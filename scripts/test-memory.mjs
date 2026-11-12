// node scripts/test-memory.mjs [PUBLIC_DIR]
//
// The playground pages' memory budgets (data/memory.json; xo decision 0615),
// in headless Chrome against PUBLIC_DIR (default public/, a hugo build):
//
//   repl  the 30-entry session of data/memory.json typed into /repl/: the
//         REPL compiler's wasm memory after each entry (data-repl-mem; wasm
//         memory never shrinks, so the last is the peak). Fails above
//         max_mb (the owner's bar) or above baseline_mb plus slack, or when
//         an entry's value is not session_values'.
//   play  /play/'s default program run 30 times (the REPL is not on this
//         page): the renderer processes' RSS after each run (ps). Fails
//         above baseline_mb plus slack.
//
// MEMORY_ONLY=repl|play runs one; MEMORY_RUNS=N repeats each N times and
// checks the highest peak; MEMORY_NOCHECK=1 measures without failing (to
// take a baseline); MEMORY_OUT=FILE writes the numbers as JSON. The last
// line is "memory: ..." with each peak and its budget. Exit 1 on a failed
// budget or value, 2 when the page could not be driven. Darwin and Linux
// (CHROME names the browser; ps reads RSS).
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const root = process.argv[2] || join(SITE, "public");
const cfg = JSON.parse(readFileSync(join(SITE, "data", "memory.json"), "utf8"));
const only = process.env.MEMORY_ONLY || "";
const runs = Number(process.env.MEMORY_RUNS || 1);
const nocheck = process.env.MEMORY_NOCHECK === "1";
const CHROME = process.env.CHROME || (process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".css": "text/css", ".wasm": "application/wasm", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

if (!existsSync(join(root, "repl", "index.html")) || !existsSync(join(root, "play", "index.html"))) {
  console.error(`test-memory: no /repl/ or /play/ page in ${root} (build the site with hugo first)`);
  process.exit(2);
}

const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (p.includes("..")) { res.writeHead(400).end(); return; }
  let f = join(root, p);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
  if (!existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
  res.end(readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

// one fresh browser (its own profile) per measurement
async function browser() {
  const profile = mkdtempSync(join(tmpdir(), "xo-memory-"));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--window-size=1300,900", "about:blank"], { stdio: "ignore" });
  let ws;
  for (let i = 0; i < 100 && !ws; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === "page");
      if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
    } catch (e) {}
    if (!ws) await new Promise((r) => setTimeout(r, 200));
  }
  if (!ws) throw new Error("Chrome did not start: " + CHROME);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const waits = new Map();
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && waits.has(d.id)) { waits.get(d.id)(d); waits.delete(d.id); } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; waits.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "evaluation failed");
    return r.result.result.value;
  };
  const until = async (expr, ms = 180000) => {
    const t = Date.now();
    for (;;) {
      const v = await ev(expr).catch(() => null);
      if (v) return v;
      if (Date.now() - t > ms) throw new Error("timed out waiting for " + expr);
      await new Promise((r) => setTimeout(r, 100));
    }
  };
  // the renderer processes of this profile (the page and its workers)
  const rss = () => {
    const out = execFileSync("ps", ["-axo", "rss=,command="], { encoding: "utf8" });
    let kb = 0;
    for (const l of out.split("\n")) if (l.includes(profile) && l.includes("--type=renderer")) kb += Number(l.trim().split(/\s+/)[0]);
    return Math.round(kb / 1024);
  };
  await send("Runtime.enable");
  await send("Page.enable");
  const go = async (path) => {
    await send("Page.navigate", { url: base + path });
    await until("document.readyState === 'complete' && document.documentElement.dataset.playReady === '1'");
    await ev(`(() => { const ok = document.getElementById('play-consent-ok'); if (ok && !ok.closest('[hidden]')) ok.click(); return true; })()`);
  };
  const close = async () => {
    ws.close();
    proc.kill();
    await new Promise((r) => setTimeout(r, 1500));
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 }); } catch (e) {}
  };
  return { ev, until, rss, go, close };
}

