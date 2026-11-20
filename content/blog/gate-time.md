---
title: "The test floor: why selecting fewer tests did not make our gates faster"
date: 2026-11-20T09:00:00-05:00
description: "Every push to Xo runs a gate. Over two days the LLVM step of that gate averaged 45 minutes, even for a change that selected no test programs at all. How we found the fixed floor, the two costs hiding under it, what we changed, and the daily check that keeps it from coming back."
---

Every change to Xo passes a gate before it lands on main: the compiler is
built from the change, then the tests of the packages the change can affect
run against it. Agents push many changes a day, so gate time compounds.
A minute added to every gate is an hour lost by the end of a busy day.

This post is about a cost we had stopped seeing: a floor under the gate
that every change paid, whatever it touched.

## How we found it

The owner asked a simple question: we do a lot of testing, is the testing
optimized? We had per-step timings in every gate log, so we added them up
over two days of gates (2026-11-12 and 2026-11-13, 109 distinct gates):

| Step | Runs | Mean | Total |
|---|---:|---:|---:|
| llvm | 33 | 44.8 min | 24.7 h |
| arm64 | 30 | 18.4 min | 9.2 h |
| corpora | 44 | 6.5 min | 4.7 h |
| cmd | 15 | 14.3 min | 3.6 h |

The llvm step was half the total. That was a surprise, because the llvm
step already had a selection: since October it builds only the golden
programs whose LLVM IR the change alters. A change to one compiler pass
should select a handful.

It did select a handful, and it still took most of an hour. One gate
selected 0 of 717 golden programs and its llvm step took 3,056 seconds.
Another selected 3 and took about 34 minutes. The time did not scale with
the selection. Something under it did not depend on the change at all.

## Two costs under the floor

We ran the same gate twice on the same host (an 18 CPU linux/arm64
machine), before and after each fix, with a change chosen to select
nothing: a comment in one compiler file. Whatever that gate costs is the
floor.

**The selection itself.** To choose golden programs, the gate compares
each program's LLVM IR at the merge base and at the change. The base's
IR manifest was cached by commit, but main moves between almost every
gate, so nearly every gate found no cached manifest for its base. It then
built the base's compiler and the IR of all 723 golden programs before it
could choose. On the before run, choosing took 2,186 seconds, longer than
running the tests it chose.

**Tests that ran for every change.** About 130 top-level tests in the
LLVM package (TLS, x509 and crypto differentials, race tables, scheduler
tests) ran in every gate whatever the change touched. They are good
tests, but a change to the HTTP router cannot break the constant time
check of the P-256 code.

The arm64 step had the same shape, with one more twist we found later.

## What we changed

**An ancestor's manifest.** The goldens whose IR differs between an
ancestor of the base and the change are the base's selection plus those
the commits in between changed: a superset. So the gate first used the
newest cached manifest within 30 commits of the base, and only built the
change's side. Nothing the base would select is lost. But it saved time
only when no compiler commit fell in between, and on a main that moves
this fast one nearly always does. The next section says what that cost
and how we fixed it.

**Test areas.** A new file, `scripts/gate-areas.txt`, lists the slow tests
of the three heaviest packages with the paths that can break them:

```
@crypto ^std/(crypto|tls|x509|...)\.xo$|^std/native/llrt/(aes|sha|p256|...)
internal/llvm TestConstantTimeLLVM @llvmbe @crypto
internal/arm64 TestDebugInfoSameCode @debuginfo @arm64be @driver
```

A gate skips a listed test when the change touches none of its areas
(`go test -skip`). A test that is not listed always runs, a test whose own
test file changed always runs, and a change to the build driver runs
everything. The 8-hourly full tier runs every test, so a skipped test
still runs within hours on main. A repository test checks the file:
every named test must exist, so a rename cannot silently unscope a test.

**Hidden subtest time.** After the first two fixes the arm64 step was
still slow, yet its slowest top-level tests summed to far less than the
step's wall time. The cause is how `go test -json` reports a parent of
parallel subtests: the parent's elapsed time leaves out its subtests. One
test reported a few seconds while its subtests summed to 5,290 seconds of
work. Ranking by the parent's time had hidden our three slowest tests.
The gate now records each parent's summed subtest time, and those parents
are scoped too.

**More parallelism for the change's manifest.** The change's side of the
selection built the 723 IRs four at a time, and each build was blocked
half its time. It now runs as many builds as the CPUs and the free memory
allow. On a 12 CPU host, choosing alone went from 988 to 292 seconds.

**The arm64 goldens follow the same selection.** The arm64 tests that
build every golden program now build only the ones whose LLVM IR the
change alters, when the change leaves the native backend alone (the IR
and the native code come from the same SSA). For a change to std's CSV
module, the arm64 package went from 551 to 253 seconds.

