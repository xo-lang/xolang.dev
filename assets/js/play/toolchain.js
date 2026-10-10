// The playground's toolchain worker: checks, formats, and builds Xo
// programs with WebAssembly builds of xoplay (the Xo compiler), the Go
// compiler, and the Go linker, over an in-memory file system. Nothing is
// sent anywhere: the only network requests are for the toolchain itself,
// from this site. Running the built program happens in a separate worker
// (runner.js) that the page can stop at any time.
import { WASI, File, Directory, OpenFile, PreopenDirectory, ConsoleStdout } from "/play/vendor/browser_wasi_shim-0.4.2/index.js";

const CACHE = "xo-play";
const MODULE = "module example.com/play\nedition 2026\n";
const MAX_OUTPUT = 4 << 20; // bytes of stdout or stderr kept from a tool

let manifest = null;
const modules = {}; // name -> WebAssembly.Module
let archives = null; // [{path, file}] of the precompiled Go packages

async function loadManifest() {
  if (!manifest) {
    const res = await fetch("/play/manifest.json", { credentials: "omit", cache: "no-cache" });
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
    const keep = new Set(Object.values(manifest.files).map((f) => new URL("/play/" + f.path, self.location.origin).href));
    for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
  } catch (e) {
    // Cache Storage is unavailable (private mode); files are fetched again.
  }
}

// asset returns the decompressed bytes of one manifest file, from Cache
// Storage when it is there (file names carry a content hash, so a cached
// file never goes stale), reporting download progress.
async function asset(name, progress) {
  const m = (await loadManifest()).files[name];
  const url = new URL("/play/" + m.path, self.location.origin).href;
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
      progress(name, got, m.gzip);
    }
    blob = new Blob(parts);
    if (cache) {
      try { await cache.put(url, new Response(blob)); } catch (e) {}
    }
  }
  const stream = blob.stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function module(name, progress) {
  if (!modules[name]) modules[name] = await WebAssembly.compile(await asset(name, progress));
  return modules[name];
}

// unbundle splits a bundle (scripts/build-playground.py) into read only
// files.
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

async function loadArchives(progress) {
  if (!archives) archives = unbundle(await asset("pkg", progress));
  return archives;
}

let bindings = null; // [{path, file}] of the `use go` bindings

