#!/bin/bash
# test-check-facts.sh: check-facts.sh accepts a std-coverage hash that is on
# XO_REPO's main or on a release tag (v*), and refuses one on neither (task
# #684: the 0.55.0 page cites the v0.55.0 tag commit, which the publish
# mirror's main does not contain). CHECK_FACTS names the script under test.
set -euo pipefail
cd "$(dirname "$0")/.."
cf=$(cd "$(dirname "${CHECK_FACTS:-scripts/check-facts.sh}")" && pwd)/$(basename "${CHECK_FACTS:-scripts/check-facts.sh}")
t=$(mktemp -d)
trap 'rm -rf "$t"' EXIT
g() { git -C "$1" -c user.name=t -c user.email=t@example.org "${@:2}"; }
# a fake public repository: main, a release branch tagged v9.9.9, a stray branch
r=$t/repo; mkdir -p "$r"; git -C "$r" init -q -b main
g "$r" commit -q --allow-empty -m base
g "$r" checkout -q -b rel; g "$r" commit -q --allow-empty -m release; g "$r" tag v9.9.9
tagged=$(git -C "$r" rev-parse --short=9 HEAD)
g "$r" checkout -q -b stray main; g "$r" commit -q --allow-empty -m stray
stray=$(git -C "$r" rev-parse --short=9 HEAD)
g "$r" checkout -q main
today=$(date +%Y-%m-%d)
run() { # HASH: check-facts' output on a copy of this site whose std-coverage cites HASH
  local s=$t/site-$1
  mkdir -p "$s"; git archive HEAD | tar -x -C "$s"
  sed -i.bak -E "s/development, main [0-9a-f]+ of [0-9-]+/development, main $1 of $today/" "$s/content/docs/std-coverage.md"
  rm "$s/content/docs/std-coverage.md.bak"
  cp "$cf" "$s/scripts/check-facts.sh"  # it runs from its own parent directory
  git -C "$s" init -q; g "$s" add -A; g "$s" commit -q -m site
  (cd "$s" && XO_REPO=$r bash scripts/check-facts.sh 2>&1) || true
}
fail=0
if run "$tagged" | grep -q "describes $tagged, which is not on"; then
  echo "test-check-facts: FAIL: a hash on release tag v9.9.9 was refused"; fail=1
fi
if ! run "$stray" | grep -q "describes $stray, which is not on"; then
  echo "test-check-facts: FAIL: a hash on no main and no release tag passed"; fail=1
fi
[ $fail = 0 ] && echo "test-check-facts: ok"
exit $fail
