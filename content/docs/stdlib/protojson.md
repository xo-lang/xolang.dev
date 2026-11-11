---
title: "std/protojson"
linkTitle: "protojson"
description: "Protocol Buffers' canonical JSON mapping as protobuf-go's encoding/protojson: a message is conver..."
toc: true
module: "std/protojson"
source: "https://github.com/xo-lang/xo/blob/main/std/protojson.xo"
generated: "scripts/sync-content.py from `xo doc std/protojson`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`JsonErr`](#jsonerr)
  - method [`JsonErr.display`](#jsonerrdisplay)
- type [`Opts`](#opts)
- type [`Registry`](#registry)
- type [`MsgInfo`](#msginfo)
- fn [`registry`](#registry)
- fn [`registry_from_set`](#registry_from_set)
- fn [`marshal`](#marshal)
- fn [`unmarshal`](#unmarshal)
- fn [`normalize`](#normalize)

## Types

### JsonErr

```xo
struct JsonErr {
  text: Str
}
```

Why a conversion failed; `text` is protojson's message.

[Source: `std/protojson.xo:16`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L16)

#### JsonErr.display

```xo
fn (e: JsonErr) display() -> Str
```

[Source: `std/protojson.xo:20`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L20)

### Opts

```xo
struct Opts {
  proto_names: Bool = false
  emit_defaults: Bool = false
  enum_numbers: Bool = false
  discard_unknown: Bool = false
}
```

Go's MarshalOptions and UnmarshalOptions: `proto_names` writes the proto field names (UseProtoNames),
`emit_defaults` writes default valued fields (EmitDefaultValues), `enum_numbers` writes enums as numbers
(UseEnumNumbers); `discard_unknown` skips unknown fields and enum names when reading (DiscardUnknown).

[Source: `std/protojson.xo:25`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L25)

### Registry

```xo
struct Registry {
  msgs: Map[Str, MsgInfo]
  enums: Map[Str, protodesc.EnumDesc]
}
```

The messages and enums of a set of files, by full name (no leading dot).

[Source: `std/protojson.xo:33`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L33)

### MsgInfo

```xo
struct MsgInfo {
  d: protodesc.MessageDesc
  full: Str
  proto3: Bool
  is_map: Bool
  implicit_nums: List[Int] = []
}
```

A message of a registry: its descriptor, full name, syntax and whether it is a map entry. Internal.

[Source: `std/protojson.xo:39`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L39)

## Functions

### registry

```xo
fn registry(files: List[protodesc.FileDesc]) -> Registry
```

A registry of the files (a file's dependencies must be in the list).

[Source: `std/protojson.xo:49`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L49)

### registry_from_set

```xo
fn registry_from_set(set: Bytes) -> Registry ! protobuf.ProtoErr
```

A registry of a serialized FileDescriptorSet.

[Source: `std/protojson.xo:51`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L51)

### marshal

```xo
fn marshal(r: Registry, name: Str, wire: Bytes, o: Opts = Opts{}) -> Str ! JsonErr
```

The JSON text (compact, no whitespace) of the wire bytes of message `name` (`pkg.Msg`).

[Source: `std/protojson.xo:54`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L54)

### unmarshal

```xo
fn unmarshal(r: Registry, name: Str, json: Str, o: Opts = Opts{}) -> Bytes ! JsonErr
```

The wire bytes (fields in field number order, maps in key order: Go's Deterministic marshaling) of the JSON
text as message `name`.

[Source: `std/protojson.xo:57`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L57)

### normalize

```xo
fn normalize(r: Registry, name: Str, wire: Bytes) -> Bytes ! JsonErr
```

The wire bytes of message `name` as protobuf-go writes it after parsing `wire` (proto.Unmarshal then
proto.Marshal on a dynamic message): the known fields in canonical form (field number order, repeated numbers
packed in proto3, maps in key order), then the message's own unknown fields (a number the descriptor lacks, or a
wire type it does not take) as they were on the wire. An invalid message, or one missing a proto2 required
field, is an error. The known fields go through the JSON mapping, so the result is exact only
for a message that mapping carries without loss, and unknown fields inside nested messages are not kept.

[Source: `std/protojson.xo:64`](https://github.com/xo-lang/xo/blob/main/std/protojson.xo#L64)
