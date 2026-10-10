---
title: "Effects and capabilities"
description: "uses clauses, capability values passed from main, and fake capabilities in tests."
weight: 8
---

In Xo, a function's signature says what it can touch. The effects are `net`,
`fs`, `clock`, `rand`, `env`, `proc`, and `stdio`. A `pub` function declares
the ones it uses; one without a `uses` clause is pure.

{{% example "effects" %}}

- `banner` declares `uses stdio`; `slugify` declares nothing, so it cannot
  touch the outside world at all.
- The authority itself is a value: `banner` can only print because it was
  handed a `Stdio`. The only source of these capabilities is `main`'s `os`, so
  a library cannot open a file or a socket unless someone gives it one.
- In a `test`, `os` holds fakes: an in memory filesystem, a virtual clock, a
  network that fails unless you register a handler, and captured output, as
  `os.stdio.output()` shows.

Forgetting to declare an effect is caught, with the call that performs it:

{{% mistake "effect" %}}
