// The /play-next/ toolchain worker: checks, formats, and builds Xo
// programs with a WebAssembly build of the Xo compiler and its own wasm
// backend (selfhost/wasm `--play`, decision 0242 in the xo repo), over an
// in-memory file system. No Go toolchain: the compiler writes the
// program's WASI module itself, which the runner worker (runner.js, as on
// /play/) runs. Nothing is sent anywhere: the only network requests are
// for the toolchain itself, from this site.
import { WASI, File, Directory, OpenFile, PreopenDirectory, ConsoleStdout } from "/play/vendor/browser_wasi_shim-0.4.2/index.js";
import { BrotliDecode } from "/play/vendor/brotli-decode-1.1.0/decode.js";

const BASE = "/play-next/";
const CACHE = "xo-play-next";
const MODULE = "module example.com/play\nedition preview\n";
const MAX_OUTPUT = 4 << 20; // bytes of stdout or stderr kept from a run

let manifest = null;
let compiler = null; // WebAssembly.Module
let stdFiles = null; // [{path, file}]

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
}

// unbundle splits a bundle (scripts/build-playground-next.py) into read
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
  for (const { path, file } of entries) {
    const parts = path.split("/");
    let dir = top;
    for (const part of parts.slice(0, -1)) {
      if (!dir.has(part)) dir.set(part, new Directory(new Map()));
      dir = dir.get(part).contents;
    }
    dir.set(parts[parts.length - 1], file);
  }
  return new Directory(top);
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
  return new Directory(new Map([
    ["std", tree(stdFiles)],
    ["src", new Directory(new Map([["main.xo", text(source)], ["xo.mod", text(MODULE)]]))],
    ["out", new Directory(new Map())],
  ]));
}

// xoc runs one `--play` command of the compiler with /w the workspace and
// decodes its one JSON line. The Xo wasm runtime resolves a relative path
// against the first preopened directory and an absolute one against the
// second, "/" (selfhost/wasm rt4.xo), so both are given.
function xoc(args, w) {
  const stdout = collector(), stderr = collector();
  const fds = [new OpenFile(new File([])), stdout, stderr, new PreopenDirectory(".", w.contents), new PreopenDirectory("/", new Map([["w", w]]))];
  const wasi = new WASI(["xoc", "--std=/w/std", "--wd=/w", "--play", ...args], ["HOME=/w", "PWD=/w"], fds, { debug: false });
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

async function check(source, progress) {
  await load(progress);
  return xoc(["check", "/w/src"], workspace(source));
}

async function format(source, progress) {
  await load(progress);
  const w = workspace(source);
  const out = xoc(["fmt", "/w/src/main.xo"], w);
  const f = w.contents.get("src").contents.get("main.xo");
  return { source: new TextDecoder().decode(f.data), changed: out.changed };
}

async function build(source, progress, status, test) {
  if (test) {
    return { refused: "This playground preview does not run tests yet; /play/ does." };
  }
  status("Loading the toolchain");
  await load(progress);
  status("Compiling");
  const w = workspace(source);
  const out = xoc(["build", "/w/src", "/w/out/prog.wasm"], w);
  if (!out.ok) {
    if (out.unsupported) return { diagnostics: out.diagnostics, refused: "This program uses something the wasm backend does not support yet: " + out.unsupported };
    return { diagnostics: out.diagnostics };
  }
  const prog = w.contents.get("out").contents.get("prog.wasm");
  return { diagnostics: out.diagnostics, wasm: prog.data.slice().buffer };
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
    else throw new Error("unknown command " + cmd);
    self.postMessage({ id, result }, result.wasm ? [result.wasm] : []);
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
