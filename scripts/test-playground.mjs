#!/usr/bin/env node
// End to end test of the playground in headless Chrome, over the DevTools
// protocol (no npm dependencies).
//
// Usage: .tools/bin/hugo --gc --minify && node scripts/test-playground.mjs [url]
//
// Without a url it serves public/ on a free localhost port. It runs every
// example (tour programs must print examples/tour/*/output.txt; mistakes
// must report the code in examples/mistakes/*/check.txt), the tests of the
// tour programs that have them, and the safety limits, and checks the
// download notice, example links, share links, and highlighting. Set
// CHROME to the browser binary if it is not in the default macOS place.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";

const SITE = new URL("..", import.meta.url).pathname;
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".gz": "application/gzip", ".png": "image/png", ".webp": "image/webp", ".xml": "application/xml" };

let failures = 0;
const fail = (name, msg) => { failures++; console.log(`FAIL ${name}: ${msg}`); };
const pass = (name, msg = "") => console.log(`ok   ${name}${msg ? ": " + msg : ""}`);

// ---- static server for public/ ----

function serve() {
  const root = join(SITE, "public");
  if (!existsSync(join(root, "play", "index.html"))) throw new Error("build the site first: .tools/bin/hugo --gc --minify");
  const server = createServer((req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (p.includes("..")) { res.writeHead(400).end(); return; }
    let f = join(root, p);
    if (existsSync(f) && statSync(f).isDirectory()) f = join(f, "index.html");
    if (!existsSync(f)) { res.writeHead(404).end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" });
    res.end(readFileSync(f));
  });
  return new Promise((r) => server.listen(0, "127.0.0.1", () => r(server)));
}

// ---- Chrome over the DevTools protocol ----

async function browser() {
  const profile = mkdtempSync(join(tmpdir(), "xo-play-test-"));
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
  if (!ws) throw new Error("Chrome did not start");
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const waits = new Map();
  const logs = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && waits.has(d.id)) { waits.get(d.id)(d); waits.delete(d.id); }
    else if (d.method === "Runtime.exceptionThrown") logs.push("exception: " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text));
    else if (d.method === "Log.entryAdded" && d.params.entry.level === "error") logs.push("error: " + d.params.entry.text);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; waits.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Page.enable");
  return {
    logs,
    async go(url) {
      await send("Page.navigate", { url });
      await this.until("document.readyState === 'complete' && document.getElementById('play-code')");
    },
    async eval(expr) {
      const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || "evaluation failed");
      return r.result.result.value;
    },
    async until(expr, ms = 120000) {
      const t = Date.now();
      for (;;) {
        const v = await this.eval(expr).catch(() => null);
        if (v) return v;
        if (Date.now() - t > ms) throw new Error("timed out waiting for " + expr);
        await new Promise((r) => setTimeout(r, 150));
      }
    },
    close() {
      ws.close();
      proc.kill(); // the Chrome this function started
      setTimeout(() => rmSync(profile, { recursive: true, force: true }), 500);
    },
  };
}

// ---- page helpers (evaluated in the page) ----

const HELPERS = `
window.t = {
  set(src) { const c = document.getElementById('play-code'); c.value = src; c.dispatchEvent(new Event('input')); },
  idle() { const r = document.getElementById('play-run'), s = document.getElementById('play-test'); return !r.disabled && !s.disabled && r.textContent === 'run' && s.textContent === 'test'; },
  async press(id) {
    document.getElementById(id).click();
    await new Promise(r => setTimeout(r, 250));
    while (!this.idle()) await new Promise(r => setTimeout(r, 100));
    return { out: document.getElementById('play-output').innerText, problems: document.getElementById('play-problems').innerText };
  },
};
true`;

function examples(group) {
  const dir = join(SITE, "examples", group);
  return readdirSync(dir).filter((d) => statSync(join(dir, d)).isDirectory()).map((name) => {
    const read = (f) => existsSync(join(dir, name, f)) ? readFileSync(join(dir, name, f), "utf8") : null;
    return { name, source: read("main.xo"), output: read("output.txt"), check: read("check.txt") };
  });
}

