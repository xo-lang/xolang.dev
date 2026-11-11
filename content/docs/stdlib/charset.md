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

- type [`Charset`](#Charset)
- type [`CharsetErr`](#CharsetErr)
  - method [`CharsetErr.display`](#CharsetErr.display)
- fn [`decode`](#decode)
- fn [`encode`](#encode)
- fn [`lookup`](#lookup)
- fn [`utf16_units`](#utf16_units)
- fn [`from_utf16_units`](#from_utf16_units)

## Types

### Charset {#Charset}

```xo
enum Charset {
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

[Source: `std/charset.xo:18`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L18)

### CharsetErr {#CharsetErr}

```xo
struct CharsetErr {
  offset: Int
  msg: Str
}
```

Where and why text could not be converted: the byte offset in the input
(`decode`: the bytes; `encode`: the text) and a message
(`invalid UTF-8`, `odd number of UTF-16 bytes`, `unpaired UTF-16
surrogate`, `character U+20AC is not in latin1`). Displays as
`charset: MSG at byte OFFSET`.

[Source: `std/charset.xo:32`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L32)

#### CharsetErr.display {#CharsetErr.display}

```xo
fn (e: CharsetErr) display() -> Str
```

[Source: `std/charset.xo:37`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L37)

## Functions

### decode {#decode}

```xo
fn decode(data: Bytes, cs: Charset, lossy: Bool = false) -> Str ! CharsetErr
```

The text of data in cs. A byte sequence that is not valid in cs is a
CharsetErr at its first byte; with `lossy` it is U+FFFD instead (one for
each invalid UTF-8 byte, as Go ranges over a string; one for each
unpaired UTF-16 surrogate, as unicode/utf16, and one for an odd last
byte, as x/text; x/text itself gives one U+FFFD for a lone low surrogate
and the surrogate after it).
Latin1 and Windows1252 accept every byte.

[Source: `std/charset.xo:46`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L46)

### encode {#encode}

```xo
fn encode(text: Str, cs: Charset) -> Bytes ! CharsetErr
```

The bytes of text in cs. A character cs cannot hold is a CharsetErr at
its byte offset in text.

[Source: `std/charset.xo:49`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L49)

### lookup {#lookup}

```xo
fn lookup(label: Str) -> Charset?
```

The charset a label names, by the WHATWG Encoding Standard's labels,
case and surrounding ASCII space ignored: "utf-8", "utf8";
"utf-16" (`Utf16Bom`), "utf-16le", "ucs-2", "unicode" (`Utf16Le`),
"utf-16be"; "windows-1252", "cp1252", "iso-8859-1", "latin1" and "ascii"
(all `Windows1252`, as browsers read them). None for any other label.

[Source: `std/charset.xo:55`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L55)

### utf16_units {#utf16_units}

```xo
fn utf16_units(text: Str) -> List[Int]
```

Go's utf16.Encode: the UTF-16 code units of text (0 to 65535, a
surrogate pair for a character above U+FFFF).

[Source: `std/charset.xo:58`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L58)

### from_utf16_units {#from_utf16_units}

```xo
fn from_utf16_units(units: List[Int]) -> Str
```

Go's utf16.Decode: the text of code units; an unpaired surrogate or a
value outside 0 to 65535 is U+FFFD.

[Source: `std/charset.xo:61`](https://github.com/xo-lang/xo/blob/main/std/charset.xo#L61)
