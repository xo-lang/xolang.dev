---
title: "std/protodesc"
linkTitle: "protodesc"
description: "The descriptors of google/protobuf/ descriptor.proto that reflection, ProtoJSON and Any resolve n..."
toc: true
module: "std/protodesc"
source: "https://github.com/xo-lang/xo/blob/main/std/protodesc.xo"
generated: "scripts/sync-content.py from `xo doc std/protodesc`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`LABEL_OPTIONAL`](#label_optional)
- const [`LABEL_REQUIRED`](#label_required)
- const [`LABEL_REPEATED`](#label_repeated)
- const [`TYPE_DOUBLE`](#type_double)
- const [`TYPE_FLOAT`](#type_float)
- const [`TYPE_INT64`](#type_int64)
- const [`TYPE_UINT64`](#type_uint64)
- const [`TYPE_INT32`](#type_int32)
- const [`TYPE_FIXED64`](#type_fixed64)
- const [`TYPE_FIXED32`](#type_fixed32)
- const [`TYPE_BOOL`](#type_bool)
- const [`TYPE_STRING`](#type_string)
- const [`TYPE_GROUP`](#type_group)
- const [`TYPE_MESSAGE`](#type_message)
- const [`TYPE_BYTES`](#type_bytes)
- const [`TYPE_UINT32`](#type_uint32)
- const [`TYPE_ENUM`](#type_enum)
- const [`TYPE_SFIXED32`](#type_sfixed32)
- const [`TYPE_SFIXED64`](#type_sfixed64)
- const [`TYPE_SINT32`](#type_sint32)
- const [`TYPE_SINT64`](#type_sint64)
- type [`ReservedRange`](#reservedrange)
- type [`ExtensionRange`](#extensionrange)
- type [`OneofDesc`](#oneofdesc)
- type [`FieldDesc`](#fielddesc)
- type [`EnumValueDesc`](#enumvaluedesc)
- type [`EnumDesc`](#enumdesc)
- type [`MessageDesc`](#messagedesc)
- type [`MethodDesc`](#methoddesc)
- type [`ServiceDesc`](#servicedesc)
- type [`FileDesc`](#filedesc)
- fn [`encode`](#encode)
- fn [`decode`](#decode)

## Constants

### LABEL_OPTIONAL

```xo
const LABEL_OPTIONAL: Int = 1
```

FieldDescriptorProto.Label.

[Source: `std/protodesc.xo:12`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L12)

### LABEL_REQUIRED

```xo
const LABEL_REQUIRED: Int = 2
```

[Source: `std/protodesc.xo:13`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L13)

### LABEL_REPEATED

```xo
const LABEL_REPEATED: Int = 3
```

[Source: `std/protodesc.xo:14`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L14)

### TYPE_DOUBLE

```xo
const TYPE_DOUBLE: Int = 1
```

FieldDescriptorProto.Type.

[Source: `std/protodesc.xo:17`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L17)

### TYPE_FLOAT

```xo
const TYPE_FLOAT: Int = 2
```

[Source: `std/protodesc.xo:18`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L18)

### TYPE_INT64

```xo
const TYPE_INT64: Int = 3
```

[Source: `std/protodesc.xo:19`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L19)

### TYPE_UINT64

```xo
const TYPE_UINT64: Int = 4
```

[Source: `std/protodesc.xo:20`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L20)

### TYPE_INT32

```xo
const TYPE_INT32: Int = 5
```

[Source: `std/protodesc.xo:21`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L21)

### TYPE_FIXED64

```xo
const TYPE_FIXED64: Int = 6
```

[Source: `std/protodesc.xo:22`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L22)

### TYPE_FIXED32

```xo
const TYPE_FIXED32: Int = 7
```

[Source: `std/protodesc.xo:23`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L23)

### TYPE_BOOL

```xo
const TYPE_BOOL: Int = 8
```

[Source: `std/protodesc.xo:24`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L24)

### TYPE_STRING

```xo
const TYPE_STRING: Int = 9
```

[Source: `std/protodesc.xo:25`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L25)

### TYPE_GROUP

```xo
const TYPE_GROUP: Int = 10
```

[Source: `std/protodesc.xo:26`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L26)

### TYPE_MESSAGE

```xo
const TYPE_MESSAGE: Int = 11
```

[Source: `std/protodesc.xo:27`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L27)

### TYPE_BYTES

```xo
const TYPE_BYTES: Int = 12
```

[Source: `std/protodesc.xo:28`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L28)

### TYPE_UINT32

```xo
const TYPE_UINT32: Int = 13
```

[Source: `std/protodesc.xo:29`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L29)

### TYPE_ENUM

```xo
const TYPE_ENUM: Int = 14
```

[Source: `std/protodesc.xo:30`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L30)

### TYPE_SFIXED32

```xo
const TYPE_SFIXED32: Int = 15
```

[Source: `std/protodesc.xo:31`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L31)

### TYPE_SFIXED64

```xo
const TYPE_SFIXED64: Int = 16
```

[Source: `std/protodesc.xo:32`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L32)

### TYPE_SINT32

```xo
const TYPE_SINT32: Int = 17
```

[Source: `std/protodesc.xo:33`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L33)

### TYPE_SINT64

```xo
const TYPE_SINT64: Int = 18
```

[Source: `std/protodesc.xo:34`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L34)

## Types

### ReservedRange

```xo
struct ReservedRange {
  start: Int
  end: Int
} derive Eq
```

A `start` to `end` range (DescriptorProto.ReservedRange and EnumReservedRange; end is exclusive for
messages and inclusive for enums, as in descriptor.proto).

[Source: `std/protodesc.xo:38`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L38)

### ExtensionRange

```xo
struct ExtensionRange {
  start: Int
  end: Int
  options: Bytes = b""
  options_set: Bool = false
} derive Eq
```

[Source: `std/protodesc.xo:43`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L43)

### OneofDesc

```xo
struct OneofDesc {
  name: Str
  options: Bytes = b""
  options_set: Bool = false
} derive Eq
```

[Source: `std/protodesc.xo:51`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L51)

### FieldDesc

```xo
struct FieldDesc {
  name: Str
  extendee: Str = ""
  number: Int
  label: Int = 0
  kind: Int = 0
  type_name: Str = ""
  default_value: Str = ""
  options: Bytes = b""
  options_set: Bool = false
  oneof_index: Int? = None
  json_name: Str = ""
  proto3_optional: Bool = false
  unknown: Bytes = b""
} derive Eq
```

FieldDescriptorProto. `kind` is the proto `type` (TYPE_*), `type_name` the fully qualified name with
its leading dot (`.pkg.Msg`) for a message or enum field.

[Source: `std/protodesc.xo:60`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L60)

### EnumValueDesc

```xo
struct EnumValueDesc {
  name: Str
  number: Int
  options: Bytes = b""
  options_set: Bool = false
} derive Eq
```

[Source: `std/protodesc.xo:77`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L77)

### EnumDesc

```xo
struct EnumDesc {
  name: Str
  value: List[EnumValueDesc] = []
  options: Bytes = b""
  options_set: Bool = false
  reserved_range: List[ReservedRange] = []
  reserved_name: List[Str] = []
} derive Eq
```

[Source: `std/protodesc.xo:85`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L85)

### MessageDesc

```xo
struct MessageDesc {
  name: Str
  field: List[FieldDesc] = []
  extension: List[FieldDesc] = []
  nested_type: List[MessageDesc] = []
  enum_type: List[EnumDesc] = []
  extension_range: List[ExtensionRange] = []
  oneof_decl: List[OneofDesc] = []
  options: Bytes = b""
  options_set: Bool = false
  reserved_range: List[ReservedRange] = []
  reserved_name: List[Str] = []
} derive Eq
```

[Source: `std/protodesc.xo:95`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L95)

### MethodDesc

```xo
struct MethodDesc {
  name: Str
  input_type: Str
  output_type: Str
  options: Bytes = b""
  options_set: Bool = false
  client_streaming: Bool = false
  server_streaming: Bool = false
  streaming_set: Int = 0
} derive Eq
```

[Source: `std/protodesc.xo:110`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L110)

### ServiceDesc

```xo
struct ServiceDesc {
  name: Str
  method: List[MethodDesc] = []
  options: Bytes = b""
  options_set: Bool = false
} derive Eq
```

[Source: `std/protodesc.xo:124`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L124)

### FileDesc

```xo
struct FileDesc {
  name: Str
  package: Str = ""
  dependency: List[Str] = []
  public_dependency: List[Int] = []
  weak_dependency: List[Int] = []
  message_type: List[MessageDesc] = []
  enum_type: List[EnumDesc] = []
  service: List[ServiceDesc] = []
  extension: List[FieldDesc] = []
  options: Bytes = b""
  options_set: Bool = false
  source_code_info: Bytes = b""
  syntax: Str = ""
  edition: Int = 0
} derive Eq
```

FileDescriptorProto. `syntax` is `proto2` (written as empty), `proto3` or `editions`.

[Source: `std/protodesc.xo:133`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L133)

## Functions

### encode

```xo
fn encode(f: FileDesc) -> Bytes
```

The wire bytes of `f` (a serialized FileDescriptorProto), fields in field number order.

[Source: `std/protodesc.xo:152`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L152)

### decode

```xo
fn decode(data: Bytes) -> FileDesc ! protobuf.ProtoErr
```

The FileDescriptorProto of `data`; the wire reader's errors, and `Utf8` for a name that is not text.

[Source: `std/protodesc.xo:154`](https://github.com/xo-lang/xo/blob/main/std/protodesc.xo#L154)
