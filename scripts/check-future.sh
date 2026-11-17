#!/bin/bash
# check-future.sh: fails when a page's date or publishDate is later than
# now. Hugo leaves such a page out of the build with no warning
# (buildFuture is off), so a release page or post dated ahead of its
# publish time 404s until someone notices (the 0.33 notes, 2026-10-27).
# Date pages at or before the moment they are published, with an offset.
# HUGO names the hugo binary (default .tools/bin/hugo).
set -euo pipefail
cd "$(dirname "$0")/.."
hugo=${HUGO:-.tools/bin/hugo}
out=$("$hugo" list future)
pages=$(printf '%s\n' "$out" | tail -n +2 | grep -v '^$' || true)
if [ -n "$pages" ]; then
  echo "check-future: these pages are dated in the future and Hugo would leave them out:"
  printf '%s\n' "$pages" | cut -d, -f1,4,6
  exit 1
fi
echo "check-future: ok"
