// The playground page. The editor is a plain textarea. Checking,
// formatting, and building happen in the toolchain worker; each run gets a
// fresh runner worker that is terminated when it finishes or times out.
// Everything shown from code or its output goes through textContent.

const root = document.getElementById("play");
const code = document.getElementById("play-code");
const lines = document.getElementById("play-lines");
const output = document.getElementById("play-output");
const problems = document.getElementById("play-problems");
const count = document.getElementById("play-count");
const goPane = document.getElementById("play-go");
const statusEl = document.getElementById("play-status");
const note = document.getElementById("play-note");
const runBtn = document.getElementById("play-run");
const testBtn = document.getElementById("play-test");
const fmtBtn = document.getElementById("play-format");
const shareBtn = document.getElementById("play-share");
const select = document.getElementById("play-example");
const consentBox = document.getElementById("play-consent");
const consentBtn = document.getElementById("play-consent-ok");

const RUN_LIMIT_MS = 10000; // wall clock time a program may run
const TOOL_LIMIT_MS = 120000; // a toolchain request (includes the download)
const MAX_SOURCE = 64 << 10; // bytes of source accepted from a shared link
const STORE = "xo-play-source";
const CONSENT = "xo-play-download-ok";

const examples = JSON.parse(document.getElementById("play-examples").textContent);
const hl = document.getElementById("play-hl");
const { render } = await import(root.dataset.highlight);

// ---- toolchain worker -------------------------------------------------

let worker = null;
let nextId = 1;
const pending = new Map();

function startWorker() {
  worker = new Worker(root.dataset.toolchain, { type: "module" });
  worker.onmessage = (e) => {
    const p = pending.get(e.data.id);
    if (!p) return;
    if (e.data.progress) return p.onProgress(e.data.progress);
    if (e.data.status) return p.onStatus(e.data.status);
    pending.delete(e.data.id);
    clearTimeout(p.timer);
    if (e.data.error) p.reject(new Error(e.data.error));
    else p.resolve(e.data.result);
  };
  worker.onerror = (e) => {
    for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error(e.message || "the toolchain stopped")); }
    pending.clear();
    worker.terminate();
    worker = null;
  };
}

function request(cmd, source, onStatus = () => {}) {
  if (!worker) startWorker();
  const id = nextId++;
  const downloads = {};
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      // a hung compiler: drop the worker; the next request starts a new one
      pending.delete(id);
      worker.terminate();
      worker = null;
      for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error("the toolchain was restarted")); }
      pending.clear();
      reject(new Error("the toolchain took longer than " + TOOL_LIMIT_MS / 1000 + " s and was stopped"));
    }, TOOL_LIMIT_MS);
    pending.set(id, {
      resolve, reject, timer, onStatus,
      onProgress: ({ name, got, total }) => {
        downloads[name] = [got, total];
        let g = 0, t = 0;
        for (const [a, b] of Object.values(downloads)) { g += a; t += b; }
        setStatus("Downloading the toolchain: " + (g / 1048576).toFixed(1) + " of " + (t / 1048576).toFixed(1) + " MB (only the first time)");
      },
    });
    worker.postMessage({ id, cmd, source });
  });
}

// ---- editor -----------------------------------------------------------

let numbered = 0;

let hlFrame = 0;

// paint redraws the highlighting overlay, at most once a frame.
function paint() {
  if (hlFrame) return;
  hlFrame = requestAnimationFrame(() => {
    hlFrame = 0;
    render(hl, code.value);
    syncScroll();
  });
}

function syncScroll() {
  hl.scrollTop = code.scrollTop;
  hl.scrollLeft = code.scrollLeft;
  lines.scrollTop = code.scrollTop;
}

function renumber() {
  paint();
  const n = code.value.split("\n").length;
  if (numbered !== n) {
    numbered = n;
    let s = "";
    for (let i = 1; i <= n; i++) s += i + "\n";
    lines.textContent = s;
  }
  lines.scrollTop = code.scrollTop;
}

