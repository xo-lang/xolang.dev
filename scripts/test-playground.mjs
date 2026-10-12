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
// download notice, example links, share links, highlighting, squiggles
// and their tooltips, the generated Go tab, the layout at phone width of
// the playground and the home page (SHOTS=dir saves screenshots of it), the
// section highlight of the docs index,
// and the test seed and explore options. CHROME_FLAGS adds browser flags
// (CI passes --no-sandbox: Ubuntu runners forbid Chrome's sandbox). Set
// CHROME to the browser binary if it is not in the default macOS place.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
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
  const extra = (process.env.CHROME_FLAGS || "").split(" ").filter(Boolean);
  const proc = spawn(CHROME, ["--headless=new", ...extra, `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--window-size=1300,900", "about:blank"], { stdio: "ignore" });
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
    // viewport emulates a screen of w by h CSS pixels (a phone if mobile)
    async viewport(w, h, mobile) {
      await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 3 : 1, mobile });
    },
    // shot saves a screenshot when SHOTS names a directory
    async shot(name) {
      if (!process.env.SHOTS) return;
      const r = await send("Page.captureScreenshot", { format: "png" });
      writeFileSync(join(process.env.SHOTS, name + ".png"), Buffer.from(r.result.data, "base64"));
    },
    // close stops the Chrome this function started and removes its
    // profile once it has exited (the caller exits right after)
    async close() {
      ws.close();
      const exited = new Promise((r) => proc.once("exit", r));
      proc.kill();
      await Promise.race([exited, new Promise((r) => setTimeout(r, 5000))]);
      // Chrome's helper processes can still be writing the profile after
      // the main process exits (ENOTEMPTY on CI): retry, and never let
      // the cleanup fail a run whose tests passed
      try {
        rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
      } catch (e) {
        console.log(`warning: could not remove the Chrome profile ${profile}: ${e.code || e.message}`);
      }
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

    // seed and explore (core 7.4): this test passes under seed 1 and
    // fails under seed 2, as `xo test --explore=20` reports natively
    const RACE = 'fn first(ch: Chan[Int]) -> Int {\n  var got = 0\n  for x in ch {\n    if got == 0 { got = x }\n  }\n  got\n}\n\ntest "the first task sends first" {\n  let ch = Chan[Int].new(cap: 2)\n  scope s {\n    s.spawn(fn() { ch.send(1) })\n    s.spawn(fn() { ch.send(2) })\n  }\n  ch.close()\n  expect(first(ch)) == 1\n}\n\nfn main(os: Os) {\n}\n';
    await b.eval(`t.set(${JSON.stringify(RACE)}); true`);
    const plain = await b.eval(`t.press('play-test')`);
    await b.eval(`document.getElementById('play-explore').value = '20'; true`);
    const explored = await b.eval(`t.press('play-test')`);
    await b.eval(`document.getElementById('play-explore').value = ''; document.getElementById('play-seed').value = '2'; true`);
    const seeded = await b.eval(`t.press('play-test')`);
    await b.eval(`document.getElementById('play-seed').value = ''; true`);
    if (/1 passed, 0 failed/.test(plain.out)) pass("test under the default seed");
    else fail("default seed", JSON.stringify(plain.out.slice(0, 300)));
    if (/seed 2 fails/.test(explored.out)) pass("explore finds the failing seed");
    else fail("explore", JSON.stringify(explored.out.slice(0, 300)));
    if (/1 failed/.test(seeded.out)) pass("seed 2 reproduces the failure");
    else fail("seed", JSON.stringify(seeded.out.slice(0, 300)));

    // diagnostics are underlined in the editor
    const ignored = examples("mistakes").find((x) => x.name === "ignored");
    await b.eval(`t.set(${JSON.stringify(ignored.source)}); true`);
    const marked = await b.until(`[...document.querySelectorAll('#play-hl .xmark-error')].map(e => e.textContent).join('')`, 15000).catch(() => "");
    if (marked.startsWith("parse_port")) pass("diagnostics underlined", marked);
    else fail("squiggles", JSON.stringify(marked));

    // their message shows on hover, and with the caret inside them
    const hover = await b.eval(`(() => {
      const s = document.querySelector('#play-hl .xmark-error'), r = s.getBoundingClientRect();
      document.getElementById('play-code').dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + 3, clientY: r.top + r.height / 2, bubbles: true }));
      return true;
    })()`);
    const tipText = await b.until(`!document.getElementById('play-tip').hidden && document.getElementById('play-tip').textContent`, 5000).catch(() => "");
    if (hover && /error XO0201/.test(tipText)) pass("hover shows the diagnostic", tipText.slice(0, 60));
    else fail("hover", JSON.stringify(tipText));
    await b.eval(`(() => {
      const c = document.getElementById('play-code');
      c.dispatchEvent(new MouseEvent('mouseleave'));
      c.focus();
      const at = c.value.indexOf('parse_port("8080")') + 2;
      c.setSelectionRange(at, at);
      c.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
      return true;
    })()`);
    const caretText = await b.until(`!document.getElementById('play-tip').hidden && document.getElementById('play-tip').textContent`, 5000).catch(() => "");
    if (/XO0201/.test(caretText)) pass("the caret shows the diagnostic");
    else fail("caret tip", JSON.stringify(caretText));

    // the generated Go tab hides //line directives unless asked
    await b.eval(`t.set('fn main(os: Os) {\\n  os.stdio.println("hi")\\n}\\n'); true`);
    await b.eval(`t.press('play-run')`);
    const goText = await b.eval(`document.getElementById('play-go').textContent`);
    const goLines = await b.eval(`(() => { const g = document.getElementById('play-golines'); g.click(); const t = document.getElementById('play-go').textContent; g.click(); return t; })()`);
    if (/func F_main/.test(goText) && !/\/\/line /.test(goText) && /\/\/line main\.xo:1:1/.test(goLines) && !/(\/\/line [^\n]*\n)\1/.test(goLines)) pass("generated Go, //line directives on request");
    else fail("generated Go", JSON.stringify(goText.slice(0, 200)) + " / " + JSON.stringify(goLines.slice(0, 200)));
    const goLink = await b.eval(`(() => {
      const kw = [...document.querySelectorAll('#play-go .xk')].some((e) => e.textContent === 'func');
      const l = [...document.querySelectorAll('#play-go [data-xo]')].find((e) => e.textContent.includes('M_println'));
      if (!kw || !l) return 'highlighted: ' + kw + ', println line linked: ' + !!l;
      l.click();
      const c = document.getElementById('play-code');
      return c.value.slice(0, c.selectionStart).split('\\n').length;
    })()`);
    if (goLink === 2) pass("generated Go is highlighted and links to main.xo");
    else fail("Go links", JSON.stringify(goLink));

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

    // phones: nothing is wider than the screen, the toolbar, test options,
    // tooltip, and Go tab fit, and the editor is above the output
    await b.viewport(390, 844, true);
    await b.go(base + "/play/");
    await b.eval(HELPERS);
    await b.eval(`t.set(${JSON.stringify(ignored.source)}); true`);
    await b.until(`document.querySelector('#play-hl .xmark-error')`, 15000);
    const fits = (sel) => `[...document.querySelectorAll(${JSON.stringify(sel)})].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.left < -0.5 || r.right > innerWidth + 0.5); }).map((e) => (e.id || e.className || e.tagName) + ' ' + Math.round(e.getBoundingClientRect().left) + '..' + Math.round(e.getBoundingClientRect().right))`;
    const wide = async (what) => {
      const over = await b.eval(`[...${fits(".play-bar > *, .play-opts-body, #play-tip:not([hidden]), .play-go-bar, .play-editor, .play-out, .play-consent")}, ...(document.documentElement.scrollWidth > innerWidth ? ['page ' + document.documentElement.scrollWidth] : [])]`);
      if (over.length) fail("phone: " + what, over.join(", "));
      else pass("phone: " + what + " fits 390 px");
    };
    await b.shot("phone-editor");
    await wide("toolbar and editor");
    const tops = await b.eval(`[...document.querySelectorAll('.play-bar > .btn, .play-opts summary')].map((e) => Math.round(e.getBoundingClientRect().top))`);
    if (Math.max(...tops) - Math.min(...tops) < 12) pass("phone: the buttons are on one row");
    else fail("phone toolbar", "button tops " + tops.join(", "));
    const stacked = await b.eval(`document.querySelector('.play-out').getBoundingClientRect().top >= document.querySelector('.play-editor').getBoundingClientRect().bottom`);
    if (stacked) pass("phone: output below the editor");
    else fail("phone layout", "the editor and output are side by side");
    await b.eval(`document.querySelector('.play-opts').open = true; true`);
    await b.shot("phone-options");
    await wide("test options");
    const pushed = await b.eval(`document.getElementById('play-note').getBoundingClientRect().top`);
    await b.eval(`document.querySelector('.play-opts').open = false; true`);
    if (pushed === await b.eval(`document.getElementById('play-note').getBoundingClientRect().top`)) pass("phone: test options float over the page");
    else fail("phone options", "opening them moves the page");
    await b.eval(`(() => {
      const s = document.querySelector('#play-hl .xmark-error'), r = s.getBoundingClientRect();
      document.getElementById('play-code').dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + 3, clientY: r.top + r.height / 2 }));
      return true;
    })()`);
    await b.until(`!document.getElementById('play-tip').hidden`, 5000).catch(() => {});
    await b.shot("phone-tooltip");
    await wide("tooltip");
    await b.eval(`t.set('fn main(os: Os) {\\n  os.stdio.println("hi")\\n}\\n'); true`);
    await b.eval(`t.press('play-run')`);
    await b.eval(`document.querySelector('[data-tab=go]').click(); document.querySelector('.play-out').scrollIntoView(); true`);
    await b.shot("phone-go");
    await wide("generated Go tab");

    // the home page at phone width: the cards, terminals, and status
    // stages fit, and the page does not scroll sideways
    await b.eval(`location.href = ${JSON.stringify(base + "/")}; true`);
    await b.until(`location.pathname === '/' && document.readyState === 'complete' && document.querySelector('.supply .term') && document.querySelector('.stages li')`, 15000);
    const homeOver = await b.eval(`[...${fits(".wrap > *, .cell, .term, .stages li, .limits, .ix")}, ...(document.documentElement.scrollWidth > innerWidth ? ['page ' + document.documentElement.scrollWidth] : [])]`);
    await b.eval(`document.querySelector('.supply').scrollIntoView(); true`);
    await b.shot("phone-home-supply");
    if (homeOver.length) fail("phone: home page", homeOver.join(", "));
    else pass("phone: home page fits 390 px");
    await b.viewport(1300, 900, false);

    // on a tall desktop window the playground leaves room for the footer
    await b.viewport(1300, 1600, false);
    await b.go(base + "/play/");
    const [footerBottom, winHeight] = await b.eval(`[Math.round(document.querySelector('footer').getBoundingClientRect().bottom), innerHeight]`);
    if (footerBottom <= winHeight) pass("playground footer in view on a tall window", `bottom ${footerBottom} of ${winHeight}`);
    else fail("playground footer", `bottom at ${footerBottom} of ${winHeight}`);
    await b.viewport(1300, 900, false);

    // the "On this page" index highlights the section being read, by
    // scrolling and by following an index link
    await b.eval(`location.href = ${JSON.stringify(base + "/docs/spec/std/")}; true`);
    await b.until(`location.pathname === '/docs/spec/std/' && document.readyState === 'complete' && document.querySelectorAll('.toc a[href^="#"]').length > 10`, 15000);
    const tocAt = async (how) => {
      const want = await b.eval(`(() => {
        const a = document.querySelectorAll('.toc a[href^="#"]')[8];
        const h = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
        ${how === "click" ? "a.click();" : "scrollTo(0, h.getBoundingClientRect().top + scrollY - 40);"}
        return a.getAttribute('href');
      })()`);
      await new Promise((r) => setTimeout(r, 300));
      return [want, await b.eval(`document.querySelector('.toc a.active')?.getAttribute('href') || 'none'`)];
    };
    for (const how of ["scroll", "click"]) {
      const [want, got] = await tocAt(how);
      if (want === got) pass("index highlights the section after a " + how, want);
      else fail("index highlight after a " + how, `want ${want}, got ${got}`);
      if (how === "click") await b.shot("toc-active");
      await b.eval(`scrollTo(0, 0); true`);
    }

    if (b.logs.length) fail("console", b.logs.join("\n"));
    else pass("no errors in the console");
  } finally {
    await b.close();
    if (server) server.close();
  }
  console.log(failures ? `${failures} failure(s)` : "all passed");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(2); });
