---
title: "std/netip"
linkTitle: "netip"
description: "Go's net/netip: IP addresses and prefixes as values."
toc: true
module: "std/netip"
source: "https://github.com/xo-lang/xo/blob/main/std/netip.xo"
generated: "scripts/sync-content.py from `xo doc std/netip`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Addr`](#addr)
  - method [`Addr.is_4`](#addris_4)
  - method [`Addr.is_6`](#addris_6)
  - method [`Addr.is_4in6`](#addris_4in6)
  - method [`Addr.unmap`](#addrunmap)
  - method [`Addr.is_loopback`](#addris_loopback)
  - method [`Addr.is_private`](#addris_private)
  - method [`Addr.is_unspecified`](#addris_unspecified)
  - method [`Addr.is_link_local_unicast`](#addris_link_local_unicast)
  - method [`Addr.is_multicast`](#addris_multicast)
  - method [`Addr.bytes`](#addrbytes)
  - method [`Addr.display`](#addrdisplay)
- type [`Prefix`](#prefix)
  - method [`Prefix.contains`](#prefixcontains)
  - method [`Prefix.masked`](#prefixmasked)
  - method [`Prefix.display`](#prefixdisplay)
- type [`ParseErr`](#parseerr)
  - method [`ParseErr.display`](#parseerrdisplay)
- fn [`parse_addr`](#parse_addr)
- fn [`lookup`](#lookup)
- fn [`parse_prefix`](#parse_prefix)
- fn [`addr_from_bytes`](#addr_from_bytes)

## Types

### Addr

```xo
struct Addr {
  bits: Int
  hi: Int
  lo: Int
  zone: Str
} derive Ord
```

An IP address: `bits` is 32 for IPv4, 128 for IPv6, 0 for the zero
value; `hi` and `lo` its 16 bytes as two words (an IPv4 address as
::ffff:a.b.c.d); `zone` an IPv6 zone. The order is Go's Addr.Compare.

[Source: `std/netip.xo:8`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L8)

#### Addr.is_4

```xo
fn (a: Addr) is_4() -> Bool
```

[Source: `std/netip.xo:40`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L40)

#### Addr.is_6

```xo
fn (a: Addr) is_6() -> Bool
```

[Source: `std/netip.xo:41`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L41)

#### Addr.is_4in6

```xo
fn (a: Addr) is_4in6() -> Bool
```

[Source: `std/netip.xo:42`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L42)

#### Addr.unmap

```xo
fn (a: Addr) unmap() -> Addr
```

An IPv4 in IPv6 address as IPv4 (its zone dropped), others as they are.

[Source: `std/netip.xo:44`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L44)

#### Addr.is_loopback

```xo
fn (a: Addr) is_loopback() -> Bool
```

[Source: `std/netip.xo:45`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L45)

#### Addr.is_private

```xo
fn (a: Addr) is_private() -> Bool
```

[Source: `std/netip.xo:46`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L46)

#### Addr.is_unspecified

```xo
fn (a: Addr) is_unspecified() -> Bool
```

[Source: `std/netip.xo:47`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L47)

#### Addr.is_link_local_unicast

```xo
fn (a: Addr) is_link_local_unicast() -> Bool
```

[Source: `std/netip.xo:48`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L48)

#### Addr.is_multicast

```xo
fn (a: Addr) is_multicast() -> Bool
```

[Source: `std/netip.xo:49`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L49)

#### Addr.bytes

```xo
fn (a: Addr) bytes() -> Bytes
```

4 bytes for IPv4, 16 for IPv6 (Go's AsSlice).

[Source: `std/netip.xo:51`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L51)

#### Addr.display

```xo
fn (a: Addr) display() -> Str
```

Go's String: `1.2.3.4`, `2001:db8::1`, `::ffff:1.2.3.4`, `fe80::1%eth0`.

[Source: `std/netip.xo:53`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L53)

### Prefix

```xo
struct Prefix {
  addr: Addr
  len: Int
}
```

An address and a prefix length.

[Source: `std/netip.xo:19`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L19)

#### Prefix.contains

```xo
fn (p: Prefix) contains(a: Addr) -> Bool
```

[Source: `std/netip.xo:54`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L54)

#### Prefix.masked

```xo
fn (p: Prefix) masked() -> Prefix
```

[Source: `std/netip.xo:55`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L55)

#### Prefix.display

```xo
fn (p: Prefix) display() -> Str
```

[Source: `std/netip.xo:56`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L56)

### ParseErr

```xo
struct ParseErr {
  msg: Str
}
```

Go's texts: `ParseAddr("1.2.3"): IPv4 address too short`.

[Source: `std/netip.xo:25`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L25)

#### ParseErr.display

```xo
fn (e: ParseErr) display() -> Str
```

[Source: `std/netip.xo:29`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L29)

## Functions

### parse_addr

```xo
fn parse_addr(s: Str) -> Addr ! ParseErr
```

Go's ParseAddr: IPv4 (no leading zeros), IPv6, IPv4 in IPv6, zones.

[Source: `std/netip.xo:32`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L32)

### lookup

```xo
fn lookup(n: Net, host: Str) -> List[Addr] ! NetErr uses net.dial
```

The addresses of host, in the order Net.dial tries them (Go's
net.LookupIP through Net.lookup_host; decision 0406).

[Source: `std/netip.xo:35`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L35)

### parse_prefix

```xo
fn parse_prefix(s: Str) -> Prefix ! ParseErr
```

Go's ParsePrefix: `10.0.0.0/8`, `2001:db8::/32`.

[Source: `std/netip.xo:37`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L37)

### addr_from_bytes

```xo
fn addr_from_bytes(b: Bytes) -> Addr?
```

The address of 4 or 16 bytes (AddrFrom4, AddrFrom16); None for another length.

[Source: `std/netip.xo:39`](https://github.com/xo-lang/xo/blob/main/std/netip.xo#L39)
