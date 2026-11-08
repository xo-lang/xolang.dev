---
title: "std/crc32"
linkTitle: "crc32"
description: "Go's hash/crc32: the 32 bit cyclic redundancy check of gzip, zip and PNG (IEEE) and of iSCSI, ext..."
toc: true
module: "std/crc32"
source: "https://github.com/xo-lang/xo/blob/main/std/crc32.xo"
generated: "scripts/sync-content.py from `xo doc std/crc32`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Poly`](#poly)
- fn [`checksum`](#checksum)
- fn [`update`](#update)

## Types

### Poly

```xo
enum Poly {
  Ieee
  Castagnoli
}
```

The polynomial: Go's IEEE (0xedb88320) and Castagnoli (0x82f63b78)
tables, both reversed as Go's are.

[Source: `std/crc32.xo:8`](https://github.com/xo-lang/xo/blob/main/std/crc32.xo#L8)

## Functions

### checksum

```xo
fn checksum(data: Bytes, poly: Poly = Poly.Ieee) -> Int
```

The CRC-32 of data, 0 to 2^32 - 1 (Go's ChecksumIEEE, and Checksum
with MakeTable(Castagnoli)).

[Source: `std/crc32.xo:15`](https://github.com/xo-lang/xo/blob/main/std/crc32.xo#L15)

### update

```xo
fn update(crc: Int, data: Bytes, poly: Poly = Poly.Ieee) -> Int
```

The CRC-32 of what crc was the checksum of, followed by data (Go's
Update): `update(checksum(a), b) == checksum(a + b)`, and
`update(0, d) == checksum(d)`.

[Source: `std/crc32.xo:19`](https://github.com/xo-lang/xo/blob/main/std/crc32.xo#L19)
