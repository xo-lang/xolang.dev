// The playground's toolchain worker: checks, formats, and builds Xo
// programs with a WebAssembly build of the Xo compiler and its own wasm
// backend (selfhost/wasm `--play`, decision 0242 in the xo repo), over an
// in-memory file system. No Go toolchain: the compiler writes the
// program's WASI module itself, which the runner worker (runner.js) runs. Nothing is sent anywhere: the only network requests are
// for the toolchain itself, from this site.
import { WASI, File, Directory, OpenFile, PreopenDirectory, ConsoleStdout } from "/play/vendor/browser_wasi_shim-0.4.2/index.js";
import { BrotliDecode } from "/play/vendor/brotli-decode-1.1.0/decode.js";

const BASE = "/play/";
const CACHE = "xo-play";
const MODULE = "module example.com/play\nedition preview\n";
const MAX_OUTPUT = 4 << 20; // bytes of stdout or stderr kept from a run

let manifest = null;
let compiler = null; // WebAssembly.Module
let stdFiles = null; // [{path, file}]: the first load's std files and the packs fetched since
const stdPacks = new Set(); // the manifest's std packs fetched
let replStd = null; // the REPL's live /w/std, which fetched packs join
let record = null; // File: std's declaration record, when the manifest has one

async function loadManifest() {
  if (!manifest) {
    const res = await fetch(BASE + "manifest.json", { credentials: "omit", cache: "no-cache" });
    if (!res.ok) throw new Error("could not load the playground manifest (" + res.status + ")");
    manifest = await res.json();
    pruneCache();
  }
  return manifest;
}

// pruneCache drops cached toolchain files the current manifest no longer
// names (an older build).
async function pruneCache() {
  try {
    const cache = await caches.open(CACHE);
    const keep = new Set(Object.values(manifest.files).map((f) => new URL(BASE + f.path, self.location.origin).href));
    for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
  } catch (e) {
    // Cache Storage is unavailable (private mode); files are fetched again.
  }
}

// asset returns the decompressed bytes of one manifest file, from Cache
// Storage when it is there (names carry a content hash), reporting
// download progress.
async function asset(name, progress) {
  const m = (await loadManifest()).files[name];
  const url = new URL(BASE + m.path, self.location.origin).href;
  let cache = null;
  try { cache = await caches.open(CACHE); } catch (e) {}
  let blob = null;
  if (cache) {
    const hit = await cache.match(url);
    if (hit) blob = await hit.blob();
  }
  if (!blob) {
    const res = await fetch(url, { credentials: "omit" });
    if (!res.ok) throw new Error("could not download " + m.path + " (" + res.status + ")");
    const reader = res.body.getReader();
    const parts = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      got += value.byteLength;
      progress(name, got, m.compressed);
    }
    blob = new Blob(parts);
    if (cache) {
      try { await cache.put(url, new Response(blob)); } catch (e) {}
    }
  }
  const out = BrotliDecode(new Int8Array(await blob.arrayBuffer()));
  if (out.length !== m.size) throw new Error("the download of " + m.path + " is damaged; reload the page");
  return new Uint8Array(out.buffer, out.byteOffset, out.length);
}

async function load(progress) {
  if (!compiler) compiler = await WebAssembly.compile(await asset("xoc", progress));
  if (!stdFiles) stdFiles = unbundle(await asset("std", progress));
  // std's declaration record (decision 0583 lever (b) in the xo repo):
  // the compiler loads std's declarations from it instead of checking
  // them on every build (an older manifest has none)
  if (!record && (await loadManifest()).files.rec) record = new File(await asset("rec", progress), { readonly: true });
}

// USE_STD finds the std modules a source names (`use std/json`).
const USE_STD = /^\s*use\s+(std\/[A-Za-z0-9_/]+)/gm;

// addStd fetches the packs not yet here and adds their files to std (and
// the REPL's live std).
async function addStd(packs, progress) {
  for (const p of packs) {
    if (stdPacks.has(p)) continue;
    const entries = unbundle(await asset(p, progress));
    stdPacks.add(p);
    stdFiles.push(...entries);
    if (replStd) place(replStd.contents, entries);
  }
}

