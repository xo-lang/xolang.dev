// The toolchain worker's client, shared by the playground (/play/) and
// the REPL page (/repl/): one worker (toolchain.js) per page, requests by
// id, download progress on the page's status line, and a time limit per
// request after which the worker is restarted.

export const TOOL_LIMIT_MS = 120000; // a toolchain request (includes the download)

// client returns request(cmd, source, onStatus) for the worker at url;
// setStatus shows the download progress.
export function client(url, setStatus) {
  let worker = null;
  let nextId = 1;
  const pending = new Map();

  function start() {
    worker = new Worker(url, { type: "module" });
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

  return function request(cmd, source, onStatus = () => {}) {
    if (!worker) start();
    const id = nextId++;
    const downloads = {};
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // a stuck compile: restart the worker (the next request starts a new one)
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
  };
}

// el makes an element with a class and text.
export function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// ---- download notice --------------------------------------------------

// Nothing is downloaded until the visitor agrees, once per browser (one
// answer for both pages).
const CONSENT = "xo-play-download-ok";
let agreed = false;

export function consented() {
  if (agreed) return true;
  try { agreed = localStorage.getItem(CONSENT) === "1"; } catch (e) {}
  return agreed;
}

export function agree() {
  agreed = true;
  try { localStorage.setItem(CONSENT, "1"); } catch (e) {}
}

// sizes writes the real download size from the manifest into box's
// [data-size=check] (the size written in the page stays when it fails).
export async function sizes(box, manifest = "/play/manifest.json") {
  try {
    const m = await (await fetch(manifest, { credentials: "omit", cache: "no-cache" })).json();
    const mb = (n) => Math.max(1, Math.round(n / 1048576)) + " MB";
    const f = m.files;
    const e = box.querySelector('[data-size="check"]');
    if (e) e.textContent = mb(f.xoc.compressed + f.std.compressed + (f.rec ? f.rec.compressed : 0));
  } catch (e) {
    // keep the size written in the page
  }
}
