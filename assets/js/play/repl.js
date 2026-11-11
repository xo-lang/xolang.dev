// The REPL (decision 0583 in the xo repo), shared by the playground's repl
// tab and the REPL page (/repl/). Each entry goes to the toolchain
// worker's long-lived compiler (toolchain.js replStep); an entry that
// builds runs in its own runner worker, under the same limits as a
// program, and its output goes back to the compiler, which keeps the
// session's definitions. Lines starting with `:` are the REPL's commands
// (COMMANDS). Enter runs the entry, Shift+Enter starts a new line, and Up
// and Down recall earlier entries.

import { el } from "./client.js";

export const RUN_LIMIT_MS = 10000; // wall clock time an entry may run

// The commands, as `:help` lists them (the REPL page lists them too).
export const COMMANDS = [
  [":help", "list these commands"],
  [":type EXPR", "the type of an expression, without running it"],
  [":defs", "the session's definitions and bindings so far"],
  [":undo", "forget the last entry that defined or bound something"],
  [":reset", "forget the whole session"],
];

// jspi: whether this browser can run the REPL (its compiler waits for
// each entry's run through JavaScript Promise Integration).
export const jspi = typeof WebAssembly.Suspending === "function" && typeof WebAssembly.promising === "function";

// mountRepl wires a REPL into the page:
//   root      the element whose data-repl-done counts the finished entries
//             (and data-repl-ms, data-repl-mem), and data-runner names the
//             runner worker
//   log, form, input (a textarea), reset (a button, optional)
//   request   the toolchain client (client.js)
//   setStatus, ready() (false asks for the download consent first), ask()
export function mountRepl({ root, log, form, input, reset, request, setStatus, ready, ask }) {
  const history = [];
  let at = 0;
  let busy = false;

  if (!jspi) {
    log.replaceChildren(el("span", "play-sys", "The REPL needs WebAssembly JavaScript Promise Integration (JSPI), which this browser does not have yet (Chrome and Edge have it since version 137).\n"));
    input.disabled = true;
    if (reset) reset.disabled = true;
    input.placeholder = "not available in this browser";
    return { enter() {}, busy: () => false };
  }

  // runEntry runs a built entry and returns its output (stdout and stderr
  // together, as the compiler reads them) and exit status.
  function runEntry(wasm) {
    return new Promise((resolve) => {
      let out = "";
      const w = new Worker(root.dataset.runner, { type: "module" });
      const end = (code, extra) => { clearTimeout(timer); w.terminate(); resolve({ ran: out + (extra || ""), code }); };
      const timer = setTimeout(() => end(124, "\n[stopped: the entry ran for more than " + RUN_LIMIT_MS / 1000 + " s]\n"), RUN_LIMIT_MS);
      w.onmessage = (e) => {
        const m = e.data;
        if (m.text != null) out += m.text;
        else if (m.truncated) out += "\n[output truncated at 1 MB]\n";
        else if (m.crash) end(1, "\n[the entry could not run: " + m.crash + "]\n");
        else if ("exit" in m) end(m.exit === null ? 1 : m.exit);
      };
      w.onerror = (e) => end(1, "\n[the entry stopped: " + (e.message || "out of memory") + "]\n");
      w.postMessage({ wasm, args: ["play"] }, [wasm]);
    });
  }

  function show(r) {
    if (r.out) log.append(r.out.endsWith("\n") ? r.out : r.out + "\n");
    for (const d of r.diagnostics || []) {
      const pos = d.span ? (d.span.line + ":" + d.span.col + ": ") : "";
      log.append(el("span", "play-err", pos + (d.code ? d.code + " " : "") + d.message + "\n"));
    }
    // an entry that does not check says so in its diagnostics and again in
    // err: the diagnostics, with their positions, are enough
    if (r.err && !(r.diagnostics || []).length) log.append(el("span", r.ok ? "play-sys" : "play-err", r.err.endsWith("\n") ? r.err : r.err + "\n"));
    if (r.value != null) log.append(el("span", "play-repl-val", r.value + (r.typ ? "  " : "")), r.typ ? el("span", "play-sys", ": " + r.typ) : "", "\n");
  }

  async function send(req) {
    let r = await request("repl", req, (s) => setStatus(s + "…"));
    if (r.mem) root.dataset.replMem = String(r.mem);
    if (r.unsupported) return { ok: false, err: r.unsupported };
    if (r.run) {
      setStatus("Running…");
      const ran = await runEntry(r.run);
      r = await request("repl", ran);
      if (r.mem) root.dataset.replMem = String(r.mem);
    }
    return r.reply;
  }

  // command answers a `:` line: a request for the compiler, or a reply
  // made here (help, and a mistake in the command itself)
  function command(src) {
    const m = /^:(\w*)\s*([\s\S]*)$/.exec(src.trim());
    const name = m[1], arg = m[2].trim();
    switch (name) {
      case "help": case "h": case "?":
        return { local: COMMANDS.map(([c, d]) => c.padEnd(12) + d).join("\n") + "\nEnter runs an entry, Shift+Enter starts a new line, Up and Down recall earlier entries.\n" };
      case "type": case "t":
        if (!arg) return { local: ":type needs an expression, such as :type 1 + 2\n", err: true };
        return { req: { cmd: "type", arg } };
      case "defs": return { req: { cmd: "defs" } };
      case "undo": return { req: { cmd: "undo" }, after: "[undid the last entry]" };
      case "reset": return { req: { cmd: "reset" }, after: "[session reset]" };
      default:
        return { local: "unknown command :" + name + " (:help lists the commands)\n", err: true };
    }
  }

  async function enter(src) {
    if (busy || !src.trim()) return;
    if (!ready()) { ask(); return; }
    busy = true;
    input.disabled = true;
    history.push(src);
    at = history.length;
    // a multi-line entry shows its later lines under the prompt
    log.append(el("span", "play-repl-in", "› " + src.replace(/\n/g, "\n  ") + "\n"));
    try {
      const t0 = performance.now();
      if (src.trim().startsWith(":")) {
        const c = command(src);
        if (c.local != null) {
          log.append(el("span", c.err ? "play-err" : "play-sys", c.local));
        } else {
          const r = await send(c.req);
          show(r);
          if (r.ok && c.after) log.append(el("span", "play-sys", c.after + "\n"));
        }
      } else {
        show(await send({ in: src }));
      }
      root.dataset.replMs = String(Math.round(performance.now() - t0));
    } catch (e) {
      log.append(el("span", "play-err", e.message + "\n"));
      if (/restarted|stopped/.test(e.message)) log.append(el("span", "play-sys", "The next entry starts a new session.\n"));
    }
    setStatus("");
    busy = false;
    input.disabled = false;
    input.value = "";
    fit();
    input.focus();
    log.scrollTop = log.scrollHeight;
    root.dataset.replDone = String(Number(root.dataset.replDone || 0) + 1);
  }

  // fit grows the entry box with its lines, wrapped ones included (up to
  // 12 lines; it scrolls past that)
  function fit() {
    input.rows = 1;
    input.style.height = "auto";
    const line = parseFloat(getComputedStyle(input).lineHeight) || 20;
    const pad = input.offsetHeight - input.clientHeight + parseFloat(getComputedStyle(input).paddingTop) + parseFloat(getComputedStyle(input).paddingBottom);
    input.style.height = Math.min(input.scrollHeight, 12 * line + pad) + "px";
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); enter(input.value); });
  input.addEventListener("input", fit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); enter(input.value); return; }
    // history only from the first line (Up) or the last (Down), so the
    // arrows still move through a multi-line entry
    const before = input.value.slice(0, input.selectionStart);
    const after = input.value.slice(input.selectionEnd);
    if (e.key === "ArrowUp" && !before.includes("\n") && at > 0) { input.value = history[--at]; fit(); e.preventDefault(); }
    else if (e.key === "ArrowDown" && !after.includes("\n") && at < history.length) { at++; input.value = history[at] || ""; fit(); e.preventDefault(); }
  });
  if (reset) reset.addEventListener("click", () => enter(":reset"));
  return { enter, busy: () => busy, fit };
}
