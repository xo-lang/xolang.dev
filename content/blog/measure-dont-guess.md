---
title: "Measure, don't guess: performance lessons, including the ones that failed"
date: 2026-10-12T06:10:00-04:00
description: "Why the self-hosted Xo compiler ran at half speed, and the guesses, designs, and ports that did not pay off on the way. Every number here, including the disappointing ones, is in a committed results file."
---

Xo's compiler is being rewritten in Xo, and each piece is compared
with the Go implementation it replaces. Correctness gets most of the
attention in that work, but speed matters too: a compiler that is right
and twice as slow is not ready to replace anything.

This post is about how we look for speed, and in particular about the
attempts that did not work. The project has a habit in performance
work: every experiment goes into a results file in the repository,
with its numbers, whether it helped or not. A result that says "no
gain" stops the next person (or agent) from trying the same thing, and
a wrong guess written down is how we learned to stop guessing.

## The half-speed compiler

Once Xo could compile itself, the self-built compiler (called xo1
below) took about twice as long as the Go-built one to compile the same
program. The first guess was a plausible one.

**Guess one: nested updates.** The compiler's source is full of lines
like `g.blocks[g.cur].insts.push(x)`, which updates a list inside a list
element. The native backends copied the inner list to do that. Making
the update happen in place (decision 0169) was a large win on a small
benchmark: 20,000 such pushes on arm64 went from 63,580 microseconds to
104. On the compiler itself it changed nothing. Built before and after
the change, xo1 compiled its own source to assembly in 271.8 s and 276.4 s, with 2,584.5
and 2,586.5 billion instructions. The guess was wrong, and the results
file says so: the gap "does not come from nested element updates".

**Then we measured.** Timing each phase of the compiler, on the same
input, for both compilers:

| phase | Go-built compiler | xo1 |
|---|---|---|
| SSA build | 4.8 s | 1.3 s |
| insert_rc | 29.2 s | 29.5 s |
| inline | 11.4 s | 8.8 s |
| **arm64 emitter** | **227.1 s** | **860.7 s** |
| wall clock | 285.1 s | 902.7 s |

Every phase but one was at parity or faster in Xo. The whole gap was in
the arm64 emitter.

The counters said something less obvious. xo1 did not run more code:
it retired 0.94 times the Go compiler's instructions, but at 1.66
instructions per cycle against 3.23. It was waiting on memory, not
computing.

**A profile named the cause.** In the emitter's hottest loops, a line
like `for inst in g.blocks[b].insts` copied each 200-byte instruction
record: a reference count update for each of its heap fields, each in
another cache line, and a release at the end of the iteration, for every
instruction in every pass. A second pattern, reading `a[i][j]`, copied
and released the inner list on every access. The Go emitter walks
pointers and pays for none of that on the compiling thread.

**Two source fixes**, passing the list to a helper as a parameter so
its elements are borrowed instead of copied, changed the numbers:

| xo1 | before | after |
|---|---|---|
| user CPU | 507.0 s | 366.5 s (28 percent less) |
| instructions | 5,422 billion | 3,700 billion (32 percent less) |
| cycles | 3,270 billion | 1,784 billion (45 percent less) |

The assembly xo1 writes stayed byte identical, so the fixes changed
speed and nothing else. In the same run xo1 came within 1.18 times the
Go compiler's wall clock, and used fewer cycles than it. One run each on
a loaded machine, so the CPU and instruction counts are firmer than the
wall clock. The next step is to make the compiler borrow in those two
cases itself, so the copies go away everywhere without source changes.

