---
title: "std/yaml"
linkTitle: "yaml"
description: "YAML decoded into and encoded from structs that derive Yaml, by the types of their fields, with g..."
toc: true
module: "std/yaml"
source: "https://github.com/xo-lang/xo/blob/main/std/yaml.xo"
generated: "scripts/sync-content.py from `xo doc std/yaml`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`TAGGED`](#TAGGED)
- const [`DOUBLE_QUOTED`](#DOUBLE_QUOTED)
- const [`SINGLE_QUOTED`](#SINGLE_QUOTED)
- const [`LITERAL`](#LITERAL)
- const [`FOLDED`](#FOLDED)
- const [`FLOW`](#FLOW)
- type [`YamlErr`](#YamlErr)
  - method [`YamlErr.display`](#YamlErr.display)
- type [`NodeKind`](#NodeKind)
- type [`Node`](#Node)
- type [`RawNode`](#RawNode)
- type [`Doc`](#Doc)
- type [`Ev`](#Ev)
- type [`Enc`](#Enc)
- type [`Dec`](#Dec)
- fn [`decode`](#decode)
- fn [`encode_value`](#encode_value)
- fn [`decode_all`](#decode_all)
- fn [`encode_all`](#encode_all)
- fn [`parse`](#parse)
- fn [`parse_all`](#parse_all)
- fn [`to_json`](#to_json)
- fn [`encode_node`](#encode_node)
- fn [`parse_doc`](#parse_doc)
- fn [`root`](#root)
- fn [`is_null`](#is_null)
- fn [`to_str`](#to_str)
- fn [`to_int`](#to_int)
- fn [`to_float`](#to_float)
- fn [`to_bool`](#to_bool)
- fn [`items`](#items)
- fn [`pairs`](#pairs)
- fn [`bad_key`](#bad_key)
- fn [`errors`](#errors)
- fn [`zero_node`](#zero_node)
- fn [`put_node`](#put_node)
- fn [`to_node_field`](#to_node_field)
- fn [`enc_new`](#enc_new)
- fn [`set_flow`](#set_flow)
- fn [`map_start`](#map_start)
- fn [`map_end`](#map_end)
- fn [`seq_start`](#seq_start)
- fn [`seq_end`](#seq_end)
- fn [`put_null`](#put_null)
- fn [`put_bool`](#put_bool)
- fn [`put_int`](#put_int)
- fn [`put_float`](#put_float)
- fn [`put_str`](#put_str)
- fn [`sorted_keys`](#sorted_keys)
- fn [`finish`](#finish)
- fn [`dec_new`](#dec_new)
- fn [`unknown_field`](#unknown_field)
- fn [`tick`](#tick)
- fn [`leave`](#leave)
- fn [`parse_docs`](#parse_docs)
- fn [`finish_all`](#finish_all)
- fn [`to_duration`](#to_duration)
- fn [`to_time`](#to_time)
- fn [`put_time`](#put_time)
- fn [`to_civil`](#to_civil)
- fn [`zero_civil`](#zero_civil)
- fn [`put_civil`](#put_civil)
- fn [`to_bytes`](#to_bytes)
- fn [`put_duration`](#put_duration)
- fn [`put_bytes`](#put_bytes)

## Constants

### TAGGED {#TAGGED}

```xo
const TAGGED: Int = 1
```

Style bits of a Node, as yaml.v3's Style: `TAGGED` (the tag is written),
`DOUBLE_QUOTED`, `SINGLE_QUOTED`, `LITERAL`, `FOLDED`, `FLOW`.

[Source: `std/yaml.xo:45`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L45)

### DOUBLE_QUOTED {#DOUBLE_QUOTED}

```xo
const DOUBLE_QUOTED: Int = 2
```

[Source: `std/yaml.xo:46`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L46)

### SINGLE_QUOTED {#SINGLE_QUOTED}

```xo
const SINGLE_QUOTED: Int = 4
```

[Source: `std/yaml.xo:47`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L47)

### LITERAL {#LITERAL}

```xo
const LITERAL: Int = 8
```

[Source: `std/yaml.xo:48`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L48)

### FOLDED {#FOLDED}

```xo
const FOLDED: Int = 16
```

[Source: `std/yaml.xo:49`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L49)

### FLOW {#FLOW}

```xo
const FLOW: Int = 32
```

[Source: `std/yaml.xo:50`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L50)

## Types

### YamlErr {#YamlErr}

```xo
struct YamlErr {
  line: Int
  msg: Str
}
```

Displays as `yaml: line 3: mapping values are not allowed in this context`;
type mismatches as `yaml: unmarshal errors:\n  line 2: cannot unmarshal !!str
`x` into int`, all of them together.

[Source: `std/yaml.xo:11`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L11)

#### YamlErr.display {#YamlErr.display}

```xo
fn (e: YamlErr) display() -> Str
```

[Source: `std/yaml.xo:16`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L16)

### NodeKind {#NodeKind}

```xo
enum NodeKind { Document, Sequence, Mapping, Scalar, Alias }
```

The kinds of node yaml.v3's Node has.

[Source: `std/yaml.xo:41`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L41)

### Node {#Node}

```xo
struct Node {
  kind: NodeKind
  style: Int
  tag: Str
  value: Str
  anchor: Str
  head_comment: Str
  line_comment: Str
  foot_comment: Str
  alias: Node?
  content: List[Node]
  line: Int
  column: Int
}
```

A node of a YAML document, as yaml.v3's Node: a Document holds its one root in
`content`, a Sequence its items, a Mapping its keys and values alternately, a
Scalar its text in `value` with its resolved `tag` (`!!str`, `!!int`, ...), and an
Alias the anchor name in `value` and the node it names in `alias`. `anchor` is the
name an anchored node defines; `head_comment`, `line_comment` and `foot_comment` hold
the comments around the node as yaml.v3 associates them (`# ` prefixes kept, lines joined by
a line feed); `line` and `column` count from 1.

[Source: `std/yaml.xo:59`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L59)

### RawNode {#RawNode}

```xo
struct RawNode {
  kind: Int
  style: Int
  tag: Str
  value: Str
  anchor: Str
  alias: Int
  content: List[Int]
  line: Int
  column: Int
  head_comment: Str
  line_comment: Str
  foot_comment: Str
}
```

A node of the document tree; children and aliases are indexes into Doc.nodes.

[Source: `std/yaml.xo:94`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L94)

### Doc {#Doc}

```xo
struct Doc {
  nodes: List[RawNode]
  anchors: Map[Str, Int]
  root: Int
}
```

[Source: `std/yaml.xo:109`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L109)

### Ev {#Ev}

```xo
struct Ev {
  kind: Int
  text: Str
  style: Int
  node: List[Node]
}
```

A node event written by derive Yaml's encoder: 1 mapping start, 2 mapping
end, 3 sequence start, 4 sequence end, 5 a scalar (its text and style).

[Source: `std/yaml.xo:144`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L144)

### Enc {#Enc}

```xo
struct Enc {
  evs: List[Ev]
  flow: Bool
}
```

The events of one document being written.

[Source: `std/yaml.xo:153`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L153)

### Dec {#Dec}

```xo
struct Dec {
  errs: List[YamlErr]
  dc: Int
  ac: Int
  ad: Int
  active: List[Int]
  strict: Bool
}
```

The state of one decode: the type errors so far (yaml.v3 reports them
together), and the counts of its limit on alias expansion.

[Source: `std/yaml.xo:187`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L187)

## Functions

### decode {#decode}

```xo
fn decode[T: Yaml](text: Str, strict: Bool = false) -> T ! YamlErr
```

The first document of text decoded into a struct that derives Yaml: a
mapping's keys by the field names (or `as` wire names), the rest ignored, or
with `strict` an error (yaml.v3's KnownFields).
The call is compiled as a call of the function `derive Yaml` generates
for T.

[Source: `std/yaml.xo:23`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L23)

### encode_value {#encode_value}

```xo
fn encode_value[T: Yaml](v: T, indent: Int = 4) -> Str ! YamlErr
```

v as one YAML document, written as yaml.v3's Marshal does (indent 4 by
default, `indent` spaces from 2 to 9 as its SetIndent, keys in
field order, strings quoted when they would read back as another type, a map's
keys sorted as yaml.v3 sorts them). The call is compiled as a call of the
function `derive Yaml` generates for T.

[Source: `std/yaml.xo:30`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L30)

### decode_all {#decode_all}

```xo
fn decode_all[T: Yaml](text: Str, strict: Bool = false) -> List[T] ! YamlErr
```

Every document of text decoded into T (yaml.v3's Decoder.Decode until the end);
the call is compiled as a call of the function `derive Yaml` generates for T.

[Source: `std/yaml.xo:34`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L34)

### encode_all {#encode_all}

```xo
fn encode_all[T: Yaml](docs: List[T], indent: Int = 4) -> Str ! YamlErr
```

The documents written one after the other, each after the first behind a `---`
line (yaml.v3's Encoder.Encode called for each).

[Source: `std/yaml.xo:38`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L38)

### parse {#parse}

```xo
fn parse(text: Str) -> Node ! YamlErr
```

The first document of text as a Node tree (a Document node; an empty text is
a Document with no content).

[Source: `std/yaml.xo:76`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L76)

### parse_all {#parse_all}

```xo
fn parse_all(text: Str) -> List[Node] ! YamlErr
```

Every document of text.

[Source: `std/yaml.xo:78`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L78)

### to_json {#to_json}

```xo
fn to_json(text: Str) -> Str ! YamlErr
```

The first document of text as JSON text (like toml.to_json): keys sorted, aliases
and merge keys resolved, a timestamp as its text, an empty document `null`; a
NaN or an infinity is an error, as for Go's json.Marshal of yaml.v3's value.

[Source: `std/yaml.xo:82`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L82)

### encode_node {#encode_node}

```xo
fn encode_node(n: Node, indent: Int = 4) -> Str ! YamlErr
```

n written as YAML (yaml.v3's Marshal of a Node): a Document node as is, any other
node as a document of its own; a tag is left out when the text resolves to it.

[Source: `std/yaml.xo:85`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L85)

### parse_doc {#parse_doc}

```xo
fn parse_doc(text: Str) -> Doc ! YamlErr
```

The first document of text as a node tree.

[Source: `std/yaml.xo:116`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L116)

### root {#root}

```xo
fn root(d: Doc) -> Int
```

The index of the document's content node, -1 for an empty document.

[Source: `std/yaml.xo:118`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L118)

### is_null {#is_null}

```xo
fn is_null(d: Doc, i: Int) -> Bool
```

[Source: `std/yaml.xo:119`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L119)

### to_str {#to_str}

```xo
fn to_str(d: Doc, i: Int, var st: Dec) -> (Bool, Str) ! YamlErr
```

The reads below return whether a value was read (a null, a mismatch, or a
node of the wrong kind leaves the field alone, as yaml.v3 does) and the
value; a mismatch is put in st.errs (yaml.v3 reports every one together), and
only an explicit tag that its text does not fit ends the decode.

[Source: `std/yaml.xo:124`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L124)

### to_int {#to_int}

```xo
fn to_int(d: Doc, i: Int, var st: Dec) -> (Bool, Int) ! YamlErr
```

[Source: `std/yaml.xo:125`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L125)

### to_float {#to_float}

```xo
fn to_float(d: Doc, i: Int, var st: Dec) -> (Bool, Float) ! YamlErr
```

[Source: `std/yaml.xo:126`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L126)

### to_bool {#to_bool}

```xo
fn to_bool(d: Doc, i: Int, var st: Dec) -> (Bool, Bool) ! YamlErr
```

[Source: `std/yaml.xo:127`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L127)

### items {#items}

```xo
fn items(d: Doc, i: Int, what: Str, var st: Dec) -> (Bool, List[Int])
```

The items of a sequence node (what names the target type in the error).

[Source: `std/yaml.xo:129`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L129)

### pairs {#pairs}

```xo
fn pairs(d: Doc, i: Int, what: Str, var st: Dec) -> (Bool, List[(Str, Int, Int)]) ! YamlErr
```

The key and value node of each entry of a mapping node, as yaml.v3 decodes
them as (key, value node, key line) (its own entries, then its merge key's; a repeated key or a key that is
not a scalar is put in st.errs; a bad merge value ends the decode).

[Source: `std/yaml.xo:133`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L133)

### bad_key {#bad_key}

```xo
fn bad_key(d: Doc, v: Int, var st: Dec) -> Bool ! YamlErr
```

Puts in errs the error of a pairs entry for a key that is not a scalar (its
value v is negative) or ends the decode for a bad merge value; the generated
reader calls it for such an entry.

[Source: `std/yaml.xo:137`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L137)

### errors {#errors}

```xo
fn errors(st: Dec) -> YamlErr
```

The error of a decode that collected st.errs (not empty): yaml.v3's
"unmarshal errors:" list.

[Source: `std/yaml.xo:140`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L140)

### zero_node {#zero_node}

```xo
fn zero_node() -> Node
```

The value of a Node field the document does not hold: a null scalar (yaml.v3 has a Node of kind 0, which it writes as null).

[Source: `std/yaml.xo:159`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L159)

### put_node {#put_node}

```xo
fn put_node(var w: Enc, n: Node)
```

Writes a Node field as it is (yaml.v3 writes a Node value through its encoder.node).

[Source: `std/yaml.xo:161`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L161)

### to_node_field {#to_node_field}

```xo
fn to_node_field(d: Doc, i: Int, var st: Dec) -> (Bool, Node) ! YamlErr
```

A Node field: the node itself, an alias left an alias (yaml.v3 stops at the Node type before its alias handling).

[Source: `std/yaml.xo:163`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L163)

### enc_new {#enc_new}

```xo
fn enc_new() -> Enc
```

[Source: `std/yaml.xo:165`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L165)

### set_flow {#set_flow}

```xo
fn set_flow(var w: Enc, flow: Bool)
```

Makes the next mapping or sequence started a flow one (yaml.v3's e.flow).

[Source: `std/yaml.xo:167`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L167)

### map_start {#map_start}

```xo
fn map_start(var w: Enc)
```

[Source: `std/yaml.xo:168`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L168)

### map_end {#map_end}

```xo
fn map_end(var w: Enc)
```

[Source: `std/yaml.xo:169`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L169)

### seq_start {#seq_start}

```xo
fn seq_start(var w: Enc)
```

[Source: `std/yaml.xo:170`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L170)

### seq_end {#seq_end}

```xo
fn seq_end(var w: Enc)
```

[Source: `std/yaml.xo:171`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L171)

### put_null {#put_null}

```xo
fn put_null(var w: Enc)
```

[Source: `std/yaml.xo:172`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L172)

### put_bool {#put_bool}

```xo
fn put_bool(var w: Enc, b: Bool)
```

[Source: `std/yaml.xo:173`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L173)

### put_int {#put_int}

```xo
fn put_int(var w: Enc, n: Int)
```

[Source: `std/yaml.xo:174`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L174)

### put_float {#put_float}

```xo
fn put_float(var w: Enc, f: Float)
```

[Source: `std/yaml.xo:175`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L175)

### put_str {#put_str}

```xo
fn put_str(var w: Enc, s: Str)
```

A string as yaml.v3 writes it: quoted when it would read back as another
type, a literal block when it has a line break (flow: quoted instead).

[Source: `std/yaml.xo:178`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L178)

### sorted_keys {#sorted_keys}

```xo
fn sorted_keys(keys: List[Str]) -> List[Str]
```

The keys of a map[string] in yaml.v3's order (letters by code point, digit runs by value).

[Source: `std/yaml.xo:180`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L180)

### finish {#finish}

```xo
fn finish(w: Enc, indent: Int) -> Str ! YamlErr
```

The document the events make, indented by `indent` spaces (yaml.v3's SetIndent;
its Marshal uses 4; the emitter takes 2 to 9).

[Source: `std/yaml.xo:183`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L183)

### dec_new {#dec_new}

```xo
fn dec_new(strict: Bool) -> Dec
```

strict: an unknown key is an error (yaml.v3's KnownFields).

[Source: `std/yaml.xo:197`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L197)

### unknown_field {#unknown_field}

```xo
fn unknown_field(var st: Dec, k: Str, line: Int, typ: Str)
```

Puts the unknown key k, on line, of a struct typ in st.errs when the decode is strict.

[Source: `std/yaml.xo:199`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L199)

### tick {#tick}

```xo
fn tick(d: Doc, i: Int, var st: Dec) -> Bool ! YamlErr
```

Counts the read of node i (for an alias, also of its target, and enters it:
leave undoes that); fails on yaml.v3's `document contains excessive aliasing`
or an anchor that contains itself. The generated readers call it first.

[Source: `std/yaml.xo:203`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L203)

### leave {#leave}

```xo
fn leave(var st: Dec, entered: Bool)
```

[Source: `std/yaml.xo:204`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L204)

### parse_docs {#parse_docs}

```xo
fn parse_docs(text: Str) -> List[Doc] ! YamlErr
```

Every document of text (parse reads the first).

[Source: `std/yaml.xo:207`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L207)

### finish_all {#finish_all}

```xo
fn finish_all(ws: List[Enc], indent: Int) -> Str ! YamlErr
```

The documents the event lists make, one after another.

[Source: `std/yaml.xo:209`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L209)

### to_duration {#to_duration}

```xo
fn to_duration(d: Doc, i: Int, var st: Dec) -> (Bool, Duration) ! YamlErr
```

A Duration field (yaml.v3's time.Duration): a string in `Duration.parse` syntax;
an int or a float is an error there as here.

[Source: `std/yaml.xo:213`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L213)

### to_time {#to_time}

```xo
fn to_time(d: Doc, i: Int, var st: Dec) -> (Bool, Time) ! YamlErr
```

A Time field: a timestamp scalar (yaml.v3's `2001-12-14`, `2001-12-14 21:59:43.10`, `2001-12-14t21:59:43.10-05:00`)
as its instant, or any other text in RFC 3339; the zone is not kept.

[Source: `std/yaml.xo:216`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L216)

### put_time {#put_time}

```xo
fn put_time(var w: Enc, t: Time)
```

Writes a Time as RFC 3339 in UTC.

[Source: `std/yaml.xo:218`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L218)

### to_civil {#to_civil}

```xo
fn to_civil(d: Doc, i: Int, var st: Dec) -> (Bool, time.Civil) ! YamlErr
```

A time.Civil field: a Time field that keeps the offset of the timestamp (yaml.v3's time.Time does).

[Source: `std/yaml.xo:220`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L220)

### zero_civil {#zero_civil}

```xo
fn zero_civil() -> time.Civil
```

The value of a time.Civil field the document does not hold: 1970-01-01T00:00:00Z.

[Source: `std/yaml.xo:222`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L222)

### put_civil {#put_civil}

```xo
fn put_civil(var w: Enc, c: time.Civil)
```

Writes a Civil as RFC 3339 with its offset.

[Source: `std/yaml.xo:224`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L224)

### to_bytes {#to_bytes}

```xo
fn to_bytes(d: Doc, i: Int, var st: Dec) -> (Bool, Bytes) ! YamlErr
```

A Bytes field, as yaml.v3's []byte: a sequence of ints 0 to 255.

[Source: `std/yaml.xo:226`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L226)

### put_duration {#put_duration}

```xo
fn put_duration(var w: Enc, d: Duration)
```

Writes a Duration as Go's Duration.String text (`1h30m0s`).

[Source: `std/yaml.xo:228`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L228)

### put_bytes {#put_bytes}

```xo
fn put_bytes(var w: Enc, b: Bytes)
```

Writes Bytes as a sequence of ints, as yaml.v3 writes a []byte.

[Source: `std/yaml.xo:230`](https://github.com/xo-lang/xo/blob/main/std/yaml.xo#L230)
