---
title: "Three test tiers for a compiler that tests itself"
date: 2026-10-11T14:00:00-04:00
description: "The self-hosted compiler's tests grew from minutes to an hour as each stage landed. Splitting them into short, merge, and full tiers brought merges back to about 2.5 minutes. What we gave up, and why it is the right trade."
---

The [SSA builder written in Xo](/blog/ssa-in-xo/) is checked by comparing
it with the Go implementation on every program in the repository, after
every stage, with the Xo compiler built by all three of Xo's backends.
That is a strong test. It also became a slow one, and this post is about
what we did when it got too slow to run on every merge.

## The problem: a test that grew with the code

The self-hosting tests (`internal/selfhost`) are differential: build the
Xo version of a compiler part, run it and the Go version on the same
input, and require the same output. Each stage of the port added more to
compare, and the cost grew with it:

- The Xo builder is compiled three times, by the Go, arm64, and LLVM
  backends, and each build is compared. The slowest single step is the
  LLVM link-time optimization of the self-hosted SSA builder: about 10
  minutes on its own.
- After the last SSA stage, the test compares every pass, the verifier,
  and the verifier's mutants, on every program, for every backend.
- Code mutations on top: 400 mutated programs for the SSA builder, 1,000
  for the checker.

The run kept passing Go's limits. Cold runs went past the 10 minute
default timeout, then past 40 minutes: the first cold run after the last
SSA stage timed out at `-timeout 40m` while still building the LLVM
binaries. One measured cold run, with another test suite on the same
machine, took 3,474 seconds, or 58 minutes.

A merge that waits 40 minutes or more for one package is a merge that
people (and agents) start to skip.

## The design: three tiers

The package now has three tiers, chosen with `XO_SELFHOST_TIER`
(`internal/selfhost/tier_test.go`):

| tier | what it runs | time |
|---|---|---|
| **short** (`go test -short`) | the Go backend, small corpora, every 25th program for the SSA builder, fewer mutations and none for the SSA builder | about 20 s |
| **merge** (the default) | the Go backend at full size; the arm64 and LLVM backends as a smoke test at short sizes; sampled where the cost is concentrated | 139 to 147 s |
| **full** (`XO_SELFHOST_TIER=full`) | every backend, every corpus, every pass of every program, all mutations | about 1 hour cold |

Three decisions make the merge tier cheap without making it shallow.

**Keep one backend at full size.** The Go backend's build of the Xo
compiler runs every program, every corpus, and every mutation count, so
the logic of the port is compared in full on every merge. What the merge
tier drops is the repetition: the same comparison again with the
compiler built by arm64 and by LLVM.

**Smoke-test the native backends, but skip their slow builds.** The
arm64 and LLVM builds of the Xo lexer and parser still run, at short
sizes, so a native backend that breaks badly is still caught at merge.
The native builds of the checker and the SSA builder, the ones that take
minutes to link, are left to the full tier.

**Sample where the cost is, not everywhere.** Timing the passes program
by program showed that 110 of their 157 seconds went to three programs:
the self-hosted SSA builder (69 s), the self-hosted checker (22 s), and
one test fixture that is a single 5,000-line function (19 s). The other
643 programs share the rest. So the merge tier still compares the build
stage of those three, and every stage of every other program; the SSA
test went from 231 s to 54 s. The mutation test makes the first 300 of
its 400 mutations.

The full tier runs from `bench/nightly.sh` (with `-timeout 120m`),
before tagging a release, and by hand for a change the merge tier does
not cover: a construct only the self-hosted compiler uses, or an arm64 or
LLVM lowering.

## What we gave up

The merge tier can miss a bug the full tier would catch. The clearest
case is a miscompilation in the arm64 or LLVM backend that only shows up
when that backend builds the self-hosted checker or SSA builder: the
merge tier never makes those builds.

The trade is deliberate. Instead of blocking every merge for an hour,
such a bug is caught by the next full run and fixed forward with a
regression test rather than by reverting (the project's rule for any
failure the full suite finds). Most changes do not touch the self-hosted
compiler or a native backend, and the ones that do are expected to run
the full tier by hand.

One honest caveat: the nightly script exists, but its schedule is not
installed yet, so today "nightly" means whenever someone runs it. Until
it is scheduled, the gap between a merge and the next full run is longer
than a day, and that is the first thing to fix.

## The rest of the pipeline changed the same day

Faster tests were half of it. The other half was not running them
twice, and not running two at once:

- **No duplicate runs at merge.** If an agent's branch merges cleanly and
  main did not change the packages it tested, `-short` and `go vet` are
  enough; full tests rerun only for packages changed on both sides.
- **Push first, then test.** Any full suite runs in the background after
  the push, and failures are fixed forward. The next piece of work starts
  without waiting.
- **At most two agents at once, in separate parts of the code, and never
  two full test runs at the same time.** Two full suites side by side ran
  the machine out of memory.

## Test cost is also disk cost

Time was not the only budget the tests overran. Three earlier problems,
each written up in the project's notes:

- **Build directories without a cap.** Each test program gets its own
  build directory so Go's cache is reused, and nothing removed them: 21 GB
  of them filled the disk. They are now trimmed, least recently used
  first, past 4 GiB.
- **`go vet` recompiling the runtime.** Vet ran in each program's build
  directory without `-trimpath`, so Go treated every copy of the runtime
  package as new: the Go build cache grew from 28 MB to 111 GB overnight.
  The test helpers now run Go with `-trimpath` and Xo's capped cache, and
  the same 121 programs write 14 runtime archives instead of one each.
- **The default timeout.** The full code generator suite builds every
  golden program three times; alone it fits in 10 minutes, next to
  another suite it took 24. Full runs use longer timeouts.

## The lesson

A differential test that compares everything, everywhere, is the right
test to have. It is the wrong test to wait for on every change. The fix
was not to make it weaker but to decide **where** each part of it runs:
the logic at full size on every merge, the expensive repetition nightly,
and the expensive outliers measured and handled by name. Measuring before
cutting is what made the merge tier fast: three programs out of 646 were
most of the cost, and no amount of general tuning would have found that
as quickly as timing each one.

The next experiment is already running: comparing ThinLTO with full
link-time optimization for the LLVM test builds, which could shrink the
full tier's longest step. We will add the numbers here when they are in.
