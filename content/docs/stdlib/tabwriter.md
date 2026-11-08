---
title: "std/tabwriter"
linkTitle: "tabwriter"
description: "Go's text/tabwriter: elastic tabstops, columns of text terminated by tabs aligned over runs of co..."
toc: true
module: "std/tabwriter"
source: "https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo"
generated: "scripts/sync-content.py from `xo doc std/tabwriter`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`FILTER_HTML`](#filter_html)
- const [`STRIP_ESCAPE`](#strip_escape)
- const [`ALIGN_RIGHT`](#align_right)
- const [`DISCARD_EMPTY_COLUMNS`](#discard_empty_columns)
- const [`TAB_INDENT`](#tab_indent)
- const [`DEBUG`](#debug)
- const [`ESCAPE`](#escape)
- type [`TabWriter`](#tabwriter)
  - method [`TabWriter.write`](#tabwriterwrite)
  - method [`TabWriter.flush`](#tabwriterflush)
- fn [`writer`](#writer)

## Constants

### FILTER_HTML

```xo
const FILTER_HTML: Int = 1
```

Flags (Go's FilterHTML, StripEscape, AlignRight, DiscardEmptyColumns,
TabIndent, Debug), added together.

[Source: `std/tabwriter.xo:8`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L8)

### STRIP_ESCAPE

```xo
const STRIP_ESCAPE: Int = 2
```

[Source: `std/tabwriter.xo:9`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L9)

### ALIGN_RIGHT

```xo
const ALIGN_RIGHT: Int = 4
```

[Source: `std/tabwriter.xo:10`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L10)

### DISCARD_EMPTY_COLUMNS

```xo
const DISCARD_EMPTY_COLUMNS: Int = 8
```

[Source: `std/tabwriter.xo:11`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L11)

### TAB_INDENT

```xo
const TAB_INDENT: Int = 16
```

[Source: `std/tabwriter.xo:12`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L12)

### DEBUG

```xo
const DEBUG: Int = 32
```

[Source: `std/tabwriter.xo:13`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L13)

### ESCAPE

```xo
const ESCAPE: Int = 255
```

The byte that starts and ends an escaped text (Go's Escape): its
bytes pass through as one piece of the cell, tabs and all.

[Source: `std/tabwriter.xo:17`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L17)

## Types

### TabWriter

```xo
struct TabWriter {}
```

A tab writer: text written to it is split into cells at its tabs
(`\t`, or `\v`; a line ends at `\n` or `\f`), and `flush` returns the
text with every column padded to the widest cell of its block of
lines, as Go's tabwriter.Writer does. `write` takes bytes in any
pieces; the output it has formatted so far is held until `flush`
returns it (Go writes it to the io.Writer as lines complete).
@move_only

[Source: `std/tabwriter.xo:26`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L26)

#### TabWriter.write

```xo
fn (var w: TabWriter) write(data: Bytes)
```

[Source: `std/tabwriter.xo:35`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L35)

#### TabWriter.flush

```xo
fn (var w: TabWriter) flush() -> Bytes
```

The formatted output since the last flush; the writer is empty again.

[Source: `std/tabwriter.xo:37`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L37)

## Functions

### writer

```xo
fn writer(min_width: Int, tab_width: Int, padding: Int, pad_char: Int = 32, flags: Int = 0) -> TabWriter
```

Go's NewWriter(output, minwidth, tabwidth, padding, padchar, flags):
`min_width` is the minimal cell width including padding, `tab_width`
the width of a tab (when `pad_char` is a tab), `padding` the cell
padding added to the text's width, `pad_char` the byte padded with
(a space by default, 9 for tabs), and `flags` the flags added
together. A negative number faults.

[Source: `std/tabwriter.xo:34`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L34)
