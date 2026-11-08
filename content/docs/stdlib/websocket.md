---
title: "std/websocket"
linkTitle: "websocket"
description: "WebSockets (RFC 6455) with gorilla/websocket's behavior: a handler upgrades its request, a client..."
toc: true
module: "std/websocket"
source: "https://github.com/xo-lang/xo/blob/main/std/websocket.xo"
generated: "scripts/sync-content.py from `xo doc std/websocket`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Message`](#message)
- type [`Kind`](#kind)
- type [`WsErr`](#wserr)
  - method [`WsErr.display`](#wserrdisplay)
- type [`WsConn`](#wsconn)
  - method [`WsConn.read`](#wsconnread)
  - method [`WsConn.write`](#wsconnwrite)
  - method [`WsConn.write_text`](#wsconnwrite_text)
  - method [`WsConn.ping`](#wsconnping)
  - method [`WsConn.close`](#wsconnclose)
  - method [`WsConn.subprotocol`](#wsconnsubprotocol)
  - method [`WsConn.set_deadline`](#wsconnset_deadline)
  - method [`WsConn.set_read_deadline`](#wsconnset_read_deadline)
  - method [`WsConn.set_write_deadline`](#wsconnset_write_deadline)
  - method [`WsConn.on_ping`](#wsconnon_ping)
  - method [`WsConn.on_pong`](#wsconnon_pong)
  - method [`WsConn.pong`](#wsconnpong)
- fn [`upgrade`](#upgrade)
- fn [`dial`](#dial)

## Types

### Message

```xo
struct Message {
  kind: Kind
  data: Bytes
}
```

A whole message: its kind and data (a text message's data is valid
UTF-8).

[Source: `std/websocket.xo:9`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L9)

### Kind

```xo
enum Kind {
  Text
  Binary
}
```

[Source: `std/websocket.xo:14`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L14)

### WsErr

```xo
enum WsErr {
  Closed(code: Int, reason: Str)
  Protocol(msg: Str)
  TooBig(limit: Int)
  Net(err: NetErr)
  Handshake(status: Int, msg: Str)
}
```

Why a connection stopped or an operation failed. Displays as
gorilla's errors: `websocket: close 1001 (going away): bye`,
`websocket: unknown opcode 3`, `websocket: read limit exceeded`,
`websocket: bad handshake`.

[Source: `std/websocket.xo:23`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L23)

#### WsErr.display

```xo
fn (e: WsErr) display() -> Str
```

[Source: `std/websocket.xo:38`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L38)

### WsConn

```xo
struct WsConn {}
```

A WebSocket connection, either side. One task may read while another
writes; writes are whole messages, one at a time.

[Source: `std/websocket.xo:42`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L42)

#### WsConn.read

```xo
fn (c: WsConn) read() -> Message ! WsErr
```

The next whole message. Pings are answered with pongs and pongs
skipped; a close frame is answered and is `Closed`.

[Source: `std/websocket.xo:46`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L46)

#### WsConn.write

```xo
fn (c: WsConn) write(m: Message) -> () ! WsErr
```

[Source: `std/websocket.xo:47`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L47)

#### WsConn.write_text

```xo
fn (c: WsConn) write_text(s: Str) -> () ! WsErr
```

[Source: `std/websocket.xo:48`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L48)

#### WsConn.ping

```xo
fn (c: WsConn) ping(data: Bytes = b"") -> () ! WsErr
```

[Source: `std/websocket.xo:49`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L49)

#### WsConn.close

```xo
fn (c: WsConn) close(code: Int = 1000, reason: Str = "") -> () ! WsErr
```

Sends a close frame with code and reason (none for 1005) and closes
the connection; later writes fail.

[Source: `std/websocket.xo:52`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L52)

#### WsConn.subprotocol

```xo
fn (c: WsConn) subprotocol() -> Str
```

The subprotocol the server chose ("" for none).

[Source: `std/websocket.xo:54`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L54)

#### WsConn.set_deadline

```xo
fn (c: WsConn) set_deadline(clock: Clock, t: Time?) uses clock
```

Deadlines (decision 0430), gorilla's SetReadDeadline and
SetWriteDeadline: a read or write past its deadline fails with
Net(Timeout), and the connection stays failed. None clears it.

[Source: `std/websocket.xo:58`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L58)

#### WsConn.set_read_deadline

```xo
fn (c: WsConn) set_read_deadline(clock: Clock, t: Time?) uses clock
```

[Source: `std/websocket.xo:59`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L59)

#### WsConn.set_write_deadline

```xo
fn (c: WsConn) set_write_deadline(clock: Clock, t: Time?) uses clock
```

[Source: `std/websocket.xo:60`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L60)

#### WsConn.on_ping

```xo
fn (c: WsConn) on_ping[fx: Effects](f: fn(Bytes) -> () uses fx) uses fx
```

gorilla's SetPingHandler (decision 0430): f runs for each ping that
read() reads, in place of the automatic pong (send one with `pong`).
A later call replaces f. f runs inside read(), so it must not call
read().

[Source: `std/websocket.xo:65`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L65)

#### WsConn.on_pong

```xo
fn (c: WsConn) on_pong[fx: Effects](f: fn(Bytes) -> () uses fx) uses fx
```

gorilla's SetPongHandler (decision 0430): f runs for each pong that
read() reads (a keepalive moves the read deadline here).

[Source: `std/websocket.xo:68`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L68)

#### WsConn.pong

```xo
fn (c: WsConn) pong(data: Bytes = b"") -> () ! WsErr
```

A pong control frame, as gorilla's WriteControl(PongMessage).

[Source: `std/websocket.xo:70`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L70)

## Functions

### upgrade

```xo
fn upgrade[fx: Effects](req: http.Request, f: fn(WsConn) -> () uses fx, protocols: List[Str] = [], origins: List[Str] = [], max_message: Int = 1048576) -> http.Response uses fx
```

The response that upgrades req to a WebSocket and runs f with it (the
connection closes when f returns), as gorilla's Upgrader: GET,
`Connection: upgrade`, `Upgrade: websocket`, `Sec-WebSocket-Version:
13`, a key of 16 bytes, and an `Origin` whose host is the request's
(or one of origins; `["*"]` allows any); else 400, 405, or 403 with
the status text. The first of protocols the client offers is the
subprotocol.

[Source: `std/websocket.xo:79`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L79)

### dial

```xo
fn dial(net: Net, url: Str, headers: Map[Str, Str] = {}, protocols: List[Str] = [], max_message: Int = 1048576, roots: Bytes = b"") -> WsConn ! WsErr uses net.dial
```

A client connection to url (`ws://host[:port]/path?query`, or
`wss://` over TLS through std/tls, verified against roots, a PEM
bundle, when given, else the system's), as gorilla's Dialer: the
handshake with headers and the protocols offered, the 101 and its
Sec-WebSocket-Accept checked.

[Source: `std/websocket.xo:86`](https://github.com/xo-lang/xo/blob/main/std/websocket.xo#L86)
