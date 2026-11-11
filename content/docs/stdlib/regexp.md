---
title: "std/regexp"
linkTitle: "regexp"
description: "Regular expressions with RE2 syntax and guarantees (Go's regexp): matching takes time linear in t..."
toc: true
module: "std/regexp"
source: "https://github.com/xo-lang/xo/blob/main/std/regexp.xo"
generated: "scripts/sync-content.py from `xo doc std/regexp`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Regex`](#Regex)
  - method [`Regex.pattern`](#Regex.pattern)
  - method [`Regex.is_match`](#Regex.is_match)
  - method [`Regex.find`](#Regex.find)
  - method [`Regex.find_index`](#Regex.find_index)
  - method [`Regex.find_all`](#Regex.find_all)
  - method [`Regex.captures`](#Regex.captures)
  - method [`Regex.named`](#Regex.named)
  - method [`Regex.replace_all`](#Regex.replace_all)
  - method [`Regex.replace_all_literal`](#Regex.replace_all_literal)
  - method [`Regex.split`](#Regex.split)
- type [`RegexErr`](#RegexErr)
  - method [`RegexErr.display`](#RegexErr.display)
- fn [`compile`](#compile)
- fn [`must`](#must)
- fn [`quote`](#quote)

## Types

### Regex {#Regex}

```xo
struct Regex {}
```

A compiled expression: an immutable compiled value, comparable (not a
handle, decision 0112 addendum).

[Source: `std/regexp.xo:8`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L8)

#### Regex.pattern {#Regex.pattern}

```xo
fn (r: Regex) pattern() -> Str
```

[Source: `std/regexp.xo:24`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L24)

#### Regex.is_match {#Regex.is_match}

```xo
fn (r: Regex) is_match(s: Str) -> Bool
```

[Source: `std/regexp.xo:25`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L25)

#### Regex.find {#Regex.find}

```xo
fn (r: Regex) find(s: Str) -> Str?
```

The leftmost match.

[Source: `std/regexp.xo:27`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L27)

#### Regex.find_index {#Regex.find_index}

```xo
fn (r: Regex) find_index(s: Str) -> (Int, Int)?
```

The byte offsets `(start, end)` of the leftmost match.

[Source: `std/regexp.xo:29`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L29)

#### Regex.find_all {#Regex.find_all}

```xo
fn (r: Regex) find_all(s: Str) -> List[Str]
```

Every match, left to right, not overlapping.

[Source: `std/regexp.xo:31`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L31)

#### Regex.captures {#Regex.captures}

```xo
fn (r: Regex) captures(s: Str) -> List[Str?]?
```

The leftmost match and its groups: element 0 is the whole match, then
one per group, None for a group that did not take part.

[Source: `std/regexp.xo:34`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L34)

#### Regex.named {#Regex.named}

```xo
fn (r: Regex) named(s: Str) -> Map[Str, Str]?
```

The named groups (`(?P<name>...)`) of the leftmost match that took part.

[Source: `std/regexp.xo:36`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L36)

#### Regex.replace_all {#Regex.replace_all}

```xo
fn (r: Regex) replace_all(s: Str, repl: Str) -> Str
```

Every match replaced by `repl`, in which `$1` and `${name}` stand for
groups (`$$` for a dollar sign).

[Source: `std/regexp.xo:39`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L39)

#### Regex.replace_all_literal {#Regex.replace_all_literal}

```xo
fn (r: Regex) replace_all_literal(s: Str, repl: Str) -> Str
```

Every match replaced by `repl` as written (no `$` expansion).

[Source: `std/regexp.xo:41`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L41)

#### Regex.split {#Regex.split}

```xo
fn (r: Regex) split(s: Str) -> List[Str]
```

s split around the matches.

[Source: `std/regexp.xo:43`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L43)

### RegexErr {#RegexErr}

```xo
struct RegexErr {
  pattern: Str
  msg: Str
}
```

Displays as `invalid regexp "(a": missing closing ): ...`.

[Source: `std/regexp.xo:11`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L11)

#### RegexErr.display {#RegexErr.display}

```xo
fn (e: RegexErr) display() -> Str
```

[Source: `std/regexp.xo:16`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L16)

## Functions

### compile {#compile}

```xo
fn compile(pattern: Str) -> Regex ! RegexErr
```

[Source: `std/regexp.xo:18`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L18)

### must {#must}

```xo
fn must(pattern: Str) -> Regex
```

compile, faulting on a bad pattern (for patterns written in the program).

[Source: `std/regexp.xo:20`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L20)

### quote {#quote}

```xo
fn quote(text: Str) -> Str
```

text with every metacharacter escaped: a pattern matching text literally.

[Source: `std/regexp.xo:22`](https://github.com/xo-lang/xo/blob/main/std/regexp.xo#L22)
