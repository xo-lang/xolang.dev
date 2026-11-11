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
- fn [`fail`](#fail)
- fn [`nm`](#nm)
- fn [`close_top`](#close_top)
- fn [`indent_by`](#indent_by)
- fn [`tag_open`](#tag_open)
- fn [`tag_close`](#tag_close)
- fn [`walk`](#walk)
- fn [`digits_only`](#digits_only)
- fn [`code_at`](#code_at)
- fn [`lower_code_at`](#lower_code_at)
- fn [`word_at_end`](#word_at_end)
- fn [`underscore_ok`](#underscore_ok)
- fn [`float_syntax`](#float_syntax)

## Types

### Piece {#Piece}

```xo
pub struct Piece {
  pub parents: List[Str]
  pub kind: Int
  pub name: Str = ""
  pub text: Str = ""
  pub el: xml.Element? = None
}
```

One part of a struct's element: its `parents` path (the `a>b` of a
field's name, empty for none), and what to write there.

[Source: `std/xmlcodec.xo:18`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L18)

### Writer {#Writer}

```xo
pub struct Writer {
  pub out: StrBuilder
  pub indent: Str
  pub depth: Int = 0
  pub indented_in: Bool = false
  pub put_newline: Bool = false
  pub names: List[Str] = []
  pub bases: List[Int] = []
}
```

The text of elements written in order, as Element.encode writes the
tree build makes of the same pieces (Go's printer and its parent
stack), with no tree: `write_start` an element, then its fields'
`write_open`, `write_leaf` and `write_chardata` and nested starts, then
`write_end` it. Names and attributes have no namespace.

[Source: `std/xmlcodec.xo:98`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L98)

### Event {#Event}

```xo
pub struct Event {
  pub field: Int
  pub el: xml.Element
}
```

An element of a field's path (an index of `paths`), found in document
order.

[Source: `std/xmlcodec.xo:183`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L183)

## Functions

### open_path {#open_path}

```xo
pub fn open_path(parents: List[Str]) -> Piece
```

Opens the path a field's parents name (Go pushes them even for an
empty list).

[Source: `std/xmlcodec.xo:30`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L30)

### leaf {#leaf}

```xo
pub fn leaf(parents: List[Str], name: Str, text: Str) -> Piece
```

A child element `name` holding the text.

[Source: `std/xmlcodec.xo:33`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L33)

### child {#child}

```xo
pub fn child(parents: List[Str], name: Str, el: xml.Element) -> Piece
```

A child element: the tree of a nested struct, named `name`.

[Source: `std/xmlcodec.xo:38`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L38)

### chardata {#chardata}

```xo
pub fn chardata(text: Str) -> Piece
```

Character data inside the open element.

[Source: `std/xmlcodec.xo:43`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L43)

### comment {#comment}

```xo
pub fn comment(text: Str) -> Piece
```

A comment inside the open element.

[Source: `std/xmlcodec.xo:46`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L46)

### attr {#attr}

```xo
pub fn attr(name: Str, value: Str) -> xml.Attr
```

An attribute.

[Source: `std/xmlcodec.xo:49`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L49)

### build {#build}

```xo
pub fn build(name: Str, attrs: List[xml.Attr], pieces: List[Piece]) -> xml.Element
```

The element `name` with the attributes and, in order, the pieces
(Go's printer: parents shared with the previous field stay open).

[Source: `std/xmlcodec.xo:53`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L53)

### writer {#writer}

```xo
pub fn writer(indent: Str) -> Writer
```

A writer that indents by `indent` (none when empty).

[Source: `std/xmlcodec.xo:111`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L111)

### write_start {#write_start}

```xo
pub fn write_start(var w: Writer, name: Str, attrs: List[xml.Attr])
```

Starts element `name` with the attributes (an empty local name is
left out).

[Source: `std/xmlcodec.xo:115`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L115)

### write_open {#write_open}

```xo
pub fn write_open(var w: Writer, parents: List[Str])
```

Opens the path `parents` in the started element (open_path's piece):
the parents the previous field opened stay open as far as they match.

[Source: `std/xmlcodec.xo:122`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L122)

### write_leaf {#write_leaf}

```xo
pub fn write_leaf(var w: Writer, parents: List[Str], name: Str, text: Str)
```

The element `name` holding the text under `parents` (leaf's piece).

[Source: `std/xmlcodec.xo:139`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L139)

### write_chardata {#write_chardata}

```xo
pub fn write_chardata(var w: Writer, text: Str)
```

Character data where the writer is (chardata's piece).

[Source: `std/xmlcodec.xo:147`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L147)

### write_end {#write_end}

```xo
pub fn write_end(var w: Writer, name: Str)
```

Closes the open parents and the element `name` write_start began.

[Source: `std/xmlcodec.xo:150`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L150)

### written {#written}

```xo
pub fn written(var w: Writer) -> Str
```

The text written.

[Source: `std/xmlcodec.xo:160`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L160)

### parse_root {#parse_root}

```xo
pub fn parse_root(text: Str) -> xml.Element ! xml.XmlErr
```

The root element of text, as Go's Unmarshal finds it: a text with no
element is `EOF`.

[Source: `std/xmlcodec.xo:164`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L164)

### attr_of {#attr_of}

```xo
pub fn attr_of(e: xml.Element, name: Str) -> Str?
```

The value of the attribute of that local name.

[Source: `std/xmlcodec.xo:172`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L172)

### events {#events}

```xo
pub fn events(e: xml.Element, paths: List[List[Str]]) -> List[Event]
```

The elements below e whose path from e is one of `paths`, in document
order, with the index of the path.

[Source: `std/xmlcodec.xo:190`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L190)

### direct_text {#direct_text}

```xo
pub fn direct_text(e: xml.Element) -> Str
```

The character data directly inside e, in order (Go's chardata).

[Source: `std/xmlcodec.xo:197`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L197)

### float_text {#float_text}

```xo
pub fn float_text(f: Float) -> Str
```

Go's FormatFloat(f, 'g', -1, 64): Xo's text of a Float without the
".0" an integral value gets.

[Source: `std/xmlcodec.xo:210`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L210)

### int_of {#int_of}

```xo
pub fn int_of(s: Str) -> Int ! xml.XmlErr
```

Go's strconv.ParseInt of the text with spaces trimmed (0 when empty):
`strconv.ParseInt: parsing "x": invalid syntax` or `value out of range`.

[Source: `std/xmlcodec.xo:217`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L217)

### float_of {#float_of}

```xo
pub fn float_of(s: Str) -> Float ! xml.XmlErr
```

Go's strconv.ParseFloat of the text with spaces trimmed (0 when
empty): `strconv.ParseFloat: parsing "x": invalid syntax` or `value
out of range`.

[Source: `std/xmlcodec.xo:234`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L234)

### bool_of {#bool_of}

```xo
pub fn bool_of(s: Str) -> Bool ! xml.XmlErr
```

Go's strconv.ParseBool (false when empty).

[Source: `std/xmlcodec.xo:249`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L249)

### fail {#fail}

```xo
fn fail(msg: Str) -> xml.XmlErr
```

[Source: `std/xmlcodec.xo:261`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L261)

### nm {#nm}

```xo
fn nm(local: Str) -> xml.Name
```

[Source: `std/xmlcodec.xo:263`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L263)

### close_top {#close_top}

```xo
fn close_top(var names: List[Str], var kids: List[List[xml.Node]])
```

Closes the innermost open parent into the frame below it.

[Source: `std/xmlcodec.xo:266`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L266)

### indent_by {#indent_by}

```xo
fn indent_by(var w: Writer, delta: Int)
```

xml's Printer.write_indent.

[Source: `std/xmlcodec.xo:275`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L275)

### tag_open {#tag_open}

```xo
fn tag_open(var w: Writer, name: Str, attrs: List[xml.Attr])
```

[Source: `std/xmlcodec.xo:300`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L300)

### tag_close {#tag_close}

```xo
fn tag_close(var w: Writer, name: Str)
```

[Source: `std/xmlcodec.xo:317`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L317)

### walk {#walk}

```xo
fn walk(el: xml.Element, prefix: List[Str], paths: List[List[Str]], var out: List[Event])
```

The elements below el, in document order, whose path from the struct's
element is one of paths (Go reads the document once, in order).

[Source: `std/xmlcodec.xo:326`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L326)

### digits_only {#digits_only}

```xo
fn digits_only(s: Str) -> Bool
```

[Source: `std/xmlcodec.xo:348`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L348)

### code_at {#code_at}

```xo
fn code_at(b: Bytes, i: Int) -> Int
```

The byte of b at i as an Int, -1 past the end.

[Source: `std/xmlcodec.xo:365`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L365)

### lower_code_at {#lower_code_at}

```xo
fn lower_code_at(b: Bytes, i: Int) -> Int
```

code_at lowercased when it is an ASCII letter (Go's lower).

[Source: `std/xmlcodec.xo:374`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L374)

### word_at_end {#word_at_end}

```xo
fn word_at_end(b: Bytes, i: Int, w: Bytes) -> Bool
```

Whether the bytes of b from i are exactly the letters of w, case
ignored, with nothing after them.

[Source: `std/xmlcodec.xo:385`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L385)

### underscore_ok {#underscore_ok}

```xo
fn underscore_ok(b: Bytes, n: Int) -> Bool
```

strconv.underscoreOK on the first n bytes of b: every underscore
between digits, and a 0x prefix counts as a digit.

[Source: `std/xmlcodec.xo:401`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L401)

### float_syntax {#float_syntax}

```xo
fn float_syntax(s: Str) -> Bool
```

Whether s is a Float text Go's strconv.ParseFloat accepts on its way to
a value: atof.go's special words, its decimal and hexadecimal forms,
and its underscore rule. The value is not computed, so a text that
overflows (which Float.parse answers None for, as it does a syntax
error) is told from one that is malformed.

[Source: `std/xmlcodec.xo:439`](https://github.com/xo-lang/xo/blob/main/std/xmlcodec.xo#L439)
