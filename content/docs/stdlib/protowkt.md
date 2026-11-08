---
title: "std/protowkt"
linkTitle: "protowkt"
description: "The well known types of protobuf's google/protobuf/*.proto as Xo values with their wire codecs wr..."
toc: true
module: "std/protowkt"
source: "https://github.com/xo-lang/xo/blob/main/std/protowkt.xo"
generated: "scripts/sync-content.py from `xo doc std/protowkt`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Timestamp`](#timestamp)
- type [`Duration`](#duration)
- type [`Empty`](#empty)
- type [`FieldMask`](#fieldmask)
- type [`Any`](#any)
- type [`DoubleValue`](#doublevalue)
- type [`FloatValue`](#floatvalue)
- type [`Int64Value`](#int64value)
- type [`UInt64Value`](#uint64value)
- type [`Int32Value`](#int32value)
- type [`UInt32Value`](#uint32value)
- type [`BoolValue`](#boolvalue)
- type [`StringValue`](#stringvalue)
- type [`BytesValue`](#bytesvalue)
- type [`Value`](#value)
- type [`Struct`](#struct)
- type [`ListValue`](#listvalue)
- fn [`encode_timestamp`](#encode_timestamp)
- fn [`decode_timestamp`](#decode_timestamp)
- fn [`encode_duration`](#encode_duration)
- fn [`decode_duration`](#decode_duration)
- fn [`encode_empty`](#encode_empty)
- fn [`decode_empty`](#decode_empty)
- fn [`encode_field_mask`](#encode_field_mask)
- fn [`decode_field_mask`](#decode_field_mask)
- fn [`encode_any`](#encode_any)
- fn [`decode_any`](#decode_any)
- fn [`encode_double_value`](#encode_double_value)
- fn [`decode_double_value`](#decode_double_value)
- fn [`encode_float_value`](#encode_float_value)
- fn [`decode_float_value`](#decode_float_value)
- fn [`encode_int64_value`](#encode_int64_value)
- fn [`decode_int64_value`](#decode_int64_value)
- fn [`encode_uint64_value`](#encode_uint64_value)
- fn [`decode_uint64_value`](#decode_uint64_value)
- fn [`encode_int32_value`](#encode_int32_value)
- fn [`decode_int32_value`](#decode_int32_value)
- fn [`encode_uint32_value`](#encode_uint32_value)
- fn [`decode_uint32_value`](#decode_uint32_value)
- fn [`encode_bool_value`](#encode_bool_value)
- fn [`decode_bool_value`](#decode_bool_value)
- fn [`encode_string_value`](#encode_string_value)
- fn [`decode_string_value`](#decode_string_value)
- fn [`encode_bytes_value`](#encode_bytes_value)
- fn [`decode_bytes_value`](#decode_bytes_value)
- fn [`encode_value`](#encode_value)
- fn [`decode_value`](#decode_value)
- fn [`encode_struct`](#encode_struct)
- fn [`decode_struct`](#decode_struct)
- fn [`encode_list_value`](#encode_list_value)
- fn [`decode_list_value`](#decode_list_value)

## Types

### Timestamp

```xo
struct Timestamp {
  seconds: Int = 0
  nanos: Int = 0
} derive Eq
```

[Source: `std/protowkt.xo:12`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L12)

### Duration

```xo
struct Duration {
  seconds: Int = 0
  nanos: Int = 0
} derive Eq
```

[Source: `std/protowkt.xo:17`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L17)

### Empty

```xo
struct Empty {
  unknown: Bytes = b""
} derive Eq
```

[Source: `std/protowkt.xo:22`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L22)

### FieldMask

```xo
struct FieldMask {
  paths: List[Str] = []
} derive Eq
```

[Source: `std/protowkt.xo:27`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L27)

### Any

```xo
struct Any {
  type_url: Str = ""
  value: Bytes = b""
} derive Eq
```

google.protobuf.Any: `type_url` names the packed message (`type.googleapis.com/pkg.Msg`), `value` is
its wire bytes.

[Source: `std/protowkt.xo:33`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L33)

### DoubleValue

```xo
struct DoubleValue { value: Float = 0.0 }
```

[Source: `std/protowkt.xo:38`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L38)

### FloatValue

```xo
struct FloatValue { value: Float32 = 0.0 }
```

[Source: `std/protowkt.xo:39`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L39)

### Int64Value

```xo
struct Int64Value { value: Int = 0 } derive Eq
```

[Source: `std/protowkt.xo:40`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L40)

### UInt64Value

```xo
struct UInt64Value { value: UInt64 = 0 } derive Eq
```

[Source: `std/protowkt.xo:41`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L41)

### Int32Value

```xo
struct Int32Value { value: Int = 0 } derive Eq
```

[Source: `std/protowkt.xo:42`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L42)

### UInt32Value

```xo
struct UInt32Value { value: Int = 0 } derive Eq
```

[Source: `std/protowkt.xo:43`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L43)

### BoolValue

```xo
struct BoolValue { value: Bool = false } derive Eq
```

[Source: `std/protowkt.xo:44`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L44)

### StringValue

```xo
struct StringValue { value: Str = "" } derive Eq
```

[Source: `std/protowkt.xo:45`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L45)

### BytesValue

```xo
struct BytesValue { value: Bytes = b"" } derive Eq
```

[Source: `std/protowkt.xo:46`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L46)

### Value

```xo
enum Value {
  Unset
  Null
  Number(v: Float)
  Text(v: Str)
  Flag(v: Bool)
  Object(v: Struct)
  Array(v: ListValue)
}
```

google.protobuf.Value: the kind that is set, `Unset` when none is.

[Source: `std/protowkt.xo:49`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L49)

### Struct

```xo
struct Struct {
  fields: Map[Str, Value] = {}
}
```

[Source: `std/protowkt.xo:59`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L59)

### ListValue

```xo
struct ListValue {
  values: List[Value] = []
}
```

[Source: `std/protowkt.xo:63`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L63)

## Functions

### encode_timestamp

```xo
fn encode_timestamp(m: Timestamp) -> Bytes
```

[Source: `std/protowkt.xo:67`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L67)

### decode_timestamp

```xo
fn decode_timestamp(b: Bytes) -> Timestamp ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:68`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L68)

### encode_duration

```xo
fn encode_duration(m: Duration) -> Bytes
```

[Source: `std/protowkt.xo:69`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L69)

### decode_duration

```xo
fn decode_duration(b: Bytes) -> Duration ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:70`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L70)

### encode_empty

```xo
fn encode_empty(m: Empty) -> Bytes
```

[Source: `std/protowkt.xo:71`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L71)

### decode_empty

```xo
fn decode_empty(b: Bytes) -> Empty ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:72`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L72)

### encode_field_mask

```xo
fn encode_field_mask(m: FieldMask) -> Bytes
```

[Source: `std/protowkt.xo:73`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L73)

### decode_field_mask

```xo
fn decode_field_mask(b: Bytes) -> FieldMask ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:74`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L74)

### encode_any

```xo
fn encode_any(m: Any) -> Bytes
```

[Source: `std/protowkt.xo:75`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L75)

### decode_any

```xo
fn decode_any(b: Bytes) -> Any ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:76`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L76)

### encode_double_value

```xo
fn encode_double_value(m: DoubleValue) -> Bytes
```

[Source: `std/protowkt.xo:77`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L77)

### decode_double_value

```xo
fn decode_double_value(b: Bytes) -> DoubleValue ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:78`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L78)

### encode_float_value

```xo
fn encode_float_value(m: FloatValue) -> Bytes
```

[Source: `std/protowkt.xo:79`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L79)

### decode_float_value

```xo
fn decode_float_value(b: Bytes) -> FloatValue ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:80`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L80)

### encode_int64_value

```xo
fn encode_int64_value(m: Int64Value) -> Bytes
```

[Source: `std/protowkt.xo:81`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L81)

### decode_int64_value

```xo
fn decode_int64_value(b: Bytes) -> Int64Value ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:82`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L82)

### encode_uint64_value

```xo
fn encode_uint64_value(m: UInt64Value) -> Bytes
```

[Source: `std/protowkt.xo:83`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L83)

### decode_uint64_value

```xo
fn decode_uint64_value(b: Bytes) -> UInt64Value ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:84`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L84)

### encode_int32_value

```xo
fn encode_int32_value(m: Int32Value) -> Bytes
```

[Source: `std/protowkt.xo:85`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L85)

### decode_int32_value

```xo
fn decode_int32_value(b: Bytes) -> Int32Value ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:86`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L86)

### encode_uint32_value

```xo
fn encode_uint32_value(m: UInt32Value) -> Bytes
```

[Source: `std/protowkt.xo:87`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L87)

### decode_uint32_value

```xo
fn decode_uint32_value(b: Bytes) -> UInt32Value ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:88`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L88)

### encode_bool_value

```xo
fn encode_bool_value(m: BoolValue) -> Bytes
```

[Source: `std/protowkt.xo:89`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L89)

### decode_bool_value

```xo
fn decode_bool_value(b: Bytes) -> BoolValue ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:90`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L90)

### encode_string_value

```xo
fn encode_string_value(m: StringValue) -> Bytes
```

[Source: `std/protowkt.xo:91`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L91)

### decode_string_value

```xo
fn decode_string_value(b: Bytes) -> StringValue ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:92`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L92)

### encode_bytes_value

```xo
fn encode_bytes_value(m: BytesValue) -> Bytes
```

[Source: `std/protowkt.xo:93`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L93)

### decode_bytes_value

```xo
fn decode_bytes_value(b: Bytes) -> BytesValue ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:94`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L94)

### encode_value

```xo
fn encode_value(m: Value) -> Bytes
```

A Struct's entries are written in key order (protobuf-go's Deterministic marshaling).

[Source: `std/protowkt.xo:96`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L96)

### decode_value

```xo
fn decode_value(b: Bytes) -> Value ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:97`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L97)

### encode_struct

```xo
fn encode_struct(m: Struct) -> Bytes
```

[Source: `std/protowkt.xo:98`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L98)

### decode_struct

```xo
fn decode_struct(b: Bytes) -> Struct ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:99`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L99)

### encode_list_value

```xo
fn encode_list_value(m: ListValue) -> Bytes
```

[Source: `std/protowkt.xo:100`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L100)

### decode_list_value

```xo
fn decode_list_value(b: Bytes) -> ListValue ! protobuf.ProtoErr
```

[Source: `std/protowkt.xo:101`](https://github.com/xo-lang/xo/blob/main/std/protowkt.xo#L101)
