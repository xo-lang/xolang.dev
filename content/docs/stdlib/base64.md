---
title: "std/base64"
linkTitle: "base64"
description: "Go's encoding/base64: the four alphabets of RFC 4648."
toc: true
module: "std/base64"
source: "https://github.com/xo-lang/xo/blob/main/std/base64.xo"
generated: "scripts/sync-content.py from `xo doc std/base64`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Base64`](#Base64)
- type [`DecodeErr`](#DecodeErr)
  - method [`DecodeErr.display`](#DecodeErr.display)
- fn [`encode`](#encode)
- fn [`decode`](#decode)

## Types

### Base64 {#Base64}

```xo
enum Base64 {
  Std
  Url
  RawStd
  RawUrl
}
```

RFC 4648 section 4 (`Std`, `+/`) and section 5 (`Url`, `-_`); the Raw
forms write and read no `=` padding.

[Source: `std/base64.xo:8`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L8)

### DecodeErr {#DecodeErr}

```xo
struct DecodeErr {
  at: Int
}
```

Displays as Go's CorruptInputError: `illegal base64 data at input byte 4`.

[Source: `std/base64.xo:16`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L16)

#### DecodeErr.display {#DecodeErr.display}

```xo
fn (e: DecodeErr) display() -> Str
```

[Source: `std/base64.xo:20`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L20)

## Functions

### encode {#encode}

```xo
fn encode(data: Bytes, enc: Base64 = Base64.Std) -> Str
```

[Source: `std/base64.xo:22`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L22)

### decode {#decode}

```xo
fn decode(s: Str, enc: Base64 = Base64.Std) -> Bytes ! DecodeErr
```

`\r` and `\n` are skipped; anything else outside the alphabet, or
padding where the encoding has none, is DecodeErr at its byte offset.

[Source: `std/base64.xo:25`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L25)