const SAFETY = [
  ["infinite loop is stopped", "fn main(os: Os) {\n  var i = 0\n  while true {\n    i = i + 1\n  }\n}\n", (r) => /ran for more than 10 s/.test(r.out)],
  ["output is capped, HTML stays text", "fn main(os: Os) {\n  while true {\n    os.stdio.println(\"<img src=x onerror=alert(1)>\")\n  }\n}\n", (r) => /truncated at 1 MB/.test(r.out)],
  ["memory is capped", "fn main(os: Os) {\n  var xs: List[Str] = []\n  while true {\n    xs.push(\"abcdefghijabcdefghijabcdefghijabcdefghij${xs.len()}\")\n  }\n}\n", (r) => /out of memory/.test(r.out) && /\[exit 2/.test(r.out)],
  ["no files", "fn main(os: Os) ! {\n  let s = os.fs.read_text(\"/etc/passwd\")?\n  os.stdio.println(s)\n}\n", (r) => /error: Io/.test(r.out) && !/root:/.test(r.out)],
  ["unbound Go package is refused", "use go \"os/exec\"\n\nfn main(os: Os) {\n}\n", (r) => /cannot use Go package `os\/exec`/.test(r.problems)],
  ["sleep works", "fn main(os: Os) {\n  os.stdio.println(\"a\")\n  os.clock.sleep(200ms)\n  os.stdio.println(\"b\")\n}\n", (r) => /a\nb\n/.test(r.out)],
];

async function main() {
  const server = process.argv[2] ? null : await serve();
  const base = process.argv[2] || `http://127.0.0.1:${server.address().port}`;
  const b = await browser();
  try {
    // the notice: nothing is checked or downloaded before consent
    await b.go(base + "/play/");
    await b.eval(HELPERS);
    const before = await b.eval(`({ shown: !document.getElementById('play-consent').hidden, problems: document.getElementById('play-problems').innerText })`);
    if (before.shown && /Download the toolchain/.test(before.problems)) pass("download notice shown, nothing checked before consent");
    else fail("download notice", JSON.stringify(before));
    await b.eval(`document.getElementById('play-run').click(); true`);
    if (await b.eval(`document.getElementById('play-output').innerText.includes('Press run')`)) pass("run before consent does nothing");
    else fail("run before consent", "the output changed");
    await b.eval(`document.getElementById('play-consent-ok').click(); true`);
    await b.until(`/No problems/.test(document.getElementById('play-problems').innerText)`);
    pass("consent loads the compiler and checks");

    // highlighting
    const hl = await b.eval(`[...document.querySelectorAll('#play-hl span')].map(s => s.className + ':' + s.textContent).slice(0, 400).join(' ')`);
    for (const want of ["xk:fn", "xs:\"hello\"", "xt:Str", "xf:greet", "xsi:${"]) {
      if (hl.includes(want)) pass("highlights " + want);
      else fail("highlighting", "missing " + want);
    }

    for (const x of examples("tour")) {
      await b.eval(`t.set(${JSON.stringify(x.source)}); true`);
      const r = await b.eval(`t.press('play-run')`);
      if (x.name === "webservice") {
        if (/can be checked here but not run/.test(r.out)) pass("tour/webservice refused to run");
        else fail("tour/webservice", r.out.slice(0, 200));
      } else if (x.output && r.out.startsWith(x.output) && /\[exit 0 in/.test(r.out)) pass("tour/" + x.name);
      else fail("tour/" + x.name, JSON.stringify(r.out.slice(0, 300)));
      if (/^test "/m.test(x.source) && x.name !== "webservice") {
        const t = await b.eval(`t.press('play-test')`);
        if (/ok: \d+ passed, 0 failed/.test(t.out)) pass("tour/" + x.name + " tests", t.out.match(/ok: .*/)[0]);
        else fail("tour/" + x.name + " tests", JSON.stringify(t.out.slice(0, 300)));
      }
    }
    for (const x of examples("mistakes")) {
      await b.eval(`t.set(${JSON.stringify(x.source)}); true`);
      const r = await b.eval(`t.press('play-run')`);
      const code = /error (XO\d{4})/.exec(x.check)[1];
      if (r.problems.includes(code)) pass("mistakes/" + x.name, code);
      else fail("mistakes/" + x.name, JSON.stringify(r.problems.slice(0, 200)));
    }
    for (const [name, src, ok] of SAFETY) {
      await b.eval(`t.set(${JSON.stringify(src)}); true`);
      const r = await b.eval(`t.press('play-run')`);
      if (ok(r)) pass(name);
      else fail(name, JSON.stringify({ out: r.out.slice(-200), problems: r.problems.slice(0, 200) }));
    }

    // a failing test is reported
    await b.eval(`t.set(${JSON.stringify('fn add(a: Int, b: Int) -> Int {\n  a + b\n}\n\ntest "add" {\n  expect(add(2, 2)) == 5\n}\n\nfn main(os: Os) {\n}\n')}); true`);
    const ft = await b.eval(`t.press('play-test')`);
    if (/1 failed/.test(ft.out)) pass("a failing test is reported");
    else fail("failing test", JSON.stringify(ft.out.slice(0, 300)));

    // example links from the tour
    await b.go(base + "/play/#example=tour/matching");
    const src = await b.until(`document.getElementById('play-code').value.includes('match')
      && document.getElementById('play-code').value`, 15000).catch(() => "");
    if (src === examples("tour").find((x) => x.name === "matching").source) pass("#example= opens the tour example");
    else fail("#example=", src.slice(0, 80));
    const tourLink = await b.eval(`fetch('/docs/tour/01-basics/').then(r => r.text()).then(t => t.includes('/play/#example=tour/basics'))`);
    if (tourLink) pass("tour pages link to the playground");
    else fail("tour link", "no /play/#example=tour/basics on the basics page");

    // share links round trip, and a deflate bomb is refused
    await b.eval(HELPERS);
    await b.eval(`t.set('fn main(os: Os) {\\n  os.stdio.println("shared ✓")\\n}\\n'); document.getElementById('play-share').click(); true`);
    const hash = await b.until(`location.hash.startsWith('#code=') && location.hash`);
    await b.go(base + "/play/" + hash);
    if (await b.until(`document.getElementById('play-code').value.includes("shared ✓")`, 15000).catch(() => false)) pass("share link round trip");
    else fail("share link", "code differs");
    const bomb = await b.eval(`(async () => {
      const big = new Uint8Array(10 << 20).fill(65);
      const z = new Uint8Array(await new Response(new Blob([big]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());
      let s = ''; for (const c of z) s += String.fromCharCode(c);
      return btoa(s).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
    })()`);
    await b.go(base + "/play/#code=" + bomb);
    const note = await b.until(`document.getElementById('play-note').textContent.includes('could not be read') && document.getElementById('play-note').textContent`, 15000);
    if (/too large/.test(note)) pass("oversized share link refused");
    else fail("oversized link", note);

    if (b.logs.length) fail("console", b.logs.join("\n"));
    else pass("no errors in the console");
  } finally {
    b.close();
    if (server) server.close();
  }
  console.log(failures ? `${failures} failure(s)` : "all passed");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
