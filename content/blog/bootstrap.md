---
title: "The chicken and the egg: how Xo bootstraps a compiler written in Xo"
date: 2026-10-13T06:15:00-04:00
description: "To build Xo's compiler you need an Xo compiler. Here is how the first one gets made, why we insist that each rebuild produces the same bytes, and what that does and does not prove about trust."
---

`xo` is written in Xo. To build it, you need an Xo compiler, which is
also `xo`. Every self-hosted language meets this chicken and egg
problem, and the answers differ in interesting ways. This post is
about Xo's answer, and about the check we run to show it holds.

## The seed

The first Xo compiler on a machine is built by a seed: Xo's original
implementation, written in Go. From a checkout of the repository, Go
builds the seed, and the seed builds the compiler written in Xo:

```
go build -o .tools/bin/xo-seed ./cmd/xo
XO_SELF_DRIVER=0 .tools/bin/xo-seed build --backend=arm64 -o .tools/bin/xo selfhost/xo
```

(On an x86-64 host the second command uses the LLVM backend; the
[getting started page](/docs/getting-started/) has both.) The Go
implementation is frozen: new language work happens only in the Xo
code and the specification, and the seed's job is just to get the
first Xo compiler built. After that, Xo builds Xo.

**Update, 2026-10-13:** the Go implementation has since been deleted
(see [We deleted the Go compiler](/blog/deleting-the-go-compiler/)).
The seed on a machine with no `xo` is now the last Go version, tagged
`go-compiler-final`, followed by a short recorded chain of intermediate
compilers, and `go run ./scripts/xobuild` does it all. The commands
above are for history.

## The proof: a fixed point

How do you know the compiler you just built is right? Build it again
with itself, and compare. `scripts/bootstrap-xo.sh` does it in three
stages, each with empty caches:

1. the seed builds the compiler: **s1**;
2. s1 builds the compiler: **s2**;
3. s2 builds the compiler: **s3**.

s1 and s2 are both built from the same compiler source, so if the
compiler's output depends only on its input, what they build must be
the same: s2 (built by s1) and s3 (built by s2) must be **byte for byte
identical**. If they are not, the output depends on something other
than the source. We also check that s1 equals s2.

Here is what that looks like in practice:

| Machine | s1, s2, s3 build times | Result |
|---|---|---|
| arm64 Linux (16 vCPU), with Go removed from the machine after the seed | 922 s, 965 s, 958 s | s2 and s3 identical (73,492,408 bytes); s1 equals s2 |
| arm64 Mac (Apple silicon), Go off the PATH | 556 s, 548 s, 555 s | s2 and s3 identical (76,874,400 bytes); s1 equals s2 |
| x86-64 Linux (16 vCPU), LLVM backend | 1,957 s, 1,923 s, 1,923 s | s1, s2, and s3 identical (238,948,184 bytes) |
| Intel Mac, LLVM backend | 4,575 s, 4,522 s, 4,495 s | s1, s2, and s3 identical (165,821,152 bytes) |

On the arm64 Linux run, the Go toolchain was deleted from the machine
(`/usr/local/go` gone, no `go` on the PATH) once the seed was built, so
the later stages could not have used Go. On Windows the two builds
are identical except for the time stamp and checksum that the Windows
linker writes into the file header; with those two fields zeroed, the
files match.

## Why identical bytes, and not just passing tests

A compiler that passes its tests can still differ in ways no test
looks at. Identical bytes rule that out for the compiler's own build,
and every time a stage failed or differed, it pointed at a real
problem:

- On a clean Linux machine, the first bootstrap attempt failed at s1:
  the Xo compiler, given a relative path to the standard library,
  doubled part of a path while building the TLS library. The
  development Mac never showed it because its cache already held that
  library. Only a cold build, which is what the bootstrap script does,
  could find it.
- On x86-64 Linux, s2 and s3 produced identical LLVM IR but different
  binaries. The cause was ThinLTO, which names the local symbols it
  promotes across modules with a hash that, by our experiment, follows
  each module's path in the build directory. Each stage builds in its
  own directory, so the names differed. x86-64 builds of the compiler
  now use no link time optimization, and the binaries match.

There is a bonus on x86-64 Linux: s1, built by the seed written in Go,
and s2 and s3, built by the compiler written in Xo, are all the same
file. Two different compilers, in two different languages, produced
the same bytes from the same source.

## The runtime is in the loop too

The compiler is an Xo program like any other, so it links the same
native runtime every Xo program does, including the parts of that
runtime now written in Xo. Each bootstrap stage runs a full compile of
the largest Xo program we have, with that runtime underneath. A
runtime bug that changed the compiler's behavior would show up as a
stage that differs.

## Trusting trust

In his 1984 Turing Award lecture, "Reflections on Trusting Trust," Ken
Thompson showed why a self-compiling compiler is hard to trust: a
compromised compiler binary can insert a backdoor into the programs it
compiles, including into new builds of itself, while the source looks
clean. Reading the source does not help if you cannot trust the binary
that compiles it.

The known answer has two parts. The first is reproducibility: the same
source must give the same bytes, so anyone can rebuild and compare. The
second is David A. Wheeler's diverse double-compiling: build the
compiler's source with a second, independent compiler, use that result
to build the source again, and check that the final binary is
identical to the one you are asked to trust. A backdoor would have to
be present in both independent compilers in the same way.

Xo has the first part: byte-identical fixed points on every platform
above. It also has the ingredients of the second, since the seed
written in Go is an independent implementation of Xo, and the x86-64
result above already shows the Go-built and Xo-built compilers agreeing
byte for byte. Running that as a formal diverse double-compiling check
against a given `xo` binary is an idea we have not done yet.

## How others do it

Every self-hosted compiler needs a seed, and they choose differently.
Go needs an earlier Go release to build a new one. Zig keeps a
WebAssembly build of its own compiler in its repository, which a small
C program can translate and compile on any machine with a C compiler,
so building Zig needs no earlier Zig. Xo today uses its original Go
implementation as the seed and checks the result with fixed points.

Like most of Xo, this machinery was built by AI agents, under a rule a
person set early on: a rebuild that does not produce the same bytes is
a problem until proven otherwise. So far, every time, it was.
