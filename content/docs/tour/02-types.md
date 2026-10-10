---
title: "Structs, enums, and newtypes"
description: "Structs, sum types, derived behavior, type aliases, and newtypes."
weight: 2
---

{{% example "types" %}}

- Constructing a struct names every field, so adding a field later is a
  compile error at every place that builds one.
- `u with {name: "..."}` makes a modified copy. Structs are values.
- Enums are sum types: each variant can carry its own fields, and `match`
  must handle every variant.
- `derive Display` prints the value structurally. `Json`, `Eq`, `Hash`, and
  `Ord` are derived the same way.
- `type UserId = Int` is an alias. `type Email struct(Str)` is a distinct
  type, so an `Email` can never be passed where a plain `Str` is expected by
  accident. Its value is `e.0`.
