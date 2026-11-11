---
title: "std/base32"
linkTitle: "base32"
description: "Go's encoding/base32: the alphabets of RFC 4648."
toc: true
module: "std/base32"
source: "https://github.com/xo-lang/xo/blob/main/std/base32.xo"
generated: "scripts/sync-content.py from `xo doc std/base32`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Base32`](#Base32)
- type [`DecodeErr`](#DecodeErr)
  - method [`DecodeErr.display`](#DecodeErr.display)
- fn [`encode`](#encode)
- fn [`decode`](#decode)

## Types

### Base32 {#Base32}

```xo
enum Base32 {
  Std
  Hex
  RawStd
  RawHex
}
```

RFC 4648 section 6 (`Std`, `A-Z2-7`) and section 7 (`Hex`,
`0-9A-V`); the Raw forms write and read no `=` padding.

[Source: `std/base32.xo:7`](https://github.com/xo-lang/xo/blob/main/std/base32.xo#L7)

### DecodeErr {#DecodeErr}

```xo
struct DecodeErr {
  at: Int
}
```

Displays as Go's CorruptInputError: `illegal base32 data at input byte 4`.

[Source: `std/base32.xo:15`](https://github.com/xo-lang/xo/blob/main/std/base32.xo#L15)

#### DecodeErr.display {#DecodeErr.display}

```xo
fn (e: DecodeErr) display() -> Str
```

[Source: `std/base32.xo:19`](https://github.com/xo-lang/xo/blob/main/std/base32.xo#L19)

## Functions

### encode {#encode}

```xo
fn encode(data: Bytes, enc: Base32 = Base32.Std) -> Str
```

[Source: `std/base32.xo:21`](https://github.com/xo-lang/xo/blob/main/std/base32.xo#L21)

### decode {#decode}

```xo
fn decode(s: Str, enc: Base32 = Base32.Std) -> Bytes ! DecodeErr
```

`\r` and `\n` are removed first; anything else outside the alphabet,
or padding where the encoding has none, is DecodeErr at its byte
offset in the input without them.

[Source: `std/base32.xo:25`](https://github.com/xo-lang/xo/blob/main/std/base32.xo#L25)
