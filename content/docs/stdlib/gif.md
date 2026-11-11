---
title: "std/gif"
linkTitle: "gif"
description: "Go's image/gif over whole buffers: Decode, DecodeAll, DecodeConfig, Encode and EncodeAll, with Go..."
toc: true
module: "std/gif"
source: "https://github.com/xo-lang/xo/blob/main/std/gif.xo"
generated: "scripts/sync-content.py from `xo doc std/gif`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`GifErr`](#GifErr)
  - method [`GifErr.display`](#GifErr.display)
- type [`Config`](#Config)
- type [`Gif`](#Gif)
- fn [`decode`](#decode)
- fn [`decode_all`](#decode_all)
- fn [`decode_config`](#decode_config)
- fn [`encode`](#encode)
- fn [`encode_all`](#encode_all)

## Types

### GifErr {#GifErr}

```xo
struct GifErr {
  msg: Str
}
```

Go's error texts: `gif: not enough image data`, `gif: too much image
data`, `gif: invalid pixel value`, `gif: reading frames: unexpected EOF`,
`gif: can't recognize format "GIF90a"`, `gif: image is too large to
encode`, `image too large` (more than max_pixels) and the rest of
image/gif's.

[Source: `std/gif.xo:14`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L14)

#### GifErr.display {#GifErr.display}

```xo
fn (e: GifErr) display() -> Str
```

[Source: `std/gif.xo:18`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L18)

### Config {#Config}

```xo
struct Config {
  width: Int
  height: Int
  palette: List[Int]
}
```

What DecodeConfig returns: the logical screen and the global color
table (empty when there is none).

[Source: `std/gif.xo:22`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L22)

### Gif {#Gif}

```xo
struct Gif {
  frames: List[image.Image]
  delay: List[Int]
  disposal: List[Int]
  loop_count: Int
  width: Int
  height: Int
  palette: List[Int]
  background_index: Int
}
```

Go's gif.GIF: the frames in order (each a Paletted Image whose min_x and
min_y are the frame's offset on the screen), the delays in 100ths of a
second, the disposal methods (0 to 3; empty means none: Go's nil), the
loop count (-1: no loop extension, 0: forever, n: n times after the first
run), the screen size and global palette (empty: none) and the
background color index.

[Source: `std/gif.xo:34`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L34)

## Functions

### decode {#decode}

```xo
fn decode(data: Bytes, max_pixels: Int = 100000000) -> image.Image ! GifErr
```

Go's gif.Decode: the first frame. A screen or frame of more than
max_pixels pixels is refused before anything is allocated.

[Source: `std/gif.xo:47`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L47)

### decode_all {#decode_all}

```xo
fn decode_all(data: Bytes, max_pixels: Int = 100000000) -> Gif ! GifErr
```

Go's gif.DecodeAll.

[Source: `std/gif.xo:49`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L49)

### decode_config {#decode_config}

```xo
fn decode_config(data: Bytes) -> Config ! GifErr
```

Go's gif.DecodeConfig.

[Source: `std/gif.xo:51`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L51)

### encode {#encode}

```xo
fn encode(im: image.Image, num_colors: Int = 256) -> Bytes ! GifErr
```

Go's gif.Encode with Options{NumColors: num_colors} (1 to 256, else 256)
and its default Floyd-Steinberg drawer: a Paletted image with at most
num_colors entries is written as it is, any other image is drawn onto
the first num_colors entries of the Plan 9 palette.

[Source: `std/gif.xo:57`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L57)

### encode_all {#encode_all}

```xo
fn encode_all(g: Gif) -> Bytes ! GifErr
```

Go's gif.EncodeAll.

[Source: `std/gif.xo:59`](https://github.com/xo-lang/xo/blob/main/std/gif.xo#L59)
