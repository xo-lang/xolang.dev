---
title: "The SSA builder, written in Xo"
date: 2026-10-11T13:30:00-04:00
description: "The largest piece of the Xo compiler's back half now exists in Xo too, checked function by function against the Go implementation on three backends. How we checked it, what it found, and how fast it is."
---

Xo is being rewritten in Xo. The lexer, parser, and type checker came
first; their output is identical to the Go implementation's on every
program in the repository that does not call Go or C. The next piece is
the one every native backend depends on: the SSA builder, which turns a
checked program into the intermediate form that the LLVM and arm64
backends compile. All eight of its stages are now done.

## Why this piece next

The Go compiler that ships today has four code generation parts: the SSA
builder (about 14,800 lines of Go, shared by both native backends), the
arm64 emitter, the LLVM emitter, and the Go code generator. The SSA
builder is the largest and the one the others need, so it went first
(decision 0150). The arm64 emitter comes next; once the Xo compiler
builds itself to a byte-identical fixed point, the released `xo` on arm64
hosts becomes the self-hosted compiler for native builds. The [roadmap](/roadmap/#plan)
has the full order.

## How it was checked

Rewriting a compiler is easy to get subtly wrong, so the rule was the
same as for the front end: the two implementations must print the same
thing. A hidden command, `xo ssadump`, prints the module the Go builder
makes, function by function, after each stage; the Xo builder prints the
same format. The test compares them on every directory of the repository
that holds Xo code, about 630 programs.

Three things make the comparison stricter than it sounds:

- **Three builds of the Xo builder.** The Xo builder is itself compiled
  by each of Xo's three backends (Go, LLVM, and arm64), and all three
  must agree with the Go builder. A bug in any backend that miscompiles
  the builder shows up as a difference.
- **Every stage, not just the end.** After the initial build, the passes
  run in order (unwinding, landing pads, cleanup, reference counting),
  and each stage's output is compared on its own.
- **Mutations.** A separate test changes programs at random (400
  mutated programs) and compares both builders on the results, and the
  verifier is run on programs with each retain or release removed, to
  check that both builders' verifiers reject the same broken code.

The port went in eight stages, each adding a slice of the language:
the core (functions, generics, structs, enums, `match`, closures),
interfaces and dynamic values, maps and sets, contracts and `defer`,
concurrency and I/O, the standard library's built-ins and `use c`, test
binaries, and finally the passes and the verifier.

## The result

- **11,543 of 11,569 functions** identical to the Go builder's output.
  Every function left over is one the Go builder rejects too.
- **6,282 of 6,376 functions** in test binaries identical, with the same
  rule for the rest.
- **The passes:** identical output at every stage on all 306 programs
  both builders build completely.
- **The verifier:** 32,411 mutant verdicts identical. A mutant verdict is
  the verifier's answer for one function with one retain or release
  removed.
- **0 differences** with the Go, arm64, and LLVM builds of the Xo
  builder.

## What it found

The Xo builder is about 17,000 lines of Xo, the largest program Xo's own
backends have compiled, and building it found real problems:

- **The arm64 backend was 13 times slower than Go on this code.** The
  builder passes a large struct (about 300 words) to almost every call,
  and arm64 copied it through the stack in both directions each time.
  Passing structs of 256 bytes or more by reference (decision 0151) took
  the arm64 build from 13.2x to 2.3x the Go builder's time on the same
  input, and the binary from 54 MB to 23 MB. Large enums now follow the
  same rule (decision 0153), another 5 to 9 percent.
- **An arm64 address that did not fit an instruction.** A struct of
  4.7 KiB passed by value put a stack slot past the 4,095 limit of an
  `add` immediate, and the assembler rejected the build. Fixed with a
  shifted add.
- **Branches that could not reach.** One function of the arm64 build had
  280,000 instructions, and its conditional branches to fault handlers
  could not reach past 1 MiB of code. They are now rewritten to reach.
- **A slow equality in the Go backend.** `==` on enums boxed both values;
  comparing tags directly removed 9% of the Go build's time.

None of these was a miscompilation: each was a build failure or a slow
path.

## How fast is it?

The Xo-built builder is slower than the Go-built one, and by how much
depends on what you measure:

| measured | Xo, LLVM backend | Xo, Go backend | Xo, arm64 backend |
|---|---|---|---|
| a full run: build, every pass, the verifier and its mutants | 1.05x | 1.30x | 1.29x |
| the build step alone | 1.62x | 1.68x | 2.18x |

Times are relative to the Go-built compiler on the same input (the type
checker's own source; Apple M4 Pro). The full run is closer because the
verifier's mutants take most of its time. The build step alone is the fairer number for the work the builder does.
The largest remaining cost is Xo's ordered maps, which record insertion
order; using integer keys for the hottest map is the next experiment.

**Update, 2026-10-12.** One suspected cost is fixed: updating a list
inside a list element, as in `g.blocks[g.cur].insts.push(x)`, now
happens in place on the native backends instead of copying the inner
list (decision 0169). 20,000 such pushes on arm64 went from 63,580
microseconds to 104, and from 39,993 allocations to 18. It does not
explain the gap, though: the self-compiled compiler, built before and
after the change, compiles itself in the same time (271.8 s and 276.4
s), still about twice the Go-built compiler's. Profiling that run is the
next experiment.

## Meanwhile, on arm64

A related change landed the same day: release builds now ship the arm64
backend's C runtime precompiled for each target (decision 0157), so arm64
builds no longer compile C and need no clang. The system `cc` still
assembles and links. A first build on a cold cache went from 1.94 s to
0.13 s for a small program, and from 4.27 s to 0.28 s for an HTTPS
server, on an arm64 Mac.

Next is the arm64 emitter in Xo, and with it the first point where Xo
builds Xo end to end.
