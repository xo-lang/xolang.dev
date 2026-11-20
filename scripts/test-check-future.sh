#!/bin/bash
# test-check-future.sh: check-future.sh names each future page with its
# date and publishDate, also when its title has a comma (hugo list future
# quotes that title in its CSV; cut -d, split inside it and printed
# another column as the date, task #504).
# HUGO names the hugo binary (default .tools/bin/hugo).
set -euo pipefail
cd "$(dirname "$0")/.."
hugo=$(cd "$(dirname "${HUGO:-.tools/bin/hugo}")" && pwd)/$(basename "${HUGO:-.tools/bin/hugo}")
t=$(mktemp -d)
trap 'rm -rf "$t"' EXIT
mkdir -p "$t/scripts" "$t/content/blog"
cp scripts/check-future.sh "$t/scripts/"
printf 'baseURL = "https://example.org/"\ntitle = "t"\n' > "$t/hugo.toml"
printf -- '---\ntitle: "One app, built twice"\ndate: 2099-01-02T09:00:00-05:00\n---\nx\n' > "$t/content/blog/p.md"
if out=$(HUGO="$hugo" bash "$t/scripts/check-future.sh" 2>&1); then
  echo "test-check-future: FAIL: a page dated 2099 passed"
  exit 1
fi
want='content/blog/p.md,2099-01-02T09:00:00-05:00,2099-01-02T09:00:00-05:00'
if ! printf '%s\n' "$out" | grep -qxF "$want"; then
  echo "test-check-future: FAIL: want the line $want, got:"
  printf '%s\n' "$out"
  exit 1
fi
echo "test-check-future: ok"
