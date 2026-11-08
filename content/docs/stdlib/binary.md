---
title: "std/binary"
linkTitle: "binary"
description: "Go's encoding/binary byte orders and varints as pure functions on Bytes."
toc: true
module: "std/binary"
source: "https://github.com/xo-lang/xo/blob/main/std/binary.xo"
generated: "scripts/sync-content.py from `xo doc std/binary`; edit the doc comments in the Xo repo, not this file"
---
## Index

- fn [`u16_be`](#u16_be)
- fn [`u32_be`](#u32_be)
- fn [`u64_be`](#u64_be)
- fn [`u16_le`](#u16_le)
- fn [`u32_le`](#u32_le)
- fn [`u64_le`](#u64_le)
- fn [`get_u16_be`](#get_u16_be)
- fn [`get_u32_be`](#get_u32_be)
- fn [`get_u64_be`](#get_u64_be)
- fn [`get_u16_le`](#get_u16_le)
- fn [`get_u32_le`](#get_u32_le)
- fn [`get_u64_le`](#get_u64_le)
- fn [`get_i16_be`](#get_i16_be)
- fn [`get_i32_be`](#get_i32_be)
- fn [`get_i16_le`](#get_i16_le)
- fn [`get_i32_le`](#get_i32_le)
- fn [`uvarint`](#uvarint)
- fn [`varint`](#varint)
- fn [`get_uvarint`](#get_uvarint)
- fn [`get_varint`](#get_varint)

## Functions

### u16_be

```xo
fn u16_be(n: Int) -> Bytes
```

The low 16 bits of n, big endian (2 bytes); also the 32 (4 bytes) and
64 bit (8 bytes) forms and little endian ones.

[Source: `std/binary.xo:9`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L9)

### u32_be

```xo
fn u32_be(n: Int) -> Bytes
```

[Source: `std/binary.xo:10`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L10)

### u64_be

```xo
fn u64_be(n: Int) -> Bytes
```

[Source: `std/binary.xo:11`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L11)

### u16_le

```xo
fn u16_le(n: Int) -> Bytes
```

[Source: `std/binary.xo:12`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L12)

### u32_le

```xo
fn u32_le(n: Int) -> Bytes
```

[Source: `std/binary.xo:13`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L13)

### u64_le

```xo
fn u64_le(n: Int) -> Bytes
```

[Source: `std/binary.xo:14`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L14)

### get_u16_be

```xo
fn get_u16_be(b: Bytes, at: Int) -> Int
```

The unsigned 16 bit value at byte at, big endian; faults when the
bytes run past the end. Also the 32 and 64 bit and little endian forms.

[Source: `std/binary.xo:18`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L18)

### get_u32_be

```xo
fn get_u32_be(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:19`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L19)

### get_u64_be

```xo
fn get_u64_be(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:20`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L20)

### get_u16_le

```xo
fn get_u16_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:21`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L21)

### get_u32_le

```xo
fn get_u32_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:22`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L22)

### get_u64_le

```xo
fn get_u64_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:23`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L23)

### get_i16_be

```xo
fn get_i16_be(b: Bytes, at: Int) -> Int
```

The same, sign extended (Go's int16(binary.BigEndian.Uint16(b))).

[Source: `std/binary.xo:25`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L25)

### get_i32_be

```xo
fn get_i32_be(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:26`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L26)

### get_i16_le

```xo
fn get_i16_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:27`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L27)

### get_i32_le

```xo
fn get_i32_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:28`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L28)

### uvarint

```xo
fn uvarint(n: Int) -> Bytes
```

n as an unsigned 64 bit word in the varint encoding (binary.AppendUvarint).

[Source: `std/binary.xo:31`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L31)

### varint

```xo
fn varint(n: Int) -> Bytes
```

n zig-zag encoded (binary.AppendVarint).

[Source: `std/binary.xo:33`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L33)

### get_uvarint

```xo
fn get_uvarint(b: Bytes, at: Int) -> (Int, Int)?
```

The value at byte at and the bytes it took; None when the input ends
first or the value overflows 64 bits (binary.Uvarint's n \<= 0).

[Source: `std/binary.xo:36`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L36)

### get_varint

```xo
fn get_varint(b: Bytes, at: Int) -> (Int, Int)?
```

[Source: `std/binary.xo:37`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L37)
