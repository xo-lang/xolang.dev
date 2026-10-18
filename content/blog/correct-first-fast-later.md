---
title: "Correct first, fast later: closing the gap to LLVM"
date: 2026-10-18T00:30:00-04:00
description: "Xo's own arm64 and x86_64 backends started as straightforward code generators and are now within about 10 to 15 percent of LLVM's instruction counts. What changed, how we measure it, and the changes that were wrong."
---

Xo has two kinds of native backend. The LLVM backend hands Xo's SSA form
to LLVM and gets decades of optimization work for free. The arm64 and
x86_64 backends are Xo's own: they write assembly straight from the same
SSA form, with no LLVM in the way, so builds are fast and need no C
toolchain. arm64 is the default on arm64 hosts; x86_64 is newer, and
LLVM stays the default there until it passes its gates. The price is
that every optimization LLVM does, ours has to do itself.

This post is about paying that price down. On the morning of
2026-10-17, Xo's arm64 backend ran 1.32 times LLVM's instructions on the
geometric mean of our benchmark set, and x86_64 ran 1.63 times. By the
night of the same day they were at 1.09 and 1.14. Below is why the
backends started slow on purpose, what closed most of the gap, and how
we keep a faster compiler from being a wrong one.

## Correct first

A new backend is usually written as templates: each SSA operation
becomes a fixed sequence of machine instructions, values go to the
stack when registers run out, and every function makes a full frame.
The output is slow and easy to check. Once it is right on every
program the tests have, optimization passes go on top, one at a time,
each measured against the plain version.