code.addEventListener("scroll", syncScroll);
code.addEventListener("input", () => { renumber(); save(); scheduleCheck(); });
code.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(e.shiftKey); return; }
  if (e.key === "F" && e.shiftKey && e.altKey) { e.preventDefault(); format(); return; }
  if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault();
    insert("  ");
  } else if (e.key === "Enter" && !e.shiftKey) {
    // keep the indentation of the current line
    const start = code.value.lastIndexOf("\n", code.selectionStart - 1) + 1;
    const indent = /^[ \t]*/.exec(code.value.slice(start, code.selectionStart))[0];
    const before = code.value.slice(0, code.selectionStart).trimEnd();
    e.preventDefault();
    insert("\n" + indent + (/[{(\[]$/.test(before) ? "  " : ""));
  }
});

// insert types text at the cursor, keeping the browser's undo history.
function insert(s) {
  code.focus();
  if (!document.execCommand("insertText", false, s)) code.setRangeText(s, code.selectionStart, code.selectionEnd, "end");
  renumber();
  save();
  scheduleCheck();
}

// replaceAll swaps the whole source, as one undoable edit when it can.
function replaceAll(s) {
  code.focus();
  code.select();
  if (!document.execCommand("insertText", false, s)) code.value = s;
  code.setSelectionRange(0, 0);
  code.scrollTop = 0;
  renumber();
  save();
}

function setSource(s) {
  code.value = s;
  renumber();
  save();
}

function save() {
  try { localStorage.setItem(STORE, code.value); } catch (e) {}
}

function goTo(line, col) {
  const ls = code.value.split("\n");
  let off = 0;
  for (let i = 0; i < line - 1 && i < ls.length; i++) off += ls[i].length + 1;
  off += byteColToIndex(ls[line - 1] || "", col);
  code.focus();
  code.setSelectionRange(off, off);
  const lh = parseFloat(getComputedStyle(code).lineHeight) || 20;
  code.scrollTop = Math.max(0, (line - 4) * lh);
}

// Diagnostic columns count bytes (UTF-8); textarea offsets count UTF-16.
function byteColToIndex(line, col) {
  const enc = new TextEncoder();
  let bytes = 0;
  let i = 0;
  for (const ch of line) {
    if (bytes >= col - 1) break;
    bytes += enc.encode(ch).length;
    i += ch.length;
  }
  return i;
}

function offsetOf(src, line, col) {
  const ls = src.split("\n");
  let off = 0;
  for (let i = 0; i < line - 1 && i < ls.length; i++) off += ls[i].length + 1;
  return off + byteColToIndex(ls[line - 1] || "", col);
}

// ---- results ----------------------------------------------------------

function setStatus(s) { statusEl.textContent = s; }

function showTab(name) {
  for (const b of root.querySelectorAll("[data-tab]")) b.setAttribute("aria-selected", String(b.dataset.tab === name));
  for (const p of root.querySelectorAll("[data-pane]")) p.hidden = p.dataset.pane !== name;
}
for (const b of root.querySelectorAll("[data-tab]")) b.addEventListener("click", () => showTab(b.dataset.tab));

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function file(f) { return String(f || "").replace(/^(\/w\/)?src\//, ""); }

function showDiagnostics(ds) {
  problems.replaceChildren();
  const errors = ds.filter((d) => d.severity === "error").length;
  count.textContent = ds.length ? "(" + ds.length + ")" : "";
  count.className = errors ? "bad" : "";
  if (!ds.length) {
    problems.append(el("li", "play-ok", "No problems."));
    return;
  }
  for (const d of ds) {
    const li = el("li", "play-diag " + d.severity);
    const head = el("div", "play-diag-head");
    const where = el("button", "play-where", file(d.span.file) + ":" + d.span.line + ":" + d.span.col);
    where.type = "button";
    where.addEventListener("click", () => goTo(d.span.line, d.span.col));
    const codeLink = el("a", "play-code", d.code);
    codeLink.href = "/docs/diagnostics/" + encodeURIComponent(d.code.toLowerCase()) + "/";
    codeLink.target = "_blank";
    codeLink.rel = "noopener";
    head.append(where, " ", el("span", "sev", d.severity), " ", codeLink, ": ", el("span", "msg", d.message));
    li.append(head);
    for (const n of d.notes || []) li.append(el("div", "play-note-line", "note: " + n.message));
    for (const f of d.fixes || []) {
      const b = el("button", "play-fix", "fix: " + f.title);
      b.type = "button";
      b.addEventListener("click", () => applyFix(f));
      li.append(b);
    }
    problems.append(li);
  }
}

function applyFix(f) {
  const src = code.value;
  const edits = f.edits
    .filter((e) => file(e.span.file) === "main.xo")
    .map((e) => ({
      start: offsetOf(src, e.span.line, e.span.col),
      end: offsetOf(src, e.span.end_line || e.span.line, e.span.end_col || e.span.col),
      text: e.replace,
    }))
    .sort((a, b) => b.start - a.start);
  let out = src;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  replaceAll(out);
  check();
}

// ---- commands ---------------------------------------------------------

let checkTimer = 0;
let checkSeq = 0;
let busy = false;

function scheduleCheck() {
  clearTimeout(checkTimer);
  checkTimer = setTimeout(check, 700);
}

async function check() {
  if (!consented()) return;
  const seq = ++checkSeq;
  try {
    const r = await request("check", code.value);
    if (seq !== checkSeq) return;
    showDiagnostics(r.diagnostics);
    if (!busy) setStatus("");
  } catch (e) {
    if (seq === checkSeq && !busy) setStatus(e.message);
  }
}

async function format() {
  if (!consented()) { askConsent(); return; }
  if (busy) return;
  try {
    const r = await request("format", code.value);
    if (r.changed) replaceAll(r.source);
    check();
  } catch (e) {
    // a syntax error: the problems tab says where
    setStatus("Could not format: " + e.message.split("\n")[0]);
    check();
  }
}

let runner = null;

function stop(message) {
  if (runner) { runner.terminate(); runner = null; }
  if (message) output.append(el("span", "play-sys", "\n" + message + "\n"));
  done();
}

let active = runBtn; // the button of the current run: run or test

function done() {
  busy = false;
  runBtn.textContent = "run";
  testBtn.textContent = "test";
  runBtn.disabled = testBtn.disabled = false;
}

// run builds and runs the program, or with test set, its test blocks
// (`xo test -v`).
async function run(test = false) {
  if (!consented()) { askConsent(); return; }
  if (runner) { stop("[stopped]"); return; }
  if (busy) return;
  busy = true;
  active = test ? testBtn : runBtn;
  runBtn.disabled = testBtn.disabled = true;
  showTab("output");
  output.replaceChildren(el("span", "play-sys", "Building…"));
  let r;
  try {
    r = await request(test ? "test" : "build", code.value, (s) => setStatus(s + "…"));
  } catch (e) {
    output.replaceChildren(el("span", "play-err", e.message));
    setStatus("");
    done();
    return;
  }
  showDiagnostics(r.diagnostics || []);
  if (r.go) {
    goPane.replaceChildren();
    for (const files of Object.values(r.go)) {
      for (const f of files) {
        goPane.append(el("span", "play-sys", "// " + f.name + "\n"), f.text, "\n");
      }
    }
  }
  if (!r.wasm) {
    setStatus("");
    if (r.refused) output.replaceChildren(el("span", "play-sys", r.refused));
    else if (r.internal) output.replaceChildren(el("span", "play-err", r.internal));
    else { output.replaceChildren(el("span", "play-err", "The program has errors; see problems.")); showTab("problems"); }
    done();
    return;
  }
  output.replaceChildren();
  setStatus("Running…");
  active.textContent = "stop";
  active.disabled = false;
  runner = new Worker(root.dataset.runner, { type: "module" });
  const timer = setTimeout(() => { setStatus(""); stop("[stopped: the program ran for more than " + RUN_LIMIT_MS / 1000 + " s]"); }, RUN_LIMIT_MS);
  const finish = (msg, cls) => {
    clearTimeout(timer);
    setStatus("");
    if (msg) output.append(el("span", cls || "play-sys", msg));
    if (runner) { runner.terminate(); runner = null; }
    done();
  };
  runner.onmessage = (e) => {
    const m = e.data;
    if (m.text != null) output.append(m.fd === 2 ? el("span", "play-err", m.text) : m.text);
    else if (m.truncated) output.append(el("span", "play-sys", "\n[output truncated at 1 MB]"));
    else if (m.crash) finish("\n[the program could not run: " + m.crash + "]", "play-err");
    else if ("exit" in m) finish(m.exit === null ? "" : "\n[exit " + m.exit + " in " + Math.round(m.ms) + " ms]");
  };
  runner.onerror = (e) => finish("\n[the program stopped: " + (e.message || "out of memory") + "]", "play-err");
  runner.postMessage({ wasm: r.wasm, args: test ? ["play.test", "-v"] : ["play"] }, [r.wasm]);
}

runBtn.addEventListener("click", () => run(false));
testBtn.addEventListener("click", () => run(true));
fmtBtn.addEventListener("click", format);

// ---- download notice --------------------------------------------------

// Nothing is downloaded until the visitor agrees, once per browser.
let agreed = false;

function consented() {
  if (agreed) return true;
  try { agreed = localStorage.getItem(CONSENT) === "1"; } catch (e) {}
  return agreed;
}

function askConsent() {
  consentBox.hidden = false;
  consentBox.classList.remove("flash");
  void consentBox.offsetWidth;
  consentBox.classList.add("flash");
  consentBtn.focus();
}

consentBtn.addEventListener("click", () => {
  agreed = true;
  try { localStorage.setItem(CONSENT, "1"); } catch (e) {}
  consentBox.hidden = true;
  check();
});

// sizes shows the real download sizes from the manifest.
async function sizes() {
  try {
    const m = await (await fetch("/play/manifest.json", { credentials: "omit", cache: "no-cache" })).json();
    const mb = (n) => Math.max(1, Math.round(n / 1048576)) + " MB";
    const f = m.files;
    consentBox.querySelector('[data-size="check"]').textContent = mb(f.xoplay.gzip + f.gobind.gzip);
    consentBox.querySelector('[data-size="run"]').textContent = mb(f.compile.gzip + f.link.gzip + f.pkg.gzip);
  } catch (e) {
    // keep the sizes written in the page
  }
}

// ---- sharing ----------------------------------------------------------

function b64url(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pipe(bytes, stream) {
  return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}

shareBtn.addEventListener("click", async () => {
  const packed = await pipe(new TextEncoder().encode(code.value), new CompressionStream("deflate-raw"));
  // The code is in the fragment, which browsers never send to a server.
  history.replaceState(null, "", "#code=" + b64url(packed));
  try {
    await navigator.clipboard.writeText(location.href);
    setStatus("Link copied. The code is in the link itself; nothing is uploaded.");
  } catch (e) {
    setStatus("The link in the address bar holds this code.");
  }
});

async function fromLink() {
  const m = /^#code=([A-Za-z0-9_-]+)$/.exec(location.hash);
  if (!m) return null;
  try {
    // inflate at most MAX_SOURCE bytes, whatever the link claims
    const stream = new Blob([unb64url(m[1])]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    const reader = stream.getReader();
    const parts = [];
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      n += value.byteLength;
      if (n > MAX_SOURCE) { reader.cancel(); throw new Error("too large"); }
      parts.push(value);
    }
    return new TextDecoder("utf-8", { fatal: true }).decode(await new Blob(parts).arrayBuffer());
  } catch (e) {
    note.textContent = "The shared link could not be read (" + e.message + "), so the playground opened with an example.";
    return null;
  }
}

// ---- examples ---------------------------------------------------------

const groups = { tour: "Tour", mistakes: "Mistakes the compiler catches" };
for (const g of Object.keys(groups)) {
  const og = document.createElement("optgroup");
  og.label = groups[g];
  examples.forEach((x, i) => {
    if (x.group !== g) return;
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = x.name;
    og.append(o);
  });
  select.append(og);
}
select.addEventListener("change", () => {
  const x = examples[Number(select.value)];
  select.value = "";
  if (!x) return;
  replaceAll(x.source);
  history.replaceState(null, "", location.pathname);
  output.replaceChildren("Press run to build and run the program.");
  check();
});

// A new #example= or #code= on this page (a link followed from the page
// itself) loads like a fresh visit. Share uses replaceState, which does not
// fire this.
window.addEventListener("hashchange", () => location.reload());

// ---- start ------------------------------------------------------------

(async () => {
  if (!consented()) {
    consentBox.hidden = false;
    sizes();
    problems.replaceChildren(el("li", "play-sys", "Download the toolchain (above) to check code."));
  }
  const ex = /^#example=(\w+)\/([\w-]+)$/.exec(location.hash);
  const named = ex && examples.find((x) => x.group === ex[1] && x.name === ex[2]);
  const shared = named ? null : await fromLink();
  if (named) {
    setSource(named.source);
  } else if (shared != null) {
    setSource(shared);
    note.textContent = "This code came from a shared link. It runs only in this tab, with no network access, and only when you press run.";
  } else {
    let saved = null;
    try { saved = localStorage.getItem(STORE); } catch (e) {}
    setSource(saved || examples.find((x) => x.name === "basics").source);
  }
  check();
})();
