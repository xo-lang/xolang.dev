---
title: "std/xml"
linkTitle: "xml"
description: "Go's encoding/xml: the Decoder's tokens (namespaces resolved, entities and CDATA decoded, Go's er..."
toc: true
module: "std/xml"
source: "https://github.com/xo-lang/xo/blob/main/std/xml.xo"
generated: "scripts/sync-content.py from `xo doc std/xml`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Name`](#name)
- type [`Attr`](#attr)
- type [`Token`](#token)
- type [`XmlErr`](#xmlerr)
  - method [`XmlErr.display`](#xmlerrdisplay)
- type [`Reader`](#reader)
  - method [`Reader.next`](#readernext)
- type [`Element`](#element)
  - method [`Element.attr`](#elementattr)
  - method [`Element.child`](#elementchild)
  - method [`Element.children_named`](#elementchildren_named)
  - method [`Element.text`](#elementtext)
  - method [`Element.encode`](#elementencode)
- type [`Node`](#node)
- fn [`tokens`](#tokens)
- fn [`raw_tokens`](#raw_tokens)
- fn [`reader`](#reader)
- fn [`raw_reader`](#raw_reader)
- fn [`parse`](#parse)
- fn [`escape`](#escape)
- fn [`escape_to`](#escape_to)
- fn [`encode_value`](#encode_value)
- fn [`decode`](#decode)

## Types

### Name

```xo
struct Name {
  space: Str
  local: Str
} derive Eq, Ord, Hash
```

An element or attribute name. `space` is the namespace URL once
resolved (the prefix itself in raw tokens); empty for none.

[Source: `std/xml.xo:9`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L9)

### Attr

```xo
struct Attr {
  name: Name
  value: Str
} derive Eq
```

[Source: `std/xml.xo:14`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L14)

### Token

```xo
enum Token {
  Start(name: Name, attrs: List[Attr])
  End(name: Name)
  Text(s: Str)
  Comment(s: Str)
  ProcInst(target: Str, inst: Str)
  Directive(s: Str)
} derive Eq
```

Go's xml.Token.

[Source: `std/xml.xo:20`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L20)

### XmlErr

```xo
struct XmlErr {
  line: Int
  msg: Str
}
```

Go's SyntaxError (line > 0): displays as `XML syntax error on line N:
MSG`; Go's other errors and parse's own (line 0) as MSG.

[Source: `std/xml.xo:32`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L32)

#### XmlErr.display

```xo
fn (e: XmlErr) display() -> Str
```

[Source: `std/xml.xo:37`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L37)

### Reader

```xo
struct Reader {}
```

Tokens one at a time (Go's Decoder.Token and RawToken): the same tokens as
`tokens` and `raw_tokens`, without holding the list; the input stays
(decision 0463).

[Source: `std/xml.xo:49`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L49)

#### Reader.next

```xo
fn (var r: Reader) next() -> Token? ! XmlErr
```

The next token, None at the end of the input; an error is returned again
by every later call.

[Source: `std/xml.xo:57`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L57)

### Element

```xo
struct Element {
  name: Name
  attrs: List[Attr]
  children: List[Node]
} derive Eq
```

An element and everything inside it.

[Source: `std/xml.xo:60`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L60)

#### Element.attr

```xo
fn (e: Element) attr(local: Str) -> Str?
```

The value of the first attribute of that local name.

[Source: `std/xml.xo:82`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L82)

#### Element.child

```xo
fn (e: Element) child(local: Str) -> Element?
```

The first child element of that local name.

[Source: `std/xml.xo:84`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L84)

#### Element.children_named

```xo
fn (e: Element) children_named(local: Str) -> List[Element]
```

[Source: `std/xml.xo:85`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L85)

#### Element.text

```xo
fn (e: Element) text() -> Str
```

The character data inside e, its descendants' included, in order.

[Source: `std/xml.xo:87`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L87)

#### Element.encode

```xo
fn (e: Element) encode(indent: Str = "") -> Str ! XmlErr
```

The element as Go's Encoder writes its tokens (Indent("", indent) when
indent is not empty), or the Encoder's error (`xml: comment cannot
contain "--"`).

[Source: `std/xml.xo:91`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L91)

### Node

```xo
enum Node {
  Elem(e: Element)
  Text(s: Str)
  Comment(s: Str)
  ProcInst(target: Str, inst: Str)
  Directive(s: Str)
  Raw(s: Str)
} derive Eq
```

[Source: `std/xml.xo:66`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L66)

## Functions

### tokens

```xo
fn tokens(text: Str, strict: Bool = true) -> List[Token] ! XmlErr
```

Every token of text (Decoder.Token until EOF). strict: false is Go's
Strict = false with AutoClose = HTMLAutoClose and Entity = HTMLEntity.

[Source: `std/xml.xo:41`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L41)

### raw_tokens

```xo
fn raw_tokens(text: Str) -> List[Token] ! XmlErr
```

Decoder.RawToken until EOF: prefixes as written, no start and end
matching.

[Source: `std/xml.xo:44`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L44)

### reader

```xo
fn reader(text: Str, strict: Bool = true) -> Reader
```

A reader of text's tokens (`tokens`'s rules, strict: false as there).

[Source: `std/xml.xo:52`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L52)

### raw_reader

```xo
fn raw_reader(text: Str) -> Reader
```

A reader of Decoder.RawToken's tokens (`raw_tokens`).

[Source: `std/xml.xo:54`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L54)

### parse

```xo
fn parse(text: Str, strict: Bool = true) -> Element ! XmlErr
```

The document's root element; outside it only whitespace, comments,
processing instructions, and directives (`xml: no root element`, `xml:
more than one root element`, `xml: text outside the root element`).

[Source: `std/xml.xo:80`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L80)

### escape

```xo
fn escape(s: Str) -> Str
```

Go's EscapeText of s.

[Source: `std/xml.xo:93`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L93)

### escape_to

```xo
fn escape_to(var out: StrBuilder, s: Str)
```

Go's EscapeText of s into out: the text escape returns, appended.

[Source: `std/xml.xo:95`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L95)

### encode_value

```xo
fn encode_value[T: Xml](v: T, indent: Str = "") -> Str ! XmlErr
```

Go's xml.MarshalIndent of a struct that derives Xml (indent "" is
Marshal): attributes, character data, `a>b>c` paths, omitempty and `-`
from its `xml` wire strings (decision 0315). The call is compiled as a
call of the function `derive Xml` generates for T.

[Source: `std/xml.xo:101`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L101)

### decode

```xo
fn decode[T: Xml](text: Str) -> T ! XmlErr
```

Go's xml.Unmarshal of text into a struct that derives Xml: the root
element's attributes and children by the field names, the rest ignored.

[Source: `std/xml.xo:104`](https://github.com/xo-lang/xo/blob/main/std/xml.xo#L104)
