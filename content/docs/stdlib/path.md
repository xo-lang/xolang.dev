---
title: "std/path"
linkTitle: "path"
description: "Pure helpers for `/` separated paths, the form every Fs capability uses on every OS (std.md 3.1)."
toc: true
module: "std/path"
source: "https://github.com/xo-lang/xo/blob/main/std/path.xo"
generated: "scripts/sync-content.py from `xo doc std/path`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`PathErr`](#patherr)
  - method [`PathErr.display`](#patherrdisplay)
- fn [`join`](#join)
- fn [`split`](#split)
- fn [`dir`](#dir)
- fn [`base`](#base)
- fn [`ext`](#ext)
- fn [`clean`](#clean)
- fn [`is_abs`](#is_abs)
- fn [`is_match`](#is_match)

## Types

### PathErr

```xo
struct PathErr {
  pattern: Str
}
```

A path pattern `is_match` cannot parse (Go's path.ErrBadPattern).

[Source: `std/path.xo:14`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L14)

#### PathErr.display

```xo
fn (e: PathErr) display() -> Str
```

[Source: `std/path.xo:18`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L18)

## Functions

### join

```xo
fn join(a: Str, b: Str) -> Str
```

[Source: `std/path.xo:5`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L5)

### split

```xo
fn split(p: Str) -> (Str, Str)
```

[Source: `std/path.xo:6`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L6)

### dir

```xo
fn dir(p: Str) -> Str
```

[Source: `std/path.xo:7`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L7)

### base

```xo
fn base(p: Str) -> Str
```

[Source: `std/path.xo:8`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L8)

### ext

```xo
fn ext(p: Str) -> Str
```

[Source: `std/path.xo:9`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L9)

### clean

```xo
fn clean(p: Str) -> Str
```

[Source: `std/path.xo:10`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L10)

### is_abs

```xo
fn is_abs(p: Str) -> Bool
```

[Source: `std/path.xo:11`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L11)

### is_match

```xo
fn is_match(pattern: Str, name: Str) -> Bool ! PathErr
```

Whether name matches the shell pattern: `*` any sequence of non-`/`
characters, `?` one non-`/` character, `[a-z]` and `[^a-z]` a byte
class, `\c` the character c. The pattern must match all of name.

[Source: `std/path.xo:23`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L23)
