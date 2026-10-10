#!/bin/sh
# Check, run, and test every example the docs show, and record the outputs the
# pages print next to them. Needs the xo binary: XO=path/to/xo, or xo on PATH.
#
#   examples/tour/<name>/      must check, run, and pass `xo test`;
#                              writes output.txt (what `xo run` printed)
#   examples/mistakes/<name>/  must fail `xo check`; writes check.txt
#
# Run after changing an example or after a new Xo release, then commit.
set -eu
cd "$(dirname "$0")/.."
XO=${XO:-xo}
fail=0
for d in examples/tour/*/; do
  name=$(basename "$d")
  if ! (cd "$d" && "$XO" check . >/dev/null 2>&1); then
    echo "FAIL check $name"; (cd "$d" && "$XO" check . 2>&1 | head -20) || true; fail=1; continue
  fi
  case $name in
    webservice) printf '%s\n' '(serves on :8080; try GET /todos and GET /todos/1)' > "$d/output.txt" ;;
    *) (cd "$d" && "$XO" run . > output.txt 2>&1) || { echo "FAIL run $name"; fail=1; } ;;
  esac
  (cd "$d" && "$XO" test . > test.txt 2>&1) || { echo "FAIL test $name"; cat "$d/test.txt"; fail=1; }
  echo "ok   $name: $(tail -1 "$d/test.txt")"
  rm -f "$d/test.txt"
done
for d in examples/mistakes/*/; do
  name=$(basename "$d")
  if (cd "$d" && "$XO" check . > check.txt 2>&1); then
    echo "FAIL $name: expected a diagnostic"; fail=1
  else
    echo "ok   $name: $(grep -o 'XO[0-9]\{4\}' "$d/check.txt" | head -1)"
  fi
done
exit $fail
