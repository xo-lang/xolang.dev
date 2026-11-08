---
title: "std/cbor"
linkTitle: "cbor"
description: "RFC 8949 CBOR over a Value tree that holds the whole data model: encode with the preferred serial..."
toc: true
module: "std/cbor"
source: "https://github.com/xo-lang/xo/blob/main/std/cbor.xo"
generated: "scripts/sync-content.py from `xo doc std/cbor`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Value`](#value)
  - method [`Value.to_int`](#valueto_int)
  - method [`Value.get`](#valueget)
  - method [`Value.diagnostic`](#valuediagnostic)
  - method [`Value.to_json`](#valueto_json)
- type [`CborErr`](#cborerr)
  - method [`CborErr.display`](#cborerrdisplay)
- type [`Unm`](#unm)
- fn [`from_int`](#from_int)
- fn [`encode`](#encode)
- fn [`decode`](#decode)
- fn [`decode_prefix`](#decode_prefix)
- fn [`well_formed`](#well_formed)
- fn [`from_json`](#from_json)
- fn [`marshal`](#marshal)
- fn [`unmarshal`](#unmarshal)
- fn [`unmarshal_prefix`](#unmarshal_prefix)
- fn [`unm_new`](#unm_new)
- fn [`dec_error`](#dec_error)
- fn [`is_null`](#is_null)
- fn [`to_str`](#to_str)
- fn [`to_int`](#to_int)
- fn [`to_float`](#to_float)
- fn [`to_bool`](#to_bool)
- fn [`to_bytes`](#to_bytes)
- fn [`items`](#items)
- fn [`pairs`](#pairs)
- fn [`key_text`](#key_text)
- fn [`key_int`](#key_int)
- fn [`unknown_key`](#unknown_key)
- fn [`sorted_keys`](#sorted_keys)
- fn [`to_value`](#to_value)
- fn [`from_value`](#from_value)
- fn [`to_time`](#to_time)
- fn [`to_duration`](#to_duration)
- fn [`from_time`](#from_time)
- fn [`from_duration`](#from_duration)
- fn [`put_head`](#put_head)
- fn [`put_int`](#put_int)
- fn [`put_float`](#put_float)
- fn [`put_text`](#put_text)
- fn [`put_bytes`](#put_bytes)
- fn [`put_value`](#put_value)
- fn [`det_keys`](#det_keys)
- fn [`bad_arity`](#bad_arity)
- fn [`bad_variant`](#bad_variant)

## Types

### Value

```xo
enum Value {
  Uint(n: UInt64)
  Nint(n: UInt64)
  ByteString(b: Bytes)
  TextString(s: Str)
  Array(items: List[Value])
  Map(pairs: List[(Value, Value)])
  Tag(num: UInt64, v: Value)
  Simple(n: Int)
  Bool(b: Bool)
  Null
  Undefined
  Float(f: Float)
}
```

A CBOR data item. Integers keep the full range of the format: `Uint(n)`
is n (0 to 2^64-1) and `Nint(n)` is -1-n (-1 down to -2^64), so
`Nint(0)` is -1. A map keeps its pairs in order, with any key. `Simple(n)`
is a simple value other than false, true, null and undefined (n is 0 to
19 or 32 to 255). A decoded half, single or double float is a `Float`;
`encode` writes the shortest of the three that holds the value.

[Source: `std/cbor.xo:15`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L15)

#### Value.to_int

```xo
fn (v: Value) to_int() -> Int?
```

The Int an item holds: Uint or Nint within Int's range; None for any
other item or a value past Int.

[Source: `std/cbor.xo:56`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L56)

#### Value.get

```xo
fn (v: Value) get(key: Str) -> Value?
```

The value in a map with a text key; None for a missing key or a value
that is not a map.

[Source: `std/cbor.xo:60`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L60)

#### Value.diagnostic

```xo
fn (v: Value) diagnostic() -> Str
```

RFC 8949 Section 8: integers in decimal, byte strings as h'0102', text in
double quotes with JSON escapes (non ASCII as \uXXXX), arrays `[1, 2]`,
maps `{1: 2}`, tags `N(item)`, `simple(N)`, `true`, `false`, `null`,
`undefined`, and floats with a decimal point or exponent (`1.0`, `1.5e+300`,
`NaN`, `Infinity`, `-Infinity`; ES6 number text). An indefinite length item
is written as its definite value.

[Source: `std/cbor.xo:88`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L88)

#### Value.to_json

```xo
fn (v: Value) to_json() -> json.Value ! CborErr
```

RFC 8949 Section 6.2, the item as JSON: integers and floats as numbers
(a float without a fraction stays a float; a Nint or Uint past Int is
a number text through Float), byte strings as base64url text without
padding, text as text, `Null` and `Undefined` as null, `true` and `false`,
arrays, maps with text, integer, float, bool or null keys as objects (the
key's text), tags dropped (their content kept), `Simple(n)` as the text
`simple(n)`. NaN and infinity are `Invalid`, as is a map key that is
not one of those kinds.

[Source: `std/cbor.xo:98`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L98)

### CborErr

```xo
enum CborErr {
  Truncated
  Syntax(msg: Str)
  Invalid(msg: Str)
  Limit(msg: Str)
  Type(msg: Str)
}
```

`Truncated`: the data ends inside an item. `Syntax`: not well formed
(a reserved additional information, a break outside an indefinite item,
an indefinite string with a chunk of another kind or an indefinite
chunk, an odd number of items in an indefinite map, a simple value below
32 written in two bytes). `Invalid`: well formed but refused (text that
is not UTF-8, a repeated map key when `reject_dup_keys` is set, data after
the item, a `Simple` or float that cannot be written). `Limit`: more
nesting than max_depth, or an item larger than the data.

[Source: `std/cbor.xo:38`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L38)

#### CborErr.display

```xo
fn (e: CborErr) display() -> Str
```

[Source: `std/cbor.xo:48`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L48)

### Unm

```xo
struct Unm {
  strict: Bool
  err: CborErr?
}
```

The state of one `unmarshal`: the first type mismatch is kept and the
decode goes on (fxamacker's UnmarshalTypeError); `strict` makes a map
key no field names an error.

[Source: `std/cbor.xo:110`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L110)

## Functions

### from_int

```xo
fn from_int(n: Int) -> Value
```

The value of `n` as an Int-valued item: `Uint(n)` for n >= 0, `Nint(-1-n)`
below.

[Source: `std/cbor.xo:52`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L52)

### encode

```xo
fn encode(v: Value, deterministic: Bool = false) -> Bytes ! CborErr
```

Encodes v with the preferred serialization (shortest integer heads, the
shortest float that holds the value, definite lengths). With
`deterministic` (RFC 8949 Section 4.2.1) the pairs of every map are
sorted bytewise by the encoding of the key. `Invalid` for a `Simple`
that is not 0 to 19 or 32 to 255.

[Source: `std/cbor.xo:67`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L67)

### decode

```xo
fn decode(data: Bytes, max_depth: Int = 128, reject_dup_keys: Bool = false) -> Value ! CborErr
```

One data item; nothing may follow it. `max_depth` bounds the nesting of
arrays, maps and tags; with `reject_dup_keys` a map with a repeated key
is `Invalid`.

[Source: `std/cbor.xo:72`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L72)

### decode_prefix

```xo
fn decode_prefix(data: Bytes, max_depth: Int = 128, reject_dup_keys: Bool = false) -> (Value, Int) ! CborErr
```

The first item of data and the number of bytes it takes; what follows is
left for the caller (a CBOR sequence, RFC 8742).

[Source: `std/cbor.xo:76`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L76)

### well_formed

```xo
fn well_formed(data: Bytes, max_depth: Int = 128) -> Bool
```

Whether data is exactly one well formed item (no UTF-8 or duplicate key
check), as RFC 8949 Section 5.3.1 defines it.

[Source: `std/cbor.xo:80`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L80)

### from_json

```xo
fn from_json(j: json.Value) -> Value
```

RFC 8949 Section 6.1, the JSON value as an item: Null, Bool, Int as Uint
or Nint, Num as Float, Str as TextString, List as Array, Object as Map
with text keys. A `Trusted` value is its text.

[Source: `std/cbor.xo:103`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L103)

### marshal

```xo
fn marshal[T: Cbor](v: T, deterministic: Bool = true) -> Bytes ! CborErr
```

Decoded into a struct that derives Cbor, by the types of its fields.
The call is compiled as a call of the function `derive Cbor` generates
for T. `deterministic` sorts map keys (section 4.2.1).

[Source: `std/cbor.xo:118`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L118)

### unmarshal

```xo
fn unmarshal[T: Cbor](data: Bytes, strict: Bool = false, max_depth: Int = 128) -> T ! CborErr
```

`data` (exactly one item) decoded into T.

[Source: `std/cbor.xo:121`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L121)

### unmarshal_prefix

```xo
fn unmarshal_prefix[T: Cbor](data: Bytes, strict: Bool = false, max_depth: Int = 128) -> (T, Int) ! CborErr
```

The first item of `data` decoded into T, and the bytes it used.

[Source: `std/cbor.xo:124`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L124)

### unm_new

```xo
fn unm_new(strict: Bool) -> Unm
```

[Source: `std/cbor.xo:127`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L127)

### dec_error

```xo
fn dec_error(st: Unm) -> CborErr?
```

[Source: `std/cbor.xo:128`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L128)

### is_null

```xo
fn is_null(v: Value) -> Bool
```

[Source: `std/cbor.xo:129`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L129)

### to_str

```xo
fn to_str(v: Value, var st: Unm) -> (Bool, Str)
```

[Source: `std/cbor.xo:130`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L130)

### to_int

```xo
fn to_int(v: Value, var st: Unm) -> (Bool, Int)
```

[Source: `std/cbor.xo:131`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L131)

### to_float

```xo
fn to_float(v: Value, var st: Unm) -> (Bool, Float)
```

[Source: `std/cbor.xo:132`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L132)

### to_bool

```xo
fn to_bool(v: Value, var st: Unm) -> (Bool, Bool)
```

[Source: `std/cbor.xo:133`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L133)

### to_bytes

```xo
fn to_bytes(v: Value, var st: Unm) -> (Bool, Bytes)
```

[Source: `std/cbor.xo:134`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L134)

### items

```xo
fn items(v: Value, want: Str, var st: Unm) -> (Bool, List[Value])
```

[Source: `std/cbor.xo:135`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L135)

### pairs

```xo
fn pairs(v: Value, want: Str, var st: Unm) -> (Bool, List[(Value, Value)])
```

[Source: `std/cbor.xo:136`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L136)

### key_text

```xo
fn key_text(k: Value) -> Str?
```

[Source: `std/cbor.xo:137`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L137)

### key_int

```xo
fn key_int(k: Value) -> Int?
```

[Source: `std/cbor.xo:138`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L138)

### unknown_key

```xo
fn unknown_key(var st: Unm, want: Str, k: Value)
```

[Source: `std/cbor.xo:139`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L139)

### sorted_keys

```xo
fn sorted_keys(keys: List[Str]) -> List[Str]
```

[Source: `std/cbor.xo:140`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L140)

### to_value

```xo
fn to_value(v: Value, var st: Unm) -> (Bool, Value)
```

[Source: `std/cbor.xo:141`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L141)

### from_value

```xo
fn from_value(v: Value) -> Value
```

[Source: `std/cbor.xo:142`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L142)

### to_time

```xo
fn to_time(v: Value, var st: Unm) -> (Bool, Time)
```

[Source: `std/cbor.xo:143`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L143)

### to_duration

```xo
fn to_duration(v: Value, var st: Unm) -> (Bool, Duration)
```

[Source: `std/cbor.xo:144`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L144)

### from_time

```xo
fn from_time(t: Time) -> Value
```

[Source: `std/cbor.xo:145`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L145)

### from_duration

```xo
fn from_duration(d: Duration) -> Value
```

[Source: `std/cbor.xo:146`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L146)

### put_head

```xo
fn put_head(var out: BytesBuilder, major: Int, n: Int)
```

[Source: `std/cbor.xo:149`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L149)

### put_int

```xo
fn put_int(var out: BytesBuilder, n: Int)
```

[Source: `std/cbor.xo:150`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L150)

### put_float

```xo
fn put_float(var out: BytesBuilder, f: Float)
```

[Source: `std/cbor.xo:151`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L151)

### put_text

```xo
fn put_text(var out: BytesBuilder, s: Str)
```

[Source: `std/cbor.xo:152`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L152)

### put_bytes

```xo
fn put_bytes(var out: BytesBuilder, b: Bytes)
```

[Source: `std/cbor.xo:153`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L153)

### put_value

```xo
fn put_value(var out: BytesBuilder, v: Value, deterministic: Bool) -> () ! CborErr
```

[Source: `std/cbor.xo:154`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L154)

### det_keys

```xo
fn det_keys(keys: List[Str]) -> List[Str]
```

[Source: `std/cbor.xo:155`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L155)

### bad_arity

```xo
fn bad_arity(var st: Unm, want: Str, got: Int, need: Int)
```

[Source: `std/cbor.xo:156`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L156)

### bad_variant

```xo
fn bad_variant(var st: Unm, want: Str, got: Str)
```

[Source: `std/cbor.xo:157`](https://github.com/xo-lang/xo/blob/main/std/cbor.xo#L157)