One more measurement shaped that plan. An xo1 built by the LLVM backend
took about a third of the cycles off (3,270 to 2,181 billion) but stayed
well behind the Go compiler. Better machine code accounts for about a
third of the gap; the rest was the memory model, the reference counts
and allocations behind those copies, which LLVM does not remove. The short version of this story is also in the
[SSA builder post's updates](/blog/ssa-in-xo/#how-fast-is-it).

## Three verifiers slower than the one we kept

The self-hosted SSA builder checks its own output with a verifier that
tracks reference counts through every block and edge of every function.
It kept its counts in an ordered map of strings, cloned per block and
per edge, and it was slow. The obvious fix, integer keys instead of
strings, took five attempts:

| verifier design | wall clock, checker | wall clock, SSA builder |
|---|---|---|
| before: an ordered map per state, cloned per block and edge | 23.8 to 24.6 s | 66 to 75 s |
| v1: a dense list of counts per state | 40.5 s | 258.7 s |
| v2: sparse sorted lists, zeros removed | 24.4 s | 81.1 s |
| v3: v2 keeping zero entries | 32.6 s | 134.5 s |
| v4: one reused dense list per block, states copied out at the end | 20.7 s | 63.5 s |
| v5 (kept): v4, with edge changes made and undone in place | 18.0 s | 47.9 s |

The first three were slower than what they replaced. Integer keys were
never the point: the cost was copying a state per block and per edge,
and v1 to v3 only changed what was copied. A dense list copies every
entry of the function on every edge; a sparse list copies less, but
every change after a copy shifts it. v4 and v5 count in one list, in
place, and copy out a compact state once per edge. Against the same
baseline the kept design retired 31 percent fewer instructions on the
checker's source and 34 percent fewer on the SSA builder's.

In the same file, an experiment that went nowhere: giving each new
function's lists room up front (`List.with_capacity`). Both sizes tried
ran more instructions, because zeroing room most small functions never
use cost more than the copies of growing. The results file records it as
"No gain", and the code stays without it.

## Splitting the LLVM build

The slowest single step in the project's tests is the LLVM build of the
self-hosted SSA builder: 2,394 s as one module with full link-time
optimization, 2,023 s of it in the link, on one core. Turning the
optimization off is no answer either: 1,589 s.

Splitting the program into 12 modules compiled in parallel (decision
0168) was:

| build | total |
|---|---|
| one module, full link-time optimization | 2,394 s |
| 12 modules, no link-time optimization | 512 s |
| 12 modules, ThinLTO | 556 s |

The output with ThinLTO is within the run-to-run noise of the
one-module build; without link-time optimization it is 2 to 4 percent
slower. So the tests use the split build, and real builds keep one
module with full link-time optimization by default. The details, and
the trade-offs between the two split builds, are in the
[test tiers post](/blog/test-tiers/#update-2026-10-12-the-llvm-build-split).

## The runtime pilot: faster and slower at once

The native backends' runtime is written in C. Should it move to Xo, as
Go's runtime moved from C to Go? The pilot (decision 0180) ported one
file, the Unicode operations, and set a bar before measuring: no
measurable slowdown on string-heavy work, on both native backends.

The first version, all Xo and building results byte by byte, was 2 to
11 times slower than the C. After two rounds of work, the result was
mixed, in instructions retired against the C:

| workload | arm64 | LLVM |
|---|---|---|
| ASCII case mapping (`to_lower`, `to_upper`) | 0.63x to 0.67x | 0.63x to 0.67x |
| mixed-script case mapping | 1.45x | 1.02x |
| case-insensitive compare | 1.62x | 1.13x |
| character classes (`is_letter` and others) | 1.46x | 0.87x |
| per-character case mapping | 1.80x | 1.17x |

ASCII text got faster than the C on both backends. Work done one
character at a time got slower on arm64, because the arm64 backend
inlines only functions that call nothing else, so small helpers stay
function calls; LLVM inlines across them. The bar was not met on arm64.

So the decision was not "port the runtime". The Xo version is the
default, the C version stays selectable, and porting more of the runtime
waits until arm64 inlines better and every workload is within 5 percent
of the C on both backends. The runtime objects did get 4.7 percent
smaller along the way.

**Update, later on 2026-10-12:** the arm64 half is met. The arm64
backend now inlines small functions that call others and drops bounds,
overflow, and shift checks it can prove safe (decision 0184). Every
workload is now within 5 percent of the C on arm64: the closest are the
case-insensitive compare at 1.016x and character classes at 1.027x, and
the rest are faster than the C. The same change made the self-hosted
compiler's own build take about 22 percent fewer cycles (one run each,
under different load, while writing 8.5 percent more assembly), with
the fixed point intact. LLVM, unchanged by this work, still has the
compare at about 1.13x, so the C version stays for now.

## What we keep doing

- **Write the guess down before testing it, and keep the answer either
  way.** The nested update fix was worth doing and did not explain the
  gap; both facts are in the same file.
- **Find the phase before the function.** A phase table on one input
  ruled out every part of the compiler but one in a single run.
- **Count instructions and cycles, not only seconds.** These runs share
  a busy machine, and wall clock moved with the load. Instructions per
  cycle showed the problem was memory, which no amount of optimizing
  the emitter's logic would have fixed.
- **Set the bar before the experiment.** The runtime pilot's bar turned
  a mixed result into a clear decision instead of an argument.
- **Keep the output fixed.** Every speed change here was checked to
  produce the same output as before (byte-identical assembly for the
  compiler fixes), so a faster number never hid a different program.
