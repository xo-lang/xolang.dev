---
title: "The playground now runs Xo's own compiler: 2 MB instead of 23.5, and runs in half a second"
date: 2026-10-16T22:30:00-04:00
description: "The Xo playground used to ship Go's compiler and linker to your browser. Now it runs Xo's compiler, built for WebAssembly by its own backend: a 2.13 MB download instead of 23.5 MB, and a run in about half a second instead of about 2.7. How it got there, the stack overflow that nearly stopped it, and what was dropped."
---

The [playground](/play/) still checks, compiles, and runs your program
inside your browser tab, with no server, as described in [A playground
with no server](/blog/a-playground-with-no-server/). What changed is the
compiler inside it. As usual, AI agents did the work and the project owner
set the direction (decision 0242).

## Before and after

The old playground was built when Xo compiled to Go: it shipped the Xo
checker plus Go's own compiler and linker, all built for WebAssembly. Since
then Xo's compiler is written in Xo, and it has its own WebAssembly
backend. The new playground runs that compiler in the tab, and it writes
the program's WebAssembly itself.

| | Old playground | New playground |
|---|---|---|
| First download (brotli) | 23.5 MB | 2.13 MB |
| Run a small program, first time | 3.79 s | 0.66 s |
| Run it again | 2.68 s, 2.79 s | 0.45 s, 0.45 s |

The download is the compiler (1,458,595 bytes compressed) and the sources
of Xo's standard library (672,614 bytes), cached after the first visit.
The times are from pressing run to seeing the output, in headless Chrome
on the development Mac, for a program that sorts a list and prints two
values. The tour's examples take 0.5 to 0.8 s each.

## Getting a compiler into a browser tab

The compiler built for WebAssembly by its own backend worked under Node
from the start. In Chrome it stopped on the first check with "Maximum
call stack size exceeded". A browser worker's stack is small, about
0.6 MB of what a Node worker allows, and a page cannot make it bigger. So
the frames had to shrink. In order:

- **A 138-term string.** A table of Windows time zone names in the
  runtime was written as 138 strings joined with `+`. The parser nests
  such a chain, and the checker recursed once per term. The table became
  one literal, and the checker now walks a chain of operators in a loop,
  so your programs cannot hit the same wall.
- **Checking only what a build uses.** A build used to check every
  function body of the runtime, although a program reaches a small part
  of it. Now a native build checks a runtime body when it first builds it
  (decision 0247). The playground gains the most, and native builds gain
  too: a hello world builds in 622 ms instead of 947 ms.
- **The real culprit: one parallel pass.** One pass of the compiler, the
  one that places reference counting, ran in parallel tasks connected by
  a channel. To support code that can wait, Xo's WebAssembly backend
  gives every function that might wait, and every function that calls
  one, extra machinery to save and restore its frame. That one channel
  dragged 514 functions of the compiler into it, including the checker's
  biggest. In a WebAssembly build of the compiler, which has one thread
  anyway, the pass now runs sequentially, and nothing in the module can
  wait. The compiler's WebAssembly went from 51.7 MB to 28.7 MB, and the
  stack a build needs from 1 to 1.5 MB down to 0.6 MB.
- **One last recursion.** The compiler's lookup of a variable's value
  walked back through the program's blocks one call per block. It now
  walks in a loop, producing the same code for every test program.

Each step was found the same way: run the compiler under Node with a
small stack, read the frames at the overflow, and fix what sits on top.

## What was dropped

Two things the old playground had are gone, by the owner's decision, and
both can come back:

- **`use go`.** The new playground has no Go toolchain, so a program
  that imports a Go package gets a clear message instead of an error
  about bindings. It could return as a mode that downloads the old Go
  toolchain only when a program needs it.
- **The generated Go tab.** The new compiler writes WebAssembly, not Go.
  A tab showing the generated WebAssembly text could take its place.

Tests are not run yet; that is still a goal. Programs that serve HTTP
were never runnable in a tab, and are refused before they are built.

## What did not change

Your code still never leaves your machine, a run still stops after 10
seconds, 1 MB of output, or 1 GB of memory, and shared links still run
only when you press run. Open the [playground](/play/), or follow a "Run
it in the playground" link in the [tour](/docs/tour/).
