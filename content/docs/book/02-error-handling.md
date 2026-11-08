---
title: "Error handling"
description: "Errors are values: chain them with from, handle them with ?? and match, and keep faults for bugs."
weight: 2
---

Xo has two kinds of failure, and the language keeps them apart:

- an **error** is something the caller can reasonably handle (bad input, a
  missing file). It is a value in the return type after `!`.
- a **fault** is a bug (a broken `requires`, an index out of range). It
  stops the task, and only an isolation boundary turns it into a value.

## Layered errors with `from`

Each layer has its own error enum. A `from` variant lets `?` convert a lower
layer's error into the upper one.

{{% example "book/errors-chain" %}}

- `port` returns `Int ! PortErr`. `parse(text)?` yields a `ParseErr`, which
  the `Parse(from ParseErr)` variant wraps; `check_range(n)?` does the same
  for `RangeErr`.
- The caller can still tell which layer failed: the test matches
  `Err(Range(TooSmall(n, _)))`.
- Variants with two fields are built with named arguments.

Ignoring a result is not allowed to pass silently:

{{% mistake "ignored" %}}

## Handling an error without ceremony

{{% example "book/errors-handling" %}}

- `a ?? b` gives the value, or `b` when there is none. With a `Result` the
  right side may bind the error: `r ?? e => { ... }`.
- `?? return x` leaves the function early when the value is missing.
- `or_err` turns an `Option` into a `Result`; `?` passes the error up.
- `if let Some(p) = ...` handles just the case you care about.

## Faults are not errors

{{% example "book/errors-faults" %}}

- `nth` states its precondition with `requires`. Breaking it is the caller's
  bug, so it is a fault, not an error value.
- `nth_checked` takes input that may legitimately be wrong, so it returns an
  error.
- `task.isolate` runs a function in its own scope and returns `Faulted` when
  it faults. Use it at a service boundary (one request), not to hide bugs.

## What to take away

- Input from outside is an error; a broken promise inside the program is a
  fault.
- Give each layer its own error enum and connect them with `from`.
- Prefer `??` for fallbacks and `match` when each case needs its own action.

Back to the [book overview](/docs/book/).
