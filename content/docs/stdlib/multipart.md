---
title: "std/multipart"
linkTitle: "multipart"
description: "Go's mime/multipart in memory: the body is a request's, already capped by the server."
toc: true
module: "std/multipart"
source: "https://github.com/xo-lang/xo/blob/main/std/multipart.xo"
generated: "scripts/sync-content.py from `xo doc std/multipart`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Part`](#part)
- type [`Form`](#form)
- type [`MultipartErr`](#multiparterr)
  - method [`MultipartErr.display`](#multiparterrdisplay)
- fn [`parse`](#parse)
- fn [`parse_form`](#parse_form)
- fn [`write`](#write)
- fn [`form_data_content_type`](#form_data_content_type)
- fn [`random_boundary`](#random_boundary)

## Types

### Part

```xo
struct Part {
  name: Str
  filename: Str?
  headers: Map[Str, Str]
  data: Bytes
}
```

One part. `name` is the form field (Content-Disposition `form-data`'s
`name`, else ""); `filename` its file name, the last path element as
Go's FileName; `headers` the first value of each header, keys in
canonical form (Content-Type).

[Source: `std/multipart.xo:11`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L11)

### Form

```xo
struct Form {
  values: url.Values
  files: Map[Str, List[Part]]
}
```

A form: the fields without a file name, and the file parts by field.

[Source: `std/multipart.xo:19`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L19)

### MultipartErr

```xo
struct MultipartErr {
  msg: Str
}
```

Go's error texts: `multipart: NextPart: EOF`, `multipart: message too
large`, `unexpected EOF`, `malformed MIME header line: ...`.

[Source: `std/multipart.xo:26`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L26)

#### MultipartErr.display

```xo
fn (e: MultipartErr) display() -> Str
```

[Source: `std/multipart.xo:30`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L30)

## Functions

### parse

```xo
fn parse(body: Bytes, boundary: Str) -> List[Part] ! MultipartErr
```

Every part (Reader.NextPart, each part read whole; a
quoted-printable part decoded).

[Source: `std/multipart.xo:34`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L34)

### parse_form

```xo
fn parse_form(body: Bytes, boundary: Str, max_parts: Int = 1000) -> Form ! MultipartErr
```

Reader.ReadForm with Go's limits (the 32 MB of http's
ParseMultipartForm, `max_parts`, 10,000 headers).

[Source: `std/multipart.xo:37`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L37)

### write

```xo
fn write(parts: List[Part], boundary: Str) -> Bytes
```

A body of the parts (Writer): each part's headers sorted, a
Content-Disposition from `name` and `filename` when the part has none.

[Source: `std/multipart.xo:40`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L40)

### form_data_content_type

```xo
fn form_data_content_type(boundary: Str) -> Str
```

`multipart/form-data; boundary=...` (Writer.FormDataContentType).

[Source: `std/multipart.xo:42`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L42)

### random_boundary

```xo
fn random_boundary(r: Rand) -> Str uses rand
```

60 hex digits from 30 random bytes (Writer's boundary).

[Source: `std/multipart.xo:44`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L44)
