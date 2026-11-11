---
title: "std/png"
linkTitle: "png"
description: "Go's image/png, Decode, DecodeConfig and Encode, over whole buffers: the image Go decodes to for ..."
toc: true
module: "std/png"
source: "https://github.com/xo-lang/xo/blob/main/std/png.xo"
generated: "scripts/sync-content.py from `xo doc std/png`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Model`](#Model)
  - method [`Model.bytes_per_pixel`](#Model.bytes_per_pixel)
- type [`Image`](#Image)
  - method [`Image.at`](#Image.at)
- type [`Config`](#Config)
- type [`Compression`](#Compression)
- type [`PngErr`](#PngErr)
  - method [`PngErr.display`](#PngErr.display)
- fn [`image`](#image)
- fn [`decode`](#decode)
- fn [`decode_config`](#decode_config)
- fn [`encode`](#encode)

## Types

### Model {#Model}

```xo
enum Model {
  Gray
  Gray16
  Paletted
  RGBA
  NRGBA
  RGBA64
  NRGBA64
} derive Eq, Display
```

The image types image/png decodes to and encodes, each with Go's pix
layout (rows of `width * bytes` with no padding):
Gray (1 byte a pixel), Gray16 (2, big endian), Paletted (1, an index
into `palette`), RGBA (4, alpha premultiplied; decode makes it from
opaque truecolor, so alpha is 255), NRGBA (4, not premultiplied),
RGBA64 (8, big endian 16 bit channels, premultiplied), NRGBA64 (8).

[Source: `std/png.xo:14`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L14)

#### Model.bytes_per_pixel {#Model.bytes_per_pixel}

```xo
fn (m: Model) bytes_per_pixel() -> Int
```

The bytes of one pixel: 1, 2, 4 or 8.

[Source: `std/png.xo:71`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L71)

### Image {#Image}

```xo
struct Image {
  width: Int
  height: Int
  model: Model
  pix: Bytes
  palette: List[Int] = []
}
```

A raster image. `pix` has `width * height * bytes per pixel` bytes;
`palette` is only for Paletted, one `0xRRGGBBAA` (not premultiplied)
per index, at most 256.

[Source: `std/png.xo:27`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L27)

#### Image.at {#Image.at}

```xo
fn (img: Image) at(x: Int, y: Int) -> Int
```

The pixel at (x, y) as `0xRRGGBBAA`, 8 bits a channel and not
premultiplied (Go's color.NRGBAModel on At(x, y), then the high byte of
each channel); a Paletted index past the palette reads as 0. Faults
for a point outside the image.

[Source: `std/png.xo:77`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L77)

### Config {#Config}

```xo
struct Config {
  width: Int
  height: Int
  model: Model
}
```

The size and image type of a PNG (Go's image.Config; the palette is
not read).

[Source: `std/png.xo:37`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L37)

### Compression {#Compression}

```xo
enum Compression {
  Default
  None
  Speed
  Best
} derive Eq
```

Go's png.CompressionLevel: Default (std/compress's default level), None,
Speed (compress level 1) or Best (level 9).

[Source: `std/png.xo:45`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L45)

### PngErr {#PngErr}

```xo
enum PngErr {
  Format(msg: Str)
  Unsupported(msg: Str)
  Truncated
  Flate(msg: Str)
}
```

Go's errors: `png: invalid format: ...` (Format), `png: unsupported
feature: ...` (Unsupported), `unexpected EOF` (Truncated), and the
zlib reader's own errors, such as `zlib: invalid header` or `flate:
corrupt input before offset 12` (Flate); also Format for a PNG whose
header asks for more than max_pixels pixels, `image too large`.

[Source: `std/png.xo:57`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L57)

#### PngErr.display {#PngErr.display}

```xo
fn (e: PngErr) display() -> Str
```

[Source: `std/png.xo:64`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L64)

## Functions

### image {#image}

```xo
fn image(width: Int, height: Int, model: Model) -> Image
```

A zeroed image of the model (pix all 0; a Paletted one has an empty
palette, set it before `encode`). Faults for a width or height under 1.

[Source: `std/png.xo:68`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L68)

### decode {#decode}

```xo
fn decode(data: Bytes, max_pixels: Int = 100000000) -> Image ! PngErr
```

Go's png.Decode: the image type depends on the color type (gray and
truecolor with a tRNS chunk, gray with alpha and truecolor with alpha
are NRGBA or NRGBA64; opaque truecolor is RGBA or RGBA64; gray is Gray or
Gray16; palettes are Paletted). Adam7 interlacing is read. A header over
max_pixels pixels is refused before anything is allocated (Go allocates
from the header).

[Source: `std/png.xo:85`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L85)

### decode_config {#decode_config}

```xo
fn decode_config(data: Bytes) -> Config ! PngErr
```

Go's png.DecodeConfig: the size and image type without the pixels.

[Source: `std/png.xo:88`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L88)

### encode {#encode}

```xo
fn encode(img: Image, level: Compression = Compression.Default) -> Bytes ! PngErr
```

Go's png.Encoder.Encode: Gray is 8 bit gray, Gray16 16 bit gray, a
Paletted image of 2, 4, 16 or more colors is 1, 2, 4 or 8 bit palette
indexed (the palette's alpha goes in a tRNS chunk), RGBA and NRGBA are
8 bit truecolor when every pixel is opaque and truecolor with alpha
otherwise, RGBA64 and NRGBA64 likewise at 16 bits. The IDAT chunks hold
32,768 bytes of compressed data each. Faults when `pix` is not the size
the width, height and model say; Format for a size under 1 or a bad
palette length.

[Source: `std/png.xo:98`](https://github.com/xo-lang/xo/blob/main/std/png.xo#L98)
