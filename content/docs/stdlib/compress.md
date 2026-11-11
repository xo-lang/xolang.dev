---
title: "std/compress"
linkTitle: "compress"
description: "Go's compress/gzip, compress/flate, and compress/zlib over whole buffers: the bytes Go's writers ..."
toc: true
module: "std/compress"
source: "https://github.com/xo-lang/xo/blob/main/std/compress.xo"
generated: "scripts/sync-content.py from `xo doc std/compress`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Level`](#Level)
- type [`CompressErr`](#CompressErr)
  - method [`CompressErr.display`](#CompressErr.display)
- type [`Format`](#Format)
- type [`Compressor`](#Compressor)
  - method [`Compressor.write`](#Compressor.write)
  - method [`Compressor.flush`](#Compressor.flush)
  - method [`Compressor.finish`](#Compressor.finish)
- type [`Decompressor`](#Decompressor)
  - method [`Decompressor.write`](#Decompressor.write)
  - method [`Decompressor.finish`](#Decompressor.finish)
- type [`LzwOrder`](#LzwOrder)
- fn [`gzip`](#gzip)
- fn [`gunzip`](#gunzip)
- fn [`deflate`](#deflate)
- fn [`inflate`](#inflate)
- fn [`zlib`](#zlib)
- fn [`unzlib`](#unzlib)
- fn [`compressor`](#compressor)
- fn [`decompressor`](#decompressor)
- fn [`lzw_encode`](#lzw_encode)
- fn [`lzw_decode`](#lzw_decode)

## Types

### Level {#Level}

```xo
enum Level {
  NoCompression
  BestSpeed
  Default
  BestCompression
  HuffmanOnly
  Of(n: Int)
}
```

A compression level: Go's -2 (HuffmanOnly) to 9 (BestCompression);
`Of(n)` for any of them, a fault outside -2 to 9.

[Source: `std/compress.xo:9`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L9)

### CompressErr {#CompressErr}

```xo
struct CompressErr {
  msg: Str
}
```

Go's error texts (`gzip: invalid header`, `flate: corrupt input before
offset 5`, `zlib: invalid checksum`, `unexpected EOF`), or
`gzip: output exceeds max_size (N bytes)` (flate, zlib likewise).

[Source: `std/compress.xo:21`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L21)

#### CompressErr.display {#CompressErr.display}

```xo
fn (e: CompressErr) display() -> Str
```

[Source: `std/compress.xo:25`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L25)

### Format {#Format}

```xo
enum Format {
  Gzip
  Deflate
  Zlib
}
```

The stream formats of a Compressor or Decompressor.

[Source: `std/compress.xo:41`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L41)

### Compressor {#Compressor}

```xo
struct Compressor {}
```

A streaming compressor: bytes in, compressed bytes out, no I/O of its
own; `write` returns the output ready so far (it may be empty),
`flush` everything written so far (a sync block: a reader can decode
it all), `finish` the rest and the format's trailer. The concatenation
of its outputs is what gzip, deflate, or zlib gives for all the data.
@move_only

[Source: `std/compress.xo:53`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L53)

#### Compressor.write {#Compressor.write}

```xo
fn (var c: Compressor) write(data: Bytes) -> Bytes
```

[Source: `std/compress.xo:56`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L56)

#### Compressor.flush {#Compressor.flush}

```xo
fn (var c: Compressor) flush() -> Bytes
```

[Source: `std/compress.xo:57`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L57)

#### Compressor.finish {#Compressor.finish}

```xo
fn (var c: Compressor) finish() -> Bytes
```

@moves

[Source: `std/compress.xo:59`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L59)

### Decompressor {#Decompressor}

```xo
struct Decompressor {}
```

A streaming decompressor: compressed bytes in, decoded bytes out as
their input arrives (how much each write returns may differ between
backends: natively each whole DEFLATE block, on the Go backend what Go's
reader returns); `finish` returns the rest, or `unexpected EOF` when
the stream did not end. The concatenation of the outputs is what
gunzip, inflate, or unzlib gives; more than max_size bytes in all is an
error at once.
@move_only

[Source: `std/compress.xo:69`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L69)

#### Decompressor.write {#Decompressor.write}

```xo
fn (var d: Decompressor) write(data: Bytes) -> Bytes ! CompressErr
```

[Source: `std/compress.xo:72`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L72)

#### Decompressor.finish {#Decompressor.finish}

```xo
fn (var d: Decompressor) finish() -> Bytes ! CompressErr
```

@moves

[Source: `std/compress.xo:74`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L74)

### LzwOrder {#LzwOrder}

```xo
enum LzwOrder {
  LSB
  MSB
} derive Eq, Display
```

The bit order of an LZW stream (Go's compress/lzw Order): LSB (GIF, and
TIFF's predecessor) packs codes from the low end of each byte, MSB (PDF,
TIFF) from the high end.

[Source: `std/compress.xo:79`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L79)

## Functions

### gzip {#gzip}

```xo
fn gzip(data: Bytes, level: Level = Level.Default) -> Bytes
```

A gzip member with no name and no time (the output depends on the data
and the level only).

[Source: `std/compress.xo:29`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L29)

### gunzip {#gunzip}

```xo
fn gunzip(data: Bytes, max_size: Int = 1073741824) -> Bytes ! CompressErr
```

Every concatenated member; more than max_size bytes of output is an
error.

[Source: `std/compress.xo:32`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L32)

### deflate {#deflate}

```xo
fn deflate(data: Bytes, level: Level = Level.Default) -> Bytes
```

Raw DEFLATE (RFC 1951).

[Source: `std/compress.xo:34`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L34)

### inflate {#inflate}

```xo
fn inflate(data: Bytes, max_size: Int = 1073741824) -> Bytes ! CompressErr
```

[Source: `std/compress.xo:35`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L35)

### zlib {#zlib}

```xo
fn zlib(data: Bytes, level: Level = Level.Default) -> Bytes
```

zlib (RFC 1950): a two byte header, DEFLATE, and the Adler-32 sum.

[Source: `std/compress.xo:37`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L37)

### unzlib {#unzlib}

```xo
fn unzlib(data: Bytes, max_size: Int = 1073741824) -> Bytes ! CompressErr
```

[Source: `std/compress.xo:38`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L38)

### compressor {#compressor}

```xo
fn compressor(format: Format, level: Level = Level.Default) -> Compressor
```

[Source: `std/compress.xo:55`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L55)

### decompressor {#decompressor}

```xo
fn decompressor(format: Format, max_size: Int = 1073741824) -> Decompressor
```

[Source: `std/compress.xo:71`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L71)

### lzw_encode {#lzw_encode}

```xo
fn lzw_encode(data: Bytes, order: LzwOrder, lit_width: Int) -> Bytes ! CompressErr
```

Go's compress/lzw writer over a whole buffer: the codes Go writes for
the data, a leading clear code, a table reset when the 12 bit codes run
out, then the end code. lit_width (2 to 8) is the width of a literal code
and every byte must fit in it. Errors are Go's texts: `lzw: litWidth 9
out of range`, `lzw: input byte too large for the litWidth`.

[Source: `std/compress.xo:89`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L89)

### lzw_decode {#lzw_decode}

```xo
fn lzw_decode(data: Bytes, order: LzwOrder, lit_width: Int, max_size: Int = 1073741824) -> Bytes ! CompressErr
```

Go's compress/lzw reader over a whole buffer: the bytes up to the end
code (anything after it is ignored). Errors are Go's texts: `lzw: invalid
code`, `unexpected EOF` (no end code), `lzw: litWidth 1 out of range`, or
`lzw: output exceeds max_size (N bytes)`.

[Source: `std/compress.xo:95`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L95)
