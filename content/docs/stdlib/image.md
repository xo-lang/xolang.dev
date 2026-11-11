---
title: "std/image"
linkTitle: "image"
description: "Go's image and image/color over one Image: the pixel models of std/png and std/jpeg in one enum, ..."
toc: true
module: "std/image"
source: "https://github.com/xo-lang/xo/blob/main/std/image.xo"
generated: "scripts/sync-content.py from `xo doc std/image`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Rect`](#rect)
- type [`Color`](#color)
  - method [`Color.gray`](#colorgray)
  - method [`Color.gray16`](#colorgray16)
  - method [`Color.nrgba`](#colornrgba)
- type [`Model`](#model)
- type [`Image`](#image)
  - method [`Image.at`](#imageat)
  - method [`Image.set`](#imageset)
  - method [`Image.sub_image`](#imagesub_image)
  - method [`Image.crop`](#imagecrop)
  - method [`Image.to_rgba`](#imageto_rgba)
  - method [`Image.to_nrgba`](#imageto_nrgba)
  - method [`Image.to_png`](#imageto_png)
  - method [`Image.to_jpeg`](#imageto_jpeg)
  - method [`Image.draw`](#imagedraw)
  - method [`Image.draw_mask`](#imagedraw_mask)
  - method [`Image.fill`](#imagefill)
  - method [`Image.scale`](#imagescale)
  - method [`Image.floyd_steinberg`](#imagefloyd_steinberg)
- type [`Op`](#op)
- type [`Kernel`](#kernel)
- fn [`rgb_to_ycbcr`](#rgb_to_ycbcr)
- fn [`ycbcr_to_rgb`](#ycbcr_to_rgb)
- fn [`rgb_to_cmyk`](#rgb_to_cmyk)
- fn [`cmyk_to_rgb`](#cmyk_to_rgb)
- fn [`from_nrgba`](#from_nrgba)
- fn [`web_safe`](#web_safe)
- fn [`plan9`](#plan9)
- fn [`from_png`](#from_png)
- fn [`from_jpeg`](#from_jpeg)

## Types

### Rect

```xo
struct Rect {
  x0: Int
  y0: Int
  x1: Int
  y1: Int
} derive Eq
```

Go's image.Rectangle: x0 \<= x \< x1 and y0 \<= y \< y1.

[Source: `std/image.xo:10`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L10)

### Color

```xo
struct Color {
  r: Int
  g: Int
  b: Int
  a: Int
} derive Eq
```

Go's color.Color.RGBA(): 16 bit channels, alpha premultiplied (each of
r, g and b is at most a).

[Source: `std/image.xo:19`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L19)

#### Color.gray

```xo
fn (c: Color) gray() -> Int
```

Go's color.GrayModel: the 8 bit luma of c, (19595 r + 38470 g + 7471 b +
1\<\<15) >> 24 over the 16 bit premultiplied channels.

[Source: `std/image.xo:68`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L68)

#### Color.gray16

```xo
fn (c: Color) gray16() -> Int
```

Go's color.Gray16Model: the same sum >> 16.

[Source: `std/image.xo:71`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L71)

#### Color.nrgba

```xo
fn (c: Color) nrgba() -> Int
```

Go's color.NRGBAModel: 8 bit channels, not premultiplied, as 0xRRGGBBAA.

[Source: `std/image.xo:74`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L74)

### Model

```xo
enum Model {
  Gray
  Gray16
  Paletted
  RGBA
  NRGBA
  RGBA64
  NRGBA64
  CMYK
  YCbCr
} derive Eq, Display
```

The pixel models of image/png and image/jpeg, with Go's layouts:
Gray (1 byte), Gray16 (2, big endian), Paletted (1, an index),
RGBA (4, premultiplied), NRGBA (4), RGBA64 (8, big endian), NRGBA64 (8),
CMYK (4, 255 is full ink) and YCbCr (the planes `y`, `cb` and `cr`).

[Source: `std/image.xo:30`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L30)

### Image

```xo
struct Image {
  width: Int
  height: Int
  model: Model
  pix: Bytes
  stride: Int = 0
  palette: List[Int] = []
  min_x: Int = 0
  min_y: Int = 0
  y: Bytes = b""
  cb: Bytes = b""
  cr: Bytes = b""
  y_stride: Int = 0
  c_stride: Int = 0
  subsample: jpeg.Subsample = jpeg.Subsample.S444
}
```

A raster image whose top left pixel is (`min_x`, `min_y`) (Go's
Rect().Min; 0, 0 for a decoded image) and whose size is `width` by
`height`. `pix` holds rows of `stride` bytes; a view made by
`sub_image` keeps the parent's stride. `palette` is for Paletted, one
`0xRRGGBBAA` (not premultiplied) per index. A YCbCr image keeps its samples
in the planes `y`, `cb` and `cr` (rows of `y_stride` and `c_stride` bytes,
0 for tight rows; the chroma subsampled by `subsample`) and `pix` is empty.

[Source: `std/image.xo:49`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L49)

#### Image.at

```xo
fn (im: Image) at(x: Int, y: Int) -> Color
```

Go's Image.At for the pixel models that keep their samples in `pix`
(everything but YCbCr): the color at (x, y) as 16 bit premultiplied
channels. Outside the image it is what Go's zero value gives (Gray and
Gray16: opaque black, RGBA, NRGBA, RGBA64 and NRGBA64: transparent,
CMYK: opaque white, Paletted: palette entry 0).

[Source: `std/image.xo:97`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L97)

#### Image.set

```xo
fn (var im: Image) set(x: Int, y: Int, c: Color)
```

Go's Image.Set for the models that keep their samples in `pix` (not
YCbCr): stores c converted by the model as Go's color model does (Gray,
Gray16, NRGBA, NRGBA64, CMYK from the premultiplied channels; Paletted
picks the nearest entry by Go's Palette.Index). A point outside the image
is ignored, as in Go.

[Source: `std/image.xo:113`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L113)

#### Image.sub_image

```xo
fn (im: Image) sub_image(r: Rect) -> Image
```

Go's Image.SubImage for the models that keep their samples in `pix` (not
YCbCr): the part of the image inside r (clipped to the image) sharing the
pixels of the parent, with its coordinates kept (min_x, min_y are r's
corner) and the parent's stride. An empty intersection gives the empty
image Go returns.

[Source: `std/image.xo:120`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L120)

#### Image.crop

```xo
fn (im: Image) crop(r: Rect) -> Image
```

A tightly packed copy of the part of the image inside r (stride 0, min
at r's corner after clipping).

[Source: `std/image.xo:124`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L124)

#### Image.to_rgba

```xo
fn (im: Image) to_rgba() -> Image
```

The image as an RGBA image (Go's draw.Draw of it onto image.NewRGBA with
Src, i.e. color.RGBAModel on every pixel): premultiplied 8 bit samples,
tight rows, the same size and corner. Not YCbCr yet.

[Source: `std/image.xo:129`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L129)

#### Image.to_nrgba

```xo
fn (im: Image) to_nrgba() -> Image
```

The image as an NRGBA image (color.NRGBAModel on every pixel).

[Source: `std/image.xo:132`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L132)

#### Image.to_png

```xo
fn (im: Image) to_png() -> png.Image?
```

The PNG form of the image (std/png's Image, tight rows from the corner
(0, 0): a sub image is cropped first), or None for a model PNG has no
layout for (CMYK, YCbCr).

[Source: `std/image.xo:141`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L141)

#### Image.to_jpeg

```xo
fn (im: Image) to_jpeg() -> jpeg.Image?
```

The JPEG form of the image (std/jpeg's Image, tight rows from (0, 0)), or
None for a model JPEG has no layout for (everything but Gray, YCbCr, CMYK
and RGBA) and for a YCbCr sub image (crop does not pack planes yet).

[Source: `std/image.xo:150`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L150)

#### Image.draw

```xo
fn (var dst: Image) draw(r: Rect, src: Image, sp_x: Int, sp_y: Int, op: Op)
```

Go's draw.Draw (a nil mask): draws the part of src that lies over r onto
the image, aligning r's corner with the source point (sp_x, sp_y), after
clipping r to the image and to the source (draw.clip). Src replaces the
pixels, Over composites the source over them (Porter-Duff, alpha
premultiplied). Each pixel comes out as Go's fast paths compute it (an
RGBA destination takes 16 bit source channels and 8 bit destination
channels as drawRGBA does; NRGBA and NRGBA64 copy a source of their own
model with Src; the rest go through the RGBA64 formula and Set). A YCbCr
destination is left alone (Go has no Set for it). The samples are copied
once per call.

[Source: `std/image.xo:168`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L168)

#### Image.draw_mask

```xo
fn (var dst: Image) draw_mask(r: Rect, src: Image, sp_x: Int, sp_y: Int, mask: Image, mp_x: Int, mp_y: Int, op: Op)
```

Go's draw.DrawMask: as draw, with the alpha of mask (at mask point
(mp_x, mp_y) for r's corner) scaling the source: Over composites
src * mask over the pixels, Src replaces them with src * mask. r is also
clipped to the mask's bounds. Any model's alpha serves as the mask (an
opaque Gray, say, is a mask of all ones); the mask's own coordinates are
its min_x and min_y. Each pixel comes out as Go's general path computes
it (16 bit channels, premultiplied), which is what Go's glyph and mask
fast paths compute too.

[Source: `std/image.xo:178`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L178)

#### Image.fill

```xo
fn (var dst: Image) fill(r: Rect, c: Color, op: Op)
```

Go's draw.Draw with an image.Uniform source of color c (16 bit
premultiplied channels, as Color is everywhere): fills r clipped to the
image, with Src or Over (an opaque c fills as Src either way).

[Source: `std/image.xo:183`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L183)

#### Image.scale

```xo
fn (var dst: Image) scale(dr: Rect, src: Image, sr: Rect, op: Op, kernel: Kernel)
```

golang.org/x/image/draw's Scale: scales the part of src over sr to the
part of the image over dr (clipped to the image), with the Porter-Duff op
and the interpolator. Equal sizes of dr and sr draw without scaling, as
the Go function does. NearestNeighbor picks, for destination pixel
(dx, dy) of dr, the source pixel at ((2 dx + 1) sw / (2 dw), (2 dy + 1) sh /
(2 dh)) from sr's corner; source pixels outside the source image read as
transparent black (or the palette's first entry). ApproxBiLinear blends the
four nearest source pixels by the fractions of the source position. BiLinear (the tent
kernel, support 1) and CatmullRom (support 2) blend the source pixels the
kernel reaches in two passes, columns then rows, in float64 as x/image does,
and round each channel to 16 bits; an opaque source takes Src for Over.

[Source: `std/image.xo:204`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L204)

#### Image.floyd_steinberg

```xo
fn (var dst: Image) floyd_steinberg(r: Rect, src: Image, sp_x: Int, sp_y: Int)
```

Go's draw.FloydSteinberg.Draw (the Src op with Floyd-Steinberg error
diffusion) onto a Paletted image: the part of src over r, clipped as draw
clips it, quantized to the nearest palette entry (Go's sum of squared
differences over the four 16 bit channels) with the error spread to the
neighbours in sixteenths. Any other destination model is left alone.

[Source: `std/image.xo:211`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L211)

### Op

```xo
enum Op {
  Over
  Src
} derive Eq, Display
```

Go's draw.Op: how the source combines with the destination.

[Source: `std/image.xo:153`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L153)

### Kernel

```xo
enum Kernel {
  NearestNeighbor
  ApproxBiLinear
  BiLinear
  CatmullRom
} derive Eq, Display
```

The interpolation algorithms of golang.org/x/image/draw.

[Source: `std/image.xo:186`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L186)

## Functions

### rgb_to_ycbcr

```xo
fn rgb_to_ycbcr(r: Int, g: Int, b: Int) -> (Int, Int, Int)
```

Go's color.RGBToYCbCr over 8 bit channels: (y, cb, cr).

[Source: `std/image.xo:77`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L77)

### ycbcr_to_rgb

```xo
fn ycbcr_to_rgb(y: Int, cb: Int, cr: Int) -> (Int, Int, Int)
```

Go's color.YCbCrToRGB: 8 bit (r, g, b).

[Source: `std/image.xo:80`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L80)

### rgb_to_cmyk

```xo
fn rgb_to_cmyk(r: Int, g: Int, b: Int) -> (Int, Int, Int, Int)
```

Go's color.RGBToCMYK: 8 bit (c, m, y, k).

[Source: `std/image.xo:83`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L83)

### cmyk_to_rgb

```xo
fn cmyk_to_rgb(c: Int, m: Int, y: Int, k: Int) -> (Int, Int, Int)
```

Go's color.CMYKToRGB: 8 bit (r, g, b).

[Source: `std/image.xo:86`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L86)

### from_nrgba

```xo
fn from_nrgba(v: Int) -> Color
```

The color.Color of a 0xRRGGBBAA value that is not premultiplied (Go's
color.NRGBA.RGBA()).

[Source: `std/image.xo:90`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L90)

### web_safe

```xo
fn web_safe() -> List[Int]
```

Go's palette.WebSafe: the 216 colors with each channel one of 0, 51, 102,
153, 204, 255, red the slowest index and blue the fastest, as
`0xRRGGBBAA` (alpha 255).

[Source: `std/image.xo:102`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L102)

### plan9

```xo
fn plan9() -> List[Int]
```

Go's palette.Plan9: the 256 colors of Plan 9's default palette, as
`0xRRGGBBAA` (alpha 255), in Go's order.

[Source: `std/image.xo:106`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L106)

### from_png

```xo
fn from_png(p: png.Image) -> Image
```

The image of a decoded PNG (the pixels move, no copy): the same model, tight
rows, corner (0, 0).

[Source: `std/image.xo:136`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L136)

### from_jpeg

```xo
fn from_jpeg(j: jpeg.Image) -> Image
```

The image of a decoded JPEG (the samples move, no copy): Gray, CMYK and
RGBA keep their layout, YCbCr keeps its planes and chroma subsampling.

[Source: `std/image.xo:145`](https://github.com/xo-lang/xo/blob/main/std/image.xo#L145)
