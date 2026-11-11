#!/usr/bin/env node
// Writes std's declaration record for the playground (decision 0583 in the
// xo repo, lever (b)): the compiler, run once here over the same in-memory
// file system and paths the page gives it (/w/std, the vendored WASI shim),
// builds a small program with XO_PLAY_RECORD_OUT set, and the record it
// writes is what the page's compiler loads instead of parsing and checking
// std's declarations on every build and REPL entry.
//
// Usage: node scripts/play-record.mjs XOC_WASM STD_BUNDLE OUT
// (scripts/build-playground.py runs it.)
import { readFileSync, writeFileSync } from "node:fs";
import { WASI, File, Directory, OpenFile, PreopenDirectory, ConsoleStdout } from "../static/play/vendor/browser_wasi_shim-0.4.2/index.js";

const [xocPath, stdPath, outPath] = process.argv.slice(2);
if (!outPath) {
  console.error("usage: play-record.mjs XOC_WASM STD_BUNDLE OUT");
  process.exit(2);
}

// the page's unbundle and tree (assets/js/play/toolchain.js)
const data = new Uint8Array(readFileSync(stdPath));
const n = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(0, true);
const header = JSON.parse(new TextDecoder().decode(data.subarray(4, 4 + n)));
let off = 4 + n;
const top = new Map();
for (const h of header) {
  const parts = h.name.split("/");
  let dir = top;
  for (const p of parts.slice(0, -1)) {
    if (!dir.has(p)) dir.set(p, new Directory(new Map()));
    dir = dir.get(p).contents;
  }
  dir.set(parts[parts.length - 1], new File(data.subarray(off, off + h.size), { readonly: true }));
  off += h.size;
}
const text = (s) => new File(new TextEncoder().encode(s));
const w = new Directory(new Map([
  ["std", new Directory(top)],
  ["warm", new Directory(new Map([
    ["main.xo", text("fn main(os: Os) {\n  let xs = [1, 2, 3]\n  os.stdio.println(\"${xs.len()}\")\n}\n")],
    ["xo.mod", text("module warm\n")],
  ]))],
]));
let out = "", err = "";
const fds = [
  new OpenFile(new File([])),
  new ConsoleStdout((b) => { out += new TextDecoder().decode(b); }),
  new ConsoleStdout((b) => { err += new TextDecoder().decode(b); }),
  new PreopenDirectory(".", w.contents),
  new PreopenDirectory("/", new Map([["w", w]])),
];
const wasi = new WASI(["xoc", "--std=/w/std", "--wd=/w", "--play", "build", "/w/warm", "/w/warm.wasm"],
  ["HOME=/w", "PWD=/w", "XO_PLAY_RECORD_OUT=/w/std.rec"], fds, { debug: false });
const inst = await WebAssembly.instantiate(await WebAssembly.compile(readFileSync(xocPath)), { wasi_snapshot_preview1: wasi.wasiImport });
wasi.start(inst);
const rec = w.contents.get("std.rec");
let ok = false;
try { ok = JSON.parse(out).ok === true; } catch (e) {}
if (!ok || !rec || !rec.data.length) {
  console.error("play-record: the compiler wrote no record\nstdout: " + out.slice(0, 2000) + "\nstderr: " + err.slice(0, 2000));
  process.exit(1);
}
writeFileSync(outPath, rec.data);
console.log(`play-record: ${rec.data.length} bytes (compiler memory ${Math.round(inst.exports.memory.buffer.byteLength / 1048576)} MB)`);
