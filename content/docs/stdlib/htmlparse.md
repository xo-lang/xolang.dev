---
title: "std/htmlparse"
linkTitle: "htmlparse"
description: "golang.org/x/net/html's tree builder (parse.go, node.go, const.go, foreign.go, doctype.go, render..."
toc: true
module: "std/htmlparse"
source: "https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo"
generated: "scripts/sync-content.py from `xo doc std/htmlparse`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`NodeType`](#nodetype)
- type [`Attr`](#attr)
- type [`Node`](#node)
- type [`Tree`](#tree)
  - method [`Tree.render`](#treerender)
  - method [`Tree.render_node`](#treerender_node)
  - method [`Tree.dump`](#treedump)
- type [`ParseErr`](#parseerr)
  - method [`ParseErr.display`](#parseerrdisplay)
- type [`RenderErr`](#rendererr)
  - method [`RenderErr.display`](#rendererrdisplay)
- fn [`parse`](#parse)
- fn [`parse_with`](#parse_with)
- fn [`parse_fragment`](#parse_fragment)
- fn [`parse_fragment_with`](#parse_fragment_with)
- fn [`escape`](#escape)

## Types

### NodeType

```xo
enum NodeType {
  Error
  Text
  Document
  Element
  Comment
  Doctype
  Raw
} derive Eq
```

Go's html.NodeType (without the internal scope marker).

[Source: `std/htmlparse.xo:13`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L13)

### Attr

```xo
struct Attr {
  namespace: Str
  key: Str
  val: Str
} derive Eq
```

Go's html.Attribute: `namespace` is "" except for the adjusted foreign
attributes (`xlink`, `xml`, `xmlns`).

[Source: `std/htmlparse.xo:25`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L25)

### Node

```xo
struct Node {
  typ: NodeType
  data: Str
  namespace: Str
  attrs: List[Attr]
  parent: Int
  first_child: Int
  last_child: Int
  prev: Int
  next: Int
}
```

Go's html.Node: `data` is the tag name of an element (lower case, with the
svg camel case adjustments), the text of a text or comment node, the name of
a doctype (its public and system identifiers are the attributes `public`
and `system`). `namespace` is "" for html, `math` or `svg`. Tree links are
indexes into `Tree.nodes`, -1 for none.

[Source: `std/htmlparse.xo:36`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L36)

### Tree

```xo
struct Tree {
  nodes: List[Node]
  root: Int
}
```

The result of a parse: the nodes and `root`, the node whose children are the
result (the document, or for a fragment the html element Go's ParseFragment
takes its nodes from).

[Source: `std/htmlparse.xo:51`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L51)

#### Tree.render

```xo
fn (t: Tree) render() -> Str ! RenderErr
```

html.Render of the whole result: the children of `root` in order.

[Source: `std/htmlparse.xo:84`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L84)

#### Tree.render_node

```xo
fn (t: Tree) render_node(n: Int) -> Str ! RenderErr
```

html.Render of one node (a document renders its children).

[Source: `std/htmlparse.xo:86`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L86)

#### Tree.dump

```xo
fn (t: Tree) dump() -> Str
```

The tree in the html5lib tree-construction format Go's tests compare (`| `
lines, two spaces per level, attributes sorted by key, `content` under a
template).

[Source: `std/htmlparse.xo:90`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L90)

### ParseErr

```xo
struct ParseErr {
  msg: Str
}
```

A parse failure: the open elements nest deeper than 512 (Go's error and
panic text), or the tokenizer's buffer limit.

[Source: `std/htmlparse.xo:58`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L58)

#### ParseErr.display

```xo
fn (e: ParseErr) display() -> Str
```

[Source: `std/htmlparse.xo:62`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L62)

### RenderErr

```xo
struct RenderErr {
  msg: Str
}
```

A tree Render refuses: an error node, a void element with children, a
doctype identifier with both quote types.

[Source: `std/htmlparse.xo:66`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L66)

#### RenderErr.display

```xo
fn (e: RenderErr) display() -> Str
```

[Source: `std/htmlparse.xo:70`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L70)

## Functions

### parse

```xo
fn parse(text: Str) -> Tree ! ParseErr
```

html.Parse: the document of `text` (UTF-8), scripting enabled.

[Source: `std/htmlparse.xo:73`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L73)

### parse_with

```xo
fn parse_with(text: Str, scripting: Bool) -> Tree ! ParseErr
```

html.ParseWithOptions with ParseOptionEnableScripting(scripting).

[Source: `std/htmlparse.xo:75`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L75)

### parse_fragment

```xo
fn parse_fragment(text: Str, context_namespace: Str, context_tag: Str) -> Tree ! ParseErr
```

html.ParseFragment: `text` as the inner html of an element of `context_tag`
in `context_namespace` ("", `math` or `svg`); an empty tag parses a
document. The nodes are the children of the result's `root`.

[Source: `std/htmlparse.xo:79`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L79)

### parse_fragment_with

```xo
fn parse_fragment_with(text: Str, context_namespace: Str, context_tag: Str, scripting: Bool) -> Tree ! ParseErr
```

html.ParseFragmentWithOptions with the scripting flag.

[Source: `std/htmlparse.xo:81`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L81)

### escape

```xo
fn escape(s: Str) -> Str
```

html.EscapeString as x/net's renderer applies it: `&`, `'`, `<`, `>`, `"`
and carriage return as `&amp;`, `&#39;`, `&lt;`, `&gt;`, `&#34;`, `&#13;`.

[Source: `std/htmlparse.xo:94`](https://github.com/xo-lang/xo/blob/main/std/htmlparse.xo#L94)
