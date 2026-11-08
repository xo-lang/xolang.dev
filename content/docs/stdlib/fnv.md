---
title: "std/fnv"
linkTitle: "fnv"
description: "Go's hash/fnv: the Fowler-Noll-Vo hashes FNV-1 and FNV-1a, 32, 64 and 128 bits."
toc: true
module: "std/fnv"
source: "https://github.com/xo-lang/xo/blob/main/std/fnv.xo"
generated: "scripts/sync-content.py from `xo doc std/fnv`; edit the doc comments in the Xo repo, not this file"
---
## Index

- fn [`sum32`](#sum32)
- fn [`sum32a`](#sum32a)
- fn [`sum64`](#sum64)
- fn [`sum64a`](#sum64a)
- fn [`sum128`](#sum128)
- fn [`sum128a`](#sum128a)
- fn [`update32`](#update32)
- fn [`update32a`](#update32a)
- fn [`update64`](#update64)
- fn [`update64a`](#update64a)
- fn [`update128`](#update128)
- fn [`update128a`](#update128a)

## Functions

### sum32

```xo
fn sum32(data: Bytes) -> Int
```

FNV-1 of data, 0 to 2^32 - 1 (Go's New32().Sum32()).

[Source: `std/fnv.xo:8`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L8)

### sum32a

```xo
fn sum32a(data: Bytes) -> Int
```

FNV-1a of data, 0 to 2^32 - 1 (Go's New32a).

[Source: `std/fnv.xo:10`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L10)

### sum64

```xo
fn sum64(data: Bytes) -> Int
```

FNV-1 of data, 64 bits: the Int's bits are Go's uint64, so a sum past
2^63 is negative (Go's New64).

[Source: `std/fnv.xo:13`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L13)

### sum64a

```xo
fn sum64a(data: Bytes) -> Int
```

FNV-1a of data, 64 bits as sum64 (Go's New64a).

[Source: `std/fnv.xo:15`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L15)

### sum128

```xo
fn sum128(data: Bytes) -> Bytes
```

FNV-1 of data, the 16 byte big endian sum (Go's New128().Sum(nil)).

[Source: `std/fnv.xo:17`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L17)

### sum128a

```xo
fn sum128a(data: Bytes) -> Bytes
```

FNV-1a of data, 16 bytes as sum128 (Go's New128a).

[Source: `std/fnv.xo:19`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L19)

### update32

```xo
fn update32(sum: Int, data: Bytes) -> Int
```

The sum of what sum was the hash of, followed by data, for hashing a
piece at a time (Go's Write on the same hash):
`update32(sum32(a), b) == sum32(a + b)`.

[Source: `std/fnv.xo:24`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L24)

### update32a

```xo
fn update32a(sum: Int, data: Bytes) -> Int
```

[Source: `std/fnv.xo:25`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L25)

### update64

```xo
fn update64(sum: Int, data: Bytes) -> Int
```

[Source: `std/fnv.xo:26`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L26)

### update64a

```xo
fn update64a(sum: Int, data: Bytes) -> Int
```

[Source: `std/fnv.xo:27`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L27)

### update128

```xo
fn update128(sum: Bytes, data: Bytes) -> Bytes
```

update128 and update128a: sum is 16 bytes (faults otherwise).

[Source: `std/fnv.xo:29`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L29)

### update128a

```xo
fn update128a(sum: Bytes, data: Bytes) -> Bytes
```

[Source: `std/fnv.xo:30`](https://github.com/xo-lang/xo/blob/main/std/fnv.xo#L30)
