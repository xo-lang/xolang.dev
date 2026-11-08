---
title: "std/norm"
linkTitle: "norm"
description: "Unicode normalization of golang.org/x/text/unicode/norm: the four forms of UAX #15 (NFC, NFD, NFK..."
toc: true
module: "std/norm"
source: "https://github.com/xo-lang/xo/blob/main/std/norm.xo"
generated: "scripts/sync-content.py from `xo doc std/norm`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Form`](#form)
- fn [`unicode_version`](#unicode_version)
- fn [`normalize`](#normalize)
- fn [`is_normalized`](#is_normalized)

## Types

### Form

```xo
enum Form {
  Nfc
  Nfd
  Nfkc
  Nfkd
} derive Display
```

A normalization form.

[Source: `std/norm.xo:8`](https://github.com/xo-lang/xo/blob/main/std/norm.xo#L8)

## Functions

### unicode_version

```xo
fn unicode_version() -> Str
```

The Unicode version of the tables (`15.0.0`).

[Source: `std/norm.xo:21`](https://github.com/xo-lang/xo/blob/main/std/norm.xo#L21)

### normalize

```xo
fn normalize(s: Str, f: Form) -> Str
```

s in the form f (Form.String). ASCII text is returned as it is.

[Source: `std/norm.xo:24`](https://github.com/xo-lang/xo/blob/main/std/norm.xo#L24)

### is_normalized

```xo
fn is_normalized(s: Str, f: Form) -> Bool
```

Whether s is already in the form f (Form.IsNormalString).

[Source: `std/norm.xo:26`](https://github.com/xo-lang/xo/blob/main/std/norm.xo#L26)
