---
title: "From five minutes to under a minute: fast self builds, and seeds instead of a chain"
date: 2026-10-14T06:45:00-04:00
description: "Building Xo's compiler with itself used to take 337 s on a Mac and 42 minutes on x86. Now it takes about a minute, and a fresh machine no longer replays a chain of old compilers. Where the time went, what changed, and what it saves on every build."
---

Every change to Xo's compiler ends with the compiler building itself,
and every fresh machine starts by building one. Both got much faster
this week. This post is about where the time went, what changed, and
what that saves. As usual, AI agents did the work and the project owner
set the direction (decisions 0216 and 0220).

## Where the time went

We measured before changing anything. On the development Mac, the
compiler building itself took 337.28 s, and almost all of it was the
back end: 178.80 s writing arm64 assembly, then 112.41 s for the system
assembler and linker to read the 437 MB of assembly that produced. The
whole front end (loading, parsing, and checking every module) took
1.17 s. On a 32 vCPU arm64 cloud machine (r8g.8xlarge) the same build
took 496.82 s.

## Stage 1: use the cores

The compiler was doing all of that on one core. Stage 1 split the work:
the code generator emits functions in parallel, the assembly is written
and assembled in parts, and the reference counting pass and the
verifier run as tasks. The output is byte identical whatever the number
of jobs.

- Mac: 337.28 s to 59.00 s.
- r8g.8xlarge, 16 jobs: 496.82 s to 49.83 s.

## Round 2: write less code

Stage 1 made the same work faster. Round 2 cut the work itself. When a
value of a struct type died, the compiler released each heap field
separately, and the emitter loaded every field and called its release.
That pattern was 38 percent of the lines of the compiler's own
assembly. Now a struct is released with one call, and large structs go
through one generated helper per type. On r8g.8xlarge:

| | Before | After |
|---|---|---|
| self build | 49.83 s | 34.15 s |
| peak memory | 19.86 GB | 7.57 GB |
| assembly | 463.6 MB | 391.6 MB |
| calls | 4.64 million | 1.27 million |
| compiler binary | 88.4 MB | 73.1 MB |

The rebuild still reproduces itself byte for byte, and the test
programs pass on both native backends.

## x86: stop optimizing development builds

On x86-64 the compiler is built through LLVM, and most of the time
went to clang optimizing a very large program. A development build of the
compiler now uses `-O0`; builds for distribution stay at `-O2`. The
trade-off is real: a `-O0` compiler is about 1.5 times slower at
compiling programs. But it builds itself in a fraction of the time, and
with round 2 the LLVM IR it produces shrank from 1.116 GB to 312.7 MB.

Put together, the x86 development self build went from 2,510.80 s, at
`-O2` before these changes, to 83.10 s.

## How that compares

For scale, Go's own `make.bash`, which builds the whole Go toolchain
three times over, took 46.40 s from a cold cache on the same class of
machine. Xo's compiler building itself in 34.15 s is now in the same
range. It is not the same task, and Go's build is mature and cached in
ways Xo's is not yet; per-module caching is the next stage of the plan.

## Seeds: no more chain

With the Go compiler deleted, the only thing that can build `xo` is an
earlier `xo`. Until now, a fresh machine started from the last compiler
written in Go and replayed a chain of intermediate compilers up to
today's. On a fresh cloud machine that took 1,491 to 1,936 s before the
real build could even start.

Now each version of `xo` is built by the previous version, and that
previous version is kept prebuilt for every platform, in private
storage the project's own machines can read. They are not public
downloads. A fresh machine downloads one seed and does one build.
The chain from the Go compiler still exists, but only when someone asks
for it: to bootstrap a new platform, or to rebuild everything from
source so no old binary has to be trusted.

The newest seed was cut on 2026-10-14 right after the round 2 changes,
for all five platforms. The Mac's own (darwin/arm64) was built natively
with full optimization after its fixed point passed; the other four
(Linux arm64 and x86-64, Windows, Intel Mac) were cross built on the
same Mac by that compiler, through the Go backend, in 16 to 24 s each.
Each is a 14 to 16 MB archive (35 MB for the Mac's). With the first
seed, on 2026-10-13 and before the fast builds, a Mac with empty caches
had a working `xo` in 325 s, against 1,491 to 1,936 s for the chain on
a fresh cloud machine.

Seeds also decide when old runtime code can go. The C version of the
random number functions had moved to Xo, but deleting the C broke the
build: the previous seed's compiler still called it. Once the new seed
existed, nothing called it, and the C was deleted the same day. That
is the rule working as designed: a runtime change the compiler itself
depends on waits for the next seed.

## What it saves

The savings below are per build, measured; we have not added them up
into totals.

- **Every compiler change on the Mac:** a self build of 59.00 s instead
  of 337.28 s, about four and a half minutes saved each time an agent
  rebuilds the compiler.
- **Every fixed-point check in the cloud:** the self build on
  r8g.8xlarge is 34.15 s instead of 496.82 s, and the fixed point
  builds the compiler more than once.
- **Every x86 development build:** 83.10 s instead of 2,510.80 s,
  about 40 minutes saved each time.
- **Every fresh machine:** one seed and one build, instead of 25 to 32
  minutes of chain first.

What it will save is the same arithmetic, applied to every future
change. A self build is the step every compiler change, every merge,
and every fixed-point check waits on, so it is the one worth making
fast.

## What is next

Stage 2 of the plan caches work per module, so a change to one module
does not rebuild the rest; stage 3 compiles modules separately. Each
stage starts only after the measurement of the one before.
