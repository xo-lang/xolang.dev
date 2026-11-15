#!/bin/bash
# check-facts.sh: the current release's version is written in one place,
# data/release.toml, and every page that states the current release reads
# it (the `release` shortcode, site.Data.release). Fails when:
#  - one of those pages names a release version in its own text (a
#    measured or historical mention is allowed: a line naming a
#    comparison or measured workloads, a results file, "since 0.N.N"
#    or "start with 0.N.N");
#  - data/release.toml's tag is not the newest release page's `tag:`.
# Release notes, blog posts and the measured comparison pages keep the
# versions they were written about and are not checked.
set -euo pipefail
cd "$(dirname "$0")/.."
files=(
  content/docs/getting-started.md
  content/docs/faq.md
  content/docs/_index.md
  content/releases/_index.md
  layouts/home.html
  layouts/home.llms.txt
  layouts/home.llmsfull.txt
  layouts/roadmap.html
  layouts/roadmap.markdown.md
  layouts/_partials/seo.html
  hugo.toml
)
fail=0
for f in "${files[@]}"; do
  [ -f "$f" ] || { echo "check-facts: $f is missing"; fail=1; continue; }
  while IFS= read -r line; do
    case "$line" in
      *comparison*|*release-vs-go*|*workloads*|*"since 0."*|*"start with 0."*) continue ;;
    esac
    echo "check-facts: $f names a release version; use data/release.toml: $line"
    fail=1
  done < <(grep -nE '(^|[^0-9.])v?0\.[0-9]+\.[0-9]+([^0-9]|$)' "$f" || true)
done
tag=$(sed -n 's/^tag = "\(.*\)"$/\1/p' data/release.toml)
# a draft release page (draft: true, prepared before its cut) is not the newest
# grep -L exits 1 when no file has the line (macOS grep), which pipefail would make fatal
newest=$({ grep -L '^draft: *true' content/releases/[0-9]*.md || true; } | xargs grep -l '^date:' | while read -r p; do
  printf '%s %s\n' "$(sed -n 's/^date: *//p' "$p")" "$p"; done | sort -r | head -1 | cut -d' ' -f2)
ptag=$(sed -n 's/^tag: *"\(.*\)"$/\1/p' "$newest")
if [ "$ptag" != "$tag" ]; then
  echo "check-facts: data/release.toml tag $tag, but the newest release page $newest says $ptag"
  fail=1
fi
# std coverage is regenerated from main at every deploy (gen-stdcov.py, Lang 2
# and the lead, 2026-11-15: the live page stood at 1 Proven while main had 11):
# its "main HASH of DATE" is at most 7 days older than the site's HEAD commit,
# and, when XO_REPO names a checkout of the public xo-lang/xo (the page's
# hashes are the public repository's), HASH is an ancestor of its origin/main
# (STDCOV_MAX_DAYS changes the 7)
cov=content/docs/std-coverage.md
if [ -f "$cov" ]; then
  lbl=$(grep -o 'development, main [0-9a-f]* of [0-9-]*' "$cov" | head -1)
  chash=$(echo "$lbl" | awk '{print $3}'); cdate=$(echo "$lbl" | awk '{print $5}')
  if [ -z "$chash" ] || [ -z "$cdate" ]; then
    echo "check-facts: $cov has no \"development, main HASH of DATE\" label (regenerate with scripts/gen-stdcov.py XO_REPO .)"; fail=1
  else
    sdate=$(git log -1 --format=%cs HEAD)
    age=$(python3 -c 'import sys, datetime as d; print((d.date.fromisoformat(sys.argv[1]) - d.date.fromisoformat(sys.argv[2])).days)' "$sdate" "$cdate")
    if [ "$age" -gt "${STDCOV_MAX_DAYS:-7}" ]; then
      echo "check-facts: $cov describes main $chash of $cdate, $age days before this site commit ($sdate): regenerate with scripts/gen-stdcov.py XO_REPO ."; fail=1
    fi
    if [ -n "${XO_REPO:-}" ] && ! git -C "$XO_REPO" merge-base --is-ancestor "$chash" origin/main 2>/dev/null; then
      echo "check-facts: $cov describes $chash, which is not on $XO_REPO's origin/main (XO_REPO must be the public xo-lang/xo)"; fail=1
    fi
  fi
fi
# the std reference: one page per module, the index lists exactly those pages, and no page names the release
if [ -d content/docs/stdlib ]; then
  idx=content/docs/stdlib/_index.md
  for p in content/docs/stdlib/*.md; do
    n=$(basename "$p" .md)
    [ "$n" = "_index" ] && continue
    grep -q "]($n/)" "$idx" || { echo "check-facts: $idx has no row for $p"; fail=1; }
  done
  for n in $(grep -o '^| \[`std/[^`]*`\]([^/)]*/)' "$idx" | sed 's|.*\](||; s|/)||'); do
    [ -f "content/docs/stdlib/$n.md" ] || { echo "check-facts: $idx lists $n, but content/docs/stdlib/$n.md is missing"; fail=1; }
  done
  if grep -lE "(^|[^0-9.])v?$tag([^0-9]|$)" content/docs/stdlib/*.md >/dev/null 2>&1; then
    echo "check-facts: a std reference page names the release $tag"; fail=1
  fi
fi
[ "$fail" = 0 ] && echo "check-facts: ok (release $tag, newest page $newest)"
exit "$fail"
