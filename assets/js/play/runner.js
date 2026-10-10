// The playground's program runner: one worker per run, which the page
// terminates when the run ends, takes too long, or the visitor stops it.
// The program is a wasip1 module. Its only imports are the WASI functions
// below, over an empty in-memory file system: no network, no files of the
// visitor, no page access. Memory and output are capped.
import { WASI, File, OpenFile, PreopenDirectory, ConsoleStdout } from "/play/vendor/browser_wasi_shim-0.4.2/index.js";

const MAX_PAGES = 16384; // 1 GiB of wasm memory
const MAX_OUTPUT = 1 << 20; // bytes of stdout and stderr together

// capMemory rewrites the memory section of a wasm module so the memory has
// a maximum: a program that allocates without bound fails with Go's "out
// of memory" instead of exhausting the tab.
function capMemory(bytes) {
  let p = 8;
  const leb = () => {
    let r = 0, shift = 0, b;
    do { b = bytes[p++]; r |= (b & 0x7f) << shift; shift += 7; } while (b & 0x80);
    return r >>> 0;
  };
  const enc = (v) => {
    const out = [];
    do { let b = v & 0x7f; v >>>= 7; if (v) b |= 0x80; out.push(b); } while (v);
    return out;
  };
  while (p < bytes.length) {
    const start = p;
    const id = bytes[p++];
    const size = leb();
    const body = p;
    if (id === 5) {
      const count = leb();
      if (count !== 1) throw new Error("unexpected wasm memory section");
      const flags = bytes[p++];
      const min = leb();
      if (flags & 1) leb();
      if (flags & ~1) throw new Error("unexpected wasm memory flags");
      // one memory; flags 1: it has a maximum
      const payload = [...enc(1), 1, ...enc(min), ...enc(Math.max(min, MAX_PAGES))];
      const section = [5, ...enc(payload.length), ...payload];
      const out = new Uint8Array(start + section.length + (bytes.length - body - size));
      out.set(bytes.subarray(0, start));
      out.set(section, start);
      out.set(bytes.subarray(body + size), start + section.length);
      return out;
    }
    p = body + size;
  }
  throw new Error("the program has no memory section");
}

self.onmessage = async (e) => {
  let total = 0;
  const decoders = { 1: new TextDecoder(), 2: new TextDecoder() };
  const stream = (fd) => new ConsoleStdout((buf) => {
    if (total >= MAX_OUTPUT) return;
    const keep = buf.subarray(0, MAX_OUTPUT - total);
    total += buf.byteLength;
    self.postMessage({ fd, text: decoders[fd].decode(keep, { stream: true }) });
    if (total >= MAX_OUTPUT) {
      self.postMessage({ truncated: true });
      throw new Error("output limit");
    }
  });
  try {
    const mod = await WebAssembly.compile(capMemory(new Uint8Array(e.data.wasm)));
    for (const imp of WebAssembly.Module.imports(mod)) {
      if (imp.module !== "wasi_snapshot_preview1") throw new Error("the program imports " + imp.module + "." + imp.name);
    }
    const fds = [new OpenFile(new File([])), stream(1), stream(2), new PreopenDirectory("/tmp", new Map())];
    const wasi = new WASI(["play"], [], fds, { debug: false });
    const inst = await WebAssembly.instantiate(mod, { wasi_snapshot_preview1: wasi.wasiImport });
    const t0 = performance.now();
    let code;
    try {
      code = wasi.start(inst);
    } catch (err) {
      if (total >= MAX_OUTPUT) { self.postMessage({ exit: null, ms: performance.now() - t0 }); return; }
      throw err;
    }
    self.postMessage({ exit: code, ms: performance.now() - t0 });
  } catch (err) {
    self.postMessage({ crash: String(err && err.message || err) });
  }
};
