---
title: "We deleted the Go compiler"
date: 2026-10-13T15:00:00-04:00
description: "Xo's original compiler, written in Go, is gone from the repository: about 95,000 lines. What was removed, what stays in Go and why, how we checked nothing broke, and the chicken and egg problem the deletion exposed."
---

Xo started as a compiler written in Go. Since 2026-10-12 the `xo` you
run has been the compiler written in Xo, and the Go implementation was
frozen. On 2026-10-13 it was deleted. The last commit that still has
it is tagged `go-compiler-final`.

This post covers what went, what stayed, how we checked it, and one
problem the deletion exposed that we had not seen coming. As with most
of Xo, AI agents did the work; the project owner gave the go-ahead.

## What was removed

Across the deletion commits, 95,011 lines of non-test Go were deleted
(1,264 added, so 93,747 net), and 18,837 lines of Go tests. That is the
lexer, parser, checker, SSA builder, all three code generators, the
build driver, the language server, the agent server, the module tools,
the formatter, and the command line, each of which already had a twin
written in Xo. The largest pieces were the checker (18,159 lines net)
and the SSA builder (16,639).

Many of the deleted tests compared a Go package with its Xo twin. With
one side gone, those comparisons now run against a recording: the Go
side's output on every input in the repository, captured one last time
before the deletion (20,180 units). A unit whose input has not changed
must still match what the Go compiler produced; a unit with no
recording at all fails by name instead of being skipped.

## What stays in Go, and why

About 39,000 lines of Go remain, and none of them is the compiler:

- **The Go backend's runtime** (32,211 lines). Xo can still compile a
  program to Go source, and that generated Go imports this runtime.
  The Go backend itself survives too, now written in Xo: only the Go
  implementation of the compiler is gone, not the ability to emit Go.
- **`use go` bindings** (about 2,300 lines). Binding a Go package reads
  Go's type information, so `xo` runs a small Go helper for it.
- **Test infrastructure and small tools**: the helper that builds `xo`
  for the Go test harness, a random program generator, a deterministic
  archive writer, and a vendoring check.

So Go is still needed for what touches Go: the Go backend and
`use go`. It is no longer needed to compile Xo.

## How we checked it

After the last deletion, on the development Mac and on a fresh arm64
Linux machine in the cloud:

- the golden test programs passed: 179 of 179 built with the arm64
  backend, 179 of 179 with LLVM, and 136 of 136 with the Go backend;
- on the Linux machine, with no Go on the `PATH`, the compiler rebuilt
  itself three times (437 s, 419 s, 419 s), and the second and third
  builds were byte identical, 446,762,419 bytes of assembly and
  87,444,112 bytes of binary, with the first equal to them too; the
  third build ran a hello program.
- after the merge, on the Mac, `xo` built from the checkout ran a hello
  program, and the same three-stage rebuild gave identical binaries
  (87,368,784 bytes; 330 s, 341 s, 368 s), with the first equal too.

So the compiler rebuilds itself to identical bytes on both macOS and
Linux arm64 with the Go compiler gone.

That rebuild-to-identical-bytes check is the one the
[bootstrap post](/blog/bootstrap/) describes, and it is still the
test we trust most.

## The chicken and the egg, again

With the Go compiler gone, the first `xo` on a machine has to come
from somewhere. The plan was simple: build the compiler from the
`go-compiler-final` tag with Go, once, and let that `xo` build today's.

It did not work. A runtime change merged shortly before added new
built-in operations that the compiler's own source uses. No `xo` older
than that change, the tagged one included, knew those operations, so
none of them could build the current compiler: the build failed with
undefined runtime symbols.

The fix is a seed chain. A small file in the repository records one
intermediate step: a version of the compiler new enough to know the new
operations, but old enough that the tagged compiler can build it. The
tagged compiler builds that step, and the step builds today's
compiler. On the Mac each hop took 311 s. On a fresh Linux machine,
taking the chain first brought the whole build from nothing down from
1,936 s to 1,491 s, because it no longer tries, and fails, the direct
build first.

This will happen again whenever the compiler starts using something
only a newer compiler understands. A rule for that, that each new
`xo` must be buildable by the previous one, with an optional replay of
the whole chain from source, is proposed (decision 0216) and not yet
decided.

## What it means for you

From a checkout, one command builds `xo`:

```
go run ./scripts/xobuild
```

It uses an `xo` you already have if there is one. On a machine with no
`xo` at all it needs Go and git once, to build the `go-compiler-final`
seed and follow the chain; after that, every `xo` builds the next
without Go. [Getting started](/docs/getting-started/) has the details.

## What is not done

- **The playground** still builds its compiler half from the
  `go-compiler-final` tag. An Xo version of it, compiled to
  WebAssembly, is next.
- **Some tests did not carry over**, each with a recorded next step:
  a test of the checksum log server, the text form of `xo audit`, a few
  sanitizer builds, and a handful of programs a native code generator
  cannot lower yet, which used to fall back to the Go compiler and now
  stop with a clear error instead.

Every compiler change now lands once, in Xo. That was the point of
the whole port, and as of this commit it is true.
