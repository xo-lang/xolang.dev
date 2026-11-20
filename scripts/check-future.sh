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
  # path, date and publishDate; a CSV reader, since Hugo quotes a title
  # with a comma and cut -d, split inside it (task #504)
  printf '%s\n' "$out" | python3 -I -c 'import csv, sys
rows = list(csv.reader(sys.stdin))
for r in rows[1:]:
    if r:
        print(",".join([r[0], r[3], r[5]]))'
  exit 1
fi
echo "check-future: ok"
