#!/usr/bin/env node
// Finds the std files each std module needs in the playground (decision
// 0583 in the xo repo: a first load of only the files every build reads).
// The compiler, run here over the same in-memory file system, paths and
// declaration record the page gives it (as play-record.mjs), builds a
// program of one line, `use std/M`, for each module M of std's top level,
// and the files it opens under /w/std are M's. "core" is what a program
// with no `use` opens: play-record.mjs's warm program, an empty one, and
// each main.xo without a `use` under CORPUS (the xo repo's
// internal/llvm/testdata/golden): the prelude reads a runtime file only
// for what a program calls, so which ones a program needs is not in its
// `use` lines, and the page fetches the rest of std when a build names a
// module it does not have (toolchain.js).
//
// Usage: node scripts/play-trace.mjs XOC_WASM STD_BUNDLE STD_REC OUT_JSON [CORPUS]
// (scripts/build-playground.py runs it.)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { WASI, File, Directory, OpenFile, PreopenDirectory, ConsoleStdout } from "../static/play/vendor/browser_wasi_shim-0.4.2/index.js";

const [xocPath, stdPath, recPath, outPath, corpus] = process.argv.slice(2);
if (!outPath) {
  console.error("usage: play-trace.mjs XOC_WASM STD_BUNDLE STD_REC OUT_JSON");
  process.exit(2);
}

// the page's unbundle (assets/js/play/toolchain.js)
const data = new Uint8Array(readFileSync(stdPath));
const n = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(0, true);
const header = JSON.parse(new TextDecoder().decode(data.subarray(4, 4 + n)));
const entries = [];
let off = 4 + n;
for (const h of header) {
  entries.push({ path: h.name, bytes: data.subarray(off, off + h.size) });
  off += h.size;
}
const names = new Set(entries.map((e) => e.path));
function tree() {
  const top = new Map();
  for (const { path, bytes } of entries) {
    const parts = path.split("/");
    let dir = top;
    for (const p of parts.slice(0, -1)) {
      if (!dir.has(p)) dir.set(p, new Directory(new Map()));
      dir = dir.get(p).contents;
    }
    dir.set(parts[parts.length - 1], new File(bytes, { readonly: true }));
  }
  return new Directory(top);
}
const rec = new File(new Uint8Array(readFileSync(recPath)), { readonly: true });
const xoc = await WebAssembly.compile(readFileSync(xocPath));
const text = (s) => new File(new TextEncoder().encode(s));

// opened returns the std files (bundle names) the compiler opens building source
async function opened(source) {
  const w = new Directory(new Map([
    ["std", tree()],
    ["src", new Directory(new Map([["main.xo", text(source)], ["xo.mod", text("module example.com/play\nedition preview\n")]]))],
    ["out", new Directory(new Map())],
    ["std.rec", rec],
  ]));
  const fds = [
    new OpenFile(new File([])),
    new ConsoleStdout(() => {}),
    new ConsoleStdout(() => {}),
    new PreopenDirectory(".", w.contents),
    new PreopenDirectory("/", new Map([["w", w]])),
  ];
  const wasi = new WASI(["xoc", "--std=/w/std", "--wd=/w", "--play", "build", "/w/src", "/w/out/prog.wasm"],
    ["HOME=/w", "PWD=/w", "XO_PLAY_RECORD=/w/std.rec"], fds, { debug: false });
  const seen = new Set();
  let inst = null;
  const imports = { ...wasi.wasiImport };
  const open = wasi.wasiImport.path_open;
  imports.path_open = (...a) => {
    const p = new TextDecoder().decode(new Uint8Array(inst.exports.memory.buffer, a[2], a[3]));
    const i = p.indexOf("std/");
    if (i >= 0 && names.has(p.slice(i + 4))) seen.add(p.slice(i + 4));
    return open(...a);
  };
  inst = await WebAssembly.instantiate(xoc, { wasi_snapshot_preview1: imports });
  try { wasi.start(inst); } catch (e) {}
  return [...seen].sort();
}

const core = new Set([
  ...(await opened("fn main() {}\n")),
  ...(await opened("fn main(os: Os) {\n  let xs = [1, 2, 3]\n  os.stdio.println(\"${xs.len()}\")\n}\n")),
]);
let progs = 0;
if (corpus) {
  for (const g of readdirSync(corpus).sort()) {
    const f = corpus + "/" + g + "/main.xo";
    if (!existsSync(f)) continue;
    const src = readFileSync(f, "utf8");
    if (/^\s*use\s/m.test(src)) continue;
    progs++;
    for (const p of await opened(src)) core.add(p);
  }
}
const mods = {};
for (const name of [...names].sort()) {
  if (name.includes("/") || !name.endsWith(".xo")) continue;
  const m = "std/" + name.slice(0, -3);
  mods[m] = (await opened("use " + m + "\n\nfn main() {}\n")).filter((p) => !core.has(p));
}
writeFileSync(outPath, JSON.stringify({ core: [...core].sort(), mods }, null, 1) + "\n");
const per = Object.values(mods).map((l) => l.length);
console.log(`play-trace: core ${core.size} files (${progs} corpus programs), ${Object.keys(mods).length} modules (most ${Math.max(...per)} files beyond core)`);
