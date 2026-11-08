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

- type [`Level`](#level)
- type [`CompressErr`](#compresserr)
  - method [`CompressErr.display`](#compresserrdisplay)
- type [`Format`](#format)
- type [`Compressor`](#compressor)
  - method [`Compressor.write`](#compressorwrite)
  - method [`Compressor.flush`](#compressorflush)
  - method [`Compressor.finish`](#compressorfinish)
- type [`Decompressor`](#decompressor)
  - method [`Decompressor.write`](#decompressorwrite)
  - method [`Decompressor.finish`](#decompressorfinish)
- fn [`gzip`](#gzip)
- fn [`gunzip`](#gunzip)
- fn [`deflate`](#deflate)
- fn [`inflate`](#inflate)
- fn [`zlib`](#zlib)
- fn [`unzlib`](#unzlib)
- fn [`compressor`](#compressor)
- fn [`decompressor`](#decompressor)

## Types

### Level

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

### CompressErr

```xo
struct CompressErr {
  msg: Str
}
```

Go's error texts (`gzip: invalid header`, `flate: corrupt input before
offset 5`, `zlib: invalid checksum`, `unexpected EOF`), or
`gzip: output exceeds max_size (N bytes)` (flate, zlib likewise).

[Source: `std/compress.xo:21`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L21)

#### CompressErr.display

```xo
fn (e: CompressErr) display() -> Str
```

[Source: `std/compress.xo:25`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L25)

### Format

```xo
enum Format {
  Gzip
  Deflate
  Zlib
}
```

The stream formats of a Compressor or Decompressor.

[Source: `std/compress.xo:41`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L41)

### Compressor

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

#### Compressor.write

```xo
fn (var c: Compressor) write(data: Bytes) -> Bytes
```

[Source: `std/compress.xo:56`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L56)

#### Compressor.flush

```xo
fn (var c: Compressor) flush() -> Bytes
```

[Source: `std/compress.xo:57`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L57)

#### Compressor.finish

```xo
fn (var c: Compressor) finish() -> Bytes
```

@moves

[Source: `std/compress.xo:59`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L59)

### Decompressor

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

#### Decompressor.write

```xo
fn (var d: Decompressor) write(data: Bytes) -> Bytes ! CompressErr
```

[Source: `std/compress.xo:72`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L72)

#### Decompressor.finish

```xo
fn (var d: Decompressor) finish() -> Bytes ! CompressErr
```

@moves

[Source: `std/compress.xo:74`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L74)

## Functions

### gzip

```xo
fn gzip(data: Bytes, level: Level = Level.Default) -> Bytes
```

A gzip member with no name and no time (the output depends on the data
and the level only).

[Source: `std/compress.xo:29`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L29)

### gunzip

```xo
fn gunzip(data: Bytes, max_size: Int = 1073741824) -> Bytes ! CompressErr
```

Every concatenated member; more than max_size bytes of output is an
error.

[Source: `std/compress.xo:32`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L32)

### deflate

```xo
fn deflate(data: Bytes, level: Level = Level.Default) -> Bytes
```

Raw DEFLATE (RFC 1951).

[Source: `std/compress.xo:34`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L34)

### inflate

```xo
fn inflate(data: Bytes, max_size: Int = 1073741824) -> Bytes ! CompressErr
```

[Source: `std/compress.xo:35`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L35)

### zlib

```xo
fn zlib(data: Bytes, level: Level = Level.Default) -> Bytes
```

zlib (RFC 1950): a two byte header, DEFLATE, and the Adler-32 sum.

[Source: `std/compress.xo:37`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L37)

### unzlib

```xo
fn unzlib(data: Bytes, max_size: Int = 1073741824) -> Bytes ! CompressErr
```

[Source: `std/compress.xo:38`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L38)

### compressor

```xo
fn compressor(format: Format, level: Level = Level.Default) -> Compressor
```

[Source: `std/compress.xo:55`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L55)

### decompressor

```xo
fn decompressor(format: Format, max_size: Int = 1073741824) -> Decompressor
```

[Source: `std/compress.xo:71`](https://github.com/xo-lang/xo/blob/main/std/compress.xo#L71)