async function loadBindings(progress) {
  if (!bindings) bindings = unbundle(await asset("gobind", progress));
  return bindings;
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

// friendly rewrites the binder's failure to run `go` (there is no go
// command in a browser) into what the playground supports.
function friendly(ds) {
  for (const d of ds || []) {
    if (d.code === "XO1101" && /executable file not found/.test(d.message)) {
      const pkg = /`([^`]+)`/.exec(d.message);
      d.message = "the playground cannot use Go package " + (pkg ? "`" + pkg[1] + "`" : "this package") + "; it has bindings for " + manifest.gobindPackages.join(", ");
      d.notes = [{ message: "with the xo toolchain installed, `use go` binds any Go package" }];
    }
  }
  return ds;
}

function collector() {
  const chunks = [];
  let size = 0;
  const fd = new ConsoleStdout((buf) => {
    if (size < MAX_OUTPUT) chunks.push(buf.slice(0, MAX_OUTPUT - size));
    size += buf.byteLength;
  });
  fd.text = () => new TextDecoder().decode(concat(chunks));
  return fd;
}

function concat(chunks) {
  let n = 0;
  for (const c of chunks) n += c.byteLength;
  const out = new Uint8Array(n);
  n = 0;
  for (const c of chunks) { out.set(c, n); n += c.byteLength; }
  return out;
}

// tool runs one command line of a toolchain module with root as /w.
function tool(mod, args, root) {
  const stdout = collector(), stderr = collector();
  const fds = [new OpenFile(new File([])), stdout, stderr, new PreopenDirectory("/w", root)];
  const env = ["HOME=/w", "TMPDIR=/w/tmp", "GOROOT=/w/goroot", "XO_GOBIND_DIR=/w/gobind", "XO_OFFLINE=1"];
  const wasi = new WASI(args, env, fds, { debug: false });
  const inst = new WebAssembly.Instance(mod, { wasi_snapshot_preview1: wasi.wasiImport });
  let code;
  try {
    code = wasi.start(inst);
  } catch (e) {
    return { code: -1, stdout: stdout.text(), stderr: stderr.text() + "\n" + e };
  }
  return { code, stdout: stdout.text(), stderr: stderr.text() };
}

function text(s) {
  return new File(new TextEncoder().encode(s));
}

// workspace is a fresh /w: the source, the bindings, and empty output
// directories.
function workspace(source) {
  return new Map([
    ["gobind", tree(bindings)],
    ["src", new Directory(new Map([["main.xo", text(source)], ["xo.mod", text(MODULE)]]))],
    ["out", new Directory(new Map())],
    ["tmp", new Directory(new Map())],
    ["goroot", new Directory(new Map())],
  ]);
}

// xoplay runs the Xo compiler and decodes its one JSON result.
function xoplay(mod, args, root) {
  const r = tool(mod, ["xoplay", ...args], root);
  let out;
  try {
    out = JSON.parse(r.stdout);
  } catch (e) {
    throw new Error("the compiler stopped unexpectedly (exit " + r.code + ")\n" + r.stderr.slice(0, 4000));
  }
  if (out.error) throw new Error(out.error);
  return out;
}

function readFile(root, path) {
  let entry = { contents: root };
  for (const part of path.replace(/^\/w\//, "").split("/")) entry = entry.contents.get(part);
  return new TextDecoder().decode(entry.data);
}

async function check(source, progress) {
  const [mod] = await Promise.all([module("xoplay", progress), loadBindings(progress)]);
  const out = xoplay(mod, ["check", "/w/src"], workspace(source));
  friendly(out.diagnostics);
  return out;
}

async function format(source, progress) {
  const [mod] = await Promise.all([module("xoplay", progress), loadBindings(progress)]);
  const root = workspace(source);
  const out = xoplay(mod, ["fmt", "/w/src/main.xo"], root);
  return { source: readFile(root, "/w/src/main.xo"), changed: out.changed };
}

async function build(source, progress, status) {
  const m = await loadManifest();
  status("Loading the toolchain");
  const [xo, compile, link, pkgs] = await Promise.all([
    module("xoplay", progress), module("compile", progress), module("link", progress), loadArchives(progress), loadBindings(progress),
  ]);
  status("Checking");
  const root = workspace(source);
  const plan = xoplay(xo, ["gen", "/w/src", "/w/out"], root);
  friendly(plan.diagnostics);
  if (!plan.packages) return { diagnostics: plan.diagnostics };
  const missing = plan.runtime.filter((f) => !m.gobind.includes(f));
  if (missing.length) {
    return { diagnostics: plan.diagnostics, refused: "This program uses a Go package the playground has no binding for. It has bindings for " + m.gobindPackages.join(", ") + "." };
  }
  const want = m.tags.join(",");
  if (plan.tags.join(",") !== want) {
    return {
      diagnostics: plan.diagnostics,
      refused: "This program uses std/http, so it can be checked here but not run: a browser tab cannot open a server. Run it with `xo run`.",
    };
  }
  const go = {};
  for (const k of plan.packages) {
    if (k.path.startsWith("xoprog/m/")) go[k.path] = k.files.map((f) => ({ name: f.replace(/^\/w\/out\//, ""), text: readFile(root, f) }));
  }

  // The precompiled archives, read only, shared by every build.
  const pkgDir = new Map();
  const lines = [];
  pkgs.forEach((a, i) => {
    pkgDir.set(i + ".a", a.file);
    lines.push("packagefile " + a.path + "=/w/pkg/" + i + ".a");
  });
  root.set("pkg", new Directory(pkgDir));
  const objs = new Map();
  root.set("obj", new Directory(objs));

  status("Compiling");
  for (const [i, k] of plan.packages.entries()) {
    const obj = "/w/obj/" + i + ".a";
    root.set("importcfg", text(lines.join("\n") + "\n"));
    const r = tool(compile, [
      "compile", "-o", obj, "-p", k.path, "-lang=" + m.go.split(".").slice(0, 2).join("."), "-complete", "-dwarf=false",
      "-goversion", m.go, "-c=1", "-nolocalimports", "-importcfg", "/w/importcfg", "-pack", ...k.files,
    ], root);
    if (r.code !== 0) {
      return { diagnostics: plan.diagnostics, go, internal: "The generated Go for " + k.path + " did not compile. This is a bug in Xo; please report it.\n\n" + r.stderr };
    }
    lines.push("packagefile " + k.path + "=" + obj);
  }

  status("Linking");
  root.set("importcfg", text(lines.join("\n") + "\n"));
  const mainObj = "/w/obj/" + (plan.packages.length - 1) + ".a";
  const r = tool(link, ["link", "-o", "/w/obj/prog.wasm", "-importcfg", "/w/importcfg", "-buildmode=exe", "-checklinkname=0", "-s", "-w", mainObj], root);
  const prog = objs.get("prog.wasm");
  if (r.code !== 0 || !prog) {
    return { diagnostics: plan.diagnostics, go, internal: "Linking failed. This is a bug in the playground; please report it.\n\n" + r.stderr };
  }
  const wasm = prog.data.slice().buffer;
  return { diagnostics: plan.diagnostics, go, wasm };
}

self.onmessage = async (e) => {
  const { id, cmd, source } = e.data;
  const progress = (name, got, total) => self.postMessage({ id, progress: { name, got, total } });
  const status = (s) => self.postMessage({ id, status: s });
  try {
    let result;
    if (cmd === "check") result = await check(source, progress);
    else if (cmd === "format") result = await format(source, progress);
    else if (cmd === "build") result = await build(source, progress, status);
    else throw new Error("unknown command " + cmd);
    self.postMessage({ id, result }, result.wasm ? [result.wasm] : []);
  } catch (err) {
    self.postMessage({ id, error: String(err && err.message || err) });
  }
};
