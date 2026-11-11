---
title: "std/adler32"
linkTitle: "adler32"
description: "Go's hash/adler32: the checksum of zlib (RFC 1950)."
toc: true
module: "std/adler32"
source: "https://github.com/xo-lang/xo/blob/main/std/adler32.xo"
generated: "scripts/sync-content.py from `xo doc std/adler32`; edit the doc comments in the Xo repo, not this file"
---
## Index

- fn [`checksum`](#checksum)
- fn [`update`](#update)

## Functions

### checksum {#checksum}

```xo
fn checksum(data: Bytes) -> Int
```

The Adler-32 of data, 0 to 2^32 - 1 (Go's Checksum); 1 for empty data.

[Source: `std/adler32.xo:7`](https://github.com/xo-lang/xo/blob/main/std/adler32.xo#L7)

### update {#update}

```xo
fn update(sum: Int, data: Bytes) -> Int
```

The Adler-32 of what sum was the checksum of, followed by data (Go's
Write on a digest at that state): `update(checksum(a), b) ==
checksum(a + b)`, and `update(1, d) == checksum(d)`.

[Source: `std/adler32.xo:11`](https://github.com/xo-lang/xo/blob/main/std/adler32.xo#L11)
