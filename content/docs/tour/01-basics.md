---
title: "Basics"
description: "Bindings, functions, string interpolation, and expressions."
weight: 1
---

{{% example "basics" %}}

- `let` binds a value that never changes; `var` binds one that can. Mutating
  a `let` is a compile error, and so is a binding you never use.
- The last expression of a block is its value, so `greet` needs no `return`.
  `if` is an expression too.
- `"${expr}"` interpolates any value that implements `Display`.
- `main` receives the operating system as `os`. Printing goes through
  `os.stdio`; step 8 explains why.
- `0..3` is a half open range (0, 1, 2); `0..=3` includes 3.
