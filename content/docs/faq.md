---
title: "Xo FAQ"
linkTitle: "Why Xo? (FAQ)"
description: "Xo is a small, statically typed, open source (MIT) language for backends, tools, and web services, built for AI agents to write and check. Answers on installing it, its status, license, platforms, speed against Go, and Go packages."
weight: 5
toc: true
---

## What is Xo?

Xo is a small, statically typed, open source programming language for
backends, tools, and web services, designed for AI agents to write and
check and for people to read. It compiles to native code for macOS, Linux
and Windows (and WebAssembly for WASI), and turns the bugs tests usually
miss, such as ignored errors, nil, missing `match` cases, and data races,
into compile errors. It is experimental: the current release is
{{< release "version" >}}, and the language may change before 1.0.

## How do I install Xo?

Download the archive for your platform from the
[latest release]({{< release "latest_url" >}}), check it against
`SHA256SUMS`, unpack it, and put its `bin` directory on your `PATH`.
[Getting started](../getting-started/#install) has the commands for each
platform. You can also [try Xo in the browser](/play/) with nothing to
install.

## Is Xo production ready?

Not yet: Xo is experimental and has no 1.0 or compatibility promise yet.
It is tested on every platform it ships for, and its releases are signed,
but the language and standard library may change between minor
releases, with `xo fix` rewriting code across a change. See
[what "experimental" means](#what-does-experimental-mean-right-now) below.

## What license is Xo under?

The [MIT license]({{< release "license_url" >}}): the compiler, the
toolchain, and the standard library are free to use, change, and
redistribute, in open source and commercial projects alike.

## What platforms does Xo run on?

The release archives cover macOS on Apple silicon and Intel, Linux on
arm64 and x86-64, and Windows on x86-64. The toolchain cross compiles
between them and to WebAssembly (WASI), and native programs build with no
C toolchain.

## Is Xo faster than Go?

On most of the benchmarks Xo is compared with Go on, yes; on a few it is
slower. In the 0.34.0 comparison, Xo took less time than Go on 18 of 20
workloads and more on n-body (1.04 of Go's wall time) and a parallel map
(1.01), on an Apple M4 Pro, interleaved rounds each
([release-vs-go-v0.34.0.md, lines 13 to 31](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.34.0.md#L13-L31)).
[Xo and Go](../xo-and-go/#benchmarks) has every row, the method, and
where Go is still the better choice.

## Can Xo use Go packages?

Yes: with `use go`, a program calls any Go package directly through the Go
backend (`--backend=go`), with the Go toolchain installed. The
[tour's last step](../tour/12-go-packages/) shows it.

## How do you say "Xo"?

*Ex-oh*, like the letters X and O. When you search for it, use "Xo lang".

## Is Xo related to other projects named xo?

No. Xo is unrelated to the `xo` JavaScript linter, to xoscript (a server
side scripting language that also uses `.xo` files), and to any other
project or company with a similar name.

## What is Xo for?

Backends and web services: HTTP APIs, workers, command line tools. It is a
small, statically typed language that compiles to static binaries for
Linux, macOS, Windows, and WASI.

## Why design a language for AI agents?

Agents now write a large share of backend code. They are fast, but they
make the same mistakes people do (an ignored error, a nil, a forgotten case,
a race), and they work best when every mistake comes back as precise,
machine readable feedback. Xo is built around that loop:

- **The compiler is an API.** `xo check --json` reports every problem with a
  stable `XOnnnn` code, notes, and fixes that a tool can apply. Codes never
  change meaning, so an agent can learn them. See the
  [diagnostics reference](../diagnostics/).
- **No guessing.** Every name resolves to exactly one definition found by
  reading local code: no overloading, inheritance, macros, implicit
  conversions (beyond three narrow ones), `init()`, or hidden control flow.
- **Bugs that tests miss become compile errors**: unhandled errors, nil,
  missing `match` cases, data races, leaked tasks, and undeclared side
  effects.
- **Semantic tools**: `xo query` answers questions such as "who calls this"
  and "what effects does this have"; `xo edit` renames and changes
  signatures through resolved symbols; typed holes (`???`) let an agent
  check a skeleton before filling it in.

Everything that helps an agent also helps a person reading the code later.

## Does it work?

In a study with two independent authors who each planted 30 safety bugs
(ignored errors, nil, missing cases, races, leaks, lost updates), Xo
prevented or caught 23 to 29 of them, against 13 for Go with strict
analyzers and 9 for plain Go. Logic bugs were caught at the same rate in
both. In the same benchmarks, agents passed their own tests on the first
try about as often in Xo as in Go, with programs about half the size.

## How does Xo relate to Go?

Closely. Xo keeps what makes Go productive: few keywords, one obvious way to
write things, one formatter, fast builds, static binaries, a strong standard
library, and a compatibility promise. By default Xo compiles to native code
with its own runtime and scheduler (Xo's own compiler, assembler, and
linkers on arm64 and x86-64, or LLVM with `--backend=llvm`). A Go backend (`--backend=go`) compiles
through Go instead, with Go's garbage collector and cross compilation to
every Go target, and lets a program
[use any Go package directly](../tour/12-go-packages/).

The differences are where Go lets a bug compile: Xo has `Result` errors you
must handle, optionals instead of nil, sum types with exhaustive `match`,
value semantics instead of shared pointers, structured concurrency instead
of free goroutines and `ctx` plumbing, and effects in signatures.

[Xo and Go](../xo-and-go/) compares the two in detail, with measurements.

## Which other languages influenced it?

Rust (results, `?`, sum types, exhaustive `match`), Swift and Kotlin
(optionals, structured concurrency), and the ML family (pattern matching).
Effects and capabilities in signatures are less common in mainstream
languages; Xo makes them part of everyday code.

[Xo and Rust](../xo-and-rust/), [Xo and TypeScript](../xo-and-typescript/),
and [Xo and Python](../xo-and-python/) compare Xo with each, with
measurements.

## Is there a garbage collector?

Not by default. Native builds, the default, manage memory by reference
counting: values are freed when the last reference goes, with no
collector pauses, and Xo's value semantics leave no cycles to collect.
Request scoped arenas for HTTP handlers are on by default and invisible to
programs. The Go backend (`--backend=go`) uses Go's tracing garbage
collector.

## What does "experimental" mean right now?

The language is at specification draft 0.10 and toolchain {{< release "minor" >}}. It is
usable and tested, but the language may still change before 1.0, and
changes ship with automatic rewriters (`xo fix --from=draft-0.N`). The
compatibility promise starts at 1.0, with the first frozen edition: code
that builds under it keeps building under it forever. Until then every
module uses the preview edition (`edition preview` in xo.mod).

## Where is the source code?

At [github.com/xo-lang/xo](https://github.com/xo-lang/xo), public since
2026-10-18, with its full history. It is a mirror of the development
repository: issues are welcome, and code arrives as proposals (see its
CONTRIBUTING.md).

## Who is the fox?

Finan, a fennec fox: ears up while the compiler checks your code, curled up
asleep once it builds clean.
