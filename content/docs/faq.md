---
title: "Why Xo? (FAQ)"
linkTitle: "Why Xo? (FAQ)"
description: "What Xo is for, how it relates to Go, how to say it, and what experimental means today."
weight: 5
toc: true
---

## How do you say "Xo"?

*Ex-oh*, like the letters X and O. When you search for it, use "Xo lang".

## Is Xo related to other projects named xo?

No. Xo is unrelated to the `xo` JavaScript linter, to xoscript (a server
side scripting language that also uses `.xo` files), and to any other
project or company with a similar name.

## What is Xo for?

Backends and web services: HTTP APIs, workers, command line tools. It is a
small, statically typed, garbage collected language that compiles to static
binaries for Linux, macOS, Windows, and WASI.

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
library, and a compatibility promise. The first toolchain compiles Xo to Go,
so it inherits Go's garbage collector, scheduler, and cross compilation, and
[any Go package can be used directly](../tour/12-go-packages/).

The differences are where Go lets a bug compile: Xo has `Result` errors you
must handle, optionals instead of nil, sum types with exhaustive `match`,
value semantics instead of shared pointers, structured concurrency instead
of free goroutines and `ctx` plumbing, and effects in signatures.

## Which other languages influenced it?

Rust (results, `?`, sum types, exhaustive `match`), Swift and Kotlin
(optionals, structured concurrency), and the ML family (pattern matching).
Effects and capabilities in signatures are less common in mainstream
languages; Xo makes them part of everyday code.

## Is there a garbage collector?

Yes, a tracing GC, plus request scoped arenas for HTTP handlers that are on
by default and invisible to programs. Native backends (LLVM and arm64) are
in development and can also build programs without a garbage collector.

## What does "experimental" mean right now?

The language is at specification draft 0.10 and toolchain v0.9. It is
usable and tested, but the language may still change before 1.0, and
changes ship with automatic rewriters (`xo fix --from=draft-0.N`). The
compatibility promise starts at 1.0, with the first frozen edition: code
that builds under it keeps building under it forever.

## Where is the source code?

It is not public yet; it will be soon, at
[github.com/xo-lang](https://github.com/xo-lang). Until then, the
[specification](../spec/) describes the whole language, and the
[tour](../tour/) shows it working.

## Who is the fox?

Finan, a fennec fox: ears up while the compiler checks your code, curled up
asleep once it builds clean.
