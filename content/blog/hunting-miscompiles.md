---
title: "How Xo hunts its own miscompiles, and the /alloc chase that ended in luck"
date: 2026-11-03T12:00:00-05:00
draft: false
description: "A compiler pass that is wrong gives a correct program a wrong answer with no error. How Xo hunts those on purpose, what it found, and a benchmark regression chase that crossed five suspects and ended at a code placement."
---

A wrong optimization pass is the worst kind of compiler bug: a correct
program prints a wrong answer, with no error and no crash. Xo's native
backend runs more than fifty such passes over its own intermediate form. This
post is about how we hunt for the wrong ones on purpose, what the hunt
found, and a second, longer hunt after a benchmark got slower, which
crossed five suspects, one real hardware effect, and ended at a result we
did not expect: the slowdown was where the code happened to land.

## Part 1: hunting miscompiles

Every method below disagrees with an oracle. The oracle is the LLVM
backend, which runs a separate optimizer, or the Go backend, which runs
Go's compiler.

**Pass-off sweeps.** Each optional pass can be switched off with
`XO_PASSES=-pass`. The largest sweep took the 40 largest golden programs
and built each with each of the 56 passes off in turn, and once with all
of them off. A build whose generated code is identical to the default
build runs nothing new, so those were skipped: 558 of 2,280 builds. The
other 1,722 ran against the expected output, with no differences and no
build failures
([pass-hunt-2026-11-02.md:15, :32-40](https://github.com/xo-lang/xo/blob/main/bench/results/pass-hunt-2026-11-02.md)).
The repository keeps a version of this as a test: 26 `pass_*` golden
programs, each written against what one pass assumes, and
`TestGoldenPassesOff`, which builds each with every pass off and with the
pass it aims at off alone (commit cf74eb85a).

**Random programs that must agree.** `progen` writes programs in families
that each stress one idea. The `Alias` family, for example, writes code
where two elements of one list may be the same element. Every program is
built four ways (Go, LLVM, native, and native with every optional pass
off), and a difference that appears only in the native build is a bug in
a pass. On the second linux/arm64 host two later runs of 3,200 and 3,000
`AliasBig` programs found no difference; on linux/amd64, 6,000 `Coll`,
3,000 `Alias`, 1,300 `AliasBig` and 1,200 `AliasEmpty` programs found none
either
([progen-sweeps-and-alloc-split-2026-11-02.md:38-55](https://github.com/xo-lang/xo/blob/main/bench/results/progen-sweeps-and-alloc-split-2026-11-02.md)).

One result there is not clean. An earlier counting run on arm64 showed
five `AliasBig` programs whose output differed between backends. No rerun
reproduced them: not alone, not thirty times in a row, not under load,
not with a longer timeout, not with a cold cache. By the time we looked,
the cached build of the failing program had been pruned. **Those five
differences remain unexplained and unreproduced.** We are saying so
rather than writing "no differences", because the honest count is five
that we could not run down
([the same file, :38-50](https://github.com/xo-lang/xo/blob/main/bench/results/progen-sweeps-and-alloc-split-2026-11-02.md)).

**The x86 passes.** The x86 backend has its own passes. They were run off
one at a time and then all at once over 45 hunt goldens on linux/amd64:
nine sets, no failures
([pass-hunt-2026-11-02.md:17](https://github.com/xo-lang/xo/blob/main/bench/results/pass-hunt-2026-11-02.md)).

**Load stress.** Concurrent programs are run many copies at a time beside
processes that burn every CPU. One HTTP/2 golden, `http_trailers`, failed
once in 1,920 runs this way, and the failure was not in a pass.

### What it found

- **`thread_cset`** gave wrong answers. The pass turns a compare and a
  conditional set into a branch, and it put the compare after the block's
  parallel move. When the move wrote a register the compare read, the
  compare saw the new value. A loop like
  `let n = s.len(); s.add(x); c = s.len() != n` left after one turn. It
  was found by a refactor that behaved differently, then named by
  `xo dev bisect-pass`. The fix is in 9ea34b18d with a golden,
  `loop_compare_moved`; `XO_PASSES=-thread_cset` is the workaround for
  older versions. Why it escaped: `progen`'s `while` loops compared a
  counter with a constant, and no golden set a loop's `Bool` variable from a
  compare against a value read at the top of the loop
  ([the gotcha](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/branch-compare-past-parallel-move.md)).
- **`slp_f64`** (arm64) pairs neighboring `Float` loads and stores. With two list indexes that may name the same element, it moved a
  store past a load of that element. It shipped in v0.25.0 through
  v0.35.0 (introduced in a1d26ce7b) and was fixed in 05593bce3. The `Alias`
  family found two more shapes of the same pass: a build failure, and a
  pack that read its two lanes swapped (seed 387, f049bbc4f)
  ([pass-hunt-2026-11-02.md:24-30](https://github.com/xo-lang/xo/blob/main/bench/results/pass-hunt-2026-11-02.md)).
- **An HTTP/2 hang.** A request whose trailers arrived in a later read than
  its last data frame left a `handle_stream` handler waiting forever: the
  trailers frame ended the stream without waking it. The same code is in
  v0.35.0. It showed up once in about 1,900 runs under load, and the
  fix (2bb23e14a) came with a test that waits 300 ms between the data and
  the trailers.
- **Clean, and live.** The pass `cancel_rc_pairs` was thought never to
  fire. A survey of all 520 goldens found it changes the generated code of
  exactly 80 of them (mostly through std) and of the compiler itself, and
  all 80 pass with it on and off
  ([pass-hunt-2026-11-02.md:18](https://github.com/xo-lang/xo/blob/main/bench/results/pass-hunt-2026-11-02.md)).

Every case above is now a golden or a test, so the next change that breaks one fails
a test.

## Part 2: the /alloc chase

After v0.35.0, our HTTP benchmark `/alloc` lost throughput on linux/arm64.
`/alloc` builds a page of 200 items (about 1,000 fields) and encodes it as
JSON on each request. It measures how fast a server answers when most of
its time is spent allocating and copying.

The method mattered as much as the cause.

- **Same-job ratios.** A number from one job is not comparable with a
  number from another. Each job measures every revision beside a build of
  v0.35.0 and reports the ratio, so the host's drift cancels. The proof:
  main with one experimental change read 0.595 of v0.35.0 in one job, and
  main without it read 0.810 in another, while the same pair measured in
  one job gave the change a cost of 0.756
  ([alloc-regression-2026-11-02.md:237, :246, :63-64](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).
- **A quiet host.** A host that has just finished a build keeps its load
  average high for minutes. A timing job now waits up to 300 seconds for
  the one minute load to fall below 1 before it starts (commit 762c7a5a5).
- **Builds off the timing host.** Timing runs take the whole machine. We
  moved the builds to a second host so that they stop competing for the
  lease (commits c26742cb5 and 43ca0e3d7).

### Three regressions, found by bisecting

Eight points showed more than one step
([alloc-regression-2026-11-02.md:153-165](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).
The ratios to v0.35.0 at 32 and 256 connections:

- The HTTP/1.1 idle park (5f3ac741b) took 0.608 and 0.570
  (:167-173).
- `slot_group` (2d5a7fb26), a register allocation change, took 1.005 and
  0.845 down to 0.872 and 0.728 (:184-189).
- One more field in `Response` (4d6c882c2) took 0.873 and 0.735 down to
  0.776 and 0.658
  ([progen-sweeps-and-alloc-split-2026-11-02.md:81-82](https://github.com/xo-lang/xo/blob/main/bench/results/progen-sweeps-and-alloc-split-2026-11-02.md)).

### A rule that amplified small costs

The idle park parks a connection that has waited a while between requests,
freeing its fiber's stack. The rule used a gap of 2 ms. Under load a
connection's next request becomes readable one poll later than it used to,
so busy connections looked idle: on Linux 57% of requests at 32
connections and 91% at 256 found their connection parked and paid for a
new fiber
([alloc-regression-2026-11-02.md:139](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).
Turning the park off brought the same tree to 1.014 and 1.021
([:193](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)),
including the share of the other two steps, which the park had amplified.

The fix was not to remove the park but to change its rule: an idle
connection now waits 20 ms on its descriptor, and parks only if nothing
came. `/alloc` went from 0.775 to 1.023 at 32 connections and from 0.651
to 1.027 at 256, with CPU a request from 1.327 to 0.972 and from 1.536 to
0.973 (commit a36f13231; the job is
[:214-222](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).

### A speedup that cost more than it paid

A change to how a worker polls was an owner-approved speedup. Measured on
top of its parent in one job it cost `/alloc` 0.756 at 32 connections and
0.895 at 256, though p99 at 256 halved. It was reverted (a60de1c1d) and
will return once `/alloc` is fixed and the change is measured again on top.

### Hypotheses the measurements killed

After the linger fix, one combination was still slow: the linger plus a
narrower register allocation change reached 0.778 and 0.744 of v0.35.0, and
spent 1.33 of v0.35.0's CPU a request against linger's 0.97
([:224-231](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).
Each explanation we tried was tested and failed:

- **Store forwarding.** A guard that kept copies after word stores
  recovered nothing (0.778, commit e875410d1).
- **`.data` false sharing.** Shifting `.data` by 64 bytes moved CPU a
  request by 0.6% and 1.1%. Aligning the tables, putting hot words on their
  own 128 byte lines, and splitting the pool record each moved it under 1%
  ([alloc-shift-2026-11-02.md:40-58](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-shift-2026-11-02.md)).
- **Code placement and buffer copying.** Every padding and alignment arm
  of the `XO_ARM64_PAD` sweep kept the two builds apart: linger 32.4 to
  34.2 microseconds a request, linger plus the change 45.7 to 47.5
  ([alloc-regression-2026-11-02.md:50-54](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).
  We will come back to this one.
- **A miscompile on the new path.** The two builds' `http.respond` were
  instruction for instruction the same.
- **The extra `Response` field.** Without it CPU a request fell 9.4% and
  requests a second rose about 10%, at every layout
  ([alloc-shift-2026-11-02.md:59-60](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-shift-2026-11-02.md)).
  That cost was real. The field now shares an existing slot, with the
  same effect as removing it: 1.116 and 1.118 against main in one job
  ([alloc-regression-2026-11-02.md:57-62](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).

### The cause that was real: a 4 KiB boundary on the stack

What did explain the combination was the fiber stack. Reverting the
register allocation change brought `/alloc` back to v0.35.0 (1.006 and
1.015), but that only moved the server somewhere else. Shifting every
fiber's first frame by a few bytes moved the cost with the stack alone:
the bad shifts form a comb inside about 128 of every 4,096 bytes.

![CPU microseconds a request of one server build at 12 fiber stack offsets: seven cost 35.6 to 35.8, five cost 40.7 to 48.4, and the unshifted build is the slowest](/blog/hunting-miscompiles/stack-comb.svg)

(Data: [stack-phase-2026-11-02.md:78-83](https://github.com/xo-lang/xo/blob/main/bench/results/stack-phase-2026-11-02.md).)

On a bare metal Graviton 4 the same bad phases cost under 1%, but one
hardware counter, `st_align_lat` (stores that pay a misaligned access
latency), ran about 30 times higher at exactly those phases: 664 to 669
million against 21 to 25 million
([stack-phase-2026-11-02.md:106-109](https://github.com/xo-lang/xo/blob/main/bench/results/stack-phase-2026-11-02.md)).
The sampled stores were the callee-saved register pairs that the arm64
prologue stores at stack offsets of 8 modulo 16. A 16 byte pair at 8
modulo 16 straddles a 4 KiB page at one stack position in 256, and a
Linux VM on an Apple M4 Pro with 4 KiB guest pages charges far more for a
store that crosses a page than Graviton does. On macOS, with 16 KiB
pages, the same offsets cross no page and showed no gap
([:116-131](https://github.com/xo-lang/xo/blob/main/bench/results/stack-phase-2026-11-02.md)).
It was not the stack string buffers of decision 0395: turning that pass
off changed nothing.

The fix starts the save area at a multiple of 16 and pairs two registers
only at an aligned offset (decision 0459, df336f1d3). With it, linger plus
the register allocation change runs 35.2 to 35.3 microseconds of CPU a
request at 32 connections at every former bad phase, against 47.8
without it; v0.35.0 runs 35.8
([:154-177](https://github.com/xo-lang/xo/blob/main/bench/results/stack-phase-2026-11-02.md)).
The lesson, which the gotcha records in so many words: when a cliff
appears after a harmless change, check whether it reproduces on a second
machine before spending a week on the code that happened to move it
([stack-phase-4k-aliasing.md:35-39](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/stack-phase-4k-aliasing.md)).

### What was left was luck

With the stack fix, main measured 0.966 and 0.953 of v0.35.0 at 32 and 256
connections in the same job, about 4.5% more CPU a request, and that
remainder did not move with the start address of the process
([alloc-regression-2026-11-02.md:74-89](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-regression-2026-11-02.md)).
We bisected it. A later bisect found two steps of about 2% each, one build
per side. Then the earlier code placement result came back with a
different reading. Each of those revisions measured between 0.958 and
1.003 of v0.35.0 when built at four code placements (`XO_ARM64_PAD` 0 to
3, nops before every function that shift the whole program)
([alloc-pads-v0.35.0-2026-11-03.md:3-8](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-pads-v0.35.0-2026-11-03.md)).
Was v0.35.0's own number a lucky placement?

We built v0.35.0's own source at four placements and compared it with the
release server in one job, with a repeat of pad 0 as a control:

![/alloc speed of v0.35.0's own code built at four function layouts, and of main, as a percentage of the shipped v0.35.0 binary: the same code spans 96.6% to 101.1% and main, at 97.5% and 97.1%, sits inside that span](/blog/hunting-miscompiles/alloc-pads.svg)

(Data: [alloc-pads-v0.35.0-2026-11-03.md:42-48](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-pads-v0.35.0-2026-11-03.md).)

v0.35.0's own source at pad 0 matches the release server (1.003 and 1.000
at 32 connections), and at pads 1 to 3 runs 0.974 to 0.978. Main, at 0.975,
sits where v0.35.0 sits at three of its four placements
([:10-13](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-pads-v0.35.0-2026-11-03.md)).
**The `/alloc` row was placement, not a regression**, and neither of the
later bisect's two steps is one.

Placement is not something we can fix by aligning. Aligning every function
to 64 bytes left `/alloc`'s spread over pads at 2.5% (2.0% unaligned),
cost the server 7.3% of its code size, and held another benchmark at its
slow placement
([arm64-loop-alignment-stable-not-fast.md:32-43](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/arm64-loop-alignment-stable-not-fast.md),
commit 9020e6bb3). What we changed is the judge. `alloc-split.sh` and the
release report now build each side at four placements and call a
difference only when the placements' ranges do not overlap; the verdict is
the median over placements (commit 7a21bcb59).

The cost of this approach is that a one-build measurement can no longer
settle a two percent question, and we say so in the report. The benefit is
that we stopped chasing a regression that was in the placement of the code
and not in the code.