## The speedup, and a correction

The same comment-only change, gated on the same 18 CPU host, the day the
fixes went in:

| | Before | After |
|---|---:|---:|
| Choosing the LLVM golden programs | 2,186 s | 1,014 s |
| LLVM package tests | 1,346 s | 908 s |
| llvm step | 3,533 s | 1,923 s |
| arm64 step | 1,803 s | 1,408 s |
| cmd step | 1,445 s | 1,059 s |
| All steps (they run at once) | 3,629 s | 2,014 s |

That was 60 minutes down to 34, and it was true for that base. The next
day we ran it again on our 12 CPU timing host, with nothing else on the
machine, once on the old code and once on a main with every fix:

| | Before | Now |
|---|---:|---:|
| Choosing the LLVM golden programs | 1,956 s | 1,415 s |
| Goldens selected | 0 of 723 | 722 of 728 |
| llvm step | 3,250 s | 3,437 s |
| arm64 step | 1,778 s | 1,749 s |
| cmd step | 1,415 s | 1,074 s |
| All steps | 3,322 s | 3,509 s |

The gate was slower than before: 3,509 seconds against 3,322. The only
cached manifest near its base was 25 commits back, and compiler commits
in between had changed almost every golden's IR. So the superset was
everything: 722 of 728 goldens ran, in the llvm step and, through the new
arm64 selection, in the arm64 step too. We checked 14 pairs of
consecutive cached manifests: every window with compiler commits differed
in 647 to 719 goldens. The first run had simply found a close ancestor.

The test scoping held (cmd went from 1,415 to 1,074 seconds). The
selection did not. Two changes fix it:

- An ancestor's manifest stands in for the base's only when the commits
  between them change none of the IR's inputs (the compiler and std's
  sources). Otherwise the gate builds the base's own, at full width.
- A watcher builds main's manifest once for each main commit that changes
  an IR input, on one offload host, and copies it to every host. A gate
  then finds its base's manifest instead of building it.

Both are on main now. The same change on the timing host, first with the
ancestor rule alone (the gate built its base's manifest), then with the
watcher's manifest of its base already on every host:

| | Before | Ancestor rule | Base's manifest shared |
|---|---:|---:|---:|
| Choosing the LLVM golden programs | 1,956 s | 1,330 s | 1,253 s |
| Goldens selected | 0 of 723 | 0 of 728 | 0 of 731 |
| llvm step | 3,250 s | 1,396 s | 1,335 s |
| arm64 step | 1,778 s | 1,586 s | 1,447 s |
| cmd step | 1,415 s | 1,132 s | 1,050 s |
| All steps | 3,322 s | 1,658 s | 1,519 s |

That is 55 minutes down to 25. It is short of the 25 minute target by
about 20 seconds, and the selection is still the slowest part. With the
base's manifest shared, the selection only builds the change's own IR.
Run on its own, that took under 5 minutes. Beside the arm64 and cmd
tests it took 21, because those builds run at low priority so the tests
keep the CPU. The arm64 goldens wait for the selection, so it sets the
wall time too. The next step is to build only the IR of the goldens
whose inputs a change touches.

**Since then** (2026-11-17 to 2026-11-20): a gate whose change leaves the
IR inputs alone reuses its base's manifest, filtered to the change's scope,
instead of building the base's compiler and IR (commit 9d1b071c7), and a
gate that does build one shares it with the host's other gates (4b53bd23b).
A selection keyed by each golden's LLVM binary is in testing behind a
flag (decision 0657, stage 2; bb8021698). We have not measured these
end to end yet; the figures above are the last we have.

Figures are
from [bench/results/gate-time-2026-11-14.md](https://github.com/xo-lang/xo/blob/main/bench/results/gate-time-2026-11-14.md),
which keeps every step and test time of each run.

## How we will catch it next time

The floor grew one reasonable test at a time, and nobody looked at the
total. So the total now has a check:

- Every gate writes its step and test times (including summed subtest
  time) to a file, on the Mac and on the offload hosts.
- Once a day, `scripts/lead/gatetime.sh` reads the last 24 hours of them
  and compares them with a committed baseline. It reports a step whose
  median is more than 25% over its baseline, an llvm step that selected 5
  or fewer goldens and still took over 15 minutes (the floor coming back),
  and any slow test that the areas file does not scope.
- A regression goes to the lead's bottleneck log. The baseline moves only
  in a commit that says why.

Two lessons. When a step gains a selection, measure it with an empty
selection: what remains is the floor, and every unrelated change pays it.
And measure it again on a later day, on a quiet machine: our first
"after" was right for its base and wrong for the next one.
