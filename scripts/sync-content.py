#!/usr/bin/env python3
"""Copy the spec and release notes from the Xo repository into content/.

Usage: scripts/sync-content.py [path to the xo repo]

The repo defaults to $XO_REPO, then ../xo (the local checkout next to
this site). Generated files are committed so the site builds without the
repo; rerun this after the spec or CHANGELOG.md changes.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = (sys.argv[1] if len(sys.argv) > 1 else
        os.environ.get("XO_REPO", os.path.join(SITE, "..", "xo")))
SOURCE = "https://github.com/xo-lang/xo/blob/main/"


def read(rel):
    with open(os.path.join(REPO, rel), encoding="utf-8") as f:
        return f.read()


def write(rel, text):
    path = os.path.join(SITE, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print("wrote", rel)


def front(**kv):
    lines = ["---"]
    for k, v in kv.items():
        if isinstance(v, bool):
            lines.append(f"{k}: {'true' if v else 'false'}")
        elif isinstance(v, int):
            lines.append(f"{k}: {v}")
        else:
            lines.append(f"{k}: {quote(v)}")
    lines.append("---\n")
    return "\n".join(lines)


def quote(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def spec():
    for name, title, link, weight, desc in [
        ("core.md", "Xo Language Specification (Core)", "Core language", 10,
         "Syntax and semantics of Xo: types, errors, concurrency, effects, modules, diagnostics."),
        ("std.md", "Xo Standard Library", "Standard library", 20,
         "Prelude methods and the standard library surface."),
        ("conventions.md", "Xo Conventions", "Conventions", 30,
         "How to write Xo: naming, errors, collections, performance, concurrency, tests and layout, each rule with its source."),
    ]:
        body = read("spec/" + name)
        status = re.search(r"^Status: (.*)$", body, re.M)
        write(f"content/docs/spec/{name}", front(
            title=title, linkTitle=link, weight=weight, description=desc,
            toc=True, hideTitle=True, source=SOURCE + "spec/" + name,
            status=status.group(1) if status else "",
            generated="scripts/sync-content.py from spec/" + name + "; edit the source, not this file",
        ) + body)


# Release notes live only on the /releases/ pages (content/releases/0.N.md,
# written by the release step); the blog gets no release posts (owner,
# 2026-11-05: "No release blog posts in the blog section"). The posts
# changelog() used to write from CHANGELOG.md (v0.7.0 to v0.9.0, v0.36.0,
# v0.38.1) are gone, their URLs aliases of the matching /releases/ page.
# This script never writes content/releases: those pages are edited by hand
# and keep what is added after a release (a Known issues entry found later,
# as 0.39's cabi.on_prof one, 2026-11-05).
RELEASE_POST = re.compile(r"^v\d+-\d+-\d+\.md$")


def no_release_posts():
    """Fail if a release post (content/blog/vN-N-N.md) is back."""
    posts = sorted(n for n in os.listdir(os.path.join(SITE, "content", "blog")) if RELEASE_POST.match(n))
    if posts:
        sys.exit("release posts in content/blog (release notes go in content/releases only): " + ", ".join(posts))


def md_text(s):
    """`xo explain` prose is plain text: escape <placeholders> outside code spans."""
    parts = s.split("`")
    for i in range(0, len(parts), 2):
        parts[i] = parts[i].replace("<", "\\<")
    return "`".join(parts)


def xo_binary():
    """$XO, else the repo's bin/xo, which `go run ./scripts/xobuild` builds
    (the Go compiler in cmd/xo was deleted, decision 0215)."""
    if os.environ.get("XO"):
        return os.environ["XO"], None
    out = os.path.join(REPO, "bin", "xo")
    if not os.path.exists(out):
        subprocess.run(["go", "run", "./scripts/xobuild"], cwd=REPO, check=True)
    return out, None


def diagnostics():
    """One page per XOnnnn code: the spec's table row plus `xo explain --json`."""
    spec = read("spec/core.md")
    rows = re.findall(r"^\| `(XO\d{4})` \| (\w+) \| ([^|]+?) \| (.+?) \|\s*$", spec, re.M)
    if not rows:
        sys.exit("no diagnostic table rows found in spec/core.md")
    xo, tmp = xo_binary()
    out_dir = os.path.join(SITE, "content/docs/diagnostics")
    shutil.rmtree(out_dir, ignore_errors=True)
    table = ["| Code | Severity | Phase | Meaning |", "|---|---|---|---|"]
    try:
        for code, severity, phase, meaning in rows:
            ex = json.loads(subprocess.run([xo, "explain", "--json", code], check=True,
                                           capture_output=True, text=True).stdout)
            slug = code.lower()
            table.append(f"| [`{code}`]({slug}/) | {severity} | {phase} | {meaning} |")
            body = [md_text(ex["detail"]), ""]
            if ex.get("example"):
                body += ["## Example", "", "```xo", ex["example"].rstrip("\n"), "```", ""]
            if ex.get("fix"):
                body += ["## Fix", "", "```xo", ex["fix"].rstrip("\n"), "```", ""]
            body += [f"Run `xo explain {code}` for this text in a terminal, or see",
                     "[section 10.6 of the specification](../../spec/core/#106-diagnostic-codes).", ""]
            write(f"content/docs/diagnostics/{slug}.md", front(
                title=f"{code}: {ex['title']}", linkTitle=code, description=ex["summary"],
                severity=severity, phase=phase.strip(),
                generated="scripts/sync-content.py from xo explain and spec/core.md; edit the source, not this file",
            ) + "\n".join(body))
    finally:
        if tmp:
            shutil.rmtree(tmp, ignore_errors=True)
    write("content/docs/diagnostics/_index.md", front(
        title="Diagnostic codes", description="Every XOnnnn code the xo toolchain reports, with an example and a fix.",
        weight=40, generated="scripts/sync-content.py; edit the source, not this file",
    ) + "\n".join([
        "Every problem `xo check` reports has a stable code. A code never changes",
        "meaning; new problems get new codes. `xo check --json` reports them as",
        "JSON with notes and machine applicable fixes, and `xo explain <code>`",
        "prints the explanation below in a terminal.",
        "",
    ] + table + ["{.codes}"]) + "\n")


if __name__ == "__main__":
    if not os.path.exists(os.path.join(REPO, "spec", "core.md")):
        sys.exit(f"no spec/core.md under {REPO}; pass the xo repo path or set XO_REPO")
    spec()
    diagnostics()
    no_release_posts()
