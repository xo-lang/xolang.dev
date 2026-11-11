---
title: "std/charset"
linkTitle: "charset"
description: "Text encodings other than UTF-8: UTF-16 (Excel's \"Unicode Text\" is UTF-16LE with a byte order mar..."
toc: true
module: "std/charset"
source: "https://github.com/xo-lang/xo/blob/main/std/charset.xo"
generated: "scripts/sync-content.py from `xo doc std/charset`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`W1252`](#W1252)
- type [`Charset`](#Charset)
- type [`CharsetErr`](#CharsetErr)
  - method [`CharsetErr.display`](#CharsetErr.display)
- fn [`decode`](#decode)
- fn [`encode`](#encode)
- fn [`lookup`](#lookup)
- fn [`utf16_units`](#utf16_units)
- fn [`from_utf16_units`](#from_utf16_units)
- fn [`bad`](#bad)
- fn [`w1252_rune`](#w1252_rune)
- fn [`w1252_byte`](#w1252_byte)
- fn [`hex4`](#hex4)
- fn [`name_of`](#name_of)
- fn [`put8`](#put8)
- fn [`decode_utf16`](#decode_utf16)
- fn [`put16`](#put16)
- fn [`encode_utf16`](#encode_utf16)
- fn [`is_ws`](#is_ws)

## Constants

### W1252 {#W1252}

```xo
const W1252: List[Int] = [
  0x20AC,
  0x0081,
  0x201A,
  0x0192,
  0x201E,
  0x2026,
  0x2020,
  0x2021,
  0x02C6,
  0x2030,
  0x0160,
  0x2039,
  0x0152,
  0x008D,
  0x017D,
  0x008F,
  0x0090,
  0x2018,
  0x2019,
  0x201C,
  0x201D,
  0x2022,
  0x2013,
  0x2014,
  0x02DC,
  0x2122,
  0x0161,
  0x203A,
  0x0153,
  0x009D,
  0x017E,
  0x0178,
]
```

WHATWG's windows-1252 index for the bytes 0x80 to 0x9F.

[Source: `std/charset.xo:244`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L244)

## Types

### Charset {#Charset}

```xo
pub enum Charset {
  Utf8
  Utf16Le
  Utf16Be
  Utf16Bom
  Latin1
  Windows1252
} derive Eq, Display
```

The encodings. `Utf16Le` and `Utf16Be` write and read no byte order mark
(a U+FEFF at the start is an ordinary character, x/text's IgnoreBOM).
`Utf16Bom` reads a mark (FF FE little endian, FE FF big endian) and
drops it, little endian when there is none, and writes little endian
with a mark (x/text's UseBOM and a little endian default; Excel's
Unicode Text). `Latin1` is ISO 8859-1 (a byte is the code point of the
same value); `Windows1252` is the WHATWG windows-1252 table (0x80 to
0x9F are the printable characters Microsoft put there, and the five it
left unassigned, 0x81, 0x8D, 0x8F, 0x90 and 0x9D, are U+0081, U+008D,
U+008F, U+0090 and U+009D).

[Source: `std/charset.xo:26`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L26)

### CharsetErr {#CharsetErr}

```xo
pub struct CharsetErr {
  pub offset: Int
  pub msg: Str
}
```

Where and why text could not be converted: the byte offset in the input
(`decode`: the bytes; `encode`: the text) and a message
(`invalid UTF-8`, `odd number of UTF-16 bytes`, `unpaired UTF-16
surrogate`, `character U+20AC is not in latin1`). Displays as
`charset: MSG at byte OFFSET`.

[Source: `std/charset.xo:40`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L40)

#### CharsetErr.display {#CharsetErr.display}

```xo
pub fn (e: CharsetErr) display() -> Str
```

[Source: `std/charset.xo:45`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L45)

## Functions

### decode {#decode}

```xo
pub fn decode(data: Bytes, cs: Charset, lossy: Bool = false) -> Str ! CharsetErr
```

The text of data in cs. A byte sequence that is not valid in cs is a
CharsetErr at its first byte; with `lossy` it is U+FFFD instead (one for
each invalid UTF-8 byte, as Go ranges over a string; one for each
unpaired UTF-16 surrogate, as unicode/utf16, and one for an odd last
byte, as x/text; x/text itself gives one U+FFFD for a lone low surrogate
and the surrogate after it).
Latin1 and Windows1252 accept every byte.

[Source: `std/charset.xo:54`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L54)

### encode {#encode}

```xo
pub fn encode(text: Str, cs: Charset) -> Bytes ! CharsetErr
```

The bytes of text in cs. A character cs cannot hold is a CharsetErr at
its byte offset in text.

[Source: `std/charset.xo:125`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L125)

### lookup {#lookup}

```xo
pub fn lookup(label: Str) -> Charset?
```

The charset a label names, by the WHATWG Encoding Standard's labels,
case and surrounding ASCII space ignored: "utf-8", "utf8";
"utf-16" (`Utf16Bom`), "utf-16le", "ucs-2", "unicode" (`Utf16Le`),
"utf-16be"; "windows-1252", "cp1252", "iso-8859-1", "latin1" and "ascii"
(all `Windows1252`, as browsers read them). None for any other label.

[Source: `std/charset.xo:173`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L173)

### utf16_units {#utf16_units}

```xo
pub fn utf16_units(text: Str) -> List[Int]
```

Go's utf16.Encode: the UTF-16 code units of text (0 to 65535, a
surrogate pair for a character above U+FFFF).

[Source: `std/charset.xo:202`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L202)

### from_utf16_units {#from_utf16_units}

```xo
pub fn from_utf16_units(units: List[Int]) -> Str
```

Go's utf16.Decode: the text of code units; an unpaired surrogate or a
value outside 0 to 65535 is U+FFFD.

[Source: `std/charset.xo:223`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L223)

### bad {#bad}

```xo
fn bad(offset: Int, msg: Str) -> CharsetErr
```

[Source: `std/charset.xo:251`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L251)

### w1252_rune {#w1252_rune}

```xo
fn w1252_rune(b: Int) -> Int
```

The code point of a windows-1252 byte.

[Source: `std/charset.xo:254`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L254)

### w1252_byte {#w1252_byte}

```xo
fn w1252_byte(cp: Int) -> Int
```

The windows-1252 byte of a code point, or -1.

[Source: `std/charset.xo:257`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L257)

### hex4 {#hex4}

```xo
fn hex4(cp: Int) -> Str
```

[Source: `std/charset.xo:270`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L270)

### name_of {#name_of}

```xo
fn name_of(cs: Charset) -> Str
```

[Source: `std/charset.xo:282`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L282)

### put8 {#put8}

```xo
fn put8(var out: BytesBuilder, cp: Int)
```

cp (0 to 0x10FFFF, not a surrogate) as UTF-8 bytes.

[Source: `std/charset.xo:294`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L294)

### decode_utf16 {#decode_utf16}

```xo
fn decode_utf16(data: Bytes, start: Int, big: Bool, lossy: Bool) -> Str ! CharsetErr
```

[Source: `std/charset.xo:312`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L312)

### put16 {#put16}

```xo
fn put16(var out: BytesBuilder, u: Int, big: Bool)
```

[Source: `std/charset.xo:366`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L366)

### encode_utf16 {#encode_utf16}

```xo
fn encode_utf16(src: Bytes, big: Bool, bom: Bool) -> Bytes
```

text (valid UTF-8) as UTF-16 bytes, with a byte order mark when asked.

[Source: `std/charset.xo:377`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L377)

### is_ws {#is_ws}

```xo
fn is_ws(c: UInt8) -> Bool
```

[Source: `std/charset.xo:410`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L410)
