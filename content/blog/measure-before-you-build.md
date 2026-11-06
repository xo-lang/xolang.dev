---
title: "Measure before you build: how a REPL question made Xo's tools faster"
date: 2026-11-06T12:25:00-05:00
description: "We asked whether Xo needed a REPL or a resident compiler. Measuring first found two cache bugs that cost most of a compiler rebuild, a lookup server that answers in milliseconds, and an editor that responds a third faster."
---

It started with a question from Xo's owner: would a REPL make Xo faster to
develop? A REPL feels instant because one process keeps the parsed and
type-checked program in memory between inputs. Point the same idea at the
compiler and you get a resident compile server, which we had already
accepted as a design in October (decision 0283) and never started.

Before building it, we measured what it could save. That one step changed
the plan.

## Where an edit's time went

The loop that matters most for Xo's own development is rebuilding the
compiler after a one-line edit. On our linux/arm64 offload host, a warm
rebuild took 17.5 seconds (15.7 to 15.9 seconds of it the build itself).
A cold one took 47.2 seconds. Splitting the warm build by phase:

| Part | Seconds | Would a resident process remove it? |
|---|---:|---|
| Process start | 0.00 | Nothing to remove |
| Assembling, with 0 of 126 object files reused | 9.2 to 9.5 | No: a cache key bug |
| A first pass that was thrown away and redone | about 2.4 | No: a cache bug |
| The real compile work | about 5.7 | Only its cache reads |

Process start was free. Two thirds of the build was two bugs. The object
cache keyed each assembled file on a path inside the build's random
temporary directory, so on Linux no object was ever reused. And since a
change earlier the same day (lazy checking of dependency modules, decision
0517), every warm build of a program with dependency modules type-checked
the whole program twice.

A perfect resident process could save only the cache reads inside the real
work: at most about 1.5 seconds per edit, while holding about 3.3 GB in
memory. Not worth building first.

## Fixing the bugs instead

- **Object keys** no longer include the temporary directory: after a
  one-line edit, 121 of the compiler's 127 objects are reused, and a warm
  build produces a compiler byte-identical to a cold one.
- **One check pass:** the checker now checks the bodies a skipped module
  reads before deciding to skip it.

With both fixes the build is 6.8 to 6.9 seconds, and a warm edit 8.2 to
8.3 seconds end to end, down from 17.5.

Along the way we found a third bug: with the profiler on, its exit message
broke the version check the build script reads, so every profiled build
quietly rebuilt the compiler cold, and the profile we kept was the wrong
one. That one is fixed too.

## Where a server does pay: lookups

AI agents working on Xo call `xo def`, `xo refs`, `xo type`, `xo doc` and
`xo symbols` constantly, instead of grep. Each one started cold and
type-checked the code again: 0.25 to 0.94 seconds per call on the Mac.

These now go through `xo serve`, which keeps the results: after the first
call, each one answers in 0.03 seconds, from an 8 MB server process. The
measurement also caught a correctness bug. After an edit to a module
outside the directories it had checked, the server answered with the old
result. Its cache stamps now cover each module root and the standard
library, and a test edits an imported module and checks that both `check`
and `def` see the change.

## The editor

The VS Code extension talks to `xo lsp`. Two changes made it faster on the
compiler's own source:

- **Find references** went from 622 to 733 ms to 142 to 148 ms. The server
  copied its whole type checker for every name it resolved; 41% of the CPU
  went to that copying.
- **Diagnostics** now go through the same module check cache as `xo check`
  (decision 0526), so the editor and the command line share one cache.
  Files you have open with unsaved changes are always checked fresh and
  never written to the shared cache. Measured side by side with the same
  binary: first diagnostics after opening a file went from 537 to 758 ms to
  355 to 399 ms, diagnostics after an edit from 770 to 809 ms to 583 to
  613 ms, and memory from 1.64 GB to 1.51 GB.

## What we took from it

The REPL question was the right question, but the answer was not the
first thing it suggested. Measuring the split before building turned up
two bugs worth more than the planned server, and pointed the server at the
place it pays: lookups and the editor. Builds inside the server stay
designed and unbuilt until a measurement says they pay. The next one under
way asks the same question for the test suites, which compile hundreds of
small programs and pay any fixed per-build cost hundreds of times.

Results files: bench/results/edit-loop-2026-11-05.md and
bench/results/editor-and-edit-loop-2026-11-05.md in the Xo repository.
