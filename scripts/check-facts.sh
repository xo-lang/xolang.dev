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
newest=$(grep -l '^date:' content/releases/[0-9]*.md | while read -r p; do
  printf '%s %s\n' "$(sed -n 's/^date: *//p' "$p")" "$p"; done | sort -r | head -1 | cut -d' ' -f2)
ptag=$(sed -n 's/^tag: *"\(.*\)"$/\1/p' "$newest")
if [ "$ptag" != "$tag" ]; then
  echo "check-facts: data/release.toml tag $tag, but the newest release page $newest says $ptag"
  fail=1
fi
[ "$fail" = 0 ] && echo "check-facts: ok (release $tag, newest page $newest)"
exit "$fail"
