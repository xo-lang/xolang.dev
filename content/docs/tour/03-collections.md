---
title: "Lists, maps, and sets"
description: "Immutable persistent collections, higher order methods, and safe map reads."
weight: 3
---

{{% example "collections" %}}

- `List`, `Map`, and `Set` are immutable and persistent. `push` and `put` on a
  `var` rebind it to a new collection that shares structure with the old one,
  so copies are cheap and nothing changes behind your back.
- Maps and sets keep insertion order.
- `map`, `filter`, `fold`, `find`, `sort`, and friends are methods.
- A list, map, or set interpolates as its debug text when its elements
  implement `Display`: `"${[1, 2, 3]}"` is `[1, 2, 3]`, a map is
  `{"ada": 36}`, a set is `#{"x", "y"}`, and strings keep their quotes. `show`
  here formats a list its own way instead. A list of optionals, or of a
  struct without `derive Display`, cannot be interpolated, and the compiler
  says so.

Reading a map by index is the map version of a nil dereference, so Xo
rejects it:

{{% mistake "mapindex" %}}
