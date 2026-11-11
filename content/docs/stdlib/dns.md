---
title: "std/dns"
linkTitle: "dns"
description: "Go's DNS record lookups (net.LookupMX, LookupTXT, LookupSRV, LookupAddr) over a Net: `uses net.di..."
toc: true
module: "std/dns"
source: "https://github.com/xo-lang/xo/blob/main/std/dns.xo"
generated: "scripts/sync-content.py from `xo doc std/dns`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Mx`](#Mx)
- type [`Srv`](#Srv)
- type [`Resolver`](#Resolver)
  - method [`Resolver.lookup_mx`](#Resolver.lookup_mx)
  - method [`Resolver.lookup_txt`](#Resolver.lookup_txt)
  - method [`Resolver.lookup_srv`](#Resolver.lookup_srv)
  - method [`Resolver.lookup_addr`](#Resolver.lookup_addr)
- fn [`lookup_mx`](#lookup_mx)
- fn [`lookup_txt`](#lookup_txt)
- fn [`lookup_srv`](#lookup_srv)
- fn [`lookup_addr`](#lookup_addr)

## Types

### Mx {#Mx}

```xo
struct Mx {
  host: Str
  pref: Int
}
```

A mail exchanger (Go's net.MX): its host, rooted ("mx1.example.com."),
and its preference (lower first).

[Source: `std/dns.xo:9`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L9)

### Srv {#Srv}

```xo
struct Srv {
  target: Str
  port: Int
  priority: Int
  weight: Int
}
```

A service location (Go's net.SRV): the target host (rooted), its port,
priority (lower first) and weight (a share within one priority).

[Source: `std/dns.xo:16`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L16)

### Resolver {#Resolver}

```xo
struct Resolver {
  server: Str = ""
}
```

Where lookups go: `server` "" asks the system's servers (resolv.conf
on Linux and macOS), else only that server, "host:port" with a numeric
host ("127.0.0.1:5353"), as Go's Resolver with its own Dial.

[Source: `std/dns.xo:26`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L26)

#### Resolver.lookup_mx {#Resolver.lookup_mx}

```xo
fn (r: Resolver) lookup_mx(n: Net, name: Str) -> List[Mx] ! NetErr uses net.dial
```

[Source: `std/dns.xo:46`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L46)

#### Resolver.lookup_txt {#Resolver.lookup_txt}

```xo
fn (r: Resolver) lookup_txt(n: Net, name: Str) -> List[Str] ! NetErr uses net.dial
```

[Source: `std/dns.xo:47`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L47)

#### Resolver.lookup_srv {#Resolver.lookup_srv}

```xo
fn (r: Resolver) lookup_srv(n: Net, service: Str, proto: Str, name: Str) -> List[Srv] ! NetErr uses net.dial
```

[Source: `std/dns.xo:48`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L48)

#### Resolver.lookup_addr {#Resolver.lookup_addr}

```xo
fn (r: Resolver) lookup_addr(n: Net, ip: Str) -> List[Str] ! NetErr uses net.dial
```

[Source: `std/dns.xo:49`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L49)

## Functions

### lookup_mx {#lookup_mx}

```xo
fn lookup_mx(n: Net, name: Str) -> List[Mx] ! NetErr uses net.dial
```

The MX records of name, by preference (equal ones shuffled, as Go's).
Records whose host is not a domain name are left out; Err when every
record is (Go returns both).

[Source: `std/dns.xo:33`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L33)

### lookup_txt {#lookup_txt}

```xo
fn lookup_txt(n: Net, name: Str) -> List[Str] ! NetErr uses net.dial
```

The TXT records of name, each record's strings joined (Go's
LookupTXT); a record that is not UTF-8 is left out, Err when all are.

[Source: `std/dns.xo:36`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L36)

### lookup_srv {#lookup_srv}

```xo
fn lookup_srv(n: Net, service: Str, proto: Str, name: Str) -> List[Srv] ! NetErr uses net.dial
```

The SRV records of `_service._proto.name` (name alone when service and
proto are both ""), by priority, shuffled by weight within one (RFC
2782, Go's). Records with a target that is not a domain name are left
out; Err when every record is.

[Source: `std/dns.xo:41`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L41)

### lookup_addr {#lookup_addr}

```xo
fn lookup_addr(n: Net, ip: Str) -> List[Str] ! NetErr uses net.dial
```

The names of the address ip (PTR records of its in-addr.arpa or
ip6.arpa name), rooted; /etc/hosts first, as Go's LookupAddr.

[Source: `std/dns.xo:44`](https://github.com/xo-lang/xo/blob/main/std/dns.xo#L44)
