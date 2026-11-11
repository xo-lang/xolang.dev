---
title: "std/udp"
linkTitle: "udp"
description: "Go's net.ListenPacket and net.DialUDP: UDP datagrams over a Net."
toc: true
module: "std/udp"
source: "https://github.com/xo-lang/xo/blob/main/std/udp.xo"
generated: "scripts/sync-content.py from `xo doc std/udp`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`UdpConn`](#UdpConn)
  - method [`UdpConn.read_from`](#UdpConn.read_from)
  - method [`UdpConn.write_to`](#UdpConn.write_to)
  - method [`UdpConn.read`](#UdpConn.read)
  - method [`UdpConn.write`](#UdpConn.write)
  - method [`UdpConn.local_addr`](#UdpConn.local_addr)
  - method [`UdpConn.close`](#UdpConn.close)
- fn [`listen`](#listen)
- fn [`dial`](#dial)

## Types

### UdpConn {#UdpConn}

```xo
struct UdpConn {}
```

A UDP socket: bound by `listen` (any peer) or connected by `dial`
(one peer). A handle; `close` is idempotent.

[Source: `std/udp.xo:7`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L7)

#### UdpConn.read_from {#UdpConn.read_from}

```xo
fn (c: UdpConn) read_from(max: Int = 65535) -> (Bytes, Str) ! NetErr uses net
```

The next datagram and its sender ("ip:port"); a datagram longer than
max is cut to max, the rest discarded (Go's ReadFrom).

[Source: `std/udp.xo:18`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L18)

#### UdpConn.write_to {#UdpConn.write_to}

```xo
fn (c: UdpConn) write_to(data: Bytes, addr: Str) -> () ! NetErr uses net
```

Sends data as one datagram to addr; Net.only checks addr.

[Source: `std/udp.xo:20`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L20)

#### UdpConn.read {#UdpConn.read}

```xo
fn (c: UdpConn) read(max: Int = 65535) -> Bytes ! NetErr uses net
```

The next datagram from a dialed socket's peer.

[Source: `std/udp.xo:22`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L22)

#### UdpConn.write {#UdpConn.write}

```xo
fn (c: UdpConn) write(data: Bytes) -> () ! NetErr uses net
```

Sends data as one datagram to a dialed socket's peer.

[Source: `std/udp.xo:24`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L24)

#### UdpConn.local_addr {#UdpConn.local_addr}

```xo
fn (c: UdpConn) local_addr() -> Str
```

The socket's own address ("ip:port").

[Source: `std/udp.xo:26`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L26)

#### UdpConn.close {#UdpConn.close}

```xo
fn (c: UdpConn) close()
```

Closes the socket; a waiting read fails with `Io`.

[Source: `std/udp.xo:28`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L28)

## Functions

### listen {#listen}

```xo
pub fn listen(n: Net, addr: Str) -> UdpConn ! NetErr uses net.listen
```

A socket bound to addr ("host:port"; port 0 lets the system choose,
`local_addr` reports it): Go's net.ListenPacket("udp", addr).

[Source: `std/udp.xo:11`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L11)

### dial {#dial}

```xo
pub fn dial(n: Net, addr: Str) -> UdpConn ! NetErr uses net.dial
```

A socket connected to addr: `read` and `write` exchange datagrams
with that peer only (Go's net.DialUDP).

[Source: `std/udp.xo:14`](https://github.com/xo-lang/xo/blob/main/std/udp.xo#L14)
