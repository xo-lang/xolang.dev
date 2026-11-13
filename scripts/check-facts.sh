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
