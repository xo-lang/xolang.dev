---
title: "std/amqp"
linkTitle: "amqp"
description: "std/amqp: AMQP 1.0 (ISO/IEC 19464, OASIS), a port of github.com/Azure/go-amqp v1.7.0 (MIT, Copyri..."
toc: true
module: "std/amqp"
source: "https://github.com/xo-lang/xo/blob/main/std/amqp.xo"
generated: "scripts/sync-content.py from `xo doc std/amqp`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Value`](#value)
- type [`AmqpErr`](#amqperr)
- type [`Role`](#role)
- type [`SenderSettleMode`](#sendersettlemode)
- type [`ReceiverSettleMode`](#receiversettlemode)
- type [`WireError`](#wireerror)
- type [`DeliveryState`](#deliverystate)
- type [`Source`](#source)
- type [`Target`](#target)
- type [`Open`](#open)
- type [`Begin`](#begin)
- type [`Attach`](#attach)
- type [`Flow`](#flow)
- type [`Transfer`](#transfer)
- type [`Disposition`](#disposition)
- type [`Detach`](#detach)
- type [`End`](#end)
- type [`Close`](#close)
- type [`SaslMechanisms`](#saslmechanisms)
- type [`SaslInit`](#saslinit)
- type [`SaslChallenge`](#saslchallenge)
- type [`SaslResponse`](#saslresponse)
- type [`SaslOutcome`](#sasloutcome)
- type [`FrameBody`](#framebody)
- type [`Frame`](#frame)
- type [`Sasl`](#sasl)
- type [`ConnOptions`](#connoptions)
- type [`Transport`](#transport)
- type [`ConnState`](#connstate)
- type [`Connection`](#connection)
  - method [`Connection.peer_container_id`](#connectionpeer_container_id)
  - method [`Connection.peer_max_frame_size`](#connectionpeer_max_frame_size)
  - method [`Connection.peer_channel_max`](#connectionpeer_channel_max)
  - method [`Connection.peer_idle_timeout_ms`](#connectionpeer_idle_timeout_ms)
  - method [`Connection.peer_properties`](#connectionpeer_properties)
  - method [`Connection.keepalive`](#connectionkeepalive)
  - method [`Connection.send`](#connectionsend)
  - method [`Connection.recv`](#connectionrecv)
  - method [`Connection.close`](#connectionclose)
  - method [`Connection.abort`](#connectionabort)
  - method [`Connection.begin`](#connectionbegin)
  - method [`Connection.end_session`](#connectionend_session)
  - method [`Connection.new_sender`](#connectionnew_sender)
  - method [`Connection.new_receiver`](#connectionnew_receiver)
- type [`SessionOptions`](#sessionoptions)
- type [`Session`](#session)
- type [`Header`](#header)
- type [`Properties`](#properties)
- type [`Body`](#body)
- type [`Message`](#message)
- type [`SessState`](#sessstate)
- type [`Delivery`](#delivery)
- type [`LinkState`](#linkstate)
- type [`SenderOptions`](#senderoptions)
- type [`ReceiverOptions`](#receiveroptions)
- type [`Sender`](#sender)
  - method [`Sender.send`](#sendersend)
  - method [`Sender.close`](#senderclose)
  - method [`Sender.remote_attach`](#senderremote_attach)
- type [`Receiver`](#receiver)
  - method [`Receiver.receive`](#receiverreceive)
  - method [`Receiver.remote_attach`](#receiverremote_attach)
  - method [`Receiver.issue_credit`](#receiverissue_credit)
  - method [`Receiver.drain`](#receiverdrain)
  - method [`Receiver.accept`](#receiveraccept)
  - method [`Receiver.reject`](#receiverreject)
  - method [`Receiver.release`](#receiverrelease)
  - method [`Receiver.modify`](#receivermodify)
  - method [`Receiver.close`](#receiverclose)
- fn [`encode`](#encode)
- fn [`decode`](#decode)
- fn [`encode_frame`](#encode_frame)
- fn [`decode_frame`](#decode_frame)
- fn [`dial`](#dial)
- fn [`encode_message`](#encode_message)
- fn [`decode_message`](#decode_message)
- fn [`cbs_put_token`](#cbs_put_token)

## Types

### Value

```xo
enum Value {
  Null
  Bool(v: Bool)
  UByte(v: UInt8)
  UShort(v: UInt16)
  UInt(v: UInt32)
  ULong(v: UInt64)
  Byte(v: Int8)
  Short(v: Int16)
  Int(v: Int32)
  Long(v: Int64)
  Float(v: Float32)
  Double(v: Float)
  Decimal32(bits: UInt32)
  Decimal64(bits: UInt64)
  Decimal128(bits: Bytes)
  Char(v: Rune)
  Timestamp(ms: Int)
  Uuid(bytes: Bytes)
  Binary(v: Bytes)
  Str(v: Str)
  Symbol(v: Str)
  List(items: List[Value])
  Map(pairs: List[(Value, Value)])
  Array(items: List[Value])
  Described(descriptor: Value, value: Value)
}
```

An AMQP 1.0 value (section 1.6 of the specification): the primitive
types, the compound types, and a described value.

[Source: `std/amqp.xo:11`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L11)

### AmqpErr

```xo
enum AmqpErr {
  Decode(msg: Str)
  Encode(msg: Str)
  Net(msg: Str)
  Protocol(msg: Str)
  Peer(error: WireError)
  Auth(code: Int, msg: Str)
}
```

[Source: `std/amqp.xo:44`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L44)

### Role

```xo
enum Role {
  Sender
  Receiver
}
```

[Source: `std/amqp.xo:72`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L72)

### SenderSettleMode

```xo
enum SenderSettleMode {
  Unsettled
  Settled
  Mixed
}
```

sender-settle-mode (ubyte)

[Source: `std/amqp.xo:78`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L78)

### ReceiverSettleMode

```xo
enum ReceiverSettleMode {
  First
  Second
}
```

receiver-settle-mode (ubyte)

[Source: `std/amqp.xo:85`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L85)

### WireError

```xo
struct WireError {
  condition: Str
  description: Str = ""
  info: List[(Str, Value)] = []
}
```

An AMQP error: a symbolic condition (`amqp:link:detach-forced`), text,
and a map of details.

[Source: `std/amqp.xo:92`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L92)

### DeliveryState

```xo
enum DeliveryState {
  Received(section_number: UInt32, section_offset: UInt64)
  Accepted
  Rejected(error: WireError?)
  Released
  Modified(delivery_failed: Bool, undeliverable_here: Bool, annotations: List[(Value, Value)])
}
```

The outcome or state of a delivery (section 3.4).

[Source: `std/amqp.xo:99`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L99)

### Source

```xo
struct Source {
  address: Str = ""
  durable: Int = 0
  expiry_policy: Str = ""
  timeout: Int = 0
  dynamic: Bool = false
  dynamic_node_properties: List[(Str, Value)] = []
  distribution_mode: Str = ""
  filter: List[(Str, Value)] = []
  default_outcome: Value = Value.Null
  outcomes: List[Str] = []
  capabilities: List[Str] = []
}
```

A link's source (section 3.5.3).
Fields typed Int that hold an unsigned wire value (durable, timeout, max_frame_size,
channel_max, handle_max, initial_delivery_count, max_message_size) must be in range
for the wire type (0 to 2^32-1, 2^16-1, 2^63-1); encode_frame refuses one outside it.

[Source: `std/amqp.xo:111`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L111)

### Target

```xo
struct Target {
  address: Str = ""
  durable: Int = 0
  expiry_policy: Str = ""
  timeout: Int = 0
  dynamic: Bool = false
  dynamic_node_properties: List[(Str, Value)] = []
  capabilities: List[Str] = []
}
```

A link's target (section 3.5.4).

[Source: `std/amqp.xo:126`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L126)

### Open

```xo
struct Open {
  container_id: Str
  hostname: Str = ""
  max_frame_size: Int = 4294967295
  channel_max: Int = 65535
  idle_timeout_ms: Int = 0
  outgoing_locales: List[Str] = []
  incoming_locales: List[Str] = []
  offered_capabilities: List[Str] = []
  desired_capabilities: List[Str] = []
  properties: List[(Str, Value)] = []
}
```

[Source: `std/amqp.xo:136`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L136)

### Begin

```xo
struct Begin {
  remote_channel: UInt16?
  next_outgoing_id: UInt32
  incoming_window: UInt32
  outgoing_window: UInt32
  handle_max: Int = 4294967295
  offered_capabilities: List[Str] = []
  desired_capabilities: List[Str] = []
  properties: List[(Str, Value)] = []
}
```

[Source: `std/amqp.xo:150`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L150)

### Attach

```xo
struct Attach {
  name: Str
  handle: UInt32
  role: Role
  sender_settle_mode: SenderSettleMode?
  receiver_settle_mode: ReceiverSettleMode?
  source: Source?
  target: Target?
  unsettled: List[(Bytes, DeliveryState?)] = []
  incomplete_unsettled: Bool = false
  initial_delivery_count: Int = 0
  max_message_size: Int = 0
  offered_capabilities: List[Str] = []
  desired_capabilities: List[Str] = []
  properties: List[(Str, Value)] = []
}
```

[Source: `std/amqp.xo:161`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L161)

### Flow

```xo
struct Flow {
  next_incoming_id: UInt32?
  incoming_window: UInt32
  next_outgoing_id: UInt32
  outgoing_window: UInt32
  handle: UInt32?
  delivery_count: UInt32?
  link_credit: UInt32?
  available: UInt32?
  drain: Bool = false
  echo: Bool = false
  properties: List[(Str, Value)] = []
}
```

[Source: `std/amqp.xo:178`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L178)

### Transfer

```xo
struct Transfer {
  handle: UInt32
  delivery_id: UInt32?
  delivery_tag: Bytes = b""
  message_format: UInt32?
  settled: Bool = false
  more: Bool = false
  receiver_settle_mode: ReceiverSettleMode?
  state: DeliveryState?
  resume: Bool = false
  aborted: Bool = false
  batchable: Bool = false
  payload: Bytes = b""
}
```

[Source: `std/amqp.xo:192`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L192)

### Disposition

```xo
struct Disposition {
  role: Role
  first: UInt32
  last: UInt32?
  settled: Bool = false
  state: DeliveryState?
  batchable: Bool = false
}
```

[Source: `std/amqp.xo:208`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L208)

### Detach

```xo
struct Detach {
  handle: UInt32
  closed: Bool = false
  error: WireError?
}
```

[Source: `std/amqp.xo:217`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L217)

### End

```xo
struct End {
  error: WireError?
}
```

[Source: `std/amqp.xo:223`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L223)

### Close

```xo
struct Close {
  error: WireError?
}
```

[Source: `std/amqp.xo:227`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L227)

### SaslMechanisms

```xo
struct SaslMechanisms {
  mechanisms: List[Str]
}
```

[Source: `std/amqp.xo:231`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L231)

### SaslInit

```xo
struct SaslInit {
  mechanism: Str
  initial_response: Bytes = b""
  hostname: Str = ""
}
```

[Source: `std/amqp.xo:235`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L235)

### SaslChallenge

```xo
struct SaslChallenge {
  challenge: Bytes
}
```

[Source: `std/amqp.xo:241`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L241)

### SaslResponse

```xo
struct SaslResponse {
  response: Bytes
}
```

[Source: `std/amqp.xo:245`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L245)

### SaslOutcome

```xo
struct SaslOutcome {
  code: UInt8
  additional_data: Bytes = b""
}
```

sasl-code (ubyte): 0 ok, 1 auth, 2 sys, 3 sys-perm, 4 sys-temp

[Source: `std/amqp.xo:250`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L250)

### FrameBody

```xo
enum FrameBody {
  Open(v: Open)
  Begin(v: Begin)
  Attach(v: Attach)
  Flow(v: Flow)
  Transfer(v: Transfer)
  Disposition(v: Disposition)
  Detach(v: Detach)
  End(v: End)
  Close(v: Close)
  SaslMechanisms(v: SaslMechanisms)
  SaslInit(v: SaslInit)
  SaslChallenge(v: SaslChallenge)
  SaslResponse(v: SaslResponse)
  SaslOutcome(v: SaslOutcome)
  Empty
}
```

The body of a frame.

[Source: `std/amqp.xo:256`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L256)

### Frame

```xo
struct Frame {
  channel: UInt16
  body: FrameBody
}
```

A frame: the channel it is for and its body. SASL frames are on channel 0.

[Source: `std/amqp.xo:276`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L276)

### Sasl

```xo
enum Sasl {
  None
  Plain(user: Str, password: Str)
  Anonymous
}
```

How to authenticate during the SASL exchange (section 5.3).

[Source: `std/amqp.xo:294`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L294)

### ConnOptions

```xo
struct ConnOptions {
  container_id: Str = ""
  hostname: Str = ""
  max_frame_size: Int = 65536
  channel_max: Int = 65535
  idle_timeout_ms: Int = 0
  properties: List[(Str, Value)] = []
  sasl: Sasl = Sasl.None
  tls_roots: tls.Roots? = None
  tls_verify: tls.Verify = tls.Verify.Full
  clock: Clock? = None
  timeout_ms: Int = 0
}
```

[Source: `std/amqp.xo:301`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L301)

### Transport

```xo
enum Transport {
  Plain(c: Conn)
  Tls(t: tls.TlsConn)
}
```

The transport, plain or TLS (as std/smtp's Link).

[Source: `std/amqp.xo:324`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L324)

### ConnState

```xo
struct ConnState {
  link: Transport
  buf: Bytes = b""
  max_frame_size: Int = 65536
  peer_max_frame_size: Int = 65536
  peer_channel_max: Int = 65535
  peer_idle_timeout_ms: Int = 0
  peer_container_id: Str = ""
  peer_properties: List[(Str, Value)] = []
  channels: List[Int] = []
  pending: List[Frame] = []
  closed: Bool = false
  clock: Clock? = None
  timeout_ms: Int = 0
  idle_timeout_ms: Int = 0
  last_recv_ms: Int = 0
  last_send_ms: Int = 0
  broken: AmqpErr? = None
  mux: Bool = false
  closing: Bool = false
  close_done: Bool = false
  close_err: AmqpErr? = None
  waiters: List[Chan[Bool]] = []
  sess: List[SessState] = []
  links: List[LinkState] = []
}
```

A connection's state. Internal: use the methods of `Connection`.

[Source: `std/amqp.xo:330`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L330)

### Connection

```xo
struct Connection {
  st: Mutex[ConnState]
}
```

An open AMQP connection. A handle: copies share the connection, and its methods serialize on it.

[Source: `std/amqp.xo:370`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L370)

#### Connection.peer_container_id

```xo
fn (c: Connection) peer_container_id() -> Str
```

The peer's container id from its Open.

[Source: `std/amqp.xo:375`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L375)

#### Connection.peer_max_frame_size

```xo
fn (c: Connection) peer_max_frame_size() -> Int
```

The largest frame the peer accepts, in bytes.

[Source: `std/amqp.xo:377`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L377)

#### Connection.peer_channel_max

```xo
fn (c: Connection) peer_channel_max() -> Int
```

The largest channel number usable (the lower of both sides' channel-max).

[Source: `std/amqp.xo:379`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L379)

#### Connection.peer_idle_timeout_ms

```xo
fn (c: Connection) peer_idle_timeout_ms() -> Int
```

The peer's advertised idle timeout in milliseconds, 0 for none.

[Source: `std/amqp.xo:381`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L381)

#### Connection.peer_properties

```xo
fn (c: Connection) peer_properties() -> List[(Str, Value)]
```

The peer's Open properties.

[Source: `std/amqp.xo:383`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L383)

#### Connection.keepalive

```xo
fn (c: Connection) keepalive(g: task.Group) -> () ! AmqpErr uses (net.dial, clock)
```

Starts a task in `g` that keeps the connection alive while no call is running: it sends an
empty frame at half the peer's idle timeout, reads and applies frames that arrive, and fails
the connection (later calls return the error) when the peer is silent for `idle_timeout_ms`.
While it runs it is the only reader: calls that wait (a receive, a send waiting for credit)
wait on their own channel without the connection lock, so tasks can receive on several links,
send and settle at the same time; `recv` is refused. It needs `ConnOptions.clock` and ends when
`g` is cancelled or the connection is closed. Without it, calls read while they wait.

[Source: `std/amqp.xo:391`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L391)

#### Connection.send

```xo
fn (c: Connection) send(f: Frame) -> () ! AmqpErr uses (net.dial, clock)
```

Writes one frame, as `encode_frame`'s bytes.

[Source: `std/amqp.xo:399`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L399)

#### Connection.recv

```xo
fn (c: Connection) recv() -> Frame ! AmqpErr uses (net.dial, clock)
```

The next frame from the peer (an empty frame is returned as `FrameBody.Empty`).

[Source: `std/amqp.xo:402`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L402)

#### Connection.close

```xo
fn (c: Connection) close(error: WireError? = None) -> () ! AmqpErr uses (net.dial, clock)
```

Sends Close and waits for the peer's Close; a Close carrying an error is `Peer`.

[Source: `std/amqp.xo:405`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L405)

#### Connection.abort

```xo
fn (c: Connection) abort()
```

Drops the transport without the Close exchange.

[Source: `std/amqp.xo:408`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L408)

#### Connection.begin

```xo
fn (c: Connection) begin(opts: SessionOptions = SessionOptions{}) -> Session ! AmqpErr uses (net.dial, clock)
```

Begins a session on the lowest free channel and waits for the peer's Begin.

[Source: `std/amqp.xo:431`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L431)

#### Connection.end_session

```xo
fn (c: Connection) end_session(s: Session, error: WireError? = None) -> () ! AmqpErr uses (net.dial, clock)
```

Ends the session (End, then the peer's End); frames for other channels read while waiting
stay queued for recv.

[Source: `std/amqp.xo:435`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L435)

#### Connection.new_sender

```xo
fn (c: Connection) new_sender(s: Session, target: Str, opts: SenderOptions = SenderOptions{}) -> Sender ! AmqpErr uses (net.dial, clock)
```

Attaches a sending link on session `s` to `target` and waits for the peer's Attach. A peer that
refuses the link answers with a Detach carrying an error, which is `Peer`.

[Source: `std/amqp.xo:626`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L626)

#### Connection.new_receiver

```xo
fn (c: Connection) new_receiver(s: Session, source: Str, opts: ReceiverOptions = ReceiverOptions{}) -> Receiver ! AmqpErr uses (net.dial, clock)
```

Attaches a receiving link on session `s` from `source` and grants the initial credit.

[Source: `std/amqp.xo:629`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L629)

### SessionOptions

```xo
struct SessionOptions {
  incoming_window: Int = 2048
  outgoing_window: Int = 2048
  handle_max: Int = 4294967295
}
```

[Source: `std/amqp.xo:410`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L410)

### Session

```xo
struct Session {
  channel: Int
  remote_channel: Int = 0
  next_outgoing_id: Int = 0
  remote_incoming_window: Int = 0
  remote_outgoing_window: Int = 0
  remote_next_outgoing_id: Int = 0
  incoming_window: Int
  outgoing_window: Int
  handle_max: Int
  remote_handle_max: Int = 0
}
```

A begun session: its channel and the windows both sides announced.

[Source: `std/amqp.xo:417`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L417)

### Header

```xo
struct Header {
  durable: Bool = false
  priority: Int = 4
  ttl_ms: Int = 0
  first_acquirer: Bool = false
  delivery_count: Int = 0
}
```

The header section: delivery details.

[Source: `std/amqp.xo:441`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L441)

### Properties

```xo
struct Properties {
  message_id: Value = Value.Null
  user_id: Bytes = b""
  to: Str? = None
  subject: Str? = None
  reply_to: Str? = None
  correlation_id: Value = Value.Null
  content_type: Str? = None
  content_encoding: Str? = None
  absolute_expiry_ms: Int? = None
  creation_ms: Int? = None
  group_id: Str? = None
  group_sequence: Int? = None
  reply_to_group_id: Str? = None
}
```

The properties section: standard properties of the message.

[Source: `std/amqp.xo:452`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L452)

### Body

```xo
enum Body {
  Empty
  Data(sections: List[Bytes])
  Sequence(sections: List[List[Value]])
  Value(v: Value)
}
```

The body: one or more data sections, one or more sequence sections, or one value.

[Source: `std/amqp.xo:472`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L472)

### Message

```xo
struct Message {
  header: Header? = None
  delivery_annotations: List[(Value, Value)]? = None
  annotations: List[(Value, Value)]? = None
  properties: Properties? = None
  app_properties: List[(Str, Value)]? = None
  body: Body = Body.Empty
  footer: List[(Value, Value)]? = None
}
```

A message: the sections of the bare and annotated message. A `None` section is not written; a
`Some` section is written even when empty (go-amqp's rule for a non-nil map).

[Source: `std/amqp.xo:481`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L481)

### SessState

```xo
struct SessState {
  channel: Int
  next_outgoing_id: Int = 0
  next_incoming_id: Int = 0
  incoming_window: Int
  initial_incoming_window: Int
  remote_incoming_window: Int = 0
  ended: Bool = false
  next_handle: Int = 0
  sending: Bool = false
}
```

A session's flow control state. Internal: use the methods of `Connection`.

[Source: `std/amqp.xo:502`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L502)

### Delivery

```xo
struct Delivery {
  message: Message
  id: Int
  tag: Bytes
  settled: Bool
  link: Int
}
```

A completed incoming delivery.

[Source: `std/amqp.xo:519`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L519)

### LinkState

```xo
struct LinkState {
  id: Int
  name: Str
  channel: Int
  handle: Int
  role: Role
  remote_handle: Int = -1
  attached: Bool = false
  refused: Bool = false
  detached: Bool = false
  error: WireError? = None
  peer_max_message_size: Int = 0
  delivery_count: Int = 0
  credit: Int = 0
  credit_target: Int = 1
  remote_attach: Attach? = None
  draining: Bool = false
  second: Bool = false
  waiting: List[Int] = []
  acks: List[(Int, DeliveryState?)] = []
  tag_counter: Int = 0
  results: List[(Int, DeliveryState?)] = []
  partial: Bytes = b""
  partial_active: Bool = false
  partial_id: Int = 0
  partial_tag: Bytes = b""
  partial_settled: Bool = false
  unsettled: List[Int] = []
  inbox: List[Delivery] = []
}
```

A link's state. Internal: use `Sender` and `Receiver`.

[Source: `std/amqp.xo:531`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L531)

### SenderOptions

```xo
struct SenderOptions {
  name: Str = ""
  settle_mode: SenderSettleMode? = None
  source: Str = ""
  max_message_size: Int = 0
  properties: List[(Str, Value)] = []
  capabilities: List[Str] = []
  target_capabilities: List[Str] = []
  desired_capabilities: List[Str] = []
}
```

[Source: `std/amqp.xo:575`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L575)

### ReceiverOptions

```xo
struct ReceiverOptions {
  name: Str = ""
  credit: Int = 1
  settle_mode: ReceiverSettleMode? = None
  sender_settle_mode: SenderSettleMode? = None
  target: Str = ""
  filters: List[(Str, Value)] = []
  max_message_size: Int = 0
  properties: List[(Str, Value)] = []
  capabilities: List[Str] = []
  source_capabilities: List[Str] = []
  desired_capabilities: List[Str] = []
}
```

[Source: `std/amqp.xo:589`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L589)

### Sender

```xo
struct Sender {
  conn: Connection
  id: Int
  name: Str
  target: Str
}
```

A sending link; a handle over its connection.

[Source: `std/amqp.xo:609`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L609)

#### Sender.send

```xo
fn (x: Sender) send(m: Message, settled: Bool = false, message_format: Int = 0) -> DeliveryState? ! AmqpErr uses (net.dial, clock)
```

Sends the message and returns the peer's outcome for it (`Accepted`, `Rejected`, ...), waiting for
link credit, session window and the settlement. With `settled` true the transfer is sent
pre-settled and the result is `None` right away. `message_format` is the Transfer's message-format
(0 for an AMQP message; Azure Service Bus batches use 0x80013700, a message whose data sections are
each an encoded message).

[Source: `std/amqp.xo:636`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L636)

#### Sender.close

```xo
fn (x: Sender) close(error: WireError? = None) -> () ! AmqpErr uses (net.dial, clock)
```

Detaches the link (with `closed` set) and waits for the peer's Detach.

[Source: `std/amqp.xo:639`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L639)

#### Sender.remote_attach

```xo
fn (x: Sender) remote_attach() -> Attach?
```

[Source: `std/amqp.xo:648`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L648)

### Receiver

```xo
struct Receiver {
  conn: Connection
  id: Int
  name: Str
  source: Str
}
```

A receiving link; a handle over its connection.

[Source: `std/amqp.xo:617`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L617)

#### Receiver.receive

```xo
fn (r: Receiver) receive(timeout_ms: Int = 0) -> Delivery ! AmqpErr uses (net.dial, clock)
```

The next complete message, topping up credit as needed.

[Source: `std/amqp.xo:642`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L642)

#### Receiver.remote_attach

```xo
fn (r: Receiver) remote_attach() -> Attach?
```

The peer's Attach frame for this link (None until it arrives; `new_receiver` returns after it did):
its source with the filters the peer applied (Service Bus echoes `com.microsoft:session-filter`
with the session it chose), its target and its properties (`com.microsoft:locked-until-utc`).

[Source: `std/amqp.xo:647`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L647)

#### Receiver.issue_credit

```xo
fn (r: Receiver) issue_credit(n: Int) -> () ! AmqpErr uses (net.dial, clock)
```

Grants the peer `n` more credit (a Flow with the link credit raised by `n`). With
`ReceiverOptions.credit` 0 this is the only credit the link has.

[Source: `std/amqp.xo:652`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L652)

#### Receiver.drain

```xo
fn (r: Receiver) drain(timeout_ms: Int = 0) -> List[Delivery] ! AmqpErr uses (net.dial, clock)
```

Asks the peer to use up or give up the credit (a Flow with `drain` set), waits for its answer and
returns every delivery that arrived before it, oldest first; the link then has no credit.
`timeout_ms` bounds the wait (0 for none; it needs `ConnOptions.clock`).

[Source: `std/amqp.xo:657`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L657)

#### Receiver.accept

```xo
fn (r: Receiver) accept(d: Delivery) -> () ! AmqpErr uses (net.dial, clock)
```

Settles the delivery with the outcome. With `ReceiverSettleMode.Second` the outcome is sent
unsettled and the call waits for the peer's settlement: a peer that refuses it (a Rejected state
with an error, such as Service Bus's `com.microsoft:message-lock-lost`) makes the call `Peer`.

[Source: `std/amqp.xo:662`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L662)

#### Receiver.reject

```xo
fn (r: Receiver) reject(d: Delivery, error: WireError? = None) -> () ! AmqpErr uses (net.dial, clock)
```

[Source: `std/amqp.xo:663`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L663)

#### Receiver.release

```xo
fn (r: Receiver) release(d: Delivery) -> () ! AmqpErr uses (net.dial, clock)
```

[Source: `std/amqp.xo:664`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L664)

#### Receiver.modify

```xo
fn (r: Receiver) modify(d: Delivery, delivery_failed: Bool = true, undeliverable_here: Bool = false, annotations: List[(Str, Value)] = []) -> () ! AmqpErr uses (net.dial, clock)
```

`annotations` are the Modified outcome's message-annotations to apply (Go's properties to modify;
the keys are symbols).

[Source: `std/amqp.xo:667`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L667)

#### Receiver.close

```xo
fn (r: Receiver) close(error: WireError? = None) -> () ! AmqpErr uses (net.dial, clock)
```

Detaches the link (with `closed` set) and waits for the peer's Detach.

[Source: `std/amqp.xo:670`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L670)

## Functions

### encode

```xo
fn encode(v: Value) -> Bytes ! AmqpErr
```

The encoding of v with the smallest constructors go-amqp's encoder picks
(smalluint, list8, str8 and so on).

[Source: `std/amqp.xo:61`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L61)

### decode

```xo
fn decode(b: Bytes) -> (Value, Int) ! AmqpErr
```

The value at the start of b and the number of bytes it took.

[Source: `std/amqp.xo:64`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L64)

### encode_frame

```xo
fn encode_frame(f: Frame) -> Bytes ! AmqpErr
```

The frame as bytes: the 8 byte header (size, data offset 2, type 0 for
AMQP and 1 for SASL, channel) and the body.

[Source: `std/amqp.xo:283`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L283)

### decode_frame

```xo
fn decode_frame(b: Bytes, max_size: Int = 4294967295) -> (Frame, Int) ! AmqpErr
```

The frame at the start of b and the bytes it took; `max_size` is the
largest frame size accepted (a larger one is a Decode error).

[Source: `std/amqp.xo:287`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L287)

### dial

```xo
fn dial(net: Net, addr: Str, opts: ConnOptions = ConnOptions{}) -> Connection ! AmqpErr uses (net.dial, clock)
```

Connects to `addr` (`host:port`, `amqp://host[:port]` or `amqps://host[:port]`; ports default
to 5672 and 5671; amqps runs TLS first), runs the SASL exchange when `opts.sasl` is not `None`,
and exchanges the Open frames.

[Source: `std/amqp.xo:396`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L396)

### encode_message

```xo
fn encode_message(m: Message) -> Bytes ! AmqpErr
```

The message as the bytes of a transfer's payload.

[Source: `std/amqp.xo:492`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L492)

### decode_message

```xo
fn decode_message(b: Bytes) -> Message ! AmqpErr
```

The message in b (all of it); a section out of the specification's order is accepted, a repeated
header, properties or annotations section, or mixed body kinds, is a Decode error.

[Source: `std/amqp.xo:496`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L496)

### cbs_put_token

```xo
fn cbs_put_token(c: Connection, s: Session, audience: Str, token: Str, token_type: Str = "servicebus.windows.net:sastoken", expiry_ms: Int = 0, expiration: Value? = None) -> () ! AmqpErr uses (net.dial, clock)
```

Authorizes the connection with a token: sends a `put-token` request on a `$cbs` sender and reads the
answer on a `$cbs` receiver (reply address `cbs`), then detaches both links. `token_type` is
`servicebus.windows.net:sastoken` for a SAS token and `jwt` for an Entra ID one. A status code
outside 200 to 299 is `Peer` with the condition `amqp:unauthorized-access` and the description the
server gave. `expiry_ms` (milliseconds since the Unix epoch) is sent as `expiration` when not 0.
`expiration`, when given, is sent as the `expiration` property as it is and wins over `expiry_ms` (Go's clients send
a string of Unix seconds).

[Source: `std/amqp.xo:682`](https://github.com/xo-lang/xo/blob/main/std/amqp.xo#L682)
