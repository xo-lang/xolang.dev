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

- type [`Uuid`](#uuid)
  - method [`Uuid.version`](#uuidversion)
  - method [`Uuid.bytes`](#uuidbytes)
  - method [`Uuid.display`](#uuiddisplay)
  - method [`Uuid.debug`](#uuiddebug)
- type [`UuidErr`](#uuiderr)
  - method [`UuidErr.display`](#uuiderrdisplay)
- fn [`v4`](#v4)
- fn [`v7`](#v7)
- fn [`parse`](#parse)
- fn [`from_bytes`](#from_bytes)
- fn [`nil`](#nil)

## Types

### Uuid

```xo
struct Uuid {
  hi: Int
  lo: Int
} derive Ord
```

A UUID: its 16 bytes as two words. `u.display()` (or `"${u}"`) is its
canonical text, `u.bytes()` its bytes, `u < v` the order of its bytes.
@internal: use `u.bytes()` and `uuid.from_bytes(b)`, `u.display()` and `uuid.parse(s)`, or `u < v`

[Source: `std/uuid.xo:12`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L12)

#### Uuid.version

```xo
fn (u: Uuid) version() -> Int
```

[Source: `std/uuid.xo:40`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L40)

#### Uuid.bytes

```xo
fn (u: Uuid) bytes() -> Bytes
```

[Source: `std/uuid.xo:41`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L41)

#### Uuid.display

```xo
fn (u: Uuid) display() -> Str
```

[Source: `std/uuid.xo:42`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L42)

#### Uuid.debug

```xo
fn (u: Uuid) debug() -> Str
```

`Uuid("<its text>")`, as when a Uuid was its text.

[Source: `std/uuid.xo:44`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L44)

### UuidErr

```xo
struct UuidErr {
  msg: Str
}
```

Displays as google/uuid's texts: `invalid UUID length: 35`,
`invalid UUID format`, `invalid urn prefix: "urn:uid::"`.

[Source: `std/uuid.xo:22`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L22)

#### UuidErr.display

```xo
fn (e: UuidErr) display() -> Str
```

[Source: `std/uuid.xo:26`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L26)

## Functions

### v4

```xo
fn v4(r: Rand) -> Uuid uses rand
```

A random UUID (version 4): 122 random bits.

[Source: `std/uuid.xo:29`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L29)

### v7

```xo
fn v7(r: Rand, c: Clock) -> Uuid uses (rand, clock)
```

A time ordered UUID (version 7): the Unix time in milliseconds, then 74
random bits, so keys made later sort later (to the millisecond).

[Source: `std/uuid.xo:32`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L32)

### parse

```xo
fn parse(s: Str) -> Uuid ! UuidErr
```

xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx, urn:uuid:..., {...}, or 32 hex
digits (google/uuid's Parse), in either case.

[Source: `std/uuid.xo:35`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L35)

### from_bytes

```xo
fn from_bytes(b: Bytes) -> Uuid ! UuidErr
```

The 16 bytes.

[Source: `std/uuid.xo:37`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L37)

### nil

```xo
fn nil() -> Uuid
```

00000000-0000-0000-0000-000000000000.

[Source: `std/uuid.xo:39`](https://github.com/xo-lang/xo/blob/main/std/uuid.xo#L39)
