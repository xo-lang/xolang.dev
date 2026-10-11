#!/usr/bin/env python3
"""Build the playground's WebAssembly into static/play/assets/.

Usage: scripts/build-playground.py [path to the xo repo]

The playground runs entirely in the visitor's browser (decision 0144 in the
xo repo). This script builds, with the `go` on PATH:

  xoplay.wasm   cmd/xoplay of the xo repo (check, fmt, gen), tag
                xo_playground so it embeds no runtime source
  compile.wasm  the Go compiler (cmd/compile), for GOOS=wasip1
  link.wasm     the Go linker (cmd/link), for GOOS=wasip1
  pkg.bundle    the archives of package rt (tag xo_nohttp) and every Go
                standard package it needs, compiled for wasip1/wasm
  gobind.bundle `use go` bindings (xo bind) of the Go packages in GOBIND;
                their adapters are compiled into the rt archive, so the
                browser never compiles rt (and never needs its source)

Each is compressed with brotli (the `brotli` command; about a third smaller
than gzip, decoded in the worker by Google's JS decoder, since browsers'
DecompressionStream has no brotli) and named by its hash; manifest.json
lists them. The
compiler, linker, and archives must come from the same Go release, which is
why they are built together here. Rerun after the compiler or std/rt
changes, or after a Go upgrade.
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
                       os.environ.get("XO_REPO", os.path.join(SITE, "..", "..", "codelang")))
OUT = os.path.join(SITE, "static", "play", "assets")
WASI = dict(os.environ, GOOS="wasip1", GOARCH="wasm", GOWORK="off", GOFLAGS="", CGO_ENABLED="0")
# The rt variant the browser links against: a program that imports std/http
# needs the other one (gen.Program.Tags) and is refused by the playground.
TAGS = "xo_nohttp"
# Go packages a playground program can `use go`.
GOBIND = """bytes crypto/md5 crypto/sha1 crypto/sha256 encoding/base64 encoding/csv
encoding/hex errors fmt hash/crc32 hash/fnv html maps math math/bits net/mail
net/netip net/url path regexp slices sort strconv strings text/template time
unicode unicode/utf8""".split()


def ident(p):
    """gobind.ident: the Go identifier fragment of an import path."""
    return "".join(c if c.isascii() and c.isalnum() else "_" for c in p)


def run(args, cwd, env=None):
    print("+", " ".join(args), flush=True)
    return subprocess.run(args, cwd=cwd, env=env or os.environ, check=True,
                          capture_output=True, text=True).stdout


def bundle(entries):
    """name -> bytes, as a little endian u32 header length, a JSON header
    [{name, size}], and the data in header order."""
    header = json.dumps([{"name": n, "size": len(d)} for n, d in entries]).encode()
    return len(header).to_bytes(4, "little") + header + b"".join(d for _, d in entries)


def main():
    if not os.path.exists(os.path.join(REPO, "cmd", "xoplay")):
        sys.exit(f"no cmd/xoplay under {REPO}; pass the xo repo path or set XO_REPO")
    tmp = tempfile.mkdtemp()
    try:
        blobs = {}
        flags = ["-trimpath", "-buildvcs=false", "-ldflags=-s -w"]
        run(["go", "build", "-tags", "xo_playground", *flags, "-o", f"{tmp}/xoplay.wasm", "./cmd/xoplay"], REPO, WASI)
        run(["go", "build", *flags, "-o", f"{tmp}/compile.wasm", "cmd/compile"], tmp, WASI)
        run(["go", "build", *flags, "-o", f"{tmp}/link.wasm", "cmd/link"], tmp, WASI)
        for n in ("xoplay", "compile", "link"):
            with open(f"{tmp}/{n}.wasm", "rb") as f:
                blobs[n] = f.read()

        # bindings, made by the native xo of the same repo
        run(["go", "build", "-o", f"{tmp}/xo", "./cmd/xo"], REPO)
        bind = os.path.join(tmp, "bind")
        os.makedirs(bind)
        with open(os.path.join(bind, "xo.mod"), "w") as f:
            f.write("module example.com/play\nedition 2026\n")
        gobind = os.path.join(tmp, "gobind")
        for p in GOBIND:
            run([f"{tmp}/xo", "bind", p], bind, dict(os.environ, XO_GOBIND_DIR=gobind))
        bound = []
        for p in GOBIND:
            for ext in (".xo", ".go"):
                with open(os.path.join(gobind, p + ext), "rb") as f:
                    bound.append((p + ext, f.read()))
        blobs["gobind"] = bundle(bound)

        # package rt in a module named like the build directory, xoprog
        mod = os.path.join(tmp, "mod")
        os.makedirs(os.path.join(mod, "rt"))
        goversion = run(["go", "env", "GOVERSION"], tmp).strip()
        with open(os.path.join(mod, "go.mod"), "w") as f:
            f.write("module xoprog\n\ngo " + goversion.removeprefix("go").rsplit(".", 1)[0] + "\n")
        rt = os.path.join(REPO, "std", "rt")
        for n in sorted(os.listdir(rt)):
            if (n.endswith(".go") or n.endswith(".s")) and not n.endswith("_test.go"):
                shutil.copy(os.path.join(rt, n), os.path.join(mod, "rt", n))
        for p in GOBIND:
            # the name gen gives the adapter in a build directory
            shutil.copy(os.path.join(gobind, p + ".go"), os.path.join(mod, "rt", "xo_gobind_" + ident(p) + ".go"))
        lines = run(["go", "list", "-trimpath", "-tags=" + TAGS, "-gcflags=all=-dwarf=false",
                     "-export", "-deps", "-f", "{{if .Export}}{{.ImportPath}} {{.Export}}{{end}}", "./rt"],
                    mod, WASI).split("\n")
        entries = []
        for line in lines:
            if line.strip():
                path, export = line.split(" ", 1)
                with open(export, "rb") as f:
                    entries.append((path, f.read()))
        blobs["pkg"] = bundle(entries)
        print(f"{len(entries)} archives")

        shutil.rmtree(OUT, ignore_errors=True)
        os.makedirs(OUT)
        manifest = {"go": goversion, "tags": TAGS.split(","),
                    "gobind": ["xo_gobind_" + ident(p) + ".go" for p in GOBIND], "gobindPackages": GOBIND, "files": {}}
        for n, data in blobs.items():
            # .brotli, not .br: a host could serve .br with Content-Encoding
            name = f"{n}-{hashlib.sha256(data).hexdigest()[:12]}.brotli"
            raw = os.path.join(tmp, n + ".raw")
            with open(raw, "wb") as f:
                f.write(data)
            run(["brotli", "-q", "11", "-w", "24", "-f", "-o", os.path.join(OUT, name), raw], tmp)
            packed = os.path.getsize(os.path.join(OUT, name))
            manifest["files"][n] = {"path": "assets/" + name, "size": len(data), "compressed": packed}
            print(f"wrote {name}: {len(data) / 1e6:.1f} MB, {packed / 1e6:.1f} MB compressed")
        with open(os.path.join(SITE, "static", "play", "manifest.json"), "w") as f:
            json.dump(manifest, f, indent=2)
            f.write("\n")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
