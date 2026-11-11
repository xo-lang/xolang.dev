---
title: "std/xmlcodec"
linkTitle: "xmlcodec"
description: "The helpers the code `derive Xml` generates calls: it builds a struct's element tree from pieces ..."
toc: true
module: "std/xmlcodec"
source: "https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo"
generated: "scripts/sync-content.py from `xo doc std/xmlcodec`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Piece`](#Piece)
- type [`Writer`](#Writer)
- type [`Event`](#Event)
- fn [`open_path`](#open_path)
- fn [`leaf`](#leaf)
- fn [`child`](#child)
- fn [`chardata`](#chardata)
- fn [`comment`](#comment)
- fn [`attr`](#attr)
- fn [`build`](#build)
- fn [`writer`](#writer)
- fn [`write_start`](#write_start)
- fn [`write_open`](#write_open)
- fn [`write_leaf`](#write_leaf)
- fn [`write_chardata`](#write_chardata)
- fn [`write_end`](#write_end)
- fn [`written`](#written)
- fn [`parse_root`](#parse_root)
- fn [`attr_of`](#attr_of)
- fn [`events`](#events)
- fn [`direct_text`](#direct_text)
- fn [`float_text`](#float_text)
- fn [`int_of`](#int_of)
- fn [`float_of`](#float_of)
- fn [`bool_of`](#bool_of)

## Types

### Piece {#Piece}

```xo
struct Piece {
  parents: List[Str]
  kind: Int
  name: Str = ""
  text: Str = ""
  el: xml.Element? = None
}
```

One part of a struct's element: its `parents` path (the `a>b` of a
field's name, empty for none), and what to write there.

[Source: `std/xmlcodec.xo:12`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L12)

### Writer {#Writer}

```xo
struct Writer {
  out: StrBuilder
  indent: Str
  depth: Int = 0
  indented_in: Bool = false
  put_newline: Bool = false
  names: List[Str] = []
  bases: List[Int] = []
}
```

The text of elements written in order, as Element.encode writes the
tree build makes of the same pieces (Go's printer and its parent
stack), with no tree: `write_start` an element, then its fields'
`write_open`, `write_leaf` and `write_chardata` and nested starts, then
`write_end` it. Names and attributes have no namespace.

[Source: `std/xmlcodec.xo:44`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L44)

### Event {#Event}

```xo
struct Event {
  field: Int
  el: xml.Element
}
```

An element of a field's path (an index of `paths`), found in document
order.

[Source: `std/xmlcodec.xo:80`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L80)

## Functions

### open_path {#open_path}

```xo
fn open_path(parents: List[Str]) -> Piece
```

Opens the path a field's parents name (Go pushes them even for an
empty list).

[Source: `std/xmlcodec.xo:24`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L24)

### leaf {#leaf}

```xo
fn leaf(parents: List[Str], name: Str, text: Str) -> Piece
```

A child element `name` holding the text.

[Source: `std/xmlcodec.xo:26`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L26)

### child {#child}

```xo
fn child(parents: List[Str], name: Str, el: xml.Element) -> Piece
```

A child element: the tree of a nested struct, named `name`.

[Source: `std/xmlcodec.xo:28`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L28)

### chardata {#chardata}

```xo
fn chardata(text: Str) -> Piece
```

Character data inside the open element.

[Source: `std/xmlcodec.xo:30`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L30)

### comment {#comment}

```xo
fn comment(text: Str) -> Piece
```

A comment inside the open element.

[Source: `std/xmlcodec.xo:32`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L32)

### attr {#attr}

```xo
fn attr(name: Str, value: Str) -> xml.Attr
```

An attribute.

[Source: `std/xmlcodec.xo:34`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L34)

### build {#build}

```xo
fn build(name: Str, attrs: List[xml.Attr], pieces: List[Piece]) -> xml.Element
```

The element `name` with the attributes and, in order, the pieces
(Go's printer: parents shared with the previous field stay open).

[Source: `std/xmlcodec.xo:37`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L37)

### writer {#writer}

```xo
fn writer(indent: Str) -> Writer
```

A writer that indents by `indent` (none when empty).

[Source: `std/xmlcodec.xo:57`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L57)

### write_start {#write_start}

```xo
fn write_start(var w: Writer, name: Str, attrs: List[xml.Attr])
```

Starts element `name` with the attributes (an empty local name is
left out).

[Source: `std/xmlcodec.xo:60`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L60)

### write_open {#write_open}

```xo
fn write_open(var w: Writer, parents: List[Str])
```

Opens the path `parents` in the started element (open_path's piece):
the parents the previous field opened stay open as far as they match.

[Source: `std/xmlcodec.xo:63`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L63)

### write_leaf {#write_leaf}

```xo
fn write_leaf(var w: Writer, parents: List[Str], name: Str, text: Str)
```

The element `name` holding the text under `parents` (leaf's piece).

[Source: `std/xmlcodec.xo:65`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L65)

### write_chardata {#write_chardata}

```xo
fn write_chardata(var w: Writer, text: Str)
```

Character data where the writer is (chardata's piece).

[Source: `std/xmlcodec.xo:67`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L67)

### write_end {#write_end}

```xo
fn write_end(var w: Writer, name: Str)
```

Closes the open parents and the element `name` write_start began.

[Source: `std/xmlcodec.xo:69`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L69)

### written {#written}

```xo
fn written(var w: Writer) -> Str
```

The text written.

[Source: `std/xmlcodec.xo:71`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L71)

### parse_root {#parse_root}

```xo
fn parse_root(text: Str) -> xml.Element ! xml.XmlErr
```

The root element of text, as Go's Unmarshal finds it: a text with no
element is `EOF`.

[Source: `std/xmlcodec.xo:75`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L75)

### attr_of {#attr_of}

```xo
fn attr_of(e: xml.Element, name: Str) -> Str?
```

The value of the attribute of that local name.

[Source: `std/xmlcodec.xo:77`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L77)

### events {#events}

```xo
fn events(e: xml.Element, paths: List[List[Str]]) -> List[Event]
```

The elements below e whose path from e is one of `paths`, in document
order, with the index of the path.

[Source: `std/xmlcodec.xo:87`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L87)

### direct_text {#direct_text}

```xo
fn direct_text(e: xml.Element) -> Str
```

The character data directly inside e, in order (Go's chardata).

[Source: `std/xmlcodec.xo:89`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L89)

### float_text {#float_text}

```xo
fn float_text(f: Float) -> Str
```

Go's FormatFloat(f, 'g', -1, 64): Xo's text of a Float without the
".0" an integral value gets.

[Source: `std/xmlcodec.xo:93`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L93)

### int_of {#int_of}

```xo
fn int_of(s: Str) -> Int ! xml.XmlErr
```

Go's strconv.ParseInt of the text with spaces trimmed (0 when empty):
`strconv.ParseInt: parsing "x": invalid syntax` or `value out of range`.

[Source: `std/xmlcodec.xo:97`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L97)

### float_of {#float_of}

```xo
fn float_of(s: Str) -> Float ! xml.XmlErr
```

Go's strconv.ParseFloat of the text with spaces trimmed (0 when
empty): `strconv.ParseFloat: parsing "x": invalid syntax` or `value
out of range`.

[Source: `std/xmlcodec.xo:101`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L101)

### bool_of {#bool_of}

```xo
fn bool_of(s: Str) -> Bool ! xml.XmlErr
```

Go's strconv.ParseBool (false when empty).

[Source: `std/xmlcodec.xo:103`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L103)
