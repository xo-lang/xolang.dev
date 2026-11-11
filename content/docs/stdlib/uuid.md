---
title: "std/uuid"
linkTitle: "uuid"
description: "RFC 9562 UUIDs, following github.com/google/uuid: random (v4) and time ordered (v7) ones from the..."
toc: true
module: "std/uuid"
source: "https://github.com/xo-lang/xo/blob/main/std/uuid.xo"
generated: "scripts/sync-content.py from `xo doc std/uuid`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`TOP`](#TOP)
- type [`Uuid`](#Uuid)
  - method [`Uuid.bytes`](#Uuid.bytes)
  - method [`Uuid.version`](#Uuid.version)
  - method [`Uuid.display`](#Uuid.display)
  - method [`Uuid.debug`](#Uuid.debug)
- type [`UuidErr`](#UuidErr)
  - method [`UuidErr.display`](#UuidErr.display)
- fn [`fail`](#fail)
- fn [`of_words`](#of_words)
- fn [`word_of`](#word_of)
- fn [`with_bits`](#with_bits)
- fn [`v4`](#v4)
- fn [`v7`](#v7)
- fn [`urn_at`](#urn_at)
- fn [`decode`](#decode)
- fn [`parse`](#parse)
- fn [`from_bytes`](#from_bytes)
- fn [`nil`](#nil)

## Constants

### TOP {#TOP}

```xo
const TOP: Int = Int.min
```

The top bit of a word: flipped in a Uuid's stored words so that their
signed order is the bytes' order.

[Source: `std/uuid.xo:36`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L36)

## Types

### Uuid {#Uuid}

```xo
pub struct Uuid {
  hi: Int
  lo: Int
} derive Ord
```

A UUID: its 16 bytes as two words. `u.display()` (or `"${u}"`) is its
canonical text, `u.bytes()` its bytes, `u < v` the order of its bytes.
@internal: use `u.bytes()` and `uuid.from_bytes(b)`, `u.display()` and `uuid.parse(s)`, or `u < v`

[Source: `std/uuid.xo:16`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L16)

#### Uuid.bytes {#Uuid.bytes}

```xo
pub fn (u: Uuid) bytes() -> Bytes
```

[Source: `std/uuid.xo:121`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L121)

#### Uuid.version {#Uuid.version}

```xo
pub fn (u: Uuid) version() -> Int
```

[Source: `std/uuid.xo:123`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L123)

#### Uuid.display {#Uuid.display}

```xo
pub fn (u: Uuid) display() -> Str
```

[Source: `std/uuid.xo:125`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L125)

#### Uuid.debug {#Uuid.debug}

```xo
pub fn (u: Uuid) debug() -> Str
```

`Uuid("<its text>")`, as when a Uuid was its text.

[Source: `std/uuid.xo:128`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L128)

### UuidErr {#UuidErr}

```xo
pub struct UuidErr {
  pub msg: Str
}
```

Displays as google/uuid's texts: `invalid UUID length: 35`,
`invalid UUID format`, `invalid urn prefix: "urn:uid::"`.

[Source: `std/uuid.xo:26`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L26)

#### UuidErr.display {#UuidErr.display}

```xo
pub fn (e: UuidErr) display() -> Str
```

[Source: `std/uuid.xo:30`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L30)

## Functions

### fail {#fail}

```xo
fn fail(msg: Str) -> UuidErr
```

[Source: `std/uuid.xo:32`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L32)

### of_words {#of_words}

```xo
fn of_words(hi: Int, lo: Int) -> Uuid
```

The Uuid of the words hi and lo (the bytes, the first highest).

[Source: `std/uuid.xo:39`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L39)

### word_of {#word_of}

```xo
fn word_of(b: Bytes, i: Int) -> Int
```

The word of b[i..i + 8], the first byte highest (one load natively).

[Source: `std/uuid.xo:42`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L42)

### with_bits {#with_bits}

```xo
fn with_bits(hi: Int, lo: Int, version: Int) -> Uuid
```

The version and the RFC 9562 variant (10xx) set in the words.

[Source: `std/uuid.xo:45`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L45)

### v4 {#v4}

```xo
pub fn v4(r: Rand) -> Uuid uses rand
```

A random UUID (version 4): 122 random bits.

[Source: `std/uuid.xo:52`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L52)

### v7 {#v7}

```xo
pub fn v7(r: Rand, c: Clock) -> Uuid uses (rand, clock)
```

A time ordered UUID (version 7): the Unix time in milliseconds, then 74
random bits, so keys made later sort later (to the millisecond).

[Source: `std/uuid.xo:59`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L59)

### urn_at {#urn_at}

```xo
fn urn_at(s: Bytes, off: Int) -> Bool
```

Whether s[off..off + 9] is "urn:uuid:" in any case.

[Source: `std/uuid.xo:67`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L67)

### decode {#decode}

```xo
fn decode(s: Bytes, off: Int, dashed: Bool) -> Uuid ! UuidErr
```

The Uuid of the text in s from off (internal.uuid_half), or the error.

[Source: `std/uuid.xo:82`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L82)

### parse {#parse}

```xo
pub fn parse(s0: Str) -> Uuid ! UuidErr
```

xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx, urn:uuid:..., {...}, or 32 hex
digits (google/uuid's Parse), in either case.

[Source: `std/uuid.xo:90`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L90)

### from_bytes {#from_bytes}

```xo
pub fn from_bytes(b: Bytes) -> Uuid ! UuidErr
```

The 16 bytes.

[Source: `std/uuid.xo:111`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L111)

### nil {#nil}

```xo
pub fn nil() -> Uuid
```

00000000-0000-0000-0000-000000000000.

[Source: `std/uuid.xo:119`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L119)
