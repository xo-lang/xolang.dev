---
title: "Introducing Xo"
date: 2026-10-10
description: "A small, statically typed language for backends, designed so the compiler catches what AI agents (and people) get wrong."
---

Xo (pronounced *ex-oh*) is a small, statically typed language for backends
and web services. It is built for a world where AI agents write much of the
code, and it starts from one observation: agents make the same mistakes
people do, only faster. They ignore an error, dereference a nil, forget a
case, share a map between goroutines, or call the network from a function
that looked pure. Tests catch some of these. Review catches some more. Many
reach production.

So Xo moves those bugs into the compiler.

## What the compiler checks

- **Errors cannot be ignored.** A function that can fail returns a
  `Result`, and leaving it unhandled is a compile error. Discarding one
  needs a written reason: `.ignore_err("cleanup is best effort")`.
- **There is no nil.** A missing value is a `T?`, and you unwrap it before
  you use it.
- **Matches are exhaustive.** Add a variant to an enum and every `match`
  that forgot it stops compiling.
- **No data races.** Values are copied, never shared; the only shared
  mutable state is `Mutex` and `Atomic`.
- **No leaked tasks.** Concurrency is structured: no task outlives the
  scope that started it, and cancellation flows down without a `ctx`
  parameter.
- **Side effects are visible.** A `pub` function declares what it touches
  (`uses net, fs.read`), and the authority to do it is a value passed down
  from `main`.

In a study with two independent bug authors who each planted 30 safety
bugs, Xo prevented or caught 23 to 29 of them, against 13 for Go with
strict analyzers and 9 for plain Go.

## Feedback a program can read

Every diagnostic has a stable code, notes, and a fix, as JSON:

```text
main.xo:6:3: error XO0201: result of `parse_port` is not handled
  note: `parse_port` can fail with `Error`; propagate with `?`, match on it, or discard it with `.ignore_err("reason")` (core 2.6)
  fix: discard with a reason
```

An agent can apply the fix, look the code up in the
[diagnostics reference](/docs/diagnostics/), or ask `xo explain XO0201`.
Codes never change meaning.

## Familiar on purpose

If you know Go, you can read Xo. It keeps few keywords, one formatter, fast
builds, static binaries, and a strong standard library, and the first
toolchain compiles to Go, so any Go package is one `use go` away. The ideas
it adds are proven ones: results and sum types from Rust, optionals and
structured concurrency from Swift and Kotlin.

## Where it stands

Xo is experimental: specification draft 0.10, toolchain v0.9. The source
code is not public yet; it will be soon. Meanwhile:

- take the [tour](/docs/tour/): twelve short steps, every program checked,
  run, and tested;
- read the [specification](/docs/spec/);
- or read the [FAQ](/docs/faq/).
