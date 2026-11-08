---
title: "std/json"
linkTitle: "json"
description: "Which types implement `Json` is builtin to the checker (std.md 5 table): scalars, Str, Bytes, Dur..."
toc: true
module: "std/json"
source: "https://github.com/xo-lang/xo/blob/main/std/json.xo"
generated: "scripts/sync-content.py from `xo doc std/json`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`DecodeErr`](#decodeerr)
- type [`Patch`](#patch)
  - method [`Patch.apply_to`](#patchapply_to)
  - method [`Patch.apply_opt`](#patchapply_opt)
- type [`Value`](#value)
  - method [`Value.encode`](#valueencode)
  - method [`Value.get`](#valueget)
- type [`Decoder`](#decoder)
  - method [`Decoder.write`](#decoderwrite)
  - method [`Decoder.finish`](#decoderfinish)
- type [`Token`](#token)
- type [`TokenReader`](#tokenreader)
  - method [`TokenReader.write`](#tokenreaderwrite)
  - method [`TokenReader.finish`](#tokenreaderfinish)
  - method [`TokenReader.next`](#tokenreadernext)
  - method [`TokenReader.more`](#tokenreadermore)
  - method [`TokenReader.offset`](#tokenreaderoffset)
  - method [`TokenReader.skip`](#tokenreaderskip)
  - method [`TokenReader.value`](#tokenreadervalue)
- type [`JsonWriter`](#jsonwriter)
  - method [`JsonWriter.object_start`](#jsonwriterobject_start)
  - method [`JsonWriter.object_end`](#jsonwriterobject_end)
  - method [`JsonWriter.array_start`](#jsonwriterarray_start)
  - method [`JsonWriter.array_end`](#jsonwriterarray_end)
  - method [`JsonWriter.key`](#jsonwriterkey)
  - method [`JsonWriter.str`](#jsonwriterstr)
  - method [`JsonWriter.int`](#jsonwriterint)
  - method [`JsonWriter.float`](#jsonwriterfloat)
  - method [`JsonWriter.number`](#jsonwriternumber)
  - method [`JsonWriter.bool`](#jsonwriterbool)
  - method [`JsonWriter.null`](#jsonwriternull)
  - method [`JsonWriter.raw`](#jsonwriterraw)
  - method [`JsonWriter.value`](#jsonwritervalue)
  - method [`JsonWriter.finish`](#jsonwriterfinish)
- fn [`encode`](#encode)
- fn [`encode_str`](#encode_str)
- fn [`encode_indent`](#encode_indent)
- fn [`encode_indent_str`](#encode_indent_str)
- fn [`indent`](#indent)
- fn [`compact`](#compact)
- fn [`decode`](#decode)
- fn [`decode_str`](#decode_str)
- fn [`to_value`](#to_value)
- fn [`parse_value`](#parse_value)
- fn [`decoder`](#decoder)
- fn [`from_value`](#from_value)
- fn [`token_reader`](#token_reader)
- fn [`tokens`](#tokens)
- fn [`json_writer`](#json_writer)

## Types

### DecodeErr

```xo
struct DecodeErr {
  path: Str
  msg: Str
} derive Display
```

Displays as "at $.user.email: expected string".

[Source: `std/json.xo:22`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L22)

### Patch

```xo
enum Patch[T] {
  Absent
  Null
  Value(v: T)
} derive Json
```

[Source: `std/json.xo:30`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L30)

#### Patch.apply_to

```xo
fn (p: Patch[T]) apply_to(current: T) -> T
```

[Source: `std/json.xo:27`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L27)

#### Patch.apply_opt

```xo
fn (p: Patch[T]) apply_opt(current: T?) -> T?
```

[Source: `std/json.xo:28`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L28)

### Value

```xo
enum Value {
  Null
  Bool(b: Bool)
  Int(n: Int)
  Num(n: Float)
  Str(s: Str)
  List(items: List[Value])
  Object(fields: List[(Str, Value)])
  Trusted(kind: Str, s: Str)
}
```

A JSON value of any shape (decision 0299; Go's decoding into `any`):
an object keeps its keys in the order of the text (each key once, at
its first position, with its last value, as `decode` reads objects),
and a number without a fraction or exponent that fits an Int is `Int`,
any other number `Num`.

[Source: `std/json.xo:41`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L41)

#### Value.encode

```xo
fn (v: Value) encode() -> Str
```

The JSON text of v, as `encode` writes its parts (strings escaped,
numbers, objects in their order).

[Source: `std/json.xo:64`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L64)

#### Value.get

```xo
fn (v: Value) get(key: Str) -> Value?
```

The value of an object's field key; None for a missing key or a value
that is not an object.

[Source: `std/json.xo:67`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L67)

### Decoder

```xo
struct Decoder {}
```

A streaming decoder of a sequence of JSON values (Go's json.Decoder,
decision 0309): bytes in, the values completed so far out; push style,
no I/O of its own.
@move_only

[Source: `std/json.xo:73`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L73)

#### Decoder.write

```xo
fn (var d: Decoder) write(data: Bytes) -> List[Value] ! DecodeErr
```

The values the input so far completes (a number at the very end waits
for what follows it).

[Source: `std/json.xo:79`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L79)

#### Decoder.finish

```xo
fn (var d: Decoder) finish() -> List[Value] ! DecodeErr
```

The rest; a value that did not end is `invalid JSON: unexpected EOF`.
@moves

[Source: `std/json.xo:82`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L82)

### Token

```xo
enum Token {
  ObjectStart
  ObjectEnd
  ArrayStart
  ArrayEnd
  Key(s: Str)
  Str(s: Str)
  Number(text: Str)
  Bool(b: Bool)
  Null
}
```

One token of a JSON text (decision 0495; Go's Decoder.Token). An object
member's name is `Key`; a number keeps its text as written.

[Source: `std/json.xo:88`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L88)

### TokenReader

```xo
struct TokenReader {}
```

A token at a time reader of a sequence of JSON values (Go's
Decoder.Token, decision 0495): pull style over bytes already in memory
(`tokens`), or push style (`write`), no I/O of its own. Strings are
unescaped as `decode` does (invalid UTF-8 and lone surrogate escapes
become U+FFFD); errors are `DecodeErr` at `$` with `decode`'s texts.
@move_only

[Source: `std/json.xo:106`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L106)

#### TokenReader.write

```xo
fn (var r: TokenReader) write(data: Bytes) -> List[Token] ! DecodeErr
```

The tokens the input so far completes (a number at the very end waits
for what follows it).

[Source: `std/json.xo:116`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L116)

#### TokenReader.finish

```xo
fn (var r: TokenReader) finish() -> List[Token] ! DecodeErr
```

The rest; input that ends inside an array, an object or a token is
`invalid JSON: unexpected EOF`. An error found after the tokens it
returns is the next call's (of `finish` or `next`).

[Source: `std/json.xo:120`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L120)

#### TokenReader.next

```xo
fn (var r: TokenReader) next() -> Token? ! DecodeErr
```

The next token; None at the end of the input (or, in push style, when
the next token is not complete yet).

[Source: `std/json.xo:123`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L123)

#### TokenReader.more

```xo
fn (var r: TokenReader) more() -> Bool
```

Go's Decoder.More: another element or member follows in the current
array or object (false at the end of the input).

[Source: `std/json.xo:126`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L126)

#### TokenReader.offset

```xo
fn (r: TokenReader) offset() -> Int
```

Go's Decoder.InputOffset: the byte offset after the last token.

[Source: `std/json.xo:128`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L128)

#### TokenReader.skip

```xo
fn (var r: TokenReader) skip() -> () ! DecodeErr
```

Skips the value that starts at the next token: a scalar, or an array or
object through its end.

[Source: `std/json.xo:131`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L131)

#### TokenReader.value

```xo
fn (var r: TokenReader) value() -> Value ! DecodeErr
```

The value that starts at the next token, as `parse_value` reads it.

[Source: `std/json.xo:133`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L133)

### JsonWriter

```xo
struct JsonWriter {}
```

A writer of one JSON text a token at a time (decision 0495), in
encoding/json's forms: strings escape `"`, `\`, control characters,
U+2028 and U+2029 and invalid UTF-8 as `encode` does, and `<`, `>`, `&`
as `<`, `>`, `&` when escape_html; numbers are the
shortest form of Go's floatEncoder. Commas and colons are inserted. A
call out of order (a value where a key is due, an unclosed array at
`finish`) faults: it is a bug in the caller.
@move_only

[Source: `std/json.xo:143`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L143)

#### JsonWriter.object_start

```xo
fn (var w: JsonWriter) object_start()
```

[Source: `std/json.xo:146`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L146)

#### JsonWriter.object_end

```xo
fn (var w: JsonWriter) object_end()
```

[Source: `std/json.xo:147`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L147)

#### JsonWriter.array_start

```xo
fn (var w: JsonWriter) array_start()
```

[Source: `std/json.xo:148`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L148)

#### JsonWriter.array_end

```xo
fn (var w: JsonWriter) array_end()
```

[Source: `std/json.xo:149`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L149)

#### JsonWriter.key

```xo
fn (var w: JsonWriter) key(name: Str)
```

[Source: `std/json.xo:150`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L150)

#### JsonWriter.str

```xo
fn (var w: JsonWriter) str(s: Str)
```

[Source: `std/json.xo:151`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L151)

#### JsonWriter.int

```xo
fn (var w: JsonWriter) int(n: Int)
```

[Source: `std/json.xo:152`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L152)

#### JsonWriter.float

```xo
fn (var w: JsonWriter) float(f: Float) -> () ! DecodeErr
```

NaN and infinities are refused (Go's UnsupportedValueError).

[Source: `std/json.xo:154`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L154)

#### JsonWriter.number

```xo
fn (var w: JsonWriter) number(text: Str) -> () ! DecodeErr
```

A number as written, checked against the JSON grammar.

[Source: `std/json.xo:156`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L156)

#### JsonWriter.bool

```xo
fn (var w: JsonWriter) bool(b: Bool)
```

[Source: `std/json.xo:157`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L157)

#### JsonWriter.null

```xo
fn (var w: JsonWriter) null()
```

[Source: `std/json.xo:158`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L158)

#### JsonWriter.raw

```xo
fn (var w: JsonWriter) raw(text: Str) -> () ! DecodeErr
```

Go's RawMessage: a JSON text, written compacted.

[Source: `std/json.xo:160`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L160)

#### JsonWriter.value

```xo
fn (var w: JsonWriter) value(v: Value) -> () ! DecodeErr
```

A Value, token by token (a Num that is NaN or infinite is refused).

[Source: `std/json.xo:162`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L162)

#### JsonWriter.finish

```xo
fn (var w: JsonWriter) finish() -> Bytes
```

The text written; every array and object must be closed. Values
written at the top level are separated by a newline (Go's Encoder).
@moves

[Source: `std/json.xo:166`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L166)

## Functions

### encode

```xo
fn encode[T: Json](v: T) -> Bytes
```

[Source: `std/json.xo:6`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L6)

### encode_str

```xo
fn encode_str[T: Json](v: T) -> Str
```

[Source: `std/json.xo:7`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L7)

### encode_indent

```xo
fn encode_indent[T: Json](v: T, prefix: Str = "", indent: Str = "  ") -> Bytes
```

Go's MarshalIndent: `encode` then `indent` (each element on its own
line, prefixed by prefix and one indent per level; `{}` and `[]` stay
as they are).

[Source: `std/json.xo:11`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L11)

### encode_indent_str

```xo
fn encode_indent_str[T: Json](v: T, prefix: Str = "", indent: Str = "  ") -> Str
```

[Source: `std/json.xo:12`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L12)

### indent

```xo
fn indent(text: Str, prefix: Str = "", indent: Str = "  ") -> Str ! DecodeErr
```

Go's Indent over a JSON text: numbers and strings keep their spelling;
a text that is not JSON is the DecodeErr of `parse_value`.

[Source: `std/json.xo:15`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L15)

### compact

```xo
fn compact(text: Str) -> Str ! DecodeErr
```

Go's Compact: the text with its insignificant whitespace removed.

[Source: `std/json.xo:17`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L17)

### decode

```xo
fn decode[T: Json](data: Bytes) -> T ! DecodeErr
```

[Source: `std/json.xo:18`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L18)

### decode_str

```xo
fn decode_str[T: Json](s: Str) -> T ! DecodeErr
```

[Source: `std/json.xo:19`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L19)

### to_value

```xo
fn to_value[T: Json](v: T) -> Value
```

The value of v's JSON encoding (`encode`): field names are its JSON
names (`derive Json(case:)`, decision 0277).

[Source: `std/json.xo:59`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L59)

### parse_value

```xo
fn parse_value(text: Str) -> Value ! DecodeErr
```

The value of a JSON text; `DecodeErr` at `$` with `decode`'s texts.

[Source: `std/json.xo:61`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L61)

### decoder

```xo
fn decoder(max_value: Int = 67108864) -> Decoder
```

One value may be at most max_value bytes.

[Source: `std/json.xo:76`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L76)

### from_value

```xo
fn from_value[T: Json](v: Value) -> T ! DecodeErr
```

The typed value of v, as decode reads it from v's text.

[Source: `std/json.xo:84`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L84)

### token_reader

```xo
fn token_reader(max_token: Int = 67108864) -> TokenReader
```

One token may be at most max_token bytes (a string or number waiting
for the rest of its text in push style).

[Source: `std/json.xo:110`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L110)

### tokens

```xo
fn tokens(data: Bytes) -> TokenReader
```

A reader over a whole text: `next` gives its tokens; the empty text and
white space give None at once.

[Source: `std/json.xo:113`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L113)

### json_writer

```xo
fn json_writer(escape_html: Bool = true) -> JsonWriter
```

[Source: `std/json.xo:145`](https://github.com/xo-lang/xo/blob/main/std/json.xo#L145)
