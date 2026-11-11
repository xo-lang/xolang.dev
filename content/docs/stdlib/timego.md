---
title: "std/timego"
linkTitle: "timego"
description: "Pure."
toc: true
module: "std/timego"
source: "https://github.com/xo-lang/xo/blob/main/std/timego.xo"
generated: "scripts/sync-content.py from `xo doc std/timego`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`ANSIC`](#ansic)
- const [`UNIX_DATE`](#unix_date)
- const [`RUBY_DATE`](#ruby_date)
- const [`RFC822`](#rfc822)
- const [`RFC822Z`](#rfc822z)
- const [`RFC850`](#rfc850)
- const [`RFC1123`](#rfc1123)
- const [`RFC1123Z`](#rfc1123z)
- const [`RFC3339`](#rfc3339)
- const [`RFC3339_NANO`](#rfc3339_nano)
- const [`KITCHEN`](#kitchen)
- const [`STAMP`](#stamp)
- const [`STAMP_MILLI`](#stamp_milli)
- const [`STAMP_MICRO`](#stamp_micro)
- const [`STAMP_NANO`](#stamp_nano)
- const [`DATE_TIME`](#date_time)
- const [`DATE_ONLY`](#date_only)
- const [`TIME_ONLY`](#time_only)
- type [`Layout`](#layout)
  - method [`Layout.format`](#layoutformat)
  - method [`Layout.parse`](#layoutparse)
- fn [`layout`](#layout)
- fn [`format`](#format)
- fn [`parse`](#parse)
- fn [`go_text`](#go_text)

## Constants

### ANSIC

```xo
const ANSIC: Str = "Mon Jan _2 15:04:05 2006"
```

Go's layout constants (time/format.go).

[Source: `std/timego.xo:7`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L7)

### UNIX_DATE

```xo
const UNIX_DATE: Str = "Mon Jan _2 15:04:05 MST 2006"
```

[Source: `std/timego.xo:8`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L8)

### RUBY_DATE

```xo
const RUBY_DATE: Str = "Mon Jan 02 15:04:05 -0700 2006"
```

[Source: `std/timego.xo:9`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L9)

### RFC822

```xo
const RFC822: Str = "02 Jan 06 15:04 MST"
```

[Source: `std/timego.xo:10`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L10)

### RFC822Z

```xo
const RFC822Z: Str = "02 Jan 06 15:04 -0700"
```

[Source: `std/timego.xo:11`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L11)

### RFC850

```xo
const RFC850: Str = "Monday, 02-Jan-06 15:04:05 MST"
```

[Source: `std/timego.xo:12`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L12)

### RFC1123

```xo
const RFC1123: Str = "Mon, 02 Jan 2006 15:04:05 MST"
```

[Source: `std/timego.xo:13`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L13)

### RFC1123Z

```xo
const RFC1123Z: Str = "Mon, 02 Jan 2006 15:04:05 -0700"
```

[Source: `std/timego.xo:14`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L14)

### RFC3339

```xo
const RFC3339: Str = "2006-01-02T15:04:05Z07:00"
```

[Source: `std/timego.xo:15`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L15)

### RFC3339_NANO

```xo
const RFC3339_NANO: Str = "2006-01-02T15:04:05.999999999Z07:00"
```

[Source: `std/timego.xo:16`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L16)

### KITCHEN

```xo
const KITCHEN: Str = "3:04PM"
```

[Source: `std/timego.xo:17`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L17)

### STAMP

```xo
const STAMP: Str = "Jan _2 15:04:05"
```

[Source: `std/timego.xo:18`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L18)

### STAMP_MILLI

```xo
const STAMP_MILLI: Str = "Jan _2 15:04:05.000"
```

[Source: `std/timego.xo:19`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L19)

### STAMP_MICRO

```xo
const STAMP_MICRO: Str = "Jan _2 15:04:05.000000"
```

[Source: `std/timego.xo:20`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L20)

### STAMP_NANO

```xo
const STAMP_NANO: Str = "Jan _2 15:04:05.000000000"
```

[Source: `std/timego.xo:21`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L21)

### DATE_TIME

```xo
const DATE_TIME: Str = "2006-01-02 15:04:05"
```

[Source: `std/timego.xo:22`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L22)

### DATE_ONLY

```xo
const DATE_ONLY: Str = "2006-01-02"
```

[Source: `std/timego.xo:23`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L23)

### TIME_ONLY

```xo
const TIME_ONLY: Str = "15:04:05"
```

[Source: `std/timego.xo:24`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L24)

## Types

### Layout

```xo
struct Layout {
  text: Str
  kinds: List[Int]
  lits: List[Str]
  ns: List[Int]
}
```

A Go layout scanned once: its literal text and reference elements. Hot code makes one and calls `format` and
`parse` on it.

[Source: `std/timego.xo:28`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L28)

#### Layout.format

```xo
fn (l: Layout) format(t: Time, z: time.Zone) -> Str
```

Go's Time.Format for the layout.

[Source: `std/timego.xo:38`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L38)

#### Layout.parse

```xo
fn (l: Layout) parse(s: Str, z: time.Zone) -> Time ! time.ParseErr
```

Go's time.ParseInLocation for the layout: `z` is the zone of a text without an offset. A time outside what a
`Time` holds (1677 to 2262) is a `ParseErr`; a civil time in a daylight saving gap or overlap is the earlier one.

[Source: `std/timego.xo:41`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L41)

## Functions

### layout

```xo
fn layout(go_layout: Str) -> Layout
```

Scans a Go layout (every string is a layout: text that is not a reference element is literal).

[Source: `std/timego.xo:36`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L36)

### format

```xo
fn format(t: Time, z: time.Zone, go_layout: Str) -> Str
```

`layout(go_layout).format(t, z)`.

[Source: `std/timego.xo:44`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L44)

### parse

```xo
fn parse(s: Str, go_layout: Str, z: time.Zone) -> Time ! time.ParseErr
```

`layout(go_layout).parse(s, z)`.

[Source: `std/timego.xo:46`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L46)

### go_text

```xo
fn go_text(e: time.ParseErr) -> Str
```

The text Go's time.Parse gives for the same failure (`parsing time "X" as "LAYOUT": cannot parse "REST" as "ELEM"`,
`parsing time "X": extra text: "REST"`, `parsing time "X": month out of range`) when `e` came from a timego parse; the
display text of `e` for any other failure (a time outside what a Time holds, an error of core time's parser).

[Source: `std/timego.xo:51`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L51)
