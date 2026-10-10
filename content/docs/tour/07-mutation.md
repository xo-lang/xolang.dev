---
title: "Values and mutation"
description: "Value semantics, var receivers, updating collections in place, Mutex and Atomic."
weight: 7
---

Everything in Xo is a value: assigning or passing a struct copies it (cheaply,
because collections share structure). There are no pointers, so two parts of
a program can never change the same value without synchronization, and data
races cannot happen.

{{% example "mutation" %}}

- `snapshot` kept the old balance: `acct` and `snapshot` are separate values.
- A `var` receiver (`fn (var a: Account)`) changes the caller's binding in
  place.
- `m.update(key, init, fn(var v) { ... })` changes a value inside a
  collection in one step. Copying a value out, changing it, and forgetting to
  store it back is a compile error (`XO0520`).
- `Mutex[T]` and `Atomic[T]` are the only shared mutable state.
  `with` gives the closure the value to change; `with_read` gives read only
  access shared with other readers.

Closures capture by value, so they cannot quietly change a local:

{{% mistake "capture" %}}
