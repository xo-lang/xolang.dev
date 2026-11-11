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
- fn [`check_at`](#check_at)
- fn [`swap16`](#swap16)
- fn [`swap32`](#swap32)
- fn [`swap64`](#swap64)
- fn [`le`](#le)
- fn [`be`](#be)
- fn [`signed`](#signed)

## Functions

### u16_be {#u16_be}

```xo
pub fn u16_be(n: Int) -> Bytes
```

The low 16 bits of n, big endian (2 bytes); also the 32 (4 bytes) and
64 bit (8 bytes) forms and little endian ones.

[Source: `std/binary.xo:18`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L18)

### u32_be {#u32_be}

```xo
pub fn u32_be(n: Int) -> Bytes
```

[Source: `std/binary.xo:20`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L20)

### u64_be {#u64_be}

```xo
pub fn u64_be(n: Int) -> Bytes
```

[Source: `std/binary.xo:22`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L22)

### u16_le {#u16_le}

```xo
pub fn u16_le(n: Int) -> Bytes
```

[Source: `std/binary.xo:24`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L24)

### u32_le {#u32_le}

```xo
pub fn u32_le(n: Int) -> Bytes
```

[Source: `std/binary.xo:26`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L26)

### u64_le {#u64_le}

```xo
pub fn u64_le(n: Int) -> Bytes
```

[Source: `std/binary.xo:28`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L28)

### get_u16_be {#get_u16_be}

```xo
pub fn get_u16_be(b: Bytes, at: Int) -> Int
```

The unsigned 16 bit value at byte at, big endian; faults when the
bytes run past the end. Also the 32 and 64 bit and little endian forms.

[Source: `std/binary.xo:32`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L32)

### get_u32_be {#get_u32_be}

```xo
pub fn get_u32_be(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:34`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L34)

### get_u64_be {#get_u64_be}

```xo
pub fn get_u64_be(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:36`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L36)

### get_u16_le {#get_u16_le}

```xo
pub fn get_u16_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:38`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L38)

### get_u32_le {#get_u32_le}

```xo
pub fn get_u32_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:43`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L43)

### get_u64_le {#get_u64_le}

```xo
pub fn get_u64_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:48`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L48)

### get_i16_be {#get_i16_be}

```xo
pub fn get_i16_be(b: Bytes, at: Int) -> Int
```

The same, sign extended (Go's int16(binary.BigEndian.Uint16(b))).

[Source: `std/binary.xo:54`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L54)

### get_i32_be {#get_i32_be}

```xo
pub fn get_i32_be(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:56`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L56)

### get_i16_le {#get_i16_le}

```xo
pub fn get_i16_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:58`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L58)

### get_i32_le {#get_i32_le}

```xo
pub fn get_i32_le(b: Bytes, at: Int) -> Int
```

[Source: `std/binary.xo:60`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L60)

### uvarint {#uvarint}

```xo
pub fn uvarint(n: Int) -> Bytes
```

n as an unsigned 64 bit word in the varint encoding (binary.AppendUvarint).

[Source: `std/binary.xo:63`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L63)

### varint {#varint}

```xo
pub fn varint(n: Int) -> Bytes
```

n zig-zag encoded (binary.AppendVarint).

[Source: `std/binary.xo:76`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L76)

### get_uvarint {#get_uvarint}

```xo
pub fn get_uvarint(b: Bytes, at: Int) -> (Int, Int)?
```

The value at byte at and the bytes it took; None when the input ends
first or the value overflows 64 bits (binary.Uvarint's n \<= 0).

[Source: `std/binary.xo:83`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L83)

### get_varint {#get_varint}

```xo
pub fn get_varint(b: Bytes, at: Int) -> (Int, Int)?
```

[Source: `std/binary.xo:108`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L108)

### check_at {#check_at}

```xo
fn check_at(b: Bytes, at: Int, size: Int)
```

[Source: `std/binary.xo:117`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L117)

### swap16 {#swap16}

```xo
fn swap16(n: Int) -> Int
```

[Source: `std/binary.xo:123`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L123)

### swap32 {#swap32}

```xo
fn swap32(n: Int) -> Int
```

[Source: `std/binary.xo:125`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L125)

### swap64 {#swap64}

```xo
fn swap64(n: Int) -> Int
```

[Source: `std/binary.xo:127`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L127)

### le {#le}

```xo
fn le(n: Int, size: Int) -> Bytes
```

[Source: `std/binary.xo:129`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L129)

### be {#be}

```xo
fn be(n: Int, size: Int) -> Bytes
```

[Source: `std/binary.xo:135`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L135)

### signed {#signed}

```xo
fn signed(v: Int, bits: Int) -> Int
```

[Source: `std/binary.xo:141`](https://github.com/xo-lang/xo/blob/main/std/binary.xo#L141)