// needStd fetches the packs of the std modules source names (the first
// load has only what a program with no `use` reads; decision 0583's
// follow-up in the xo repo, scripts/build-playground.py).
async function needStd(source, progress) {
  const m = await loadManifest();
  if (!m.stdmods) return;
  const packs = [];
  for (const [, mod] of source.matchAll(USE_STD)) packs.push(...(m.stdmods[mod] || []));
  await addStd(packs, progress);
}

// allStd fetches every pack: a build named a module the first load does
// not have (the prelude reads a runtime file only for what a program
// calls, which its `use` lines do not say). It reports whether any pack
// was missing.
async function allStd(progress) {
  const m = await loadManifest();
  const left = (m.stdpacks || []).filter((p) => !stdPacks.has(p));
  await addStd(left, progress);
  return left.length > 0;
}

// lacksModule reports whether a result names a module std does not have
// here (XO0601's "module `M` not found"; the code also reports a missing
// member, which more of std does not fix).
function lacksModule(out) {
  return (out.diagnostics || []).some((d) => {
    const m = d.code === "XO0601" && /^module `([^`]+)` not found/.exec(d.message || "");
    // a std/ module the manifest does not list is not in std at all
    return m && !haveModule(m[1]) && !(m[1].startsWith("std/") && manifest.stdmods && !(m[1] in manifest.stdmods));
  });
}

// haveModule reports whether std's files here include module m (P.xo or
// a directory P, std/P also as native/P.xo): a module not found that is
// here is the program's error, which more of std does not fix.
function haveModule(m) {
  const p = m.startsWith("std/") ? m.slice(4) : m;
  return stdFiles.some(({ path }) => path === p + ".xo" || path === "native/" + p + ".xo" || path.startsWith(p + "/"));
}

// lacksFile reports whether the compiler stopped for a std file its
// record names that is not here (a runtime file a call needs, which the
// program's `use` lines do not name).
function lacksFile(e) {
  return /not where std's record says/.test(String(e && e.message || e));
}

// withStd runs f, and again after fetching the rest of std when it names
// a module or stops for a file std does not have here.
async function withStd(f, progress, status) {
  let out;
  try {
    out = await f();
  } catch (e) {
    if (!lacksFile(e)) throw e;
    if (status) status("Loading the rest of std");
    if (!(await allStd(progress))) throw e;
    return await f();
  }
  if (lacksModule(out)) {
    if (status) status("Loading the rest of std");
    if (await allStd(progress)) out = await f();
  }
  return out;
}

// env is the compiler's environment: XO_PLAY_RECORD when there is a record.
function env() {
  return record ? ["HOME=/w", "PWD=/w", "XO_PLAY_RECORD=/w/std.rec"] : ["HOME=/w", "PWD=/w"];
}

// unbundle splits a bundle (scripts/build-playground.py) into read
// only files.
function unbundle(data) {
  const n = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(0, true);
  const header = JSON.parse(new TextDecoder().decode(data.subarray(4, 4 + n)));
  let off = 4 + n;
  return header.map((h) => {
    const file = new File(data.subarray(off, off + h.size), { readonly: true });
    off += h.size;
    return { path: h.name, file };
  });
}

// tree turns bundle entries with slash separated paths into nested
// directories, fresh for each workspace (directories record their parent).
function tree(entries) {
  const top = new Map();
  place(top, entries);
  return new Directory(top);
}

// ordered rebuilds each directory's contents in the full bundle's order
// (its files by name, then its directories by name), whatever order the
// packs came in: the compiler finds std's modules by that order.
function ordered(top) {
  const es = [...top.entries()].sort(([a, x], [b, y]) => {
    const da = x instanceof Directory, db = y instanceof Directory;
    return da !== db ? (da ? 1 : -1) : a < b ? -1 : a > b ? 1 : 0;
  });
  top.clear();
  for (const [k, v] of es) {
    top.set(k, v);
    if (v instanceof Directory) ordered(v.contents);
  }
}

// place adds bundle entries to the directory contents top.
function place(top, entries) {
  for (const { path, file } of entries) {
    const parts = path.split("/");
    let dir = top;
    for (const part of parts.slice(0, -1)) {
      if (!dir.has(part)) dir.set(part, new Directory(new Map()));
      dir = dir.get(part).contents;
    }
    dir.set(parts[parts.length - 1], file);
  }
  ordered(top);
}

function collector() {
  const chunks = [];
  let size = 0;
  const fd = new ConsoleStdout((buf) => {
    if (size < MAX_OUTPUT) chunks.push(buf.slice(0, MAX_OUTPUT - size));
    size += buf.byteLength;
  });
  fd.text = () => {
    let n = 0;
    for (const c of chunks) n += c.byteLength;
    const out = new Uint8Array(n);
    n = 0;
    for (const c of chunks) { out.set(c, n); n += c.byteLength; }
    return new TextDecoder().decode(out);
  };
  return fd;
}

function text(s) {
  return new File(new TextEncoder().encode(s));
}

// workspace is a fresh /w: std, the source, and an output directory.
function workspace(source) {
  const w = new Directory(new Map([
    ["std", tree(stdFiles)],
    ["src", new Directory(new Map([["main.xo", text(source)], ["xo.mod", text(MODULE)]]))],
    ["out", new Directory(new Map())],
  ]));
  if (record) w.contents.set("std.rec", record);
  return w;
}

// xoc runs one `--play` command of the compiler with /w the workspace and
// decodes its one JSON line. The Xo wasm runtime resolves a relative path
// against the first preopened directory and an absolute one against the
// second, "/" (selfhost/wasm rt4.xo), so both are given.
function xoc(args, w) {
  const stdout = collector(), stderr = collector();
  const fds = [new OpenFile(new File([])), stdout, stderr, new PreopenDirectory(".", w.contents), new PreopenDirectory("/", new Map([["w", w]]))];
  const wasi = new WASI(["xoc", "--std=/w/std", "--wd=/w", "--play", ...args], env(), fds, { debug: false });
  const inst = new WebAssembly.Instance(compiler, { wasi_snapshot_preview1: wasi.wasiImport });
  let code;
  try {
    code = wasi.start(inst);
  } catch (e) {
    throw new Error("the compiler stopped unexpectedly: " + (e && e.message || e) + "\n" + stderr.text().slice(0, 4000));
  }
  let out;
  try {
    out = JSON.parse(stdout.text());
  } catch (e) {
    throw new Error("the compiler stopped unexpectedly (exit " + code + ")\n" + stderr.text().slice(0, 4000));
  }
  if (out.error) throw new Error(out.error);
  return out;
}

// ---- one compiler a visit -------------------------------------------------

// With JSPI, check, format and build go to one long-lived compiler running
// `--play serve` (decision 0621 in the xo repo), not a new instance a
// request: V8 frees an instance late (up to 8 alive, 13 to 20 MB of
// compiled code each; bench/results/browser-play-tab-2026-11-12.md). Its
// /w is refilled before each request, and the requests run one at a time.
// An older compiler without serve answers with a usage error, and the page
// goes back to an instance a request; so does a browser without JSPI.
const SERVE_MAX_MB = 256; // a compiler grown past this is replaced after its request
let srv = null; // the visit's compiler: { inst, w, send, reply, ended }
let serveOff = false;
let serveTail = Promise.resolve(); // the last request: the next waits for it

// compile runs one `--play` command with source as the program: through
// the visit's compiler when it can, else a new instance. It returns the
// reply and the workspace the command ran in.
async function compile(args, source) {
  if (JSPI && !serveOff) {
    const r = serveTail.then(() => served(args, source));
    serveTail = r.catch(() => {});
    const out = await r;
    if (out) return out;
  }
  const w = workspace(source);
  return { out: xoc(args, w), w };
}

// served is compile through the visit's compiler, or null when this
// compiler has no serve.
async function served(args, source) {
  if (serveOff) return null;
  if (!srv || srv.ended) {
    srv = null;
    const w = new Directory(new Map());
    const r = await server(["xoc", "--std=/w/std", "--wd=/w", "--play", "serve"], w);
    r.w = w;
    srv = r;
  }
  const s = srv;
  // a fresh workspace each request: std as it is now (packs fetched since
  // join it), the program, an empty out
  s.w.contents.clear();
  for (const [k, v] of workspace(source).contents) s.w.contents.set(k, v);
  let out;
  try {
    s.send(args);
    out = await s.reply(false);
  } catch (e) {
    srv = null;
    throw e;
  }
  if (out.error && /^usage: --play/.test(out.error)) {
    serveOff = true;
    srv = null;
    return null;
  }
  if (s.inst.exports.memory.buffer.byteLength / 1048576 > SERVE_MAX_MB) srv = null;
  if (out.error) throw new Error(out.error);
  // this request's entries: the next request replaces them, not changes them
  return { out, w: new Directory(new Map(s.w.contents)) };
}

async function check(source, progress) {
  await load(progress);
  await needStd(source, progress);
  return withStd(async () => (await compile(["check", "/w/src"], source)).out, progress, null);
}

async function format(source, progress) {
  await load(progress);
  const { out, w } = await compile(["fmt", "/w/src/main.xo"], source);
  const f = w.contents.get("src").contents.get("main.xo");
  return { source: new TextDecoder().decode(f.data), changed: out.changed };
}

// USE_GO finds a `use go` import: the playground has no Go toolchain
// (the owner's decision in decision 0242), so such a program is refused
// with a clear message instead of a binding error.
const USE_GO = /^\s*use\s+go\b/m;

async function build(source, progress, status, test) {
  if (USE_GO.test(source)) {
    return { refused: "The playground runs Xo's own compiler in your browser, with no Go toolchain, so `use go` is not supported in the playground. Build this program with xo on your machine." };
  }
  if (test) {
    return { refused: "The playground does not run tests yet; run them with `xo test` on your machine." };
  }
  status("Loading the toolchain");
  await load(progress);
  await needStd(source, progress);
  status("Compiling");
  let w;
  const out = await withStd(async () => {
    const r = await compile(["build", "/w/src", "/w/out/prog.wasm"], source);
    w = r.w;
    return r.out;
  }, progress, status);
  if (!out.ok) {
    if (out.unsupported) return { diagnostics: out.diagnostics, refused: "This program uses something the wasm backend does not support yet: " + out.unsupported };
    return { diagnostics: out.diagnostics };
  }
  const prog = w.contents.get("out").contents.get("prog.wasm");
  return { diagnostics: out.diagnostics, wasm: prog.data.slice().buffer };
}

// ---- REPL ---------------------------------------------------------------

// The REPL is one long-lived compiler instance running `--play repl`
// (decision 0583 in the xo repo): it keeps the session's checked state, so
// an entry builds only itself. It reads its requests from stdin, one JSON
// line each, and an empty stdin suspends it through JSPI (WebAssembly
// JavaScript Promise Integration: fd_read is WebAssembly.Suspending and
// _start runs through WebAssembly.promising), which leaves this worker free
// for check, format, and build meanwhile. An entry that builds is a WASI
// module; the page runs it in its own runner worker, as a program, and
// sends back its output.
const JSPI = typeof WebAssembly.Suspending === "function" && typeof WebAssembly.promising === "function";
const NO_JSPI = "The REPL needs WebAssembly JavaScript Promise Integration (JSPI), which this browser does not have yet (Chrome and Edge have it since version 137). Run, format, and the problems tab work here as usual.";
const WARM = "fn main(os: Os) {\n  let xs = [1, 2, 3]\n  os.stdio.println(\"${xs.len()}\")\n}\n";
let repl = null; // { inst, sess, send, reply, ended }

async function startRepl() {
  const sess = new Directory(new Map([["xo.mod", text("module sess\n")]]));
  replStd = tree(stdFiles);
  const w = new Directory(new Map([
    ["std", replStd],
    ["warm", new Directory(new Map([["main.xo", text(WARM)], ["xo.mod", text("module warm\n")]]))],
    ["sess", sess],
  ]));
  if (record) w.contents.set("std.rec", record);
  const r = await server(["xoc", "--std=/w/std", "--wd=/w", "--play", "repl", "/w/warm", "/w/sess"], w);
  r.sess = sess;
  return r;
}

// server starts a long-lived compiler with argv and /w the directory w: it
// reads one JSON request a line on standard input (fd_read suspends under
// JSPI until send queues one) and answers one JSON line each, which reply
// returns (and throws for {"error"} when it is told to).
async function server(argv, w) {
  const queue = []; // encoded request lines not yet read
  let wake = null;
  const send = (obj) => { queue.push(new TextEncoder().encode(JSON.stringify(obj) + "\n")); if (wake) { wake(); wake = null; } };
  let pend = "";
  const replies = [];
  let rwake = null;
  const stdout = new ConsoleStdout((buf) => {
    pend += new TextDecoder().decode(buf);
    let i;
    while ((i = pend.indexOf("\n")) >= 0) { replies.push(pend.slice(0, i)); pend = pend.slice(i + 1); }
    if (replies.length && rwake) { rwake(); rwake = null; }
  });
  const stderr = collector();
  const fds = [new OpenFile(new File([])), stdout, stderr, new PreopenDirectory(".", w.contents), new PreopenDirectory("/", new Map([["w", w]]))];
  const wasi = new WASI(argv, env(), fds, { debug: false });
  const r = { send, ended: null };
  const syncRead = wasi.wasiImport.fd_read;
  const fdRead = new WebAssembly.Suspending(async (fd, iovs, iovsLen, nread) => {
    if (fd !== 0) return syncRead(fd, iovs, iovsLen, nread);
    while (!queue.length) await new Promise((res) => (wake = res));
    const buf = r.inst.exports.memory.buffer;
    const view = new DataView(buf);
    let total = 0;
    for (let k = 0; k < iovsLen && queue.length; k++) {
      const p = view.getUint32(iovs + 8 * k, true), len = view.getUint32(iovs + 8 * k + 4, true);
      const src = queue[0], m = Math.min(len, src.length);
      new Uint8Array(buf, p, m).set(src.subarray(0, m));
      total += m;
      if (m === src.length) queue.shift(); else queue[0] = src.subarray(m);
      if (m < len) break;
    }
    view.setUint32(nread, total, true);
    return 0;
  });
  r.inst = await WebAssembly.instantiate(compiler, { wasi_snapshot_preview1: { ...wasi.wasiImport, fd_read: fdRead } });
  wasi.inst = r.inst;
  WebAssembly.promising(r.inst.exports._start)().then(
    () => { r.ended = "the REPL's compiler ended"; },
    (e) => { r.ended = "the REPL's compiler stopped: " + (e && e.message || e) + "\n" + stderr.text().slice(0, 2000); },
  ).finally(() => { if (rwake) { rwake(); rwake = null; } });
  // the next reply line, or an error once the compiler has ended
  r.reply = async (throwError = true) => {
    while (!replies.length) {
      if (r.ended) throw new Error(r.ended);
      await new Promise((res) => (rwake = res));
    }
    const line = replies.shift();
    const out = JSON.parse(line);
    if (out.error && throwError) throw new Error(out.error);
    return out;
  };
  return r;
}

// replStep sends one request to the REPL and returns its reply, or, for an
// entry that built, the module to run ({ run }); the compiler's memory is
// in mem (MB).
async function replStep(req, progress, status) {
  if (!JSPI) return { unsupported: NO_JSPI };
  if (!repl || repl.ended) {
    const restarted = repl !== null;
    repl = null;
    status("Loading the toolchain");
    await load(progress);
    status("Starting the REPL");
    repl = await startRepl();
    if (restarted && !req.in) return { reply: { ok: false, err: "The REPL restarted; its session is empty.\n" } };
  }
  if (req.in) await needStd(req.in, progress);
  let r;
  try {
    repl.send(req);
    r = await repl.reply();
    if (req.in && lacksModule(r) && await allStd(progress)) {
      repl.send(req);
      r = await repl.reply();
    }
  } catch (e) {
    repl = null;
    throw e;
  }
  const mem = Math.round(repl.inst.exports.memory.buffer.byteLength / 1048576);
  if (r.run) {
    const f = repl.sess.contents.get("entry.wasm");
    return { run: f.data.slice().buffer, mem };
  }
  return { reply: r, mem };
}

self.onmessage = async (e) => {
  const { id, cmd, source } = e.data;
  const progress = (name, got, total) => self.postMessage({ id, progress: { name, got, total } });
  const status = (s) => self.postMessage({ id, status: s });
  try {
    let result;
    if (cmd === "check") result = await check(source, progress);
    else if (cmd === "format") result = await format(source, progress);
    else if (cmd === "build") result = await build(source, progress, status, false);
    else if (cmd === "test") result = await build(source, progress, status, true);
    else if (cmd === "repl") result = await replStep(source, progress, status);
    else throw new Error("unknown command " + cmd);
    self.postMessage({ id, result }, result.wasm ? [result.wasm] : result.run ? [result.run] : []);
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
