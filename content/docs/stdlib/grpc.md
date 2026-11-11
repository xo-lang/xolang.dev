---
title: "std/grpc"
linkTitle: "grpc"
description: "std/grpc (decision 0535): gRPC over std/http's HTTP/2."
toc: true
module: "std/grpc"
source: "https://github.com/xo-lang/xo/blob/main/std/grpc.xo"
generated: "scripts/sync-content.py from `xo doc std/grpc`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Code`](#Code)
  - method [`Code.number`](#Code.number)
- type [`FrameErr`](#FrameErr)
- type [`Status`](#Status)
  - method [`Status.display`](#Status.display)
- type [`Call`](#Call)
- type [`RecvState`](#RecvState)
- type [`Recv`](#Recv)
  - method [`Recv.next`](#Recv.next)
- type [`Send`](#Send)
  - method [`Send.send`](#Send.send)
  - method [`Send.set_trailer`](#Send.set_trailer)
- type [`Server`](#Server)
  - method [`Server.with_max_recv`](#Server.with_max_recv)
  - method [`Server.unary`](#Server.unary)
  - method [`Server.stream`](#Server.stream)
  - method [`Server.router`](#Server.router)
- type [`Client`](#Client)
  - method [`Client.with_gzip`](#Client.with_gzip)
  - method [`Client.unary`](#Client.unary)
  - method [`Client.call`](#Client.call)
- type [`ClientCall`](#ClientCall)
  - method [`ClientCall.send`](#ClientCall.send)
  - method [`ClientCall.close_send`](#ClientCall.close_send)
  - method [`ClientCall.recv`](#ClientCall.recv)
- type [`CallState`](#CallState)
- fn [`code_from`](#code_from)
- fn [`frame`](#frame)
- fn [`unframe`](#unframe)
- fn [`encode_timeout`](#encode_timeout)
- fn [`decode_timeout`](#decode_timeout)
- fn [`encode_message`](#encode_message)
- fn [`encode_message_bytes`](#encode_message_bytes)
- fn [`decode_message`](#decode_message)
- fn [`decode_message_bytes`](#decode_message_bytes)
- fn [`bin_encode`](#bin_encode)
- fn [`bin_decode`](#bin_decode)
- fn [`server`](#server)
- fn [`client`](#client)

## Types

### Code {#Code}

```xo
enum Code {
  Ok
  Canceled
  Unknown
  InvalidArgument
  DeadlineExceeded
  NotFound
  AlreadyExists
  PermissionDenied
  ResourceExhausted
  FailedPrecondition
  Aborted
  OutOfRange
  Unimplemented
  Internal
  Unavailable
  DataLoss
  Unauthenticated
} derive Display
```

The 17 canonical status codes (their numbers are the wire values of `grpc-status`).

[Source: `std/grpc.xo:8`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L8)

#### Code.number {#Code.number}

```xo
fn (c: Code) number() -> Int
```

The wire number of a code (OK is 0, UNAUTHENTICATED is 16).

[Source: `std/grpc.xo:29`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L29)

### FrameErr {#FrameErr}

```xo
enum FrameErr {
  Truncated
  BadFlag(flag: Int)
  TooLarge(len: Int)
} derive Display
```

Why a frame was refused.

[Source: `std/grpc.xo:34`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L34)

### Status {#Status}

```xo
struct Status {
  code: Code
  message: Str = ""
  details: Bytes = b""
}
```

A call's outcome that is not OK, the error of every call: the code, the status message and the raw
`grpc-status-details-bin` payload when the peer sent one.

[Source: `std/grpc.xo:68`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L68)

#### Status.display {#Status.display}

```xo
fn (s: Status) display() -> Str
```

Displays as `rpc error: code = NotFound desc = no such user` (grpc-go's text).

[Source: `std/grpc.xo:75`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L75)

### Call {#Call}

```xo
struct Call {
  method: Str
  metadata: Map[Str, Str]
  timeout: Duration?
}
```

The call a handler is serving.

[Source: `std/grpc.xo:78`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L78)

### RecvState {#RecvState}

```xo
struct RecvState {
  buf: Bytes = b""
  at: Int = 0
  done: Bool = false
  gzip: Bool = false
}
```

[Source: `std/grpc.xo:87`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L87)

### Recv {#Recv}

```xo
struct Recv {
  body: http.BodyReader
  st: Mutex[RecvState]
  max: Int
}
```

The messages of a call's request stream, as a handler reads them.

[Source: `std/grpc.xo:96`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L96)

#### Recv.next {#Recv.next}

```xo
fn (r: Recv) next() -> Bytes? ! Status
```

The next message; None when the client has finished sending. A message above the receive limit is
`ResourceExhausted`, a cut stream or a bad frame `Internal`, a compressed message `Unimplemented`.

[Source: `std/grpc.xo:104`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L104)

### Send {#Send}

```xo
struct Send {
  w: http.BodyWriter
  gzip: Bool = false
}
```

The messages a handler sends back.

[Source: `std/grpc.xo:107`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L107)

#### Send.send {#Send.send}

```xo
fn (s: Send) send(msg: Bytes) -> () ! Status
```

Sends one message (a frame is flushed at once).

[Source: `std/grpc.xo:114`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L114)

#### Send.set_trailer {#Send.set_trailer}

```xo
fn (s: Send) set_trailer(name: Str, value: Str)
```

A trailer sent after the last message, next to `grpc-status` and `grpc-message`.

[Source: `std/grpc.xo:116`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L116)

### Server {#Server}

```xo
struct Server {
  routes: http.Router
  max_recv: Int
  methods: List[Str]
  clock: Clock
}
```

A gRPC server: methods registered on it are served through `router()` by an HTTP/2 `http.Server`.

[Source: `std/grpc.xo:119`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L119)

#### Server.with_max_recv {#Server.with_max_recv}

```xo
fn (s: Server) with_max_recv(n: Int) -> Server
```

The server with another receive limit in bytes.

[Source: `std/grpc.xo:130`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L130)

#### Server.unary {#Server.unary}

```xo
fn (var s: Server) unary[fx: Effects](method: Str, f: fn(Call, Bytes) -> Bytes ! Status uses fx) uses (fx, clock)
```

Registers a unary method (`/package.Service/Method`).

[Source: `std/grpc.xo:132`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L132)

#### Server.stream {#Server.stream}

```xo
fn (var s: Server) stream[fx: Effects](method: Str, f: fn(Call, Recv, Send) -> () ! Status uses fx) uses (fx, clock)
```

Registers a method of any kind: a handler reads the request messages from `Recv` and writes the responses to
`Send`; returning Ok ends the call with OK, an error with its status.

[Source: `std/grpc.xo:135`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L135)

#### Server.router {#Server.router}

```xo
fn (s: Server) router() -> http.Router
```

The routes to give `http.server`, with `http.Protocol.UnencryptedHttp2` (or TLS and ALPN h2) in its protocols.

[Source: `std/grpc.xo:137`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L137)

### Client {#Client}

```xo
struct Client {
  http: http.Client
  base: Str
  gzip: Bool = false
}
```

A gRPC client over an `http.Client`.

[Source: `std/grpc.xo:140`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L140)

#### Client.with_gzip {#Client.with_gzip}

```xo
fn (c: Client) with_gzip() -> Client
```

The client sending its messages gzip compressed (`grpc-encoding: gzip`); responses are read compressed or not.

[Source: `std/grpc.xo:150`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L150)

#### Client.unary {#Client.unary}

```xo
fn (c: Client) unary(method: Str, req: Bytes, metadata: Map[Str, Str] = {}, timeout: Duration? = None) -> Bytes ! Status uses net.dial
```

One unary call: the request message, the response message, or the call's status. `timeout` is sent as
`grpc-timeout` and bounds the call (DeadlineExceeded).

[Source: `std/grpc.xo:153`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L153)

#### Client.call {#Client.call}

```xo
fn (c: Client) call[R, fx: Effects](method: Str, metadata: Map[Str, Str], timeout: Duration?, f: fn(ClientCall) -> R ! Status uses fx) -> R ! Status uses (fx, net.dial)
```

Runs `f` on a streaming call: `f` sends with `send`, ends the request with `close_send` and reads with `recv`.
The call's status is the result of `recv` after the last message (an error when it is not OK).

[Source: `std/grpc.xo:174`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L174)

### ClientCall {#ClientCall}

```xo
struct ClientCall {
  w: http.PipeWriter
  head: Chan[(http.ClientStream?, Status?)]
  st: Mutex[CallState]
  max: Int
  gzip: Bool = false
}
```

The client side of a streaming call, valid inside `Client.call`.

[Source: `std/grpc.xo:156`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L156)

#### ClientCall.send {#ClientCall.send}

```xo
fn (c: ClientCall) send(msg: Bytes) -> () ! Status
```

Sends one message.

[Source: `std/grpc.xo:176`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L176)

#### ClientCall.close_send {#ClientCall.close_send}

```xo
fn (c: ClientCall) close_send()
```

Ends the request stream.

[Source: `std/grpc.xo:178`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L178)

#### ClientCall.recv {#ClientCall.recv}

```xo
fn (c: ClientCall) recv() -> Bytes? ! Status uses net.dial
```

The next response message; None at the end of an OK call, the status as an error otherwise.

[Source: `std/grpc.xo:180`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L180)

### CallState {#CallState}

```xo
struct CallState {
  stream: http.ClientStream? = None
  failed: Status? = None
  recv: RecvState = RecvState{}
  final: Status? = None
}
```

[Source: `std/grpc.xo:165`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L165)

## Functions

### code_from {#code_from}

```xo
fn code_from(n: Int) -> Code?
```

The code of a `grpc-status` number; None above 16.

[Source: `std/grpc.xo:31`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L31)

### frame {#frame}

```xo
fn frame(payload: Bytes, compressed: Bool = false) -> Bytes
```

One message frame: a flag byte (1 for a compressed payload), a 4 byte big endian length, the payload.

[Source: `std/grpc.xo:41`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L41)

### unframe {#unframe}

```xo
fn unframe(data: Bytes, at: Int, max_len: Int = 4194304) -> (Bool, Bytes, Int) ! FrameErr
```

Reads the frame at `at`: (compressed, payload, next offset). A length above `max_len` is `TooLarge` (grpc-go's
default receive limit is 4 MiB).

[Source: `std/grpc.xo:44`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L44)

### encode_timeout {#encode_timeout}

```xo
fn encode_timeout(ns: Int) -> Str
```

The `grpc-timeout` header value for a duration in nanoseconds: at most 8 digits and the largest unit that keeps
it (`n`, `u`, `m`, `S`, `M`, `H`), as grpc-go's encodeTimeout.

[Source: `std/grpc.xo:48`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L48)

### decode_timeout {#decode_timeout}

```xo
fn decode_timeout(s: Str) -> Int?
```

The nanoseconds of a `grpc-timeout` value; None for a value that is not 1 to 8 digits and one unit letter.

[Source: `std/grpc.xo:50`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L50)

### encode_message {#encode_message}

```xo
fn encode_message(s: Str) -> Str
```

`grpc-message` encoding: bytes outside 0x20 to 0x7e and `%` are written as `%XX` (upper case hex).

[Source: `std/grpc.xo:53`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L53)

### encode_message_bytes {#encode_message_bytes}

```xo
fn encode_message_bytes(b: Bytes) -> Str
```

`encode_message` of arbitrary bytes (a status message from another language need not be UTF-8).

[Source: `std/grpc.xo:55`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L55)

### decode_message {#decode_message}

```xo
fn decode_message(s: Str) -> Str
```

The inverse; a malformed escape is kept as written (grpc-go), and bytes that are not UTF-8 become U+FFFD.

[Source: `std/grpc.xo:57`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L57)

### decode_message_bytes {#decode_message_bytes}

```xo
fn decode_message_bytes(s: Str) -> Bytes
```

The inverse as raw bytes, exactly what grpc-go's client reports.

[Source: `std/grpc.xo:59`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L59)

### bin_encode {#bin_encode}

```xo
fn bin_encode(data: Bytes) -> Str
```

A binary metadata value as grpc-go sends it: unpadded standard base64, for a name that ends in `-bin`.

[Source: `std/grpc.xo:62`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L62)

### bin_decode {#bin_decode}

```xo
fn bin_decode(value: Str) -> Bytes?
```

The bytes of a `-bin` metadata value, padded or not (grpc-go accepts both); None when it is not base64.

[Source: `std/grpc.xo:64`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L64)

### server {#server}

```xo
fn server(clock: Clock) -> Server
```

A server with grpc-go's 4 MiB receive limit. `clock` times the deadlines clients send: a handler still running at
its `grpc-timeout` is cancelled and the call ends with `DeadlineExceeded`.

[Source: `std/grpc.xo:128`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L128)

### client {#client}

```xo
fn client(c: http.Client, base: Str) -> Client
```

A client of `base` (`http://host:port`, plain HTTP/2 with prior knowledge, or `https://host:port`).

[Source: `std/grpc.xo:148`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L148)
