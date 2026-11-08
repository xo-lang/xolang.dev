---
title: "std/protoparse"
linkTitle: "protoparse"
description: "std/protoparse (decision 0530): a parser for `.proto` files (proto3), for `xo proto gen`."
toc: true
module: "std/protoparse"
source: "https://github.com/xo-lang/xo/blob/main/std/protoparse.xo"
generated: "scripts/sync-content.py from `xo doc std/protoparse`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`ParseErr`](#parseerr)
- type [`Kind`](#kind)
- type [`Token`](#token)
- type [`Field`](#field)
- type [`EnumValue`](#enumvalue)
- type [`Enum`](#enum)
- type [`Message`](#message)
- type [`Rpc`](#rpc)
- type [`Service`](#service)
- type [`File`](#file)
- fn [`tokens`](#tokens)
- fn [`parse`](#parse)
- fn [`gen`](#gen)

## Types

### ParseErr

```xo
struct ParseErr {
  line: Int
  col: Int
  msg: Str
} derive Display
```

Where and why a parse failed; the position is 1 based.

[Source: `std/protoparse.xo:5`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L5)

### Kind

```xo
enum Kind {
  Ident
  Int
  Float
  Str
  Sym
}
```

A token kind: an identifier (dots allowed inside, as in `foo.Bar`), an integer, a float, a
string literal (unquoted, escapes decoded), or one symbol character.

[Source: `std/protoparse.xo:13`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L13)

### Token

```xo
struct Token {
  kind: Kind
  text: Str
  line: Int
  col: Int
}
```

[Source: `std/protoparse.xo:21`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L21)

### Field

```xo
struct Field {
  name: Str
  num: Int
  typ: Str
  key: Str
  repeated: Bool
  optional: Bool
  required: Bool
  oneof: Str
}
```

A field of a message. `typ` is the type as written (`int32`, `Other.Msg`); for a map it is the
value type and `key` the key type. `oneof` names the oneof it belongs to, or is empty.

[Source: `std/protoparse.xo:34`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L34)

### EnumValue

```xo
struct EnumValue {
  name: Str
  num: Int
}
```

[Source: `std/protoparse.xo:46`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L46)

### Enum

```xo
struct Enum {
  name: Str
  values: List[EnumValue]
}
```

[Source: `std/protoparse.xo:51`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L51)

### Message

```xo
struct Message {
  name: Str
  fields: List[Field]
  oneofs: List[Str]
  nested: List[Message]
  enums: List[Enum]
}
```

[Source: `std/protoparse.xo:56`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L56)

### Rpc

```xo
struct Rpc {
  name: Str
  req: Str
  resp: Str
  client_stream: Bool
  server_stream: Bool
}
```

[Source: `std/protoparse.xo:64`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L64)

### Service

```xo
struct Service {
  name: Str
  rpcs: List[Rpc]
}
```

[Source: `std/protoparse.xo:72`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L72)

### File

```xo
struct File {
  syntax: Str
  package: Str
  imports: List[Str]
  messages: List[Message]
  enums: List[Enum]
  services: List[Service]
}
```

[Source: `std/protoparse.xo:77`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L77)

## Functions

### tokens

```xo
fn tokens(src: Str) -> List[Token] ! ParseErr
```

The tokens of `src` without comments (`//` and `/* */`). A token never spans lines except
inside a comment.

[Source: `std/protoparse.xo:30`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L30)

### parse

```xo
fn parse(src: Str) -> File ! ParseErr
```

Parses a proto3 or proto2 file. Options, `reserved`, `extensions`, field options (including
`default`) and `extend` blocks are read and dropped. In proto2 every field outside a oneof needs a
label (`required`, `optional` or `repeated`); a `group` becomes a nested message and a field of
that type named in lower case. A proto3 file rejects `required` and `group`.

[Source: `std/protoparse.xo:90`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L90)

### gen

```xo
fn gen(f: File) -> Str ! ParseErr
```

Xo source for the messages, enums and oneofs of `f`, using `derive Proto` (decision 0530):
a nested type `Inner` of `Outer` becomes `OuterInner`, a oneof `kind` of `Msg` the enum
`MsgKind` held in an optional field marked `proto "oneof"`, an enum an open `Int` enum with a
catch-all `Other(v: Int)`. Fields keep their proto names. Services are not generated here.

[Source: `std/protoparse.xo:96`](https://github.com/xo-lang/xo/blob/main/std/protoparse.xo#L96)
