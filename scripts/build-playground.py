#!/usr/bin/env python3
"""Build the playground's assets into static/play/assets/.

Usage: scripts/build-playground.py [path to the xo repo]

The playground on Xo's own WebAssembly backend (decision 0242 in the xo
repo): no Go toolchain in the page. (The Go-era playground, Go's compiler
and linker in the tab, was built by this script until 2026-10-16; git
history and decision 0242 have it.) This script uses the repo's bin/xo:

  xoc.wasm     compiler/wasm, the Xo compiler with its wasm backend, built
               for wasm by the repo's xo (`xo build --backend=wasm`; no Go
               backend step since 2026-10-29) (`--play check|fmt|build`,
               play.xo):
               the browser checks, formats, and compiles the program to a
               WASI module, which the runner worker runs
  std.bundle   the .xo sources (and xo.mod files) of the repo's std, which
               the compiler reads at /w/std: the first load has only the
               files a program with no `use` reads (scripts/play-trace.mjs
               over the repo's internal/llvm goldens), and every other file
               is in a pack, one per set of std modules needing it; the
               manifest's "stdmods" names each `use std/M` module's packs,
               which the page fetches before it builds a program naming M,
               and it fetches every pack when a build names a module it does
               not have (assets/js/play/toolchain.js)
  std.rec      std's declaration record (decision 0583 lever (b)), which
               scripts/play-record.mjs has the compiler write over the
               page's own paths (it needs node); the page's compiler loads
               it instead of checking std's declarations on every build and
               REPL entry

Each is compressed with brotli (the `brotli` command) and named by its
hash; manifest.json lists them with their sizes and the repo commit. The
build of xoc.wasm takes about a minute and several GB of memory.
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else
                       os.environ.get("XO_REPO", os.path.join(SITE, "..", "xo")))
OUT = os.path.join(SITE, "static", "play", "assets")


def run(args, cwd):
    print("+", " ".join(args), flush=True)
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("%s failed (exit %d):\n%s%s" % (args[0], r.returncode, r.stdout[-4000:], r.stderr[-4000:]))
    return r.stdout


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
    """Every .xo source and xo.mod under std/, but tests and testdata, and
    the lists at std's top the compiler reads (merged.txt, decision 0588 in
    the xo repo: without it a merged module's `use native/rt` is not found;
    rt_hosted.txt)."""
    root = os.path.join(REPO, "std")
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = sorted(d for d in dirnames if d != "testdata")
        for f in sorted(filenames):
            if (f.endswith(".xo") and not f.endswith("_test.xo")) or f == "xo.mod" or (dirpath == root and f.endswith(".txt")):
                p = os.path.join(dirpath, f)
                out.append((os.path.relpath(p, root), p))
    return out


USE = re.compile(r"^\s*use\s+(\S+)", re.M)


def closures(allf):
    """Per std module of the top level (std/NAME for NAME.xo): the bundle
    names of the files its `use` lines reach. A module P is P.xo or the
    files of the directory P, and std/P is std/P.xo with native/P.xo, the
    native backends' (and wasm's) side of it."""
    names = {n for n, _ in allf}
    paths = dict(allf)

    def files(mod):
        p = mod[len("std/"):] if mod.startswith("std/") else mod
        out = [c for c in ([p + ".xo"] if p.startswith("native/") else [p + ".xo", "native/" + p + ".xo"]) if c in names]
        out += [n for n in names if n.startswith(p + "/") and n.count("/") == p.count("/") + 1]
        return out

    res = {}
    for top in sorted(n for n in names if "/" not in n and n.endswith(".xo")):
        mod = "std/" + top[:-3]
        seen, todo, fs = set(), [mod], set()
        while todo:
            m = todo.pop()
            if m in seen:
                continue
            seen.add(m)
            for f in files(m):
                fs.add(f)
                for u in USE.findall(open(paths[f], encoding="utf-8").read()):
                    if u.startswith("std/") or u.startswith("native/"):
                        todo.append(u)
        res[mod] = fs
    return res


def main():
    xo = os.path.join(REPO, "bin", "xo")
    # XO_PLAY_COMMIT names a tree that is not one commit (a release plus a
    # fix applied to it: "72875102+abcdef12"), else the repo's HEAD
    commit = os.environ.get("XO_PLAY_COMMIT") or run(["git", "rev-parse", "--short=8", "HEAD"], REPO).strip()
    with tempfile.TemporaryDirectory() as tmp:
        xoc = os.path.join(tmp, "xoc.wasm")
        run([xo, "build", "--backend=wasm", "-o", xoc, "compiler/wasm"], REPO)
        std = bundle(std_files())
        stdpath = os.path.join(tmp, "std.bundle")
        open(stdpath, "wb").write(std)
        rec = os.path.join(tmp, "std.rec")
        print(run(["node", os.path.join(SITE, "scripts", "play-record.mjs"), xoc, stdpath, rec], SITE).strip())
        trace = os.path.join(tmp, "trace.json")
        corpus = os.path.join(REPO, "internal", "llvm", "testdata", "golden")
        print(run(["node", os.path.join(SITE, "scripts", "play-trace.mjs"), xoc, stdpath, rec, trace, corpus], SITE).strip())
        tr = json.load(open(trace))
        allf = std_files()
        # the first load: what a program with no `use` reads, and every file
        # but a .xo source (xo.mod files)
        core = set(tr["core"]) | {n for n, _ in allf if not n.endswith(".xo")}
        # a pack per set of modules needing a file (the files its `use`
        # lines reach, and those its trace opened); files no module needs go
        # in a pack of their own (fetched only by the fallback)
        need = closures(allf)
        for m, fs in tr["mods"].items():
            need.setdefault(m, set()).update(fs)
        sig = {}
        for m, fs in sorted(need.items()):
            for f in sorted(fs):
                if f not in core:
                    sig.setdefault(f, []).append(m)
        groups = {}
        for n, path in allf:
            if n in core:
                continue
            groups.setdefault(tuple(sig.get(n, [])), []).append((n, path))
        parts = {
            "xoc": open(xoc, "rb").read(),
            "std": bundle([(n, p) for n, p in allf if n in core]),
            "rec": open(rec, "rb").read(),
        }
        packs = []
        stdmods = {}
        for k, (mods, fs) in enumerate(sorted(groups.items(), key=lambda kv: (len(kv[0]) == 0, kv[0]))):
            name = "stdp%d" % k
            parts[name] = bundle(fs)
            packs.append(name)
            for m in mods:
                stdmods.setdefault(m, []).append(name)
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
            open(os.path.join(SITE, "static", "play", path), "wb").write(comp)
            files[name] = {"path": path, "size": len(data), "compressed": len(comp)}
            print("%s: %d bytes, %d brotli" % (name, len(data), len(comp)))
    manifest = {"xo": commit, "files": files, "stdpacks": packs, "stdmods": stdmods}
    first = sum(files[n]["compressed"] for n in ("xoc", "std", "rec"))
    print("first load: %d brotli; %d packs, %d brotli in all" % (first, len(packs), sum(files[n]["compressed"] for n in packs)))
    with open(os.path.join(SITE, "static", "play", "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")


main()
