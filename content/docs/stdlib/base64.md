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

- const [`STD`](#STD)
- const [`URL`](#URL)
- const [`DEC_STD`](#DEC_STD)
- const [`DEC_URL`](#DEC_URL)
- type [`Base64`](#Base64)
- type [`DecodeErr`](#DecodeErr)
  - method [`DecodeErr.display`](#DecodeErr.display)
- fn [`encode`](#encode)
- fn [`decode`](#decode)
- fn [`alphabet`](#alphabet)
- fn [`padded`](#padded)
- fn [`is_nl`](#is_nl)

## Constants

### STD {#STD}

```xo
const STD: Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
```

[Source: `std/base64.xo:166`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L166)

### URL {#URL}

```xo
const URL: Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
```

[Source: `std/base64.xo:168`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L168)

### DEC_STD {#DEC_STD}

```xo
const DEC_STD: Bytes = b"\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x3e\xff\xff\xff\x3f\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\xff\xff\xff\xff\xff\xff\xff\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\xff\xff\xff\xff\xff\xff\x1a\x1b\x1c\x1d\x1e\x1f\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"
```

The value of each byte in the alphabet, or 255 (also for `=` and the
newlines, which decode handles itself).

[Source: `std/base64.xo:183`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L183)

### DEC_URL {#DEC_URL}

```xo
const DEC_URL: Bytes = b"\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x3e\xff\xff\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\xff\xff\xff\xff\xff\xff\xff\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\xff\xff\xff\xff\x3f\xff\x1a\x1b\x1c\x1d\x1e\x1f\x20\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff"
```

[Source: `std/base64.xo:185`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L185)

## Types

### Base64 {#Base64}

```xo
pub enum Base64 {
  Std
  Url
  RawStd
  RawUrl
}
```

RFC 4648 section 4 (`Std`, `+/`) and section 5 (`Url`, `-_`); the Raw
forms write and read no `=` padding.

[Source: `std/base64.xo:15`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L15)

### DecodeErr {#DecodeErr}

```xo
pub struct DecodeErr {
  pub at: Int
}
```

Displays as Go's CorruptInputError: `illegal base64 data at input byte 4`.

[Source: `std/base64.xo:23`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L23)

#### DecodeErr.display {#DecodeErr.display}

```xo
pub fn (e: DecodeErr) display() -> Str
```

[Source: `std/base64.xo:27`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L27)

## Functions

### encode {#encode}

```xo
pub fn encode(data: Bytes, enc: Base64 = Base64.Std) -> Str
```

[Source: `std/base64.xo:29`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L29)

### decode {#decode}

```xo
pub fn decode(s: Str, enc: Base64 = Base64.Std) -> Bytes ! DecodeErr
```

`\r` and `\n` are skipped; anything else outside the alphabet, or
padding where the encoding has none, is DecodeErr at its byte offset.

[Source: `std/base64.xo:69`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L69)

### alphabet {#alphabet}

```xo
fn alphabet(enc: Base64) -> Bytes
```

[Source: `std/base64.xo:170`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L170)

### padded {#padded}

```xo
fn padded(enc: Base64) -> Bool
```

[Source: `std/base64.xo:179`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L179)

### is_nl {#is_nl}

```xo
fn is_nl(c: UInt8) -> Bool
```

[Source: `std/base64.xo:187`](https://github.com/xo-lang/xo/blob/main/std/base64.xo#L187)
