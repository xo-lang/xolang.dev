---
title: "Errors you have to handle"
description: "Result types, ?, error enums with from variants, and why ignoring an error does not compile."
weight: 5
---

A function that can fail says so after `!`, and its caller gets a
`Result`. Errors are ordinary values, usually an enum.

{{% example "errors" %}}

- `-> Int ! ConfigErr` returns either an `Int` or a `ConfigErr`.
- `expr?` returns the error to the caller. Here `?` in `start` turns a
  `ConfigErr` into a `StartErr` through the `from` variant.
- `Int.parse(s)` returns `Int?`; `.or_err(...)` turns a missing value into an
  error.
- `match` on the result handles both outcomes.

Ignoring an error is a compile error, not a lint:

{{% mistake "ignored" %}}

When a failure really does not matter, say why:
`parse_port(s).ignore_err("the default port is fine")`. The reason is in the
code for every reviewer to see.
