---
title: "std/jpeg"
linkTitle: "jpeg"
description: "Go's image/jpeg Decode and DecodeConfig over whole buffers: baseline and progressive JPEG, every ..."
toc: true
module: "std/jpeg"
source: "https://github.com/xo-lang/xo/blob/main/std/jpeg.xo"
generated: "scripts/sync-content.py from `xo doc std/jpeg`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Model`](#model)
- type [`Subsample`](#subsample)
- type [`Image`](#image)
  - method [`Image.chroma_width`](#imagechroma_width)
  - method [`Image.chroma_height`](#imagechroma_height)
  - method [`Image.to_rgba`](#imageto_rgba)
- type [`Config`](#config)
- type [`JpegErr`](#jpegerr)
  - method [`JpegErr.display`](#jpegerrdisplay)
- fn [`decode`](#decode)
- fn [`decode_config`](#decode_config)
- fn [`encode`](#encode)

## Types

### Model

```xo
enum Model {
  Gray
  YCbCr
  CMYK
  RGBA
} derive Eq, Display
```

The image types image/jpeg decodes to:
Gray (`pix`, 1 byte a pixel), YCbCr (the `y`, `cb` and `cr` planes with
the chroma `subsample` ratio), CMYK (`pix`, 4 bytes a pixel, Go's
image.CMYK: 255 is full ink) and RGBA (`pix`, 4 bytes a pixel with alpha
255; Go's decoder returns it for an RGB JPEG, one with an Adobe marker
that says RGB or components named R, G and B).

[Source: `std/jpeg.xo:13`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L13)

### Subsample

```xo
enum Subsample {
  S444
  S440
  S422
  S420
  S411
  S410
} derive Eq, Display
```

Go's image.YCbCrSubsampleRatio: how the chroma planes are subsampled
against luma (4:4:4 none, 4:4:0 vertical, 4:2:2 horizontal, 4:2:0 both,
4:1:1 horizontal by 4, 4:1:0 horizontal by 4 and vertical by 2).

[Source: `std/jpeg.xo:23`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L23)

### Image

```xo
struct Image {
  width: Int
  height: Int
  model: Model
  subsample: Subsample = Subsample.S444
  pix: Bytes = b""
  y: Bytes = b""
  cb: Bytes = b""
  cr: Bytes = b""
}
```

A decoded image. Rows are tight (no padding): `pix` has `width * height`
bytes for Gray and `width * height * 4` for CMYK and RGBA; a YCbCr image
has `y` of `width * height` bytes and `cb` and `cr` of `chroma_width *
chroma_height` bytes each (`pix` is empty).

[Source: `std/jpeg.xo:36`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L36)

#### Image.chroma_width

```xo
fn (img: Image) chroma_width() -> Int
```

The size of a YCbCr image's chroma planes.

[Source: `std/jpeg.xo:69`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L69)

#### Image.chroma_height

```xo
fn (img: Image) chroma_height() -> Int
```

[Source: `std/jpeg.xo:70`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L70)

#### Image.to_rgba

```xo
fn (img: Image) to_rgba() -> Bytes
```

The image as `width * height * 4` bytes of 8 bit RGBA, as Go's draw.Draw
converts it: YCbCr through color.YCbCrToRGB, CMYK through color.CMYKToRGB,
Gray as gray with alpha 255.

[Source: `std/jpeg.xo:75`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L75)

### Config

```xo
struct Config {
  width: Int
  height: Int
  model: Model
}
```

The size and image type of a JPEG (Go's image.Config).

[Source: `std/jpeg.xo:48`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L48)

### JpegErr

```xo
enum JpegErr {
  Format(msg: Str)
  Unsupported(msg: Str)
  Truncated
  Encode(msg: Str)
}
```

Go's errors: `invalid JPEG format: ...` (Format), `unsupported JPEG
feature: ...` (Unsupported) and `unexpected EOF` (Truncated); Encode is
Go's `jpeg: image is too large to encode` (decision 0510); also Format
for a JPEG whose frame header asks for more than max_pixels pixels,
`image too large`.

[Source: `std/jpeg.xo:59`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L59)

#### JpegErr.display

```xo
fn (e: JpegErr) display() -> Str
```

[Source: `std/jpeg.xo:66`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L66)

## Functions

### decode

```xo
fn decode(data: Bytes, max_pixels: Int = 100000000) -> Image ! JpegErr
```

Go's jpeg.Decode. A header over max_pixels pixels is refused before
anything is allocated (Go allocates from the header).

[Source: `std/jpeg.xo:79`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L79)

### decode_config

```xo
fn decode_config(data: Bytes) -> Config ! JpegErr
```

Go's jpeg.DecodeConfig: the size and image type without the pixels.

[Source: `std/jpeg.xo:82`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L82)

### encode

```xo
fn encode(img: Image, quality: Int = 75) -> Bytes ! JpegErr
```

Go's jpeg.Encode with `Options{Quality: quality}` (decision 0510): baseline
4:2:0 (one component for Gray), the standard Huffman tables, the quality
scaled quantization tables, Go's integer forward DCT, so the bytes are the
bytes Go writes. Gray, YCbCr (any subsample ratio), RGBA (Go's image.RGBA
fast path: premultiplied, alpha ignored) and CMYK inputs; `quality` is
clamped to 1..100. A width or height of 65,536 or more is
`JpegErr.Encode`; planes that do not match the size are a fault.

[Source: `std/jpeg.xo:91`](https://github.com/xo-lang/xo/blob/main/std/jpeg.xo#L91)
