---
title: "std/grpc"
linkTitle: "grpc"
description: "gRPC over std/http's HTTP/2."
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
- fn [`frame_msg`](#frame_msg)
- fn [`hex_val`](#hex_val)
- fn [`status_new`](#status_new)
- fn [`reserved`](#reserved)
- fn [`finish`](#finish)
- fn [`pull`](#pull)
- fn [`trailers_only`](#trailers_only)
- fn [`serve_call`](#serve_call)
- fn [`from_client_err`](#from_client_err)
- fn [`call_headers`](#call_headers)
- fn [`http_to_code`](#http_to_code)
- fn [`final_status`](#final_status)

## Types

### Code {#Code}

```xo
pub enum Code {
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

[Source: `std/grpc.xo:13`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L13)

#### Code.number {#Code.number}

```xo
pub fn (c: Code) number() -> Int
```

The wire number of a code (OK is 0, UNAUTHENTICATED is 16).

[Source: `std/grpc.xo:34`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L34)

### FrameErr {#FrameErr}

```xo
pub enum FrameErr {
  Truncated
  BadFlag(flag: Int)
  TooLarge(len: Int)
} derive Display
```

Why a frame was refused.

[Source: `std/grpc.xo:66`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L66)

### Status {#Status}

```xo
pub struct Status {
  pub code: Code
  pub message: Str = ""
  pub details: Bytes = b""
}
```

A call's outcome that is not OK, the error of every call: the code, the status message and the raw
`grpc-status-details-bin` payload when the peer sent one.

[Source: `std/grpc.xo:216`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L216)

#### Status.display {#Status.display}

```xo
pub fn (s: Status) display() -> Str
```

Displays as `rpc error: code = NotFound desc = no such user` (grpc-go's text).

[Source: `std/grpc.xo:223`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L223)

### Call {#Call}

```xo
pub struct Call {
  pub method: Str
  pub metadata: Map[Str, Str]
  pub timeout: Duration?
}
```

The call a handler is serving.

[Source: `std/grpc.xo:228`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L228)

### RecvState {#RecvState}

```xo
pub struct RecvState {
  pub buf: Bytes = b""
  pub at: Int = 0
  pub done: Bool = false
  pub gzip: Bool = false
}
```

[Source: `std/grpc.xo:237`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L237)

### Recv {#Recv}

```xo
pub struct Recv {
  pub body: http.BodyReader
  pub st: Mutex[RecvState]
  pub max: Int
}
```

The messages of a call's request stream, as a handler reads them.

[Source: `std/grpc.xo:246`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L246)

#### Recv.next {#Recv.next}

```xo
pub fn (r: Recv) next() -> Bytes? ! Status
```

The next message; None when the client has finished sending. A message above the receive limit is
`ResourceExhausted`, a cut stream or a bad frame `Internal`, a compressed message `Unimplemented`.

[Source: `std/grpc.xo:254`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L254)

### Send {#Send}

```xo
pub struct Send {
  pub w: http.BodyWriter
  pub gzip: Bool = false
}
```

The messages a handler sends back.

[Source: `std/grpc.xo:273`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L273)

#### Send.send {#Send.send}

```xo
pub fn (s: Send) send(msg: Bytes) -> () ! Status
```

Sends one message (a frame is flushed at once).

[Source: `std/grpc.xo:280`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L280)

#### Send.set_trailer {#Send.set_trailer}

```xo
pub fn (s: Send) set_trailer(name: Str, value: Str)
```

A trailer sent after the last message, next to `grpc-status` and `grpc-message`.

[Source: `std/grpc.xo:292`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L292)

### Server {#Server}

```xo
pub struct Server {
  pub routes: http.Router
  pub max_recv: Int
  pub methods: List[Str]
  pub clock: Clock
}
```

A gRPC server: methods registered on it are served through `router()` by an HTTP/2 `http.Server`.

[Source: `std/grpc.xo:297`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L297)

#### Server.with_max_recv {#Server.with_max_recv}

```xo
pub fn (s: Server) with_max_recv(n: Int) -> Server
```

The server with another receive limit in bytes.

[Source: `std/grpc.xo:311`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L311)

#### Server.unary {#Server.unary}

```xo
pub fn (var s: Server) unary[fx: Effects](method: Str, f: fn(Call, Bytes) -> Bytes ! Status uses fx) uses (fx, clock)
```

Registers a unary method (`/package.Service/Method`).

[Source: `std/grpc.xo:316`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L316)

#### Server.stream {#Server.stream}

```xo
pub fn (var s: Server) stream[fx: Effects](method: Str, f: fn(Call, Recv, Send) -> () ! Status uses fx) uses (fx, clock)
```

Registers a method of any kind: a handler reads the request messages from `Recv` and writes the responses to
`Send`; returning Ok ends the call with OK, an error with its status.

[Source: `std/grpc.xo:329`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L329)

#### Server.router {#Server.router}

```xo
pub fn (s: Server) router() -> http.Router
```

The routes to give `http.server`, with `http.Protocol.UnencryptedHttp2` (or TLS and ALPN h2) in its protocols.

[Source: `std/grpc.xo:339`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L339)

### Client {#Client}

```xo
pub struct Client {
  pub http: http.Client
  pub base: Str
  pub gzip: Bool = false
}
```

A gRPC client over an `http.Client`.

[Source: `std/grpc.xo:362`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L362)

#### Client.with_gzip {#Client.with_gzip}

```xo
pub fn (c: Client) with_gzip() -> Client
```

The client sending its messages gzip compressed (`grpc-encoding: gzip`); responses are read compressed or not.

[Source: `std/grpc.xo:376`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L376)

#### Client.unary {#Client.unary}

```xo
pub fn (c: Client) unary(method: Str, req: Bytes, metadata: Map[Str, Str] = {}, timeout: Duration? = None) -> Bytes ! Status uses net.dial
```

One unary call: the request message, the response message, or the call's status. `timeout` is sent as
`grpc-timeout` and bounds the call (DeadlineExceeded).

[Source: `std/grpc.xo:382`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L382)

#### Client.call {#Client.call}

```xo
pub fn (c: Client) call[R, fx: Effects](method: Str, metadata: Map[Str, Str], timeout: Duration?, f: fn(ClientCall) -> R ! Status uses fx) -> R ! Status uses (fx, net.dial)
```

Runs `f` on a streaming call: `f` sends with `send`, ends the request with `close_send` and reads with `recv`.
The call's status is the result of `recv` after the last message (an error when it is not OK).

[Source: `std/grpc.xo:440`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L440)

### ClientCall {#ClientCall}

```xo
pub struct ClientCall {
  pub w: http.PipeWriter
  pub head: Chan[(http.ClientStream?, Status?)]
  pub st: Mutex[CallState]
  pub max: Int
  pub gzip: Bool = false
}
```

The client side of a streaming call, valid inside `Client.call`.

[Source: `std/grpc.xo:422`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L422)

#### ClientCall.send {#ClientCall.send}

```xo
pub fn (c: ClientCall) send(msg: Bytes) -> () ! Status
```

Sends one message.

[Source: `std/grpc.xo:488`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L488)

#### ClientCall.close_send {#ClientCall.close_send}

```xo
pub fn (c: ClientCall) close_send()
```

Ends the request stream.

[Source: `std/grpc.xo:496`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L496)

#### ClientCall.recv {#ClientCall.recv}

```xo
pub fn (c: ClientCall) recv() -> Bytes? ! Status uses net.dial
```

The next response message; None at the end of an OK call, the status as an error otherwise.

[Source: `std/grpc.xo:501`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L501)

### CallState {#CallState}

```xo
pub struct CallState {
  pub stream: http.ClientStream? = None
  pub failed: Status? = None
  pub recv: RecvState = RecvState{}
  pub final: Status? = None
}
```

[Source: `std/grpc.xo:431`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L431)

## Functions

### code_from {#code_from}

```xo
pub fn code_from(n: Int) -> Code?
```

The code of a `grpc-status` number; None above 16.

[Source: `std/grpc.xo:57`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L57)

### frame {#frame}

```xo
pub fn frame(payload: Bytes, compressed: Bool = false) -> Bytes
```

One message frame: a flag byte (1 for a compressed payload), a 4 byte big endian length, the payload.

[Source: `std/grpc.xo:73`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L73)

### unframe {#unframe}

```xo
pub fn unframe(data: Bytes, at: Int, max_len: Int = 4194304) -> (Bool, Bytes, Int) ! FrameErr
```

Reads the frame at `at`: (compressed, payload, next offset). A length above `max_len` is `TooLarge` (grpc-go's
default receive limit is 4 MiB).

[Source: `std/grpc.xo:86`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L86)

### encode_timeout {#encode_timeout}

```xo
pub fn encode_timeout(ns: Int) -> Str
```

The `grpc-timeout` header value for a duration in nanoseconds: at most 8 digits and the largest unit that keeps
it (`n`, `u`, `m`, `S`, `M`, `H`), as grpc-go's encodeTimeout.

[Source: `std/grpc.xo:106`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L106)

### decode_timeout {#decode_timeout}

```xo
pub fn decode_timeout(s: Str) -> Int?
```

The nanoseconds of a `grpc-timeout` value; None for a value that is not 1 to 8 digits and one unit letter.

[Source: `std/grpc.xo:123`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L123)

### encode_message {#encode_message}

```xo
pub fn encode_message(s: Str) -> Str
```

`grpc-message` encoding: bytes outside 0x20 to 0x7e and `%` are written as `%XX` (upper case hex).

[Source: `std/grpc.xo:150`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L150)

### encode_message_bytes {#encode_message_bytes}

```xo
pub fn encode_message_bytes(b: Bytes) -> Str
```

`encode_message` of arbitrary bytes (a status message from another language need not be UTF-8).

[Source: `std/grpc.xo:155`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L155)

### decode_message {#decode_message}

```xo
pub fn decode_message(s: Str) -> Str
```

The inverse; a malformed escape is kept as written (grpc-go), and bytes that are not UTF-8 become U+FFFD.

[Source: `std/grpc.xo:174`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L174)

### decode_message_bytes {#decode_message_bytes}

```xo
pub fn decode_message_bytes(s: Str) -> Bytes
```

The inverse as raw bytes, exactly what grpc-go's client reports.

[Source: `std/grpc.xo:179`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L179)

### bin_encode {#bin_encode}

```xo
pub fn bin_encode(data: Bytes) -> Str
```

A binary metadata value as grpc-go sends it: unpadded standard base64, for a name that ends in `-bin`.

[Source: `std/grpc.xo:200`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L200)

### bin_decode {#bin_decode}

```xo
pub fn bin_decode(value: Str) -> Bytes?
```

The bytes of a `-bin` metadata value, padded or not (grpc-go accepts both); None when it is not base64.

[Source: `std/grpc.xo:203`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L203)

### server {#server}

```xo
pub fn server(clock: Clock) -> Server
```

A server with grpc-go's 4 MiB receive limit. `clock` times the deadlines clients send: a handler still running at
its `grpc-timeout` is cancelled and the call ends with `DeadlineExceeded`.

[Source: `std/grpc.xo:306`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L306)

### client {#client}

```xo
pub fn client(c: http.Client, base: Str) -> Client
```

A client of `base` (`http://host:port`, plain HTTP/2 with prior knowledge, or `https://host:port`).

[Source: `std/grpc.xo:370`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L370)

### frame_msg {#frame_msg}

```xo
fn frame_msg(msg: Bytes, gzip: Bool) -> Bytes
```

The frame of msg, gzip compressed when gzip.

[Source: `std/grpc.xo:550`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L550)

### hex_val {#hex_val}

```xo
fn hex_val(c: Int) -> Int
```

[Source: `std/grpc.xo:557`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L557)

### status_new {#status_new}

```xo
fn status_new(code: Code, message: Str) -> Status
```

[Source: `std/grpc.xo:569`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L569)

### reserved {#reserved}

```xo
fn reserved(name: Str) -> Bool
```

[Source: `std/grpc.xo:573`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L573)

### finish {#finish}

```xo
fn finish(w: http.BodyWriter, st: Status)
```

[Source: `std/grpc.xo:577`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L577)

### pull {#pull}

```xo
fn pull[fx: Effects](st: RecvState, max: Int, more: fn() -> Bytes? ! Status uses fx) -> (Bytes?, RecvState) ! Status uses fx
```

The next message of the stream whose buffered state is `st`, reading more with `more` (None at its end).

[Source: `std/grpc.xo:585`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L585)

### trailers_only {#trailers_only}

```xo
fn trailers_only(st: Status) -> http.Response
```

[Source: `std/grpc.xo:638`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L638)

### serve_call {#serve_call}

```xo
fn serve_call[fx: Effects](f: fn(Call, Recv, Send) -> () ! Status uses fx, clock: Clock, max: Int, method: Str, req: http.Request, body: http.BodyReader) -> http.Response uses (fx, clock)
```

[Source: `std/grpc.xo:644`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L644)

### from_client_err {#from_client_err}

```xo
fn from_client_err(e: http.ClientErr) -> Status
```

[Source: `std/grpc.xo:685`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L685)

### call_headers {#call_headers}

```xo
fn call_headers(metadata: Map[Str, Str], timeout: Duration?, gzip: Bool) -> Map[Str, Str]
```

[Source: `std/grpc.xo:695`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L695)

### http_to_code {#http_to_code}

```xo
fn http_to_code(status: Int) -> Code
```

[Source: `std/grpc.xo:713`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L713)

### final_status {#final_status}

```xo
fn final_status(st: http.ClientStream) -> Status
```

The call's status from a finished stream: its trailers, or the head of a trailers only response.

[Source: `std/grpc.xo:730`](https://github.com/xo-lang/xo/blob/main/std/grpc.xo#L730)