// repl: the session's entries on /repl/; the peak and any wrong value
async function replOnce() {
  const b = await browser();
  try {
    await b.go("/repl/");
    if (!(await b.ev(`typeof WebAssembly.Suspending === 'function'`))) throw new Error("this Chrome has no JSPI (WebAssembly.Suspending): the REPL cannot run");
    const wrong = [];
    let mem = 0;
    let before = await b.ev(`document.getElementById('play-repl-log').innerText`);
    for (const [i, src] of cfg.session.entries()) {
      const n = await b.ev(`Number(document.getElementById('repl').dataset.replDone || 0)`);
      await b.ev(`(() => { const e = document.getElementById('play-repl-in'); e.value = ${JSON.stringify(src)}; document.getElementById('play-repl-form').requestSubmit(); return true; })()`);
      await b.until(`Number(document.getElementById('repl').dataset.replDone || 0) > ${n}`);
      mem = Math.max(mem, await b.ev(`Number(document.getElementById('repl').dataset.replMem || 0)`));
      const after = await b.ev(`document.getElementById('play-repl-log').innerText`);
      // the entry's reply: the lines after its echo, a value without its type
      const got = after.slice(before.length).split("\n").slice(src.split("\n").length).map((l) => l.replace(/ {2}: .*$/, "")).join("\n").trim();
      before = after;
      const want = cfg.session_values[i] ?? "";
      if (got !== want) wrong.push(`entry ${i + 1} ${JSON.stringify(src)}: ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
    }
    return { peak: mem, wrong };
  } finally {
    await b.close();
  }
}

// play: the default program run 30 times on /play/; the renderers' RSS peak
async function playOnce() {
  const b = await browser();
  try {
    await b.go("/play/");
    const idle = `(() => { const r = document.getElementById('play-run'), t = document.getElementById('play-test'); return !r.disabled && !t.disabled && r.textContent === 'run' && t.textContent === 'test'; })()`;
    await b.until(idle);
    await new Promise((r) => setTimeout(r, 2000));
    let peak = b.rss();
    for (let i = 0; i < 30; i++) {
      await b.ev(`document.getElementById('play-run').click(); true`);
      await new Promise((r) => setTimeout(r, 250));
      await b.until(idle);
      peak = Math.max(peak, b.rss());
    }
    const out = await b.ev(`document.getElementById('play-output').innerText`);
    return { peak, wrong: /error|stopped/i.test(out) ? [`the default program's output: ${out.slice(0, 200)}`] : [] };
  } finally {
    await b.close();
  }
}

const limit = (baseline) => Math.round(baseline * (1 + cfg.slack));
const result = { date: new Date().toISOString().slice(0, 10) };
const lines = [];
let failed = false;
try {
  if (only !== "play") {
    const peaks = [];
    for (let k = 0; k < runs; k++) {
      const r = await replOnce();
      peaks.push(r.peak);
      for (const w of r.wrong) { console.log("FAIL repl value: " + w); failed = true; }
    }
    const peak = Math.max(...peaks);
    const cap = Math.min(cfg.repl.max_mb, limit(cfg.repl.baseline_mb));
    result.repl = { peak, runs: peaks, budget: cap };
    const ok = peak <= cap;
    if (!ok && !nocheck) failed = true;
    lines.push(`repl peak ${peak} MB (${peaks.join(", ")}; budget ${cap}: the bar ${cfg.repl.max_mb}, baseline ${cfg.repl.baseline_mb} + ${cfg.slack * 100}%)${ok ? "" : " OVER"}`);
  }
  if (only !== "repl") {
    const peaks = [];
    for (let k = 0; k < runs; k++) {
      const r = await playOnce();
      peaks.push(r.peak);
      for (const w of r.wrong) { console.log("FAIL play: " + w); failed = true; }
    }
    const peak = Math.max(...peaks);
    const cap = cfg.play.baseline_mb > 0 ? limit(cfg.play.baseline_mb) : 0;
    result.play = { peak, runs: peaks, budget: cap };
    const ok = cap === 0 || peak <= cap;
    if (cap === 0 && !nocheck) { console.log("FAIL play: data/memory.json has no play baseline_mb"); failed = true; }
    if (!ok && !nocheck) failed = true;
    lines.push(`play renderer RSS peak ${peak} MB (${peaks.join(", ")}; budget ${cap || "none"}: baseline ${cfg.play.baseline_mb} + ${cfg.slack * 100}%)${ok ? "" : " OVER"}`);
  }
} catch (e) {
  console.error("test-memory: " + e.message);
  server.close();
  process.exit(2);
}
server.close();
if (process.env.MEMORY_OUT) writeFileSync(process.env.MEMORY_OUT, JSON.stringify(result, null, 1) + "\n");
console.log("memory: " + lines.join("; ") + (failed ? " FAIL" : " ok"));
process.exit(failed ? 1 : 0);
