---
title: "Measuring through code placement noise"
date: 2026-11-03T09:00:00-05:00
draft: false
description: "The same machine code can run 38 percent apart depending on where it lands in memory. How Xo measures a change when one build of each side can show a regression that is not there, and why aligning the code did not make the problem go away."
---

A benchmark compares two builds: before a change and after it. The usual
assumption is that if the code you changed is not on the hot path, the hot
path runs the same. On a modern CPU that assumption is wrong often enough to
send you after regressions that do not exist. This post is about how Xo
measures around that, the tool it now uses by default, and the fix we
tried first that did not work.

The chase that made this a default, a `/alloc` slowdown that crossed five
suspects and ended at a code placement, is told in
[How Xo hunts its own miscompiles, and the /alloc chase that ended in luck](/blog/hunting-miscompiles/).
This post is the method behind its ending.

## The same instructions, 38 percent apart

Xo's native backend has a measurement knob, `XO_ARM64_PAD=K`, that puts K
`nop` instructions before every function. The nops are never executed; they
only shift the whole program by 4K bytes
([toolchain.md:537](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/toolchain.md)).
Nothing about the program's logic changes. Build it at sixteen values of K
and time each build: that is a pad sweep.

Here is one, for a small interpreter benchmark on an Apple M4 Pro, where the
hot function's body is identical at every pad
([interp-placement-2026-10-28.md:33-38](https://github.com/xo-lang/xo/blob/main/bench/results/interp-placement-2026-10-28.md)):

| pad | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| cycles (M) | 281.4 | 233.1 | 207.1 | 238.0 | 210.5 | 238.2 | 225.7 | 238.7 | 218.1 | 237.2 | 221.9 | 237.3 | 204.5 | 233.3 | 212.1 | 230.9 |

That is 204.5M to 281.4M cycles for one instruction stream, a 38 percent
spread, and the default placement (pad 0) was the worst of the sixteen
([:40-42](https://github.com/xo-lang/xo/blob/main/bench/results/interp-placement-2026-10-28.md)).
The interpreter dispatches through one jump table branch, and the CPU's
indirect branch predictor is indexed by that branch's address, so where the
branch lands decides how well it learns the sequence
([:42-45](https://github.com/xo-lang/xo/blob/main/bench/results/interp-placement-2026-10-28.md)).

That sweep came out of a real misreading. A build that kept the standard
library's bodies out of the program ran this benchmark in 63 ms instead of
74, three times, which looked like the inliner being 15 percent too eager
([:12-14](https://github.com/xo-lang/xo/blob/main/bench/results/interp-placement-2026-10-28.md)).
The two builds retired the same instructions (1458.7M and 1458.4M); only the
main function had changed, and that moved the hot function to a different
address
([:18-29](https://github.com/xo-lang/xo/blob/main/bench/results/interp-placement-2026-10-28.md)).

## Why one build per side lies

If a program's speed depends on where its code lands, then any change that
adds or removes a few instructions anywhere before the hot code moves the
hot code. Comparing one build of each side then measures two things at once:
the change, and a fresh roll of the placement dice.

The `/alloc` HTTP benchmark shows the size of the dice. We built v0.35.0's
own source four times, at pads 0 to 3, and measured all four against the
shipped v0.35.0 server in one job on a linux/arm64 host, with pad 0 built
twice as a control
([alloc-pads-v0.35.0-2026-11-03.md:42-48](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-pads-v0.35.0-2026-11-03.md)):

| build | 32 connections | 256 connections |
|---|---|---|
| v0.35.0 release server | 1.000 | 1.000 |
| v0.35.0 source, pad 0 | 1.003 | 1.011 |
| v0.35.0 source, pad 0 again | 1.000 | 1.004 |
| v0.35.0 source, pad 1 | 0.978 | 0.979 |
| v0.35.0 source, pad 2 | 0.974 | 0.966 |
| v0.35.0 source, pad 3 | 0.977 | 0.977 |
| main (1411dd8bf), pad 0 | 0.975 | 0.971 |

The control agrees with pad 0, so the gap between pad 0 and the other three
is placement, not run to run noise. The shipped release happened to land on
its one fast placement. A later revision, built once, landed where v0.35.0
itself lands three times out of four, and read as a 2.5 percent regression.
A bisect split that "regression" into two commits of about 2 percent each,
and each of those measured 0.958 to 1.003 of v0.35.0 across four pads
([:3-13](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-pads-v0.35.0-2026-11-03.md)).
Neither was a regression.

## The verdict: median over pads, and overlap

Since commit 7a21bcb59, Xo's `/alloc` comparisons and the HTTP section of
each release's report against Go build every side at four pads by default,
the base release included
([alloc-split.sh:10-12, :24](https://github.com/xo-lang/xo/blob/main/bench/perf/jitter/alloc-split.sh),
[toolchain.md:289-296](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/toolchain.md)).
A small script, `pads.py`, then reduces each side to two things
([pads.py:5-14](https://github.com/xo-lang/xo/blob/main/bench/perf/jitter/pads.py)):

- **the median over pads** of each pad's median over rounds: a number for the
  side that does not depend on one roll of the dice;
- **the range of those pad medians**: how far placement alone moves it.

A side is called slower or faster than the base only when the two ranges do
not overlap. When they overlap, the verdict is "placement", whatever the
medians say
([pads.py:70-79](https://github.com/xo-lang/xo/blob/main/bench/perf/jitter/pads.py)).
In the table above, main's one build (0.975 at 32 connections) sits inside
v0.35.0's own range over pads (0.974 to 1.003): "placement", not
"regression".

Two choices in that rule are deliberate:

- **Overlap, not a threshold.** A fixed "2 percent is noise" threshold would
  be wrong for every benchmark but one: the interpreter above swings 38
  percent, `/alloc` about 4, and an xo self build stays within run noise at
  every pad
  ([arm64-loop-alignment-stable-not-fast.md:36-38](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/arm64-loop-alignment-stable-not-fast.md)).
  Each benchmark's own sweep sets its own bar.
- **The base is swept too.** Sweeping only the new side would still compare
  against one lucky or unlucky build of the old one. That is exactly what
  happened with v0.35.0.

Four pads is a compromise: it found the `/alloc` gap, and it costs four
builds and four times the rounds per side. Where a change has to be judged
more finely, the earlier sweeps used sixteen, with sixteen copies of one
binary as the noise floor
([arm64-loop-alignment-stable-not-fast.md:26-30](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/arm64-loop-alignment-stable-not-fast.md)).

## Why not just align the code?

If the problem is where code lands, the obvious fix is to decide where it
lands: align every function, or every loop, to a cache line boundary. We
have tried that four times. It makes speed more stable and does not make it
faster.

**Loop tops at 64 bytes (2026-10-08, Apple M4 Pro).** Aligning every
innermost loop cut collatz's spread over 16 shifts from 2.15 to 0.74 percent
and nbody's from 1.12 to 0.20 (identical binaries vary 0.57 and 0.26). But
both got slower than the unaligned median, collatz by 1.0 percent and nbody
by 0.8, and sort got slower and more sensitive (spread 0.75 to 1.66
percent). 16 and 32 byte alignment, outer loops, and running through the
padding instead of jumping over it were no better
([arm64-loop-alignment-stable-not-fast.md:6-14](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/arm64-loop-alignment-stable-not-fast.md)).

**Loop heads on x86 (2026-10-27).** A `.p2align 5` before each of pdqsort's
31 loop heads took sort1M on an i7 to 91 to 94 ms
([sort1m-x86-2026-10-27.md:51-52](https://github.com/xo-lang/xo/blob/main/bench/results/sort1m-x86-2026-10-27.md)),
against 81 to 84 ms without it
([:15](https://github.com/xo-lang/xo/blob/main/bench/results/sort1m-x86-2026-10-27.md)).

**Hot blocks at 64 bytes (2026-10-29).** Aligning the interpreter's
jump table blocks left its spread at 1.116 (1.136 without) and cost 3
percent at the median
([pgo-layout-stage2-2026-10-29.md:18-27](https://github.com/xo-lang/xo/blob/main/bench/results/pgo-layout-stage2-2026-10-29.md)).

**Every function at 64 bytes (2026-11-03, linux/arm64).** Commit 9020e6bb3
added `XO_ARM64_FN_ALIGN=N`, which aligns every function and runtime helper
([toolchain.md:538](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/toolchain.md)).
Collatz, whose pads 1 to 3 ran in 0.94 of pad 0's time, ran at pad 0's slow
time at every pad once aligned. `/alloc`'s spread over pads was 2.0 percent
unaligned, 2.5 at 64 bytes and 1.4 at 128. The alignment cost 1.43 percent
of xo's own code size and 7.3 percent of the `/alloc` server's
([arm64-loop-alignment-stable-not-fast.md:32-39](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/arm64-loop-alignment-stable-not-fast.md)).

The reason is the same each time. These loops are fast or slow depending on
where particular instructions fall, not on whether the loop or function
starts on a boundary. Collatz is fastest with its 13 instruction loop
starting 44 bytes into a 64 byte line, crossing the boundary; sort's scan
loops prefer an 8 byte aligned top; nbody's inner loop is fastest at most
unaligned shifts
([arm64-loop-alignment-stable-not-fast.md:16-24](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/arm64-loop-alignment-stable-not-fast.md)).
Aligning picks one fixed point, and that point is not the good one for any
of them. So alignment stays off by default, and the knobs stay as
measurement instruments.

## What we do instead

- **Judge every placement sensitive comparison by its median over pads**,
  with the base swept too, and call a difference only when the ranges do not
  overlap. That is now the default for `/alloc` and for the release report's
  HTTP rows.
- **Before blaming a pass, check whether the hot code changed.** If the hot
  function is byte for byte the same and only its address moved, the
  difference is placement, whatever the timing says. That is how the
  interpreter's 15 percent "inliner" result was retired.
- **Shrink the spread with the code, not with padding.** The interpreter's
  spread fell from 38 to 14 percent when its dispatch became threaded (each
  arm of the dispatch ending in its own jump table branch instead of all
  sharing one;
  [interp-placement-2026-10-28.md:49-53](https://github.com/xo-lang/xo/blob/main/bench/results/interp-placement-2026-10-28.md)),
  not when anything was aligned
  ([pgo-layout-stage2-2026-10-29.md:25-27](https://github.com/xo-lang/xo/blob/main/bench/results/pgo-layout-stage2-2026-10-29.md)).

Not every benchmark needs this: a whole compiler build is too large for one
function's placement to show. But the ones that do are the small, hot loops
people use to compare languages, and those are exactly where a single build
of each side is most likely to tell you something that is not true.
