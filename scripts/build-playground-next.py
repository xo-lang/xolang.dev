#!/usr/bin/env python3
"""Build the /play-next/ playground's assets into static/play-next/assets/.

Usage: scripts/build-playground-next.py [path to the xo repo]

The playground on Xo's own WebAssembly backend (decision 0242 in the xo
repo): no Go toolchain in the page. This script uses the repo's bin/xo:

  xoc.wasm     selfhost/wasm, the Xo compiler with its wasm backend, built
               for wasm by itself (`--play check|fmt|build`, play.xo):
               the browser checks, formats, and compiles the program to a
               WASI module, which the runner worker runs
  std.bundle   the .xo sources (and xo.mod files) of the repo's std, which
               the compiler reads at /w/std

Each is compressed with brotli (the `brotli` command) and named by its
hash; manifest.json lists them with their sizes and the repo commit. The
build of xoc.wasm takes about a minute and several GB of memory.
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else
                       os.environ.get("XO_REPO", os.path.join(SITE, "..", "xo")))
OUT = os.path.join(SITE, "static", "play-next", "assets")


def run(args, cwd):
    print("+", " ".join(args), flush=True)
    return subprocess.run(args, cwd=cwd, check=True, capture_output=True, text=True).stdout


def bundle(files):
    """A bundle: a little endian uint32 header length, the JSON header
    ([{name, size}]), then the files' bytes in order (toolchain.js
    unbundle)."""
    header = []
    data = bytearray()
    for name, path in files:
        b = open(path, "rb").read()
        header.append({"name": name, "size": len(b)})
        data += b
    h = json.dumps(header, separators=(",", ":")).encode()
    return len(h).to_bytes(4, "little") + h + bytes(data)


def std_files():
    """Every .xo source and xo.mod under std/, but tests and testdata."""
    root = os.path.join(REPO, "std")
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d != "testdata")
        for f in sorted(filenames):
            if (f.endswith(".xo") and not f.endswith("_test.xo")) or f == "xo.mod":
                p = os.path.join(dirpath, f)
                out.append((os.path.relpath(p, root), p))
    return out


def main():
    xo = os.path.join(REPO, "bin", "xo")
    commit = run(["git", "rev-parse", "--short=8", "HEAD"], REPO).strip()
    with tempfile.TemporaryDirectory() as tmp:
        wasmc = os.path.join(tmp, "wasmc")
        run([xo, "build", "--backend=go", "-o", wasmc, "selfhost/wasm"], REPO)
        line = run([wasmc, "--std=std", "--wd=" + REPO, "--out=" + tmp, "selfhost/wasm"], REPO).strip()
        if not line.startswith("== ok"):
            sys.exit("selfhost/wasm did not build for wasm: " + line)
        parts = {
            "xoc": open(os.path.join(tmp, "wasm.wasm"), "rb").read(),
            "std": bundle(std_files()),
        }
        if os.path.isdir(OUT):
            shutil.rmtree(OUT)
        os.makedirs(OUT)
        files = {}
        for name, data in parts.items():
            raw = os.path.join(tmp, name + ".raw")
            open(raw, "wb").write(data)
            comp = subprocess.run(["brotli", "-c", "-q", "11", raw], check=True, capture_output=True).stdout
            h = hashlib.sha256(comp).hexdigest()[:12]
            path = "assets/%s-%s.brotli" % (name, h)
            open(os.path.join(SITE, "static", "play-next", path), "wb").write(comp)
            files[name] = {"path": path, "size": len(data), "compressed": len(comp)}
            print("%s: %d bytes, %d brotli" % (name, len(data), len(comp)))
    manifest = {"xo": commit, "files": files}
    with open(os.path.join(SITE, "static", "play-next", "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")


main()
