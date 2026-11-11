---
title: "std/toml"
linkTitle: "toml"
description: "TOML 1.0 configuration files decoded into the same types as JSON (`derive Json`, std.md 5): a tab..."
toc: true
module: "std/toml"
source: "https://github.com/xo-lang/xo/blob/main/std/toml.xo"
generated: "scripts/sync-content.py from `xo doc std/toml`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`TomlErr`](#TomlErr)
  - method [`TomlErr.display`](#TomlErr.display)
- type [`DecodeErr`](#DecodeErr)
  - method [`DecodeErr.display`](#DecodeErr.display)
- fn [`decode`](#decode)
- fn [`to_json`](#to_json)
- fn [`encode`](#encode)

## Types

### TomlErr {#TomlErr}

```xo
struct TomlErr {
  line: Int
  msg: Str
}
```

Displays as `toml: line 3: expected a value after =`; an encode error
has line 0 and displays as `toml: msg`.

[Source: `std/toml.xo:10`](https://github.com/xo-lang/xo/blob/main/std/toml.xo#L10)

#### TomlErr.display {#TomlErr.display}

```xo
fn (e: TomlErr) display() -> Str
```

[Source: `std/toml.xo:15`](https://github.com/xo-lang/xo/blob/main/std/toml.xo#L15)

### DecodeErr {#DecodeErr}

```xo
enum DecodeErr {
  Syntax(err: TomlErr)
  Value(err: json.DecodeErr)
}
```

Why decode failed: the text is not TOML, or its values do not fit T.

[Source: `std/toml.xo:34`](https://github.com/xo-lang/xo/blob/main/std/toml.xo#L34)

#### DecodeErr.display {#DecodeErr.display}

```xo
fn (e: DecodeErr) display() -> Str
```

[Source: `std/toml.xo:39`](https://github.com/xo-lang/xo/blob/main/std/toml.xo#L39)

## Functions

### decode {#decode}

```xo
fn decode[T: Json](text: Str) -> T ! DecodeErr
```

The document decoded into T by the rules of json.decode; a document
that is not valid TOML is TomlErr.

[Source: `std/toml.xo:19`](https://github.com/xo-lang/xo/blob/main/std/toml.xo#L19)

### to_json {#to_json}

```xo
fn to_json(text: Str) -> Str ! TomlErr
```

The document as JSON text, its keys in document order.

[Source: `std/toml.xo:21`](https://github.com/xo-lang/xo/blob/main/std/toml.xo#L21)

### encode {#encode}

```xo
fn encode[T: Json](v: T) -> Str ! TomlErr
```

v as a TOML document, laid out as pelletier/go-toml/v2's Marshal: a
table's plain keys first, then its tables (`[a.b]`, a blank line
before each) and arrays of tables (`[[a]]`) in field order; strings as
literal strings ('...') when they can be, else basic strings with
Go's escapes; an array of values or mixed values inline. v goes
through json.to_value, so a None field is left out, Time and Duration
are their JSON strings, and a Float with no fraction is an integer
(decode reads each back). TomlErr (line 0) when v is not a record or
map, or an array holds a None.

[Source: `std/toml.xo:31`](https://github.com/xo-lang/xo/blob/main/std/toml.xo#L31)
