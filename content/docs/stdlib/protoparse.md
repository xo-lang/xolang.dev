---
title: "std/protoparse"
linkTitle: "protoparse"
description: "a parser for `.proto` files (proto3), for `xo proto gen`."
toc: true
module: "std/protoparse"
source: "https://github.com/xo-lang/xo/blob/main/std/protoparse.xo"
generated: "scripts/sync-content.py from `xo doc std/protoparse`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`ParseErr`](#ParseErr)
  - method [`ParseErr.display`](#ParseErr.display)
- type [`Kind`](#Kind)
- type [`Token`](#Token)
- type [`Field`](#Field)
- type [`EnumValue`](#EnumValue)
- type [`Enum`](#Enum)
- type [`Message`](#Message)
- type [`Rpc`](#Rpc)
- type [`Service`](#Service)
- type [`File`](#File)
- type [`P`](#P)
- fn [`tokens`](#tokens)
- fn [`parse`](#parse)
- fn [`gen`](#gen)
- fn [`is_letter`](#is_letter)
- fn [`is_digit`](#is_digit)
- fn [`p_err`](#p_err)
- fn [`p_peek`](#p_peek)
- fn [`p_is`](#p_is)
- fn [`p_expect`](#p_expect)
- fn [`p_ident`](#p_ident)
- fn [`p_type`](#p_type)
- fn [`p_int`](#p_int)
- fn [`p_str`](#p_str)
- fn [`p_skip_stmt`](#p_skip_stmt)
- fn [`p_skip_block`](#p_skip_block)
- fn [`p_skip_opts`](#p_skip_opts)
- fn [`p_enum`](#p_enum)
- fn [`p_field`](#p_field)
- fn [`p_message`](#p_message)
- fn [`p_message_body`](#p_message_body)
- fn [`p_service`](#p_service)
- fn [`g_camel`](#g_camel)
- fn [`g_scalar`](#g_scalar)
- fn [`g_collect`](#g_collect)
- fn [`g_resolve`](#g_resolve)
- fn [`g_enum`](#g_enum)
- fn [`g_message`](#g_message)
- fn [`g_type`](#g_type)

## Types

### ParseErr {#ParseErr}

```xo
pub struct ParseErr {
  pub line: Int
  pub col: Int
  pub msg: Str
}
```

Where and why a parse failed; the position is 1 based.

[Source: `std/protoparse.xo:7`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L7)

#### ParseErr.display {#ParseErr.display}

```xo
pub fn (e: ParseErr) display() -> Str
```

`LINE:COL: MSG`.

[Source: `std/protoparse.xo:14`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L14)

### Kind {#Kind}

```xo
pub enum Kind {
  Ident
  Int
  Float
  Str
  Sym
}
```

A token kind: an identifier (dots allowed inside, as in `foo.Bar`), an integer, a float, a
string literal (unquoted, escapes decoded), or one symbol character.

[Source: `std/protoparse.xo:18`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L18)

### Token {#Token}

```xo
pub struct Token {
  pub kind: Kind
  pub text: Str
  pub line: Int
  pub col: Int
}
```

[Source: `std/protoparse.xo:26`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L26)

### Field {#Field}

```xo
pub struct Field {
  pub name: Str
  pub num: Int
  pub typ: Str
  pub key: Str
  pub repeated: Bool
  pub optional: Bool
  pub required: Bool
  pub oneof: Str
}
```

A field of a message. `typ` is the type as written (`int32`, `Other.Msg`); for a map it is the
value type and `key` the key type. `oneof` names the oneof it belongs to, or is empty.

[Source: `std/protoparse.xo:127`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L127)

### EnumValue {#EnumValue}

```xo
pub struct EnumValue {
  pub name: Str
  pub num: Int
}
```

[Source: `std/protoparse.xo:139`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L139)

### Enum {#Enum}

```xo
pub struct Enum {
  pub name: Str
  pub values: List[EnumValue]
}
```

[Source: `std/protoparse.xo:144`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L144)

### Message {#Message}

```xo
pub struct Message {
  pub name: Str
  pub fields: List[Field]
  pub oneofs: List[Str]
  pub nested: List[Message]
  pub enums: List[Enum]
}
```

[Source: `std/protoparse.xo:149`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L149)

### Rpc {#Rpc}

```xo
pub struct Rpc {
  pub name: Str
  pub req: Str
  pub resp: Str
  pub client_stream: Bool
  pub server_stream: Bool
}
```

[Source: `std/protoparse.xo:157`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L157)

### Service {#Service}

```xo
pub struct Service {
  pub name: Str
  pub rpcs: List[Rpc]
}
```

[Source: `std/protoparse.xo:165`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L165)

### File {#File}

```xo
pub struct File {
  pub syntax: Str
  pub package: Str
  pub imports: List[Str]
  pub messages: List[Message]
  pub enums: List[Enum]
  pub services: List[Service]
}
```

[Source: `std/protoparse.xo:170`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L170)

### P {#P}

```xo
struct P {
  ts: List[Token]
  at: Int
  proto2: Bool
}
```

[Source: `std/protoparse.xo:243`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L243)

## Functions

### tokens {#tokens}

```xo
pub fn tokens(src: Str) -> List[Token] ! ParseErr
```

The tokens of `src` without comments (`//` and `/* */`). A token never spans lines except
inside a comment.

[Source: `std/protoparse.xo:35`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L35)

### parse {#parse}

```xo
pub fn parse(src: Str) -> File ! ParseErr
```

Parses a proto3 or proto2 file. Options, `reserved`, `extensions`, field options (including
`default`) and `extend` blocks are read and dropped. In proto2 every field outside a oneof needs a
label (`required`, `optional` or `repeated`); a `group` becomes a nested message and a field of
that type named in lower case. A proto3 file rejects `required` and `group`.

[Source: `std/protoparse.xo:183`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L183)

### gen {#gen}

```xo
pub fn gen(f: File) -> Str ! ParseErr
```

Xo source for the messages, enums and oneofs of `f`, using `derive Proto` (decision 0530):
a nested type `Inner` of `Outer` becomes `OuterInner`, a oneof `kind` of `Msg` the enum
`MsgKind` held in an optional field marked `proto "oneof"`, an enum an open `Int` enum with a
catch-all `Other(v: Int)`. Fields keep their proto names. Services are not generated here.

[Source: `std/protoparse.xo:229`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L229)

### is_letter {#is_letter}

```xo
fn is_letter(c: Int) -> Bool
```

[Source: `std/protoparse.xo:239`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L239)

### is_digit {#is_digit}

```xo
fn is_digit(c: Int) -> Bool
```

[Source: `std/protoparse.xo:241`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L241)

### p_err {#p_err}

```xo
fn p_err(p: P, msg: Str) -> ParseErr
```

[Source: `std/protoparse.xo:249`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L249)

### p_peek {#p_peek}

```xo
fn p_peek(p: P) -> Str
```

[Source: `std/protoparse.xo:261`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L261)

### p_is {#p_is}

```xo
fn p_is(p: P, s: Str) -> Bool
```

[Source: `std/protoparse.xo:263`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L263)

### p_expect {#p_expect}

```xo
fn p_expect(var p: P, s: Str) ! ParseErr
```

[Source: `std/protoparse.xo:267`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L267)

### p_ident {#p_ident}

```xo
fn p_ident(var p: P) -> Str ! ParseErr
```

[Source: `std/protoparse.xo:273`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L273)

### p_type {#p_type}

```xo
fn p_type(var p: P) -> Str ! ParseErr
```

A type name, possibly starting with a dot.

[Source: `std/protoparse.xo:282`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L282)

### p_int {#p_int}

```xo
fn p_int(var p: P) -> Int ! ParseErr
```

[Source: `std/protoparse.xo:291`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L291)

### p_str {#p_str}

```xo
fn p_str(var p: P) -> Str ! ParseErr
```

[Source: `std/protoparse.xo:311`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L311)

### p_skip_stmt {#p_skip_stmt}

```xo
fn p_skip_stmt(var p: P) ! ParseErr
```

Skips tokens up to and including the next `;` outside brackets and braces.

[Source: `std/protoparse.xo:326`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L326)

### p_skip_block {#p_skip_block}

```xo
fn p_skip_block(var p: P) ! ParseErr
```

Skips an `extend NAME { ... }` block (proto3 allows extensions only to declare custom options).

[Source: `std/protoparse.xo:345`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L345)

### p_skip_opts {#p_skip_opts}

```xo
fn p_skip_opts(var p: P) ! ParseErr
```

Skips a `[ ... ]` field option list when present.

[Source: `std/protoparse.xo:368`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L368)

### p_enum {#p_enum}

```xo
fn p_enum(var p: P) -> Enum ! ParseErr
```

[Source: `std/protoparse.xo:385`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L385)

### p_field {#p_field}

```xo
fn p_field(var p: P, oneof: Str, var m: Message) -> Message ! ParseErr
```

[Source: `std/protoparse.xo:408`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L408)

### p_message {#p_message}

```xo
fn p_message(var p: P) -> Message ! ParseErr
```

[Source: `std/protoparse.xo:463`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L463)

### p_message_body {#p_message_body}

```xo
fn p_message_body(var p: P, name: Str) -> Message ! ParseErr
```

[Source: `std/protoparse.xo:468`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L468)

### p_service {#p_service}

```xo
fn p_service(var p: P) -> Service ! ParseErr
```

[Source: `std/protoparse.xo:508`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L508)

### g_camel {#g_camel}

```xo
fn g_camel(s: Str) -> Str
```

[Source: `std/protoparse.xo:560`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L560)

### g_scalar {#g_scalar}

```xo
fn g_scalar(t: Str) -> (Str, Str)?
```

The Xo type name of a scalar proto type, with the field option it needs.

[Source: `std/protoparse.xo:570`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L570)

### g_collect {#g_collect}

```xo
fn g_collect(prefix_dot: Str, prefix_gen: Str, m: Message, out: List[(Str, Str)]) -> List[(Str, Str)]
```

Every type name declared in the file as (full dotted name inside the package, generated name).

[Source: `std/protoparse.xo:592`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L592)

### g_resolve {#g_resolve}

```xo
fn g_resolve(typ: Str, scope: Str, names: List[(Str, Str)]) -> Str?
```

Resolves a type name used in the scope `scope` (the dotted name of the enclosing message)
the way protoc does: the innermost scope that declares the first component wins.

[Source: `std/protoparse.xo:604`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L604)

### g_enum {#g_enum}

```xo
fn g_enum(e: Enum, gname: Str, out: List[Str]) -> List[Str]
```

[Source: `std/protoparse.xo:622`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L622)

### g_message {#g_message}

```xo
fn g_message(m: Message, scope: Str, gprefix: Str, names: List[(Str, Str)], out: List[Str]) -> List[Str] ! ParseErr
```

[Source: `std/protoparse.xo:638`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L638)

### g_type {#g_type}

```xo
fn g_type(typ: Str, scope: Str, names: List[(Str, Str)]) -> (Str, Str) ! ParseErr
```

[Source: `std/protoparse.xo:682`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L682)
