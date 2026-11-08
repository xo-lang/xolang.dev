---
title: "std/url"
linkTitle: "url"
description: "Go's net/url query and path escaping and url.Values."
toc: true
module: "std/url"
source: "https://github.com/xo-lang/xo/blob/main/std/url.xo"
generated: "scripts/sync-content.py from `xo doc std/url`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`EscapeErr`](#escapeerr)
  - method [`EscapeErr.display`](#escapeerrdisplay)
- type [`Values`](#values)
  - method [`Values.get`](#valuesget)
  - method [`Values.all`](#valuesall)
  - method [`Values.has`](#valueshas)
  - method [`Values.keys`](#valueskeys)
  - method [`Values.encode`](#valuesencode)
  - method [`Values.add`](#valuesadd)
  - method [`Values.set`](#valuesset)
  - method [`Values.remove`](#valuesremove)
- fn [`query_escape`](#query_escape)
- fn [`query_unescape`](#query_unescape)
- fn [`path_escape`](#path_escape)
- fn [`path_unescape`](#path_unescape)
- fn [`values`](#values)
- fn [`parse_query`](#parse_query)

## Types

### EscapeErr

```xo
struct EscapeErr {
  msg: Str
}
```

A malformed escape or query; displays as Go's text, for example
`invalid URL escape "%zz"`.

[Source: `std/url.xo:7`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L7)

#### EscapeErr.display

```xo
fn (e: EscapeErr) display() -> Str
```

[Source: `std/url.xo:11`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L11)

### Values

```xo
struct Values {}
```

Query keys with their values in order (url.Values): keys in the order
they first appeared, each with every value given for it. A value, not
a handle.

[Source: `std/url.xo:27`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L27)

#### Values.get

```xo
fn (v: Values) get(key: Str) -> Str?
```

The first value of key.

[Source: `std/url.xo:34`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L34)

#### Values.all

```xo
fn (v: Values) all(key: Str) -> List[Str]
```

Every value of key, [] when missing.

[Source: `std/url.xo:36`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L36)

#### Values.has

```xo
fn (v: Values) has(key: Str) -> Bool
```

[Source: `std/url.xo:37`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L37)

#### Values.keys

```xo
fn (v: Values) keys() -> List[Str]
```

The keys in the order they first appeared.

[Source: `std/url.xo:39`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L39)

#### Values.encode

```xo
fn (v: Values) encode() -> Str
```

`a=1&b=2`, sorted by key, each value escaped with query_escape
(Values.Encode).

[Source: `std/url.xo:42`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L42)

#### Values.add

```xo
fn (var v: Values) add(key: Str, value: Str)
```

Adds a value after the key's others.

[Source: `std/url.xo:44`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L44)

#### Values.set

```xo
fn (var v: Values) set(key: Str, value: Str)
```

Replaces every value of key with value.

[Source: `std/url.xo:46`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L46)

#### Values.remove

```xo
fn (var v: Values) remove(key: Str)
```

Removes key and its values.

[Source: `std/url.xo:48`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L48)

## Functions

### query_escape

```xo
fn query_escape(s: Str) -> Str
```

s escaped for a query key or value: space as `+`, every byte but
letters, digits, `-`, `.`, `_`, and `~` as `%XX` (url.QueryEscape).

[Source: `std/url.xo:15`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L15)

### query_unescape

```xo
fn query_unescape(s: Str) -> Str ! EscapeErr
```

The inverse of query_escape: `+` is a space, `%XX` a byte.

[Source: `std/url.xo:17`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L17)

### path_escape

```xo
fn path_escape(s: Str) -> Str
```

s escaped for one path segment: space as `%20`, `/` escaped
(url.PathEscape).

[Source: `std/url.xo:20`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L20)

### path_unescape

```xo
fn path_unescape(s: Str) -> Str ! EscapeErr
```

The inverse of path_escape: `%XX` a byte, `+` stays `+`.

[Source: `std/url.xo:22`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L22)

### values

```xo
fn values() -> Values
```

[Source: `std/url.xo:29`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L29)

### parse_query

```xo
fn parse_query(s: Str) -> Values ! EscapeErr
```

`a=1&b=2&a=3` into Values; a `;` separator, a bad escape, or more than
10000 parameters is an error, as url.ParseQuery.

[Source: `std/url.xo:32`](https://github.com/xo-lang/xo/blob/main/std/url.xo#L32)