This is the usual order, and it usually takes years. Go 1.0 shipped on
2012-03-28 ([release history](https://go.dev/doc/devel/release)). Its
SSA back end arrived in Go 1.7 on 2016-08-15, for 64-bit x86 only, and
the release notes report it cut the CPU time of Go's benchmark programs
by 5 to 35 percent ([Go 1.7 notes](https://go.dev/doc/go1.7)). Go 1.8
used it for every architecture, with 20 to 30 percent on 32-bit ARM
([Go 1.8 notes](https://go.dev/doc/go1.8)). GCC 1.0 was released on
1987-05-23 ([GCC releases](https://gcc.gnu.org/releases.html)), and
LLVM began as a research project at the University of Illinois
([llvm.org](https://llvm.org/)); both have been adding passes ever
since.

Xo's backends follow the same order on a shorter clock. The arm64
backend's first measured optimization round was on 2026-10-08, when it
ran an interpreter workload at 1.23 times LLVM's time. The x86_64
backend (decision 0254) is newer still: it reuses the arm64 backend's
front half with x86 instruction templates, and the work in this post is
its first optimization round.

## Where it stands

The numbers are instructions executed on Linux, counted by valgrind's
cachegrind, which gives the same count on every run of the same binary.
Each program is built twice, once by Xo's own backend and once by the
LLVM backend, and both builds must print the same checksum. The ratio
is ours over LLVM's: below 1.00 means Xo's backend ran fewer
instructions.

| | morning, 2026-10-17 | night, 2026-10-17 |
|---|---|---|
| arm64 / LLVM, geometric mean | 1.32 | 1.09 |
| x86_64 / LLVM, geometric mean | 1.63 | 1.14 |

On arm64 the native backend is at or below LLVM on 11 of 25 workloads
and within 1.25 on 18. The gaps that are left are the collection
workloads: maxby 1.54, update 1.48, strings 1.40. Those are the shared
front half (inlining and reference counting), not instruction
selection. Against Go and Rust on the Mac, the arm64 build runs fewer
instructions than Go on five of seven compute workloads and trails Rust
by 11 to 21 percent on four of them and 2.1 times on n-body. The full
tables are in `bench/results/compare-2026-10-17.md`.

## What closed the gap

**A pairing pass that never ran on Linux.** The arm64 backend has a
pass over its final text that pairs adjacent loads and stores into
`ldp` and `stp`. It recognized only macOS's local label form, `L...:`.
Linux's is `.L...:`, and debug builds put a label before nearly every
source line, so on Linux almost nothing paired. Nothing was wrong, just
slow, which is why no test caught it. With labels fixed (and an
address fold in the same change), `copyset` went from 62.1M to 40.7M
instructions on Linux and `branch` from 2,092M to 1,117M.

**Copying memory in vector loops.** With no C library, Xo's runtime
copies memory with its own loop, which the arm64 backend compiled to 18
instructions per 32 bytes (9 after the address fold). A new runtime
intrinsic, `rt.mem_copy_block`,
copies 64 bytes in 6 instructions on arm64 (two `ldp`/`stp` pairs of
128-bit registers). `branch`, which copies a 50,000 entry map 2,000
times, fell to 0.345 of its instructions and now runs 1.01 times LLVM's
on arm64, as it does on x86_64 after a 64-byte loop there.

**Inlining that the cost model refused.** A map's lookup function,
`xo.map.find`, has few instructions but many small blocks, so the
inliner treated it as large. Counting it as small cut `update` by
25.1%, `putget` by 27.1%, and `copymut` by 21.6%. A second change lets
the inliner copy a callee's landing pads at calls that pass a closure
(decision 0256): `hof` -23.7%, `maxby` -15.8%.

**Fewer reference count operations.** Two changes removed retains and
releases the program never needed. Values that are statically immortal
(literals and the defaults built from them) are no longer counted:
x509 certificate parsing lost 543 release calls. After inlining, a
retain followed by a release of the same value with only pure
operations between now both go: `maxby` -9.1%, and -21.9% together
with a register allocator fix.

**TLS state copied at every read.** On both backends, each TLS read and
write copied the connection's state out of its holder and saved a new
copy back: about 20k of LLVM's 104k instructions per request. Moving it
out and back instead cut HTTPS keep-alive requests by 18.7% on arm64
and 27.1% on LLVM, and HTTP/2 by 13.1% and 18.8%. This one was not a
backend fix at all, which is why it helped LLVM's builds too.

**Plain HTTP.** Several smaller std and runtime changes on the plain
HTTP/1.1 path: header fields copied once instead of twice, maps of up
to 5 entries kept as a list with no hash table, and the Date header
formatted once a second. Over the day a plain request went from 35,156
to 31,426 instructions on arm64, about 10.6% fewer, and from 30,867 to
27,805 on LLVM (each step was measured against its own base, so this
end to end figure spans several runs).

**n-body.** The floating point workload was the worst ratio on both
backends. On arm64, hoisting loop invariant fields of list elements and
dropping bounds checks a dominating branch proves (decision 0257) took
it from 1.33 to 1.14 times LLVM on the Mac; on Linux it went from 1.42
in the morning's table to 1.16 in the night's. On x86_64, every two operand operation
copied its input to a new register first and the copy never coalesced:
fixing that took n-body from 4,565M to 3,515M instructions (1.56 to
1.20 times LLVM), along with 13% off `collatz`.

**Frames only where needed.** The x86_64 backend now uses the arm64
backend's shrink wrapping: a function makes its stack frame only on the
paths that need one. Recursive Fibonacci's base case went from 14
instructions to 4, and the whole program now runs 0.81 times LLVM's
instructions.

## How we work

**Measure instructions, not seconds.** Wall clock on a shared machine
moves with the load. Instruction counts from cachegrind are the same on
every run, so a 1% change is real. For the HTTP server we know the
spread too: at most 0.7% between runs on HTTP/1.1, so a change of 1% or
more there counts, and HTTP/2 needs a larger one.

**Diff against LLVM per function.** Every gap above was found the same
way: profile the same program built by both backends and subtract,
function by function. For the HTTP server that gave a list of causes in
instructions per request (TLS record functions LLVM inlines, reference
count helpers called out of line, a 2.5 KB struct passed by value to its
drop helper), and each became a work item.

**An audit of Go's compiler.** We are testing a second method: auditing
Go's compiler passes and rewrite rules against what our backend
executes, to find optimizations that matter for real programs. Results
will follow in a later post.

**Every change rebuilds the compiler.** Xo's compiler is written in Xo.
A change to a backend builds the compiler with itself twice (stages s2
and s3) and requires the two to be byte identical. A miscompile that
breaks any part of the compiler breaks that check. Random program
generation across backends (progen) and the output tests on every
backend run alongside it.

## What we got wrong

**The reload cache miscompiled the compiler.** A pass that skips
reloading a spilled value already in a scratch register was first
written in the emitter, reasoning from the SSA's view of which blocks
branch where. Later passes add branches the SSA does not show. The
self build's s2 compiled a broken checker, and s3 failed with 1,061
wrong exhaustiveness errors. The version that landed works on the final
assembly text, the only place every branch is known.

**A 16% win that was the inliner giving up.** A reference counting
change read as a 16% cut of the TLS client's code. The real change,
measured against main, was +0.04%. The inliner's output had failed
verification, and the compiler quietly fell back to no inlining at all,
so the code was smaller because nothing was inlined. The fixed point
still passed. Now the fallback prints a warning, and the self build
fails if it happens there.

**A design that measured slower (decision 0255).** On arm64 most calls
in TLS code are calls to drop helpers, and each one forces values into
memory across it. Three conventions for drop helpers that keep the
caller's registers were built and measured. The best made 29 of 114
workloads slower and 2 faster: the spills came from the real calls
between the drops, not the drops. The decision is written up as
rejected, with the numbers, and the code stays off main.

**A scheduler fix that slowed threads.** Closing the single-threaded
task spawn gap against tokio, a first version of one change made
multi-threaded spawn take 1.7 times the cycles. The gate's concurrency
run caught it before merge. The version that landed brought Xo's Linux
spawn benchmark from 1.35 times tokio's current-thread CPU time to 0.96.

## Next

The remaining arm64 gaps are in collections and strings, where the work
is in inlining and reference counting rather than instruction
selection. On x86_64, `strings` (1.55) and `maxby` (1.57) lead the list.
Each will be measured the same way, and the results files will say when
an idea did not work.
