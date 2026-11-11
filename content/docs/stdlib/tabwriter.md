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

- const [`FILTER_HTML`](#FILTER_HTML)
- const [`STRIP_ESCAPE`](#STRIP_ESCAPE)
- const [`ALIGN_RIGHT`](#ALIGN_RIGHT)
- const [`DISCARD_EMPTY_COLUMNS`](#DISCARD_EMPTY_COLUMNS)
- const [`TAB_INDENT`](#TAB_INDENT)
- const [`DEBUG`](#DEBUG)
- const [`ESCAPE`](#ESCAPE)
- type [`TabWriter`](#TabWriter)
  - method [`TabWriter.write`](#TabWriter.write)
  - method [`TabWriter.flush`](#TabWriter.flush)
  - method [`TabWriter.reset`](#TabWriter.reset)
  - method [`TabWriter.write_padding`](#TabWriter.write_padding)
  - method [`TabWriter.write_buf`](#TabWriter.write_buf)
  - method [`TabWriter.write_lines`](#TabWriter.write_lines)
  - method [`TabWriter.format`](#TabWriter.format)
  - method [`TabWriter.append`](#TabWriter.append)
  - method [`TabWriter.rune_len`](#TabWriter.rune_len)
  - method [`TabWriter.update_width`](#TabWriter.update_width)
  - method [`TabWriter.start_escape`](#TabWriter.start_escape)
  - method [`TabWriter.end_escape`](#TabWriter.end_escape)
  - method [`TabWriter.terminate_cell`](#TabWriter.terminate_cell)
  - method [`TabWriter.flush_no_defers`](#TabWriter.flush_no_defers)
- type [`Cell`](#Cell)
- fn [`writer`](#writer)

## Constants

### FILTER_HTML {#FILTER_HTML}

```xo
pub const FILTER_HTML: Int = 1
```

Flags (Go's FilterHTML, StripEscape, AlignRight, DiscardEmptyColumns,
TabIndent, Debug), added together.

[Source: `std/tabwriter.xo:15`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L15)

### STRIP_ESCAPE {#STRIP_ESCAPE}

```xo
pub const STRIP_ESCAPE: Int = 2
```

[Source: `std/tabwriter.xo:17`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L17)

### ALIGN_RIGHT {#ALIGN_RIGHT}

```xo
pub const ALIGN_RIGHT: Int = 4
```

[Source: `std/tabwriter.xo:19`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L19)

### DISCARD_EMPTY_COLUMNS {#DISCARD_EMPTY_COLUMNS}

```xo
pub const DISCARD_EMPTY_COLUMNS: Int = 8
```

[Source: `std/tabwriter.xo:21`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L21)

### TAB_INDENT {#TAB_INDENT}

```xo
pub const TAB_INDENT: Int = 16
```

[Source: `std/tabwriter.xo:23`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L23)

### DEBUG {#DEBUG}

```xo
pub const DEBUG: Int = 32
```

[Source: `std/tabwriter.xo:25`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L25)

### ESCAPE {#ESCAPE}

```xo
pub const ESCAPE: Int = 255
```

The byte that starts and ends an escaped text (Go's Escape): its
bytes pass through as one piece of the cell, tabs and all.

[Source: `std/tabwriter.xo:29`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L29)

## Types

### TabWriter {#TabWriter}

```xo
pub struct TabWriter {
  minwidth: Int
  tabwidth: Int
  padding: Int
  padbyte: Int
  flags: Int
  buf: List[UInt8]
  pos: Int
  cell: Cell
  end_char: Int
  lines: List[List[Cell]]
  widths: List[Int]
  out: BytesBuilder
}
```

A tab writer: text written to it is split into cells at its tabs
(`\t`, or `\v`; a line ends at `\n` or `\f`), and `flush` returns the
text with every column padded to the widest cell of its block of
lines, as Go's tabwriter.Writer does. `write` takes bytes in any
pieces; the output it has formatted so far is held until `flush`
returns it (Go writes it to the io.Writer as lines complete).
@move_only

[Source: `std/tabwriter.xo:38`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L38)

#### TabWriter.write {#TabWriter.write}

```xo
pub fn (var w: TabWriter) write(data: Bytes)
```

[Source: `std/tabwriter.xo:77`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L77)

#### TabWriter.flush {#TabWriter.flush}

```xo
pub fn (var w: TabWriter) flush() -> Bytes
```

The formatted output since the last flush; the writer is empty again.

[Source: `std/tabwriter.xo:136`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L136)

#### TabWriter.reset {#TabWriter.reset}

```xo
fn (var w: TabWriter) reset()
```

[Source: `std/tabwriter.xo:151`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L151)

#### TabWriter.write_padding {#TabWriter.write_padding}

```xo
fn (var w: TabWriter) write_padding(textw: Int, cellw0: Int, use_tabs: Bool)
```

[Source: `std/tabwriter.xo:160`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L160)

#### TabWriter.write_buf {#TabWriter.write_buf}

```xo
fn (var w: TabWriter) write_buf(pos: Int, n: Int)
```

The bytes buf[pos..pos + n] to the output.

[Source: `std/tabwriter.xo:180`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L180)

#### TabWriter.write_lines {#TabWriter.write_lines}

```xo
fn (var w: TabWriter) write_lines(pos0: Int, line0: Int, line1: Int) -> Int
```

[Source: `std/tabwriter.xo:186`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L186)

#### TabWriter.format {#TabWriter.format}

```xo
fn (var w: TabWriter) format(pos0: Int, line0_in: Int, line1: Int) -> Int
```

Formats lines line0..line1 (a block of consecutive lines with the
columns before the current one fixed) and returns the buffer position
after them (Go's format).

[Source: `std/tabwriter.xo:233`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L233)

#### TabWriter.append {#TabWriter.append}

```xo
fn (var w: TabWriter) append(data: Bytes, from: Int, to: Int)
```

[Source: `std/tabwriter.xo:282`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L282)

#### TabWriter.rune_len {#TabWriter.rune_len}

```xo
fn (w: TabWriter) rune_len(i: Int, end: Int) -> Int
```

The width in bytes of the rune at buf[i], or 1 for an invalid byte
(utf8.DecodeRune).

[Source: `std/tabwriter.xo:291`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L291)

#### TabWriter.update_width {#TabWriter.update_width}

```xo
fn (var w: TabWriter) update_width()
```

Adds the runes of the text since the last update to the incomplete
cell's width.

[Source: `std/tabwriter.xo:338`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L338)

#### TabWriter.start_escape {#TabWriter.start_escape}

```xo
fn (var w: TabWriter) start_escape(ch: Int)
```

[Source: `std/tabwriter.xo:354`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L354)

#### TabWriter.end_escape {#TabWriter.end_escape}

```xo
fn (var w: TabWriter) end_escape()
```

[Source: `std/tabwriter.xo:364`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L364)

#### TabWriter.terminate_cell {#TabWriter.terminate_cell}

```xo
fn (var w: TabWriter) terminate_cell(htab: Bool) -> Int
```

Ends the current cell and returns the number of cells of its line.

[Source: `std/tabwriter.xo:380`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L380)

#### TabWriter.flush_no_defers {#TabWriter.flush_no_defers}

```xo
fn (var w: TabWriter) flush_no_defers()
```

[Source: `std/tabwriter.xo:388`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L388)

### Cell {#Cell}

```xo
struct Cell {
  size: Int
  width: Int
  htab: Bool
}
```

Go's cell: its size in bytes, its width in runes, and whether a tab
ended it.

[Source: `std/tabwriter.xo:145`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L145)

## Functions

### writer {#writer}

```xo
pub fn writer(min_width: Int, tab_width: Int, padding: Int, pad_char: Int = 32, flags: Int = 0) -> TabWriter
```

Go's NewWriter(output, minwidth, tabwidth, padding, padchar, flags):
`min_width` is the minimal cell width including padding, `tab_width`
the width of a tab (when `pad_char` is a tab), `padding` the cell
padding added to the text's width, `pad_char` the byte padded with
(a space by default, 9 for tabs), and `flags` the flags added
together. A negative number faults.

[Source: `std/tabwriter.xo:63`](https://github.com/xo-lang/xo/blob/main/std/tabwriter.xo#L63)
