---
title: "std/crc64"
linkTitle: "crc64"
description: "Go's hash/crc64: the 64 bit cyclic redundancy check (ISO 3309, used by Redis and HDLC; ECMA 182, ..."
toc: true
module: "std/crc64"
source: "https://github.com/xo-lang/xo/blob/main/std/crc64.xo"
generated: "scripts/sync-content.py from `xo doc std/crc64`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Poly`](#Poly)
- fn [`checksum`](#checksum)
- fn [`update`](#update)

## Types

### Poly {#Poly}

```xo
enum Poly {
  Iso
  Ecma
  Nvme
}
```

The polynomial: Go's ISO (0xd800000000000000) and ECMA
(0xc96c5795d7870f42) tables, both reversed as Go's are, and NVMe's
(0x9a6c9329ac4bc9b5 reversed, CRC-64/NVME: Amazon S3's default
flexible checksum; `checksum(b"123456789", Poly.Nvme)` is
0xae8b14860a799888 as a Go uint64).

[Source: `std/crc64.xo:11`](https://github.com/xo-lang/xo/blob/main/std/crc64.xo#L11)

## Functions

### checksum {#checksum}

```xo
fn checksum(data: Bytes, poly: Poly = Poly.Iso) -> Int
```

The CRC-64 of data: the Int's bits are Go's uint64, so a checksum past
2^63 is negative (Go's Checksum with MakeTable(poly)).

[Source: `std/crc64.xo:19`](https://github.com/xo-lang/xo/blob/main/std/crc64.xo#L19)

### update {#update}

```xo
fn update(crc: Int, data: Bytes, poly: Poly = Poly.Iso) -> Int
```

The CRC-64 of what crc was the checksum of, followed by data (Go's
Update): `update(checksum(a), b) == checksum(a + b)`, and
`update(0, d) == checksum(d)`.

[Source: `std/crc64.xo:23`](https://github.com/xo-lang/xo/blob/main/std/crc64.xo#L23)
