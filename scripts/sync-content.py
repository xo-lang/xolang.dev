#!/usr/bin/env python3
"""Copy the spec and release notes from the Xo repository into content/.

Usage: scripts/sync-content.py [path to the xo repo]

The repo defaults to $XO_REPO, then ../../codelang (the local checkout next to
this site). Generated files are committed so the site builds without the
repo; rerun this after the spec or CHANGELOG.md changes.
"""
import os
import re
import sys

SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = (sys.argv[1] if len(sys.argv) > 1 else
        os.environ.get("XO_REPO", os.path.join(SITE, "..", "..", "codelang")))
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
    ]:
        body = read("spec/" + name)
        status = re.search(r"^Status: (.*)$", body, re.M)
        write(f"content/docs/spec/{name}", front(
            title=title, linkTitle=link, weight=weight, description=desc,
            toc=True, hideTitle=True, source=SOURCE + "spec/" + name,
            status=status.group(1) if status else "",
            generated="scripts/sync-content.py from spec/" + name + "; edit the source, not this file",
        ) + body)


def changelog():
    text = read("CHANGELOG.md")
    heads = list(re.finditer(r"^## (v\d+\.\d+\.\d+) \((\d{4}-\d{2}-\d{2})\)\s*$", text, re.M))
    for i, m in enumerate(heads):
        version, date = m.group(1), m.group(2)
        end = heads[i + 1].start() if i + 1 < len(heads) else len(text)
        body = text[m.end():end].strip() + "\n"
        draft = re.search(r"Spec draft (\d+\.\d+)", body)
        desc = f"Release notes for Xo {version}" + (f", spec draft {draft.group(1)}." if draft else ".")
        slug = version.replace(".", "-")
        write(f"content/blog/{slug}.md", front(
            title=f"Xo {version}", date=date, description=desc,
            source=SOURCE + "CHANGELOG.md",
            generated="scripts/sync-content.py from CHANGELOG.md; edit the source, not this file",
        ) + body)


if __name__ == "__main__":
    if not os.path.exists(os.path.join(REPO, "spec", "core.md")):
        sys.exit(f"no spec/core.md under {REPO}; pass the xo repo path or set XO_REPO")
    spec()
    changelog()
