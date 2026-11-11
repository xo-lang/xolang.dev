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

- const [`UPPER_HEX`](#UPPER_HEX)
- const [`TOKEN_CHARS`](#TOKEN_CHARS)
- const [`OWN_MIN`](#OWN_MIN)
- const [`BUILTIN`](#BUILTIN)
- const [`SIGS`](#SIGS)
- const [`SIG_DATA`](#SIG_DATA)
- const [`SIG_TYPES`](#SIG_TYPES)
- type [`MediaType`](#MediaType)
- type [`MimeErr`](#MimeErr)
  - method [`MimeErr.display`](#MimeErr.display)
- type [`Sig`](#Sig)
- fn [`parse_media_type`](#parse_media_type)
- fn [`format_media_type`](#format_media_type)
- fn [`type_by_extension`](#type_by_extension)
- fn [`extensions_by_type`](#extensions_by_type)
- fn [`detect_content_type`](#detect_content_type)
- fn [`err`](#err)
- fn [`is_tspecial`](#is_tspecial)
- fn [`is_token_char`](#is_token_char)
- fn [`token_case`](#token_case)
- fn [`write_cased`](#write_cased)
- fn [`is_token`](#is_token)
- fn [`value_class`](#value_class)
- fn [`consume_token`](#consume_token)
- fn [`check_media_type_disposition`](#check_media_type_disposition)
- fn [`consume_value`](#consume_value)
- fn [`consume_media_param`](#consume_media_param)
- fn [`is_hex`](#is_hex)
- fn [`unhex`](#unhex)
- fn [`percent_hex_unescape`](#percent_hex_unescape)
- fn [`decode_2231`](#decode_2231)
- fn [`own`](#own)
- fn [`builtin_type`](#builtin_type)
- fn [`sigs_of`](#sigs_of)
- fn [`is_ws`](#is_ws)
- fn [`has_prefix`](#has_prefix)
- fn [`sig_hit`](#sig_hit)
- fn [`sig_type`](#sig_type)

## Constants

### UPPER_HEX {#UPPER_HEX}

```xo
const UPPER_HEX: Str = "0123456789ABCDEF"
```

[Source: `std/mime.xo:257`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L257)

### TOKEN_CHARS {#TOKEN_CHARS}

```xo
const TOKEN_CHARS: Bytes = b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x01\x00\x01\x01\x01\x01\x01\x00\x00\x01\x01\x00\x01\x01\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
```

grammar.go isTokenChar: a US-ASCII character but space, controls, and tspecials.
One for each token character (the table of is_token_char).

[Source: `std/mime.xo:267`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L267)

### OWN_MIN {#OWN_MIN}

```xo
const OWN_MIN = 4096
```

A media type longer than this has its tokens copied (Str.clone). The rule
depends on the value being a small object of its own: the server's header
values are copies (http1 text_of, text_at), never slices of the read buffer.

[Source: `std/mime.xo:465`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L465)

### BUILTIN {#BUILTIN}

```xo
const BUILTIN: List[(Str, Str)] = [
  (".ai", "application/postscript"),
  (".apk", "application/vnd.android.package-archive"),
  (".apng", "image/apng"),
  (".avif", "image/avif"),
  (".bin", "application/octet-stream"),
  (".bmp", "image/bmp"),
  (".com", "application/octet-stream"),
  (".css", "text/css; charset=utf-8"),
  (".csv", "text/csv; charset=utf-8"),
  (".doc", "application/msword"),
  (".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
  (".ehtml", "text/html; charset=utf-8"),
  (".eml", "message/rfc822"),
  (".eps", "application/postscript"),
  (".exe", "application/octet-stream"),
  (".flac", "audio/flac"),
  (".gif", "image/gif"),
  (".gz", "application/gzip"),
  (".htm", "text/html; charset=utf-8"),
  (".html", "text/html; charset=utf-8"),
  (".ico", "image/vnd.microsoft.icon"),
  (".ics", "text/calendar; charset=utf-8"),
  (".jfif", "image/jpeg"),
  (".jpeg", "image/jpeg"),
  (".jpg", "image/jpeg"),
  (".js", "text/javascript; charset=utf-8"),
  (".json", "application/json"),
  (".m4a", "audio/mp4"),
  (".mjs", "text/javascript; charset=utf-8"),
  (".mp3", "audio/mpeg"),
  (".mp4", "video/mp4"),
  (".oga", "audio/ogg"),
  (".ogg", "audio/ogg"),
  (".ogv", "video/ogg"),
  (".opus", "audio/ogg"),
  (".pdf", "application/pdf"),
  (".pjp", "image/jpeg"),
  (".pjpeg", "image/jpeg"),
  (".png", "image/png"),
  (".ppt", "application/vnd.ms-powerpoint"),
  (".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"),
  (".ps", "application/postscript"),
  (".rdf", "application/rdf+xml"),
  (".rtf", "application/rtf"),
  (".shtml", "text/html; charset=utf-8"),
  (".svg", "image/svg+xml"),
  (".text", "text/plain; charset=utf-8"),
  (".tif", "image/tiff"),
  (".tiff", "image/tiff"),
  (".txt", "text/plain; charset=utf-8"),
  (".vtt", "text/vtt; charset=utf-8"),
  (".wasm", "application/wasm"),
  (".wav", "audio/wav"),
  (".webm", "audio/webm"),
  (".webp", "image/webp"),
  (".xbl", "text/xml; charset=utf-8"),
  (".xbm", "image/x-xbitmap"),
  (".xht", "application/xhtml+xml"),
  (".xhtml", "application/xhtml+xml"),
  (".xls", "application/vnd.ms-excel"),
  (".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
  (".xml", "text/xml; charset=utf-8"),
  (".xsl", "text/xml; charset=utf-8"),
  (".zip", "application/zip"),
]
```

Go's builtinTypesLower (type.go).

[Source: `std/mime.xo:470`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L470)

### SIGS {#SIGS}

```xo
const SIGS: List[Sig] = sigs_of(SIG_DATA)
```

sniff.go's sniffSignatures in order, made once (sigs() built the list,
and each HTML pattern's Bytes, on every call: 2026-10-26, with the
slices below, detect_content_type ran at 8.3x Go's time), decoded from
SIG_DATA (as 51 enum literals the list was 6 KB of a wasm module's code).

[Source: `std/mime.xo:622`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L622)

### SIG_DATA {#SIG_DATA}

```xo
const SIG_DATA: Bytes = b"\x00\x0E<!DOCTYPE HTML\x00\x05<HTML\x00\x05<HEAD\x00\x07<SCRIPT\x00\x07<IFRAME\x00\x03<H1\x00\x04<DIV\x00\x05<FONT\x00\x06<TABLE\x00\x02<A\x00\x06<STYLE\x00\x06<TITLE\x00\x02<B\x00\x05<BODY\x00\x03<BR\x00\x02<P\x00\x04<!--\x02\x05\xFF\xFF\xFF\xFF\xFF<?xml\x00\x03\x05%PDF-\x01\x03\x0B%!PS-Adobe-\x02\x01\x04\xFF\xFF\x00\x00\xFE\xFF\x00\x00\x03\x01\x04\xFF\xFF\x00\x00\xFF\xFE\x00\x00\x04\x01\x04\xFF\xFF\xFF\x00\xEF\xBB\xBF\x00\x05\x03\x04\x00\x00\x01\x00\x06\x03\x04\x00\x00\x02\x00\x06\x03\x02BM\x07\x03\x06GIF87a\x08\x03\x06GIF89a\x08\x01\x0E\xFF\xFF\xFF\xFF\x00\x00\x00\x00\xFF\xFF\xFF\xFF\xFF\xFFRIFF\x00\x00\x00\x00WEBPVP\x09\x03\x08\x89PNG\x0D\x0A\x1A\x0A\x0A\x03\x03\xFF\xD8\xFF\x0B\x01\x0C\xFF\xFF\xFF\xFF\x00\x00\x00\x00\xFF\xFF\xFF\xFFFORM\x00\x00\x00\x00AIFF\x0C\x01\x03\xFF\xFF\xFFID3\x0D\x01\x05\xFF\xFF\xFF\xFF\xFFOggS\x00\x0E\x01\x08\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFFMThd\x00\x00\x00\x06\x0F\x01\x0C\xFF\xFF\xFF\xFF\x00\x00\x00\x00\xFF\xFF\xFF\xFFRIFF\x00\x00\x00\x00AVI \x10\x01\x0C\xFF\xFF\xFF\xFF\x00\x00\x00\x00\xFF\xFF\xFF\xFFRIFF\x00\x00\x00\x00WAVE\x11\x04\x03\x04\x1AE\xDF\xA3\x12\x01\x24\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xFF\xFF\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00LP\x13\x03\x04\x00\x01\x00\x00\x14\x03\x04OTTO\x15\x03\x04ttcf\x16\x03\x04wOFF\x17\x03\x04wOF2\x18\x03\x03\x1F\x8B\x08\x19\x03\x04PK\x03\x04\x1A\x03\x07Rar!\x1A\x07\x00\x1B\x03\x08Rar!\x1A\x07\x01\x00\x1B\x03\x04\x00asm\x1C\x05"
```

The signatures' records in sniff.go's order: a kind byte (0 Html,
1 Masked, 2 Masked after leading white space, 3 Exact, 4 Mp4, 5 Text);
for Html a length and the pattern; for Masked a length, the mask and the
pattern (each that long) and the index of the content type in
SIG_TYPES; for Exact a length, the signature and the type's index.

[Source: `std/mime.xo:629`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L629)

### SIG_TYPES {#SIG_TYPES}

```xo
const SIG_TYPES: List[Str] = "text/xml; charset=utf-8\napplication/pdf\napplication/postscript\ntext/plain; charset=utf-16be\ntext/plain; charset=utf-16le\ntext/plain; charset=utf-8\nimage/x-icon\nimage/bmp\nimage/gif\nimage/webp\nimage/png\nimage/jpeg\naudio/aiff\naudio/mpeg\napplication/ogg\naudio/midi\nvideo/avi\naudio/wave\nvideo/webm\napplication/vnd.ms-fontobject\nfont/ttf\nfont/otf\nfont/collection\nfont/woff\nfont/woff2\napplication/x-gzip\napplication/zip\napplication/x-rar-compressed\napplication/wasm".split("\n")
```

The content types SIG_DATA's records name, by index (one literal: as
a list literal, 29 elements were built one by one).

[Source: `std/mime.xo:633`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L633)

## Types

### MediaType {#MediaType}

```xo
pub struct MediaType {
  pub kind: Str
  pub params: Map[Str, Str]
}
```

A media type: the type and subtype in lower case ("text/html") and its
parameters, names in lower case.

[Source: `std/mime.xo:16`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L16)

### MimeErr {#MimeErr}

```xo
pub struct MimeErr {
  pub msg: Str
}
```

Go's error texts: `mime: no media type`, `mime: invalid media parameter`, ...

[Source: `std/mime.xo:22`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L22)

#### MimeErr.display {#MimeErr.display}

```xo
pub fn (e: MimeErr) display() -> Str
```

[Source: `std/mime.xo:26`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L26)

### Sig {#Sig}

```xo
enum Sig {
  Html(p: Bytes)
  Masked(mask: Bytes, pat: Bytes, skip_ws: Bool, ct: Str)
  Exact(sig: Bytes, ct: Str)
  Mp4
  Text
}
```

[Source: `std/mime.xo:610`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L610)

## Functions

### parse_media_type {#parse_media_type}

```xo
pub fn parse_media_type(v: Str) -> MediaType ! MimeErr
```

`text/html; charset=utf-8` into its parts (mime.ParseMediaType): RFC
2231 continuations and charsets (utf-8, us-ascii) decoded.

[Source: `std/mime.xo:30`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L30)

### format_media_type {#format_media_type}

```xo
pub fn format_media_type(kind: Str, params: Map[Str, Str]) -> Str
```

The text of a media type and its parameters, sorted by name, quoted or
RFC 2231 encoded as needed (mime.FormatMediaType); "" when the type or
a name is not a token.

[Source: `std/mime.xo:124`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L124)

### type_by_extension {#type_by_extension}

```xo
pub fn type_by_extension(ext: Str) -> Str?
```

The type of an extension (".png" -> "image/png"), from Go's builtin
table: an exact match, else without ASCII case.

[Source: `std/mime.xo:207`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L207)

### extensions_by_type {#extensions_by_type}

```xo
pub fn extensions_by_type(kind: Str) -> List[Str] ! MimeErr
```

The extensions of a media type, sorted (mime.ExtensionsByType).

[Source: `std/mime.xo:227`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L227)

### detect_content_type {#detect_content_type}

```xo
pub fn detect_content_type(data: Bytes) -> Str
```

The media type of data from its first 512 bytes (WHATWG MIME Sniffing,
net/http's DetectContentType); "application/octet-stream" when nothing
matches.

[Source: `std/mime.xo:241`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L241)

### err {#err}

```xo
fn err(msg: Str) -> MimeErr
```

[Source: `std/mime.xo:255`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L255)

### is_tspecial {#is_tspecial}

```xo
fn is_tspecial(c: UInt8) -> Bool
```

grammar.go isTSpecial: ( ) \< > @ , ; : \ " / [ ] ? =

[Source: `std/mime.xo:260`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L260)

### is_token_char {#is_token_char}

```xo
fn is_token_char(c: UInt8) -> Bool
```

[Source: `std/mime.xo:269`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L269)

### token_case {#token_case}

```xo
fn token_case(s: Str) -> Int
```

-1 when s is not a token, else 1 when it has an upper case letter and 0
when not: is_token and the lower case test in one pass.

[Source: `std/mime.xo:276`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L276)

### write_cased {#write_cased}

```xo
fn write_cased(var b: StrBuilder, s: Str, upper: Int)
```

s (a token) in lower case, given its token_case.

[Source: `std/mime.xo:293`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L293)

### is_token {#is_token}

```xo
fn is_token(s: Str) -> Bool
```

[Source: `std/mime.xo:301`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L301)

### value_class {#value_class}

```xo
fn value_class(s: Str) -> Int
```

One scan of a parameter value: 2 when it needs encoding (mediatype.go needsEncoding),
else 1 when it is not a token, else 0.

[Source: `std/mime.xo:315`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L315)

### consume_token {#consume_token}

```xo
fn consume_token(v: Str) -> (Str, Str)
```

The token at the start of v and the rest (consumeToken).

[Source: `std/mime.xo:329`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L329)

### check_media_type_disposition {#check_media_type_disposition}

```xo
fn check_media_type_disposition(s: Str) -> () ! MimeErr
```

[Source: `std/mime.xo:338`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L338)

### consume_value {#consume_value}

```xo
fn consume_value(v: Str) -> (Str, Str)
```

consumeValue: a token or a quoted string; ("", v) when malformed.

[Source: `std/mime.xo:359`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L359)

### consume_media_param {#consume_media_param}

```xo
fn consume_media_param(v: Str) -> (Str, Str, Str)
```

consumeMediaParam: (name, value, rest), or ("", "", v) when v does not
start with a parameter.

[Source: `std/mime.xo:395`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L395)

### is_hex {#is_hex}

```xo
fn is_hex(c: UInt8) -> Bool
```

[Source: `std/mime.xo:418`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L418)

### unhex {#unhex}

```xo
fn unhex(c: UInt8) -> Int
```

[Source: `std/mime.xo:420`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L420)

### percent_hex_unescape {#percent_hex_unescape}

```xo
fn percent_hex_unescape(s: Str) -> Str?
```

percentHexUnescape; None for a bad escape.

[Source: `std/mime.xo:426`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L426)

### decode_2231 {#decode_2231}

```xo
fn decode_2231(v: Str) -> Str?
```

decode2231Enc: charset'language'value with utf-8 or us-ascii.

[Source: `std/mime.xo:451`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L451)

### own {#own}

```xo
fn own(s: Str, big: Bool) -> Str
```

[Source: `std/mime.xo:467`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L467)

### builtin_type {#builtin_type}

```xo
fn builtin_type(ext: Str) -> Str?
```

BUILTIN's type of ext as it is (a match: walking the list of tuples ran
type_by_extension at 5.5x Go's map lookup, 2026-10-26; generated from
BUILTIN, which extensions_by_type still walks).

[Source: `std/mime.xo:540`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L540)

### sigs_of {#sigs_of}

```xo
fn sigs_of(d: Bytes) -> List[Sig]
```

The signatures of SIG_DATA's records.

[Source: `std/mime.xo:636`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L636)

### is_ws {#is_ws}

```xo
fn is_ws(b: UInt8) -> Bool
```

[Source: `std/mime.xo:663`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L663)

### has_prefix {#has_prefix}

```xo
fn has_prefix(data: Bytes, p: Bytes) -> Bool
```

Whether data starts with p, compared in place (no slice: a view pays a
range check, a count and a drop).

[Source: `std/mime.xo:667`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L667)

### sig_hit {#sig_hit}

```xo
fn sig_hit(s: Sig, data: Bytes, first: Int) -> Bool
```

Whether data matches s (sniff.go's match); its type is sig_type's, made
only on a match (a Str result per signature released an empty Str ~40
times a call).

[Source: `std/mime.xo:682`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L682)

### sig_type {#sig_type}

```xo
fn sig_type(s: Sig) -> Str
```

[Source: `std/mime.xo:749`](https://github.com/xo-lang/xo/blob/main/std/mime.xo#L749)
