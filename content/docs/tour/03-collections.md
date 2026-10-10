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
- A list does not implement `Display`, so `show` formats it explicitly. The
  compiler says so if you try to interpolate one.

Reading a map by index is the map version of a nil dereference, so Xo
rejects it:

{{% mistake "mapindex" %}}
