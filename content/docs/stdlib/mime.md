---
title: "std/mime"
linkTitle: "mime"
description: "Go's mime: media types (RFC 2045, 2231), the extension table (Go's builtin one only, the same on ..."
toc: true
module: "std/mime"
source: "https://github.com/xo-lang/xo/blob/main/std/mime.xo"
generated: "scripts/sync-content.py from `xo doc std/mime`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`MediaType`](#MediaType)
- type [`MimeErr`](#MimeErr)
  - method [`MimeErr.display`](#MimeErr.display)
- fn [`parse_media_type`](#parse_media_type)
- fn [`format_media_type`](#format_media_type)
- fn [`type_by_extension`](#type_by_extension)
- fn [`extensions_by_type`](#extensions_by_type)
- fn [`detect_content_type`](#detect_content_type)

## Types

### MediaType {#MediaType}

```xo
struct MediaType {
  kind: Str
  params: Map[Str, Str]
}
```

A media type: the type and subtype in lower case ("text/html") and its
parameters, names in lower case.

[Source: `std/mime.xo:8`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L8)

### MimeErr {#MimeErr}

```xo
struct MimeErr {
  msg: Str
}
```

Go's error texts: `mime: no media type`, `mime: invalid media parameter`, ...

[Source: `std/mime.xo:14`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L14)

#### MimeErr.display {#MimeErr.display}

```xo
fn (e: MimeErr) display() -> Str
```

[Source: `std/mime.xo:18`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L18)

## Functions

### parse_media_type {#parse_media_type}

```xo
fn parse_media_type(v: Str) -> MediaType ! MimeErr
```

`text/html; charset=utf-8` into its parts (mime.ParseMediaType): RFC
2231 continuations and charsets (utf-8, us-ascii) decoded.

[Source: `std/mime.xo:22`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L22)

### format_media_type {#format_media_type}

```xo
fn format_media_type(kind: Str, params: Map[Str, Str]) -> Str
```

The text of a media type and its parameters, sorted by name, quoted or
RFC 2231 encoded as needed (mime.FormatMediaType); "" when the type or
a name is not a token.

[Source: `std/mime.xo:26`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L26)

### type_by_extension {#type_by_extension}

```xo
fn type_by_extension(ext: Str) -> Str?
```

The type of an extension (".png" -> "image/png"), from Go's builtin
table: an exact match, else without ASCII case.

[Source: `std/mime.xo:29`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L29)

### extensions_by_type {#extensions_by_type}

```xo
fn extensions_by_type(kind: Str) -> List[Str] ! MimeErr
```

The extensions of a media type, sorted (mime.ExtensionsByType).

[Source: `std/mime.xo:31`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L31)

### detect_content_type {#detect_content_type}

```xo
fn detect_content_type(data: Bytes) -> Str
```

The media type of data from its first 512 bytes (WHATWG MIME Sniffing,
net/http's DetectContentType); "application/octet-stream" when nothing
matches.

[Source: `std/mime.xo:35`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L35)
