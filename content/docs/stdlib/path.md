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

- type [`PathErr`](#PathErr)
  - method [`PathErr.display`](#PathErr.display)
- fn [`join`](#join)
- fn [`split`](#split)
- fn [`dir`](#dir)
- fn [`base`](#base)
- fn [`ext`](#ext)
- fn [`clean`](#clean)
- fn [`is_abs`](#is_abs)
- fn [`is_match`](#is_match)
- fn [`cut`](#cut)
- fn [`is_clean`](#is_clean)
- fn [`clean_list`](#clean_list)
- fn [`last_slash`](#last_slash)
- fn [`get_esc`](#get_esc)
- fn [`match_chunk`](#match_chunk)
- fn [`scan_chunk`](#scan_chunk)

## Types

### PathErr {#PathErr}

```xo
pub struct PathErr {
  pub pattern: Str
}
```

A path pattern `is_match` cannot parse (Go's path.ErrBadPattern).

[Source: `std/path.xo:208`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L208)

#### PathErr.display {#PathErr.display}

```xo
pub fn (e: PathErr) display() -> Str
```

[Source: `std/path.xo:212`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L212)

## Functions

### join {#join}

```xo
pub fn join(a: Str, b: Str) -> Str
```

[Source: `std/path.xo:12`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L12)

### split {#split}

```xo
pub fn split(p: Str) -> (Str, Str)
```

[Source: `std/path.xo:25`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L25)

### dir {#dir}

```xo
pub fn dir(p: Str) -> Str
```

[Source: `std/path.xo:30`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L30)

### base {#base}

```xo
pub fn base(p: Str) -> Str
```

[Source: `std/path.xo:38`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L38)

### ext {#ext}

```xo
pub fn ext(p: Str) -> Str
```

[Source: `std/path.xo:60`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L60)

### clean {#clean}

```xo
pub fn clean(p: Str) -> Str
```

[Source: `std/path.xo:72`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L72)

### is_abs {#is_abs}

```xo
pub fn is_abs(p: Str) -> Bool
```

[Source: `std/path.xo:205`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L205)

### is_match {#is_match}

```xo
pub fn is_match(pattern: Str, name: Str) -> Bool ! PathErr
```

Whether name matches the shell pattern: `*` any sequence of non-`/`
characters, `?` one non-`/` character, `[a-z]` and `[^a-z]` a byte
class, `\c` the character c. The pattern must match all of name.

[Source: `std/path.xo:217`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L217)

### cut {#cut}

```xo
fn cut(p: Str, a: Int, b: Int) -> Str
```

p[a..b] where both ends are at a `/` or `.` byte or an end of p (every
cut path makes): a view with no UTF-8 boundary check, which a Str slice
makes at each end (2026-11-07: llrt_str_slice_chk 7.5% of the parts
row, as a call).

[Source: `std/path.xo:289`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L289)

### is_clean {#is_clean}

```xo
fn is_clean(path: Bytes) -> Bool
```

Whether path has no empty, `.` or `..` element and no trailing `/`
(`/` alone counts as clean): clean returns such a path as it is.

[Source: `std/path.xo:293`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L293)

### clean_list {#clean_list}

```xo
fn clean_list(p: Str) -> Str
```

clean of a path that keeps more than 8 elements at once: their ranges
in a list.

[Source: `std/path.xo:318`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L318)

### last_slash {#last_slash}

```xo
fn last_slash(p: Str) -> Int
```

[Source: `std/path.xo:404`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L404)

### get_esc {#get_esc}

```xo
fn get_esc(p: Bytes, i0: Int, end: Int) -> (Int, Int, Bool)
```

[Source: `std/path.xo:418`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L418)

### match_chunk {#match_chunk}

```xo
fn match_chunk(p: Bytes, c0: Int, ce: Int, s: Bytes, s0: Int) -> (Int, Bool, Bool)
```

[Source: `std/path.xo:443`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L443)

### scan_chunk {#scan_chunk}

```xo
fn scan_chunk(p: Bytes, i0: Int) -> (Bool, Int, Int, Int)
```

[Source: `std/path.xo:529`](https://github.com/xo-lang/xo/blob/main/std/path.xo#L529)
