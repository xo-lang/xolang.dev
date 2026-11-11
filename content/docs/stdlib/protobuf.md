---
title: "std/protobuf"
linkTitle: "protobuf"
description: "std/protobuf (decision 0530): the Protocol Buffers wire format, as Go's google.golang.org/protobu..."
toc: true
module: "std/protobuf"
source: "https://github.com/xo-lang/xo/blob/main/std/protobuf.xo"
generated: "scripts/sync-content.py from `xo doc std/protobuf`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`VARINT`](#VARINT)
- const [`FIXED64`](#FIXED64)
- const [`BYTES`](#BYTES)
- const [`START_GROUP`](#START_GROUP)
- const [`END_GROUP`](#END_GROUP)
- const [`FIXED32`](#FIXED32)
- const [`MAX_GROUP_DEPTH`](#MAX_GROUP_DEPTH)
- type [`ProtoErr`](#ProtoErr)
- fn [`append_varint`](#append_varint)
- fn [`append_tag`](#append_tag)
- fn [`append_fixed32`](#append_fixed32)
- fn [`append_fixed64`](#append_fixed64)
- fn [`append_bytes`](#append_bytes)
- fn [`put_varint`](#put_varint)
- fn [`put_tag`](#put_tag)
- fn [`put_fixed32`](#put_fixed32)
- fn [`put_fixed64`](#put_fixed64)
- fn [`put_bytes`](#put_bytes)
- fn [`size_varint`](#size_varint)
- fn [`encode_zigzag`](#encode_zigzag)
- fn [`decode_zigzag`](#decode_zigzag)
- fn [`read_varint`](#read_varint)
- fn [`read_tag`](#read_tag)
- fn [`read_fixed32`](#read_fixed32)
- fn [`read_fixed64`](#read_fixed64)
- fn [`read_bytes`](#read_bytes)
- fn [`skip_field`](#skip_field)
- fn [`marshal`](#marshal)
- fn [`unmarshal`](#unmarshal)

## Constants

### VARINT {#VARINT}

```xo
const VARINT: Int = 0
```

A field's wire type (the low three bits of its tag).

[Source: `std/protobuf.xo:5`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L5)

### FIXED64 {#FIXED64}

```xo
const FIXED64: Int = 1
```

[Source: `std/protobuf.xo:6`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L6)

### BYTES {#BYTES}

```xo
const BYTES: Int = 2
```

[Source: `std/protobuf.xo:7`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L7)

### START_GROUP {#START_GROUP}

```xo
const START_GROUP: Int = 3
```

[Source: `std/protobuf.xo:8`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L8)

### END_GROUP {#END_GROUP}

```xo
const END_GROUP: Int = 4
```

[Source: `std/protobuf.xo:9`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L9)

### FIXED32 {#FIXED32}

```xo
const FIXED32: Int = 5
```

[Source: `std/protobuf.xo:10`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L10)

### MAX_GROUP_DEPTH {#MAX_GROUP_DEPTH}

```xo
const MAX_GROUP_DEPTH: Int = 10000
```

The greatest nesting of groups `skip_field` follows (protowire's 10000).

[Source: `std/protobuf.xo:30`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L30)

## Types

### ProtoErr {#ProtoErr}

```xo
enum ProtoErr {
  Truncated
  Overflow
  BadTag
  BadWire(wire: Int)
  EndGroup
  Recursion
  BadLength
  Utf8
} derive Display
```

Why a wire read failed: the cases of protowire's error codes.
`Truncated` the input ends inside a value, `Overflow` a varint is longer than ten bytes or
its tenth byte is above 1, `BadTag` a field number outside 1..2^29-1 or a tag over 32 bits,
`BadWire` a wire type of 6 or 7 (or an end group with no start), `Recursion` groups nested
deeper than the limit, `BadLength` a length that does not fit the input, `Utf8` text that is
not valid UTF-8.

[Source: `std/protobuf.xo:18`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L18)

## Functions

### append_varint {#append_varint}

```xo
fn append_varint(b: Bytes, v: UInt64) -> Bytes
```

The bytes of `v` as a varint appended to `b` (protowire.AppendVarint).

[Source: `std/protobuf.xo:33`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L33)

### append_tag {#append_tag}

```xo
fn append_tag(b: Bytes, num: Int, wire: Int) -> Bytes
```

The bytes of the tag of field `num` with wire type `wire` appended to `b` (AppendTag).

[Source: `std/protobuf.xo:35`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L35)

### append_fixed32 {#append_fixed32}

```xo
fn append_fixed32(b: Bytes, v: UInt32) -> Bytes
```

[Source: `std/protobuf.xo:36`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L36)

### append_fixed64 {#append_fixed64}

```xo
fn append_fixed64(b: Bytes, v: UInt64) -> Bytes
```

[Source: `std/protobuf.xo:37`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L37)

### append_bytes {#append_bytes}

```xo
fn append_bytes(b: Bytes, data: Bytes) -> Bytes
```

A length prefix then the bytes (AppendBytes).

[Source: `std/protobuf.xo:39`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L39)

### put_varint {#put_varint}

```xo
fn put_varint(out: BytesBuilder, v: UInt64) -> BytesBuilder
```

Builder forms of the append functions (the generated writers of `derive Proto` use them: one buffer, no copy per field).

[Source: `std/protobuf.xo:41`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L41)

### put_tag {#put_tag}

```xo
fn put_tag(out: BytesBuilder, num: Int, wire: Int) -> BytesBuilder
```

[Source: `std/protobuf.xo:42`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L42)

### put_fixed32 {#put_fixed32}

```xo
fn put_fixed32(out: BytesBuilder, v: UInt32) -> BytesBuilder
```

[Source: `std/protobuf.xo:43`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L43)

### put_fixed64 {#put_fixed64}

```xo
fn put_fixed64(out: BytesBuilder, v: UInt64) -> BytesBuilder
```

[Source: `std/protobuf.xo:44`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L44)

### put_bytes {#put_bytes}

```xo
fn put_bytes(out: BytesBuilder, data: Bytes) -> BytesBuilder
```

[Source: `std/protobuf.xo:45`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L45)

### size_varint {#size_varint}

```xo
fn size_varint(v: UInt64) -> Int
```

The number of bytes `append_varint` writes for `v` (SizeVarint).

[Source: `std/protobuf.xo:47`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L47)

### encode_zigzag {#encode_zigzag}

```xo
fn encode_zigzag(v: Int) -> UInt64
```

The zigzag form of a signed value (EncodeZigZag) and its inverse (DecodeZigZag).

[Source: `std/protobuf.xo:49`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L49)

### decode_zigzag {#decode_zigzag}

```xo
fn decode_zigzag(v: UInt64) -> Int
```

[Source: `std/protobuf.xo:50`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L50)

### read_varint {#read_varint}

```xo
fn read_varint(b: Bytes, at: Int) -> (UInt64, Int) ! ProtoErr
```

The varint at offset `at` of `b` and the offset after it (ConsumeVarint).

[Source: `std/protobuf.xo:53`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L53)

### read_tag {#read_tag}

```xo
fn read_tag(b: Bytes, at: Int) -> (Int, Int, Int) ! ProtoErr
```

The field number, wire type and the offset after the tag at `at` (ConsumeTag).

[Source: `std/protobuf.xo:55`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L55)

### read_fixed32 {#read_fixed32}

```xo
fn read_fixed32(b: Bytes, at: Int) -> (UInt32, Int) ! ProtoErr
```

[Source: `std/protobuf.xo:56`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L56)

### read_fixed64 {#read_fixed64}

```xo
fn read_fixed64(b: Bytes, at: Int) -> (UInt64, Int) ! ProtoErr
```

[Source: `std/protobuf.xo:57`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L57)

### read_bytes {#read_bytes}

```xo
fn read_bytes(b: Bytes, at: Int) -> (Bytes, Int) ! ProtoErr
```

A length prefixed value: its bytes (a view) and the offset after it (ConsumeBytes).

[Source: `std/protobuf.xo:59`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L59)

### skip_field {#skip_field}

```xo
fn skip_field(b: Bytes, at: Int, num: Int, wire: Int) -> Int ! ProtoErr
```

The offset after the value of a field with tag number `num` and wire type `wire` starting at
`at`, groups included (ConsumeFieldValue).

[Source: `std/protobuf.xo:62`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L62)

### marshal {#marshal}

```xo
fn marshal[T: Proto](v: T) -> Bytes
```

`v` as protobuf wire bytes, fields in declaration order, proto3 implicit presence (a zero
value is not written). `T` derives Proto (decision 0530).

[Source: `std/protobuf.xo:66`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L66)

### unmarshal {#unmarshal}

```xo
fn unmarshal[T: Proto](data: Bytes) -> T ! ProtoErr
```

The `T` that `data` encodes; unknown fields are skipped, a later value of a field wins.

[Source: `std/protobuf.xo:68`](https://github.com/xo-lang/xo/blob/main/std/protobuf.xo#L68)
