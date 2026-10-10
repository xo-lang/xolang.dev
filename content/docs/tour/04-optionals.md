---
title: "No nil: optionals"
description: "T? instead of nil, if let, ??, and ? on optionals."
weight: 4
---

There is no nil in Xo. A value that may be missing has type `T?` (an
`Option[T]`): either `Some(v)` or `None`, and the compiler makes you look
before you use it.

{{% example "optionals" %}}

- `if let Some(e) = opt { ... }` runs only when there is a value.
- `opt ?? default` supplies a fallback.
- In a function that returns an optional, `opt?` gives the value or returns
  `None` at once, as in `port`.
- A plain `T` is accepted where a `T?` is expected (`email: Some(...)` could
  be written `email: "..."`). That is one of only three implicit
  conversions in the language.
