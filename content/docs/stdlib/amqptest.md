---
title: "std/amqptest"
linkTitle: "amqptest"
description: "an in-process AMQP 1.0 broker that behaves like Azure Service Bus for the parts a client library ..."
toc: true
module: "std/amqptest"
source: "https://github.com/xo-lang/xo/blob/main/std/amqptest.xo"
generated: "scripts/sync-content.py from `xo doc std/amqptest`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`QueueOptions`](#QueueOptions)
- type [`FakeMsg`](#FakeMsg)
- type [`FakeSession`](#FakeSession)
- type [`FakeQueue`](#FakeQueue)
- type [`FakeFail`](#FakeFail)
- type [`FakePart`](#FakePart)
- type [`FakeHub`](#FakeHub)
- type [`HubOwner`](#HubOwner)
- type [`BrokerState`](#BrokerState)
- type [`Broker`](#Broker)
  - method [`Broker.serve`](#Broker.serve)
  - method [`Broker.queue`](#Broker.queue)
  - method [`Broker.event_hub`](#Broker.event_hub)
  - method [`Broker.event_hub_geo_factor`](#Broker.event_hub_geo_factor)
  - method [`Broker.events`](#Broker.events)
  - method [`Broker.topic`](#Broker.topic)
  - method [`Broker.subscription`](#Broker.subscription)
  - method [`Broker.put`](#Broker.put)
  - method [`Broker.ready`](#Broker.ready)
  - method [`Broker.locked`](#Broker.locked)
  - method [`Broker.dead_letters`](#Broker.dead_letters)
  - method [`Broker.scheduled`](#Broker.scheduled)
  - method [`Broker.deferred`](#Broker.deferred)
  - method [`Broker.tokens`](#Broker.tokens)
  - method [`Broker.attaches`](#Broker.attaches)
  - method [`Broker.reject_token`](#Broker.reject_token)
  - method [`Broker.require_token`](#Broker.require_token)
  - method [`Broker.session_state`](#Broker.session_state)
  - method [`Broker.fail_next`](#Broker.fail_next)
  - method [`Broker.fail`](#Broker.fail)
  - method [`Broker.clear_failures`](#Broker.clear_failures)
  - method [`Broker.slow_management`](#Broker.slow_management)
  - method [`Broker.detach_links`](#Broker.detach_links)
  - method [`Broker.disconnect_all`](#Broker.disconnect_all)
- type [`SvLink`](#SvLink)
- type [`SvSession`](#SvSession)
- type [`SvConn`](#SvConn)
- fn [`new`](#new)
- fn [`u32w`](#u32w)
- fn [`frame_on`](#frame_on)
- fn [`werr`](#werr)
- fn [`now_ms`](#now_ms)
- fn [`find_queue`](#find_queue)
- fn [`ensure_queue`](#ensure_queue)
- fn [`put_queue`](#put_queue)
- fn [`put_msg`](#put_msg)
- fn [`notify_all`](#notify_all)
- fn [`sym`](#sym)
- fn [`ann_get`](#ann_get)
- fn [`ann_set`](#ann_set)
- fn [`group_of`](#group_of)
- fn [`token_bytes`](#token_bytes)
- fn [`enqueue`](#enqueue)
- fn [`expire_locks`](#expire_locks)
- fn [`session_idx`](#session_idx)
- fn [`available`](#available)
- fn [`take`](#take)
- fn [`find_seq`](#find_seq)
- fn [`find_token`](#find_token)
- fn [`dead_letter`](#dead_letter)
- fn [`unlock`](#unlock)
- fn [`apply_modified`](#apply_modified)
- fn [`complete`](#complete)
- fn [`defer_msg`](#defer_msg)
- fn [`release_conn`](#release_conn)
- fn [`lock_session`](#lock_session)
- fn [`unlock_session`](#unlock_session)
- fn [`take_fail`](#take_fail)
- fn [`add_fail`](#add_fail)
- fn [`find_hub`](#find_hub)
- fn [`hub_parse`](#hub_parse)
- fn [`part_hash`](#part_hash)
- fn [`hub_store`](#hub_store)
- fn [`hub_offset`](#hub_offset)
- fn [`start_pos`](#start_pos)
- fn [`hub_selector`](#hub_selector)
- fn [`hub_epoch`](#hub_epoch)
- fn [`net_err`](#net_err)
- fn [`out`](#out)
- fn [`read_n`](#read_n)
- fn [`read_frame_sync`](#read_frame_sync)
- fn [`ss_idx`](#ss_idx)
- fn [`put_sess`](#put_sess)
- fn [`put_link`](#put_link)
- fn [`lk_remote`](#lk_remote)
- fn [`mget`](#mget)
- fn [`app_get`](#app_get)
- fn [`val_str`](#val_str)
- fn [`val_int`](#val_int)
- fn [`val_items`](#val_items)
- fn [`val_map`](#val_map)
- fn [`body_value`](#body_value)
- fn [`classify`](#classify)
- fn [`auth_ok`](#auth_ok)
- fn [`settle_reply`](#settle_reply)
- fn [`send_message`](#send_message)
- fn [`guid_order`](#guid_order)
- fn [`with_delivery_annotations`](#with_delivery_annotations)
- fn [`deliver_link`](#deliver_link)
- fn [`flush_replies`](#flush_replies)
- fn [`deliver_all`](#deliver_all)
- fn [`push_reply`](#push_reply)
- fn [`reply_message`](#reply_message)
- fn [`pair`](#pair)
- fn [`uuid_tokens`](#uuid_tokens)
- fn [`ok_out`](#ok_out)
- fn [`lock_lost`](#lock_lost)
- fn [`mgmt_op`](#mgmt_op)
- fn [`process_mgmt`](#process_mgmt)
- fn [`process_cbs`](#process_cbs)
- fn [`process_send`](#process_send)
- fn [`process_message`](#process_message)
- fn [`filter_key`](#filter_key)
- fn [`session_want`](#session_want)
- fn [`session_echo`](#session_echo)
- fn [`hub_link_match`](#hub_link_match)
- fn [`on_hub_attach`](#on_hub_attach)
- fn [`deliver_hub`](#deliver_hub)
- fn [`hub_mgmt`](#hub_mgmt)
- fn [`on_attach`](#on_attach)
- fn [`on_flow`](#on_flow)
- fn [`on_transfer`](#on_transfer)
- fn [`on_disposition`](#on_disposition)
- fn [`drop_link`](#drop_link)
- fn [`on_detach`](#on_detach)
- fn [`on_end`](#on_end)
- fn [`control`](#control)
- fn [`handle_frame`](#handle_frame)
- fn [`handshake`](#handshake)
- fn [`frame_reader`](#frame_reader)
- fn [`run_conn`](#run_conn)
- fn [`serve_conn`](#serve_conn)
- fn [`accept_loop`](#accept_loop)

## Types

### QueueOptions {#QueueOptions}

```xo
pub struct QueueOptions {
  pub sessions: Bool = false
  pub lock_ms: Int = 60000
  pub max_delivery_count: Int = 10
}
```

One entity's settings.

[Source: `std/amqptest.xo:13`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L13)

### FakeMsg {#FakeMsg}

```xo
pub struct FakeMsg {
  pub seq: Int
  pub m: amqp.Message
  pub delivery_count: Int = 0
  pub lock_token: Bytes = b""
  pub locked_until: Int = 0
  pub lock_conn: Int = 0
  pub scheduled_ms: Int = 0
  pub enqueued_ms: Int = 0
  pub session: Str = ""
  pub deferred: Bool = false
  pub dead_reason: Str = ""
  pub dead_description: Str = ""
}
```

A message held by a queue. Internal: use the Broker's methods.

[Source: `std/amqptest.xo:23`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L23)

### FakeSession {#FakeSession}

```xo
pub struct FakeSession {
  pub id: Str
  pub state: Bytes = b""
  pub locked_until: Int = 0
  pub owner: Int = 0
  pub updated_ms: Int = 0
}
```

A session of a session enabled queue. Internal.

[Source: `std/amqptest.xo:41`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L41)

### FakeQueue {#FakeQueue}

```xo
pub struct FakeQueue {
  pub name: Str
  pub opts: QueueOptions
  pub is_topic: Bool = false
  pub msgs: List[FakeMsg] = []
  pub dead: List[FakeMsg] = []
  pub next_seq: Int = 1
  pub sessions: List[FakeSession] = []
}
```

A queue, or a topic's subscription (named `topic/Subscriptions/name`), or a topic (no messages).
Internal.

[Source: `std/amqptest.xo:52`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L52)

### FakeFail {#FakeFail}

```xo
pub struct FakeFail {
  pub op: Str
  pub status: Int
  pub condition: Str
  pub description: Str
  pub left: Int
}
```

An injected failure. Internal.

[Source: `std/amqptest.xo:63`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L63)

### FakePart {#FakePart}

```xo
pub struct FakePart {
  pub events: List[amqp.Message] = []
}
```

One partition of an event hub: the events in order, each with its x-opt annotations. Internal.

[Source: `std/amqptest.xo:75`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L75)

### FakeHub {#FakeHub}

```xo
pub struct FakeHub {
  pub name: Str
  pub groups: List[Str]
  pub parts: List[FakePart]
  pub created_ms: Int
  pub rr: Int = 0
  pub geo_factor: Int = 1
}
```

An event hub (decision 0521). Internal.

[Source: `std/amqptest.xo:80`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L80)

### HubOwner {#HubOwner}

```xo
pub struct HubOwner {
  pub path: Str
  pub key: Str
  pub epoch: Int
}
```

A receiver link that owns a partition of a consumer group at an epoch. Internal.

[Source: `std/amqptest.xo:92`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L92)

### BrokerState {#BrokerState}

```xo
pub struct BrokerState {
  pub queues: List[FakeQueue] = []
  pub hubs: List[FakeHub] = []
  pub owners: List[HubOwner] = []
  pub tokens: List[(Str, Str)] = []
  pub attaches: List[(Str, Str, List[Str])] = []
  pub expiries: List[(Str, Int)] = []
  pub rejected: List[Str] = []
  pub require_token: Bool = false
  pub fails: List[FakeFail] = []
  pub wakes: List[(Int, Chan[Bool])] = []
  pub conns: List[(Int, ServerConn)] = []
  pub next_conn: Int = 1
  pub next_lock: Int = 1
  pub slow_mgmt_ms: Int = 0
  pub gen: Int = 0
  pub detaches: List[(Int, Str, amqp.WireError)] = []
  pub closes: List[(Int, amqp.WireError?)] = []
}
```

The broker's state. Internal.

[Source: `std/amqptest.xo:101`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L101)

### Broker {#Broker}

```xo
pub struct Broker {
  pub st: Mutex[BrokerState]
  pub clock: Clock
}
```

A broker. A handle: copies share it.

[Source: `std/amqptest.xo:127`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L127)

#### Broker.serve {#Broker.serve}

```xo
pub fn (b: Broker) serve(g: task.Group, l: Listener) uses (net.listen, clock)
```

Serves the connections `l` accepts, each in a task of `g`; returns at once. The tasks end when
`g` is cancelled or `l` is closed.

[Source: `std/amqptest.xo:196`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L196)

#### Broker.queue {#Broker.queue}

```xo
pub fn (b: Broker) queue(name: Str, opts: QueueOptions = QueueOptions{})
```

Declares a queue (a queue is also created, with the defaults, by the first link to it).

[Source: `std/amqptest.xo:201`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L201)

#### Broker.event_hub {#Broker.event_hub}

```xo
pub fn (b: Broker) event_hub(name: Str, partitions: Int, consumer_groups: List[Str] = ["$Default"]) uses clock
```

Declares an event hub with `partitions` partitions (ids "0", "1", ...), receivable by each consumer group
at `hub/ConsumerGroups/cg/Partitions/id` and sendable at `hub` or `hub/Partitions/id`.

[Source: `std/amqptest.xo:216`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L216)

#### Broker.event_hub_geo_factor {#Broker.event_hub_geo_factor}

```xo
pub fn (b: Broker) event_hub_geo_factor(hub: Str, factor: Int)
```

Sets the georeplication_factor an event hub's READ reports (1 when declared; above 1 means
geo-replication is enabled, as Event Hubs v2 reads it).

[Source: `std/amqptest.xo:229`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L229)

#### Broker.events {#Broker.events}

```xo
pub fn (b: Broker) events(hub: Str, partition: Int) -> List[amqp.Message]
```

The events a partition holds, with their x-opt-sequence-number, x-opt-offset and x-opt-enqueued-time
message annotations.

[Source: `std/amqptest.xo:242`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L242)

#### Broker.topic {#Broker.topic}

```xo
pub fn (b: Broker) topic(name: Str)
```

Declares a topic: a message sent to it is copied to every subscription.

[Source: `std/amqptest.xo:251`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L251)

#### Broker.subscription {#Broker.subscription}

```xo
pub fn (b: Broker) subscription(topic: Str, name: Str, opts: QueueOptions = QueueOptions{})
```

Declares the subscription `topic/Subscriptions/name`, receivable at that address.

[Source: `std/amqptest.xo:261`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L261)

#### Broker.put {#Broker.put}

```xo
pub fn (b: Broker) put(queue: Str, m: amqp.Message) uses clock
```

Puts a message on a queue (or a topic) as if a client had sent it.

[Source: `std/amqptest.xo:267`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L267)

#### Broker.ready {#Broker.ready}

```xo
pub fn (b: Broker) ready(queue: Str) -> List[amqp.Message] uses clock
```

The messages that can be delivered now, in order, as a client would receive them.

[Source: `std/amqptest.xo:276`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L276)

#### Broker.locked {#Broker.locked}

```xo
pub fn (b: Broker) locked(queue: Str) -> Int uses clock
```

The number of messages locked by a receiver.

[Source: `std/amqptest.xo:291`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L291)

#### Broker.dead_letters {#Broker.dead_letters}

```xo
pub fn (b: Broker) dead_letters(queue: Str) -> List[amqp.Message]
```

The messages in the dead letter queue.

[Source: `std/amqptest.xo:305`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L305)

#### Broker.scheduled {#Broker.scheduled}

```xo
pub fn (b: Broker) scheduled(queue: Str) -> List[amqp.Message] uses clock
```

The messages scheduled for later.

[Source: `std/amqptest.xo:316`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L316)

#### Broker.deferred {#Broker.deferred}

```xo
pub fn (b: Broker) deferred(queue: Str) -> List[amqp.Message]
```

The deferred messages.

[Source: `std/amqptest.xo:330`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L330)

#### Broker.tokens {#Broker.tokens}

```xo
pub fn (b: Broker) tokens() -> List[(Str, Str)]
```

The `(audience, token)` pairs the broker accepted through $cbs, in order.

[Source: `std/amqptest.xo:343`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L343)

#### Broker.attaches {#Broker.attaches}

```xo
pub fn (b: Broker) attaches() -> List[(Str, Str, List[Str])]
```

Every link a client attached, in order: its address (a sender's target, a receiver's source),
the client's role ("sender" or "receiver") and the Attach's desired capabilities.

[Source: `std/amqptest.xo:349`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L349)

#### Broker.reject_token {#Broker.reject_token}

```xo
pub fn (b: Broker) reject_token(token: Str)
```

A put-token with this token is answered with 401.

[Source: `std/amqptest.xo:354`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L354)

#### Broker.require_token {#Broker.require_token}

```xo
pub fn (b: Broker) require_token(on: Bool)
```

Links to entities are refused (`amqp:unauthorized-access`) until a put-token whose audience
ends with the entity's name was accepted and has not expired.

[Source: `std/amqptest.xo:360`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L360)

#### Broker.session_state {#Broker.session_state}

```xo
pub fn (b: Broker) session_state(queue: Str, session: Str) -> Bytes
```

The state of a session of a session enabled queue, as set by a client.

[Source: `std/amqptest.xo:365`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L365)

#### Broker.fail_next {#Broker.fail_next}

```xo
pub fn (b: Broker) fail_next(op: Str, status: Int, condition: Str, description: Str)
```

The next use of operation `op` fails with an error: an attach, a transfer, a disposition or a
put-token is refused with `condition`; a management operation (`renew-lock`, `peek-message`,
`schedule-message`, `cancel-scheduled-message`, `receive-by-sequence-number`,
`update-disposition`, `renew-session-lock`, `get-session-state`, `set-session-state`) answers
`status` with `condition` and `description`.

[Source: `std/amqptest.xo:381`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L381)

#### Broker.fail {#Broker.fail}

```xo
pub fn (b: Broker) fail(op: Str, status: Int, condition: Str, description: Str)
```

Like `fail_next`, until `clear_failures`.

[Source: `std/amqptest.xo:386`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L386)

#### Broker.clear_failures {#Broker.clear_failures}

```xo
pub fn (b: Broker) clear_failures()
```

[Source: `std/amqptest.xo:390`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L390)

#### Broker.slow_management {#Broker.slow_management}

```xo
pub fn (b: Broker) slow_management(ms: Int)
```

Holds every management reply back by `ms` milliseconds.

[Source: `std/amqptest.xo:395`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L395)

#### Broker.detach_links {#Broker.detach_links}

```xo
pub fn (b: Broker) detach_links(queue: Str, error: amqp.WireError)
```

Detaches every link to `queue` with `error` (for example `amqp:link:detach-forced`).

[Source: `std/amqptest.xo:400`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L400)

#### Broker.disconnect_all {#Broker.disconnect_all}

```xo
pub fn (b: Broker) disconnect_all(error: amqp.WireError? = None)
```

Closes every connection, with `error` in the Close frame when given, otherwise by dropping the
transport.

[Source: `std/amqptest.xo:410`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L410)

### SvLink {#SvLink}

```xo
pub struct SvLink {
  pub handle: Int
  pub remote: Int
  pub channel: Int
  pub name: Str
  pub sends: Bool
  pub kind: Int
  pub queue: Str
  pub credit: Int = 0
  pub delivery_count: Int = 0
  pub presettled: Bool = false
  pub session_id: Str = ""
  pub partial: Bytes = b""
  pub partial_id: Int = 0
  pub partial_settled: Bool = false
  pub partial_active: Bool = false
  pub partial_format: Int = 0
  pub replies: List[amqp.Message] = []
  pub unsettled: List[(Int, Int)] = []
  pub detached: Bool = false
  pub hub: Str = ""
  pub cg: Str = ""
  pub part: Int = -1
  pub pos: Int = 0
  pub epoch: Int = 0
  pub hkey: Str = ""
}
```

A link of one connection. Internal.

[Source: `std/amqptest.xo:133`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L133)

### SvSession {#SvSession}

```xo
pub struct SvSession {
  pub channel: Int
  pub next_in: Int = 0
  pub next_out: Int = 0
  pub remote_window: Int = 0
  pub ended: Bool = false
  pub in_used: Int = 0
}
```

A session of one connection. Internal.

[Source: `std/amqptest.xo:170`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L170)

### SvConn {#SvConn}

```xo
pub struct SvConn {
  pub id: Int
  pub max_frame: Int = 65536
  pub sess: List[SvSession] = []
  pub links: List[SvLink] = []
  pub seen_gen: Int = 0
}
```

One connection's state. Internal.

[Source: `std/amqptest.xo:181`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L181)

## Functions

### new {#new}

```xo
pub fn new(clock: Clock) -> Broker
```

A new broker; `clock` times message locks, scheduled messages and token expiry.

[Source: `std/amqptest.xo:190`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L190)

### u32w {#u32w}

```xo
fn u32w(x: Int) -> UInt32
```

[Source: `std/amqptest.xo:418`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L418)

### frame_on {#frame_on}

```xo
fn frame_on(ch: Int, body: amqp.FrameBody) -> amqp.Frame
```

[Source: `std/amqptest.xo:420`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L420)

### werr {#werr}

```xo
fn werr(condition: Str, description: Str) -> amqp.WireError
```

[Source: `std/amqptest.xo:424`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L424)

### now_ms {#now_ms}

```xo
fn now_ms(b: Broker) -> Int uses clock
```

[Source: `std/amqptest.xo:428`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L428)

### find_queue {#find_queue}

```xo
fn find_queue(s: BrokerState, name: Str) -> Int
```

[Source: `std/amqptest.xo:430`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L430)

### ensure_queue {#ensure_queue}

```xo
fn ensure_queue(var s: BrokerState, name: Str) -> Int
```

The queue's index, creating it with the defaults when it does not exist.

[Source: `std/amqptest.xo:440`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L440)

### put_queue {#put_queue}

```xo
fn put_queue(var s: BrokerState, i: Int, q: FakeQueue)
```

[Source: `std/amqptest.xo:447`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L447)

### put_msg {#put_msg}

```xo
fn put_msg(var q: FakeQueue, i: Int, m: FakeMsg)
```

[Source: `std/amqptest.xo:453`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L453)

### notify_all {#notify_all}

```xo
fn notify_all(s: BrokerState)
```

[Source: `std/amqptest.xo:459`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L459)

### sym {#sym}

```xo
fn sym(k: Str) -> amqp.Value
```

[Source: `std/amqptest.xo:466`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L466)

### ann_get {#ann_get}

```xo
fn ann_get(m: amqp.Message, key: Str) -> amqp.Value?
```

[Source: `std/amqptest.xo:468`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L468)

### ann_set {#ann_set}

```xo
fn ann_set(m: amqp.Message, key: Str, v: amqp.Value) -> amqp.Message
```

[Source: `std/amqptest.xo:483`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L483)

### group_of {#group_of}

```xo
fn group_of(m: amqp.Message) -> Str
```

[Source: `std/amqptest.xo:502`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L502)

### token_bytes {#token_bytes}

```xo
fn token_bytes(n: Int) -> Bytes
```

A 16 byte lock token from a counter.

[Source: `std/amqptest.xo:510`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L510)

### enqueue {#enqueue}

```xo
fn enqueue(var s: BrokerState, qi: Int, m0: amqp.Message, now: Int) -> Int
```

Stores a message on queue `qi`: sequence number, enqueue time, scheduled time and session. A
topic copies it to every subscription.

[Source: `std/amqptest.xo:524`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L524)

### expire_locks {#expire_locks}

```xo
fn expire_locks(var s: BrokerState, qi: Int, now: Int)
```

Clears locks that ran out.

[Source: `std/amqptest.xo:552`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L552)

### session_idx {#session_idx}

```xo
fn session_idx(q: FakeQueue, id: Str) -> Int
```

[Source: `std/amqptest.xo:569`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L569)

### available {#available}

```xo
fn available(q: FakeQueue, m: FakeMsg, now: Int, sess: Str) -> Bool
```

Whether message `m` can be handed to a receiver with session `sess` (any message for a queue
without sessions) now.

[Source: `std/amqptest.xo:580`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L580)

### take {#take}

```xo
fn take(var s: BrokerState, qi: Int, conn: Int, now: Int, sess: Str, settle: Bool) -> FakeMsg?
```

Locks the next available message of queue `qi` for connection `conn`, or removes it when
`settle` is true (receive and delete).

[Source: `std/amqptest.xo:590`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L590)

### find_seq {#find_seq}

```xo
fn find_seq(q: FakeQueue, seq: Int) -> Int
```

[Source: `std/amqptest.xo:618`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L618)

### find_token {#find_token}

```xo
fn find_token(q: FakeQueue, tok: Bytes) -> Int
```

[Source: `std/amqptest.xo:627`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L627)

### dead_letter {#dead_letter}

```xo
fn dead_letter(var s: BrokerState, qi: Int, seq: Int, reason: Str, description: Str)
```

Moves the message to the dead letter queue.

[Source: `std/amqptest.xo:637`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L637)

### unlock {#unlock}

```xo
fn unlock(var s: BrokerState, qi: Int, seq: Int, count_it: Bool)
```

Gives a locked message back; past the maximum delivery count it is dead lettered.

[Source: `std/amqptest.xo:653`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L653)

### apply_modified {#apply_modified}

```xo
fn apply_modified(var s: BrokerState, qi: Int, seq: Int, ann: List[(amqp.Value, amqp.Value)])
```

Service Bus applies an abandon or defer's properties to modify to the message's application
properties; a key is a symbol or a string, a later one replaces an earlier one.

[Source: `std/amqptest.xo:671`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L671)

### complete {#complete}

```xo
fn complete(var s: BrokerState, qi: Int, seq: Int)
```

[Source: `std/amqptest.xo:699`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L699)

### defer_msg {#defer_msg}

```xo
fn defer_msg(var s: BrokerState, qi: Int, seq: Int)
```

[Source: `std/amqptest.xo:705`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L705)

### release_conn {#release_conn}

```xo
fn release_conn(var s: BrokerState, conn: Int)
```

Gives back everything connection `conn` holds locked (it went away).

[Source: `std/amqptest.xo:718`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L718)

### lock_session {#lock_session}

```xo
fn lock_session(var s: BrokerState, qi: Int, conn: Int, now: Int, want: Str) -> Str?
```

Picks and locks a session of a session enabled queue for connection `conn`: the named one, or
the first with an available message. Returns its id, or None when there is none.

[Source: `std/amqptest.xo:759`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L759)

### unlock_session {#unlock_session}

```xo
fn unlock_session(var s: BrokerState, qi: Int, conn: Int, id: Str)
```

Releases connection `conn`'s lock on a session.

[Source: `std/amqptest.xo:795`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L795)

### take_fail {#take_fail}

```xo
fn take_fail(var s: BrokerState, op: Str) -> FakeFail?
```

The injected failure for `op`, if any (a `fail_next` one is used up).

[Source: `std/amqptest.xo:811`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L811)

### add_fail {#add_fail}

```xo
fn add_fail(b: Broker, op: Str, status: Int, condition: Str, description: Str, left: Int)
```

[Source: `std/amqptest.xo:834`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L834)

### find_hub {#find_hub}

```xo
fn find_hub(s: BrokerState, name: Str) -> Int
```

[Source: `std/amqptest.xo:840`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L840)

### hub_parse {#hub_parse}

```xo
fn hub_parse(addr: Str) -> (Int, Str, Str, Int)
```

The kind, hub, consumer group and partition of an event hub address: 4 for
`hub/ConsumerGroups/cg/Partitions/id` (a receiver), 5 for `hub` or `hub/Partitions/id` (a sender, partition -1
for any), 0 for anything else.

[Source: `std/amqptest.xo:852`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L852)

### part_hash {#part_hash}

```xo
fn part_hash(key: Str) -> Int
```

[Source: `std/amqptest.xo:862`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L862)

### hub_store {#hub_store}

```xo
fn hub_store(var s: BrokerState, hi: Int, part: Int, msgs: List[amqp.Message], now: Int) -> amqp.DeliveryState
```

Stores events sent to hub `hi`: the partition is the link's, else by the partition key, else round robin.
Each event gets the x-opt-sequence-number, x-opt-offset and x-opt-enqueued-time annotations.

[Source: `std/amqptest.xo:870`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L870)

### hub_offset {#hub_offset}

```xo
fn hub_offset(seq: Int) -> Int
```

[Source: `std/amqptest.xo:897`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L897)

### start_pos {#start_pos}

```xo
fn start_pos(events: List[amqp.Message], expr: Str) -> Int
```

Where a receiver with selector `expr` starts in `events`: after the matching event (`>`) or at it (`>=`).

[Source: `std/amqptest.xo:900`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L900)

### hub_selector {#hub_selector}

```xo
fn hub_selector(src: amqp.Source?) -> Str
```

[Source: `std/amqptest.xo:932`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L932)

### hub_epoch {#hub_epoch}

```xo
fn hub_epoch(a: amqp.Attach) -> Int
```

[Source: `std/amqptest.xo:949`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L949)

### net_err {#net_err}

```xo
fn net_err(e: NetErr) -> amqp.AmqpErr
```

[Source: `std/amqptest.xo:956`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L956)

### out {#out}

```xo
fn out(sc: ServerConn, ch: Int, body: amqp.FrameBody) -> () ! amqp.AmqpErr uses net.listen
```

[Source: `std/amqptest.xo:958`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L958)

### read_n {#read_n}

```xo
fn read_n(sc: ServerConn, buf: Bytes, n: Int) -> Bytes ! amqp.AmqpErr uses net.listen
```

[Source: `std/amqptest.xo:966`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L966)

### read_frame_sync {#read_frame_sync}

```xo
fn read_frame_sync(sc: ServerConn, buf: Bytes) -> (amqp.Frame, Bytes) ! amqp.AmqpErr uses net.listen
```

[Source: `std/amqptest.xo:978`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L978)

### ss_idx {#ss_idx}

```xo
fn ss_idx(c: SvConn, ch: Int) -> Int
```

[Source: `std/amqptest.xo:988`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L988)

### put_sess {#put_sess}

```xo
fn put_sess(var c: SvConn, i: Int, z: SvSession)
```

[Source: `std/amqptest.xo:997`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L997)

### put_link {#put_link}

```xo
fn put_link(var c: SvConn, l: SvLink)
```

[Source: `std/amqptest.xo:1003`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1003)

### lk_remote {#lk_remote}

```xo
fn lk_remote(c: SvConn, ch: Int, remote: Int) -> Int
```

[Source: `std/amqptest.xo:1009`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1009)

### mget {#mget}

```xo
fn mget(pairs: List[(amqp.Value, amqp.Value)], key: Str) -> amqp.Value?
```

[Source: `std/amqptest.xo:1019`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1019)

### app_get {#app_get}

```xo
fn app_get(m: amqp.Message, key: Str) -> amqp.Value?
```

[Source: `std/amqptest.xo:1029`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1029)

### val_str {#val_str}

```xo
fn val_str(v: amqp.Value?) -> Str
```

[Source: `std/amqptest.xo:1041`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1041)

### val_int {#val_int}

```xo
fn val_int(v: amqp.Value?) -> Int
```

[Source: `std/amqptest.xo:1049`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1049)

### val_items {#val_items}

```xo
fn val_items(v: amqp.Value?) -> List[amqp.Value]
```

[Source: `std/amqptest.xo:1063`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1063)

### val_map {#val_map}

```xo
fn val_map(v: amqp.Value) -> List[(amqp.Value, amqp.Value)]
```

[Source: `std/amqptest.xo:1071`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1071)

### body_value {#body_value}

```xo
fn body_value(m: amqp.Message) -> amqp.Value
```

[Source: `std/amqptest.xo:1078`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1078)

### classify {#classify}

```xo
fn classify(addr: Str) -> (Int, Str)
```

How the audience of a link is classified: the kind and the entity name.

[Source: `std/amqptest.xo:1089`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1089)

### auth_ok {#auth_ok}

```xo
fn auth_ok(s: BrokerState, entity: Str, now: Int) -> Bool
```

[Source: `std/amqptest.xo:1097`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1097)

### settle_reply {#settle_reply}

```xo
fn settle_reply(sc: ServerConn, ch: Int, id: Int, settled: Bool, state: amqp.DeliveryState) -> () ! amqp.AmqpErr uses net.listen
```

[Source: `std/amqptest.xo:1111`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1111)

### send_message {#send_message}

```xo
fn send_message(sc: ServerConn, var c: SvConn, li: Int, msg: amqp.Message, tag: Bytes, settled: Bool) -> Int ! amqp.AmqpErr uses net.listen
```

Sends a message to the client on sending link `li`, fragmented to the client's frame size. The
message is settled by the broker when `settled`.

[Source: `std/amqptest.xo:1118`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1118)

### guid_order {#guid_order}

```xo
fn guid_order(t: Bytes) -> Bytes
```

A 16 byte lock token in .NET GUID byte order (the first three groups little endian), which is how
Service Bus writes it as the delivery tag; the swap is its own inverse.

[Source: `std/amqptest.xo:1150`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1150)

### with_delivery_annotations {#with_delivery_annotations}

```xo
fn with_delivery_annotations(m: FakeMsg) -> amqp.Message
```

[Source: `std/amqptest.xo:1159`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1159)

### deliver_link {#deliver_link}

```xo
fn deliver_link(b: Broker, sc: ServerConn, var c: SvConn, li: Int) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

Sends the entity's deliverable messages while the link has credit and the client's window allows.

[Source: `std/amqptest.xo:1175`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1175)

### flush_replies {#flush_replies}

```xo
fn flush_replies(sc: ServerConn, var c: SvConn, li: Int) -> () ! amqp.AmqpErr uses net.listen
```

Sends the replies waiting on a $cbs or $management link while it has credit.

[Source: `std/amqptest.xo:1219`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1219)

### deliver_all {#deliver_all}

```xo
fn deliver_all(b: Broker, sc: ServerConn, var c: SvConn) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1234`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1234)

### push_reply {#push_reply}

```xo
fn push_reply(var c: SvConn, from: SvLink, m: amqp.Message)
```

Queues a reply on the connection's reply link of the same kind and entity.

[Source: `std/amqptest.xo:1248`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1248)

### reply_message {#reply_message}

```xo
fn reply_message(req: amqp.Message, status_key: Str, desc_key: Str, status: Int, desc: Str, cond: Str, body: amqp.Value) -> amqp.Message
```

[Source: `std/amqptest.xo:1262`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1262)

### pair {#pair}

```xo
fn pair(k: Str, v: amqp.Value) -> (amqp.Value, amqp.Value)
```

[Source: `std/amqptest.xo:1272`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1272)

### uuid_tokens {#uuid_tokens}

```xo
fn uuid_tokens(v: amqp.Value?) -> List[Bytes]
```

[Source: `std/amqptest.xo:1274`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1274)

### ok_out {#ok_out}

```xo
fn ok_out(body: amqp.Value) -> (Int, Str, Str, amqp.Value)
```

[Source: `std/amqptest.xo:1286`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1286)

### lock_lost {#lock_lost}

```xo
fn lock_lost() -> (Int, Str, Str, amqp.Value)
```

[Source: `std/amqptest.xo:1288`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1288)

### mgmt_op {#mgmt_op}

```xo
fn mgmt_op(var s: BrokerState, qi: Int, conn: Int, now: Int, op: Str, req: amqp.Message) -> (Int, Str, Str, amqp.Value)
```

One management operation on queue `qi`: status, error condition, description, body.

[Source: `std/amqptest.xo:1293`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1293)

### process_mgmt {#process_mgmt}

```xo
fn process_mgmt(b: Broker, sc: ServerConn, var c: SvConn, li: Int, req: amqp.Message) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1470`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1470)

### process_cbs {#process_cbs}

```xo
fn process_cbs(b: Broker, sc: ServerConn, var c: SvConn, li: Int, req: amqp.Message) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1487`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1487)

### process_send {#process_send}

```xo
fn process_send(b: Broker, sc: ServerConn, var c: SvConn, li: Int, id: Int, settled: Bool, msgs: List[amqp.Message]) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1513`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1513)

### process_message {#process_message}

```xo
fn process_message(b: Broker, sc: ServerConn, var c: SvConn, li: Int, id: Int, settled: Bool, fmt: Int, payload: Bytes) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1548`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1548)

### filter_key {#filter_key}

```xo
fn filter_key(src: amqp.Source?) -> (Str, amqp.Value)?
```

[Source: `std/amqptest.xo:1581`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1581)

### session_want {#session_want}

```xo
fn session_want(v: amqp.Value) -> Str
```

[Source: `std/amqptest.xo:1593`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1593)

### session_echo {#session_echo}

```xo
fn session_echo(v: amqp.Value, id: Str) -> amqp.Value
```

[Source: `std/amqptest.xo:1600`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1600)

### hub_link_match {#hub_link_match}

```xo
fn hub_link_match(l: SvLink, q: Str) -> Bool
```

[Source: `std/amqptest.xo:1607`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1607)

### on_hub_attach {#on_hub_attach}

```xo
fn on_hub_attach(b: Broker, sc: ServerConn, var c: SvConn, ch: Int, a: amqp.Attach, client_sends: Bool, hp: (Int, Str, Str, Int)) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

Attaches a link to an event hub: a receiver of one partition of a consumer group (kind 4) or a sender to a
hub or one of its partitions (kind 5).

[Source: `std/amqptest.xo:1613`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1613)

### deliver_hub {#deliver_hub}

```xo
fn deliver_hub(b: Broker, sc: ServerConn, var c: SvConn, li: Int) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

Sends the events a hub receiver has not got yet while it has credit; reading removes nothing.

[Source: `std/amqptest.xo:1691`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1691)

### hub_mgmt {#hub_mgmt}

```xo
fn hub_mgmt(b: Broker, var c: SvConn, li: Int, req: amqp.Message) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1718`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1718)

### on_attach {#on_attach}

```xo
fn on_attach(b: Broker, sc: ServerConn, var c: SvConn, ch: Int, a: amqp.Attach) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1762`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1762)

### on_flow {#on_flow}

```xo
fn on_flow(b: Broker, sc: ServerConn, var c: SvConn, ch: Int, x: amqp.Flow) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1856`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1856)

### on_transfer {#on_transfer}

```xo
fn on_transfer(b: Broker, sc: ServerConn, var c: SvConn, ch: Int, t: amqp.Transfer) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1907`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1907)

### on_disposition {#on_disposition}

```xo
fn on_disposition(b: Broker, sc: ServerConn, var c: SvConn, ch: Int, d: amqp.Disposition) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:1963`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L1963)

### drop_link {#drop_link}

```xo
fn drop_link(b: Broker, var c: SvConn, li: Int)
```

Gives back what a link held: its unsettled deliveries and its session lock.

[Source: `std/amqptest.xo:2034`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2034)

### on_detach {#on_detach}

```xo
fn on_detach(b: Broker, sc: ServerConn, var c: SvConn, ch: Int, x: amqp.Detach) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:2052`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2052)

### on_end {#on_end}

```xo
fn on_end(b: Broker, sc: ServerConn, var c: SvConn, ch: Int) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:2060`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2060)

### control {#control}

```xo
fn control(b: Broker, sc: ServerConn, var c: SvConn) -> Bool ! amqp.AmqpErr uses (net.listen, clock)
```

Acts on forced detaches and closes the test asked for. Returns true when the connection ends.

[Source: `std/amqptest.xo:2076`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2076)

### handle_frame {#handle_frame}

```xo
fn handle_frame(b: Broker, sc: ServerConn, var c: SvConn, f: amqp.Frame) -> Bool ! amqp.AmqpErr uses (net.listen, clock)
```

Handles one frame; true when the connection ends.

[Source: `std/amqptest.xo:2106`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2106)

### handshake {#handshake}

```xo
fn handshake(sc: ServerConn, var c: SvConn) -> Bytes ! amqp.AmqpErr uses net.listen
```

[Source: `std/amqptest.xo:2141`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2141)

### frame_reader {#frame_reader}

```xo
fn frame_reader(sc: ServerConn, start: Bytes, frames: Chan[amqp.Frame]) uses net.listen
```

[Source: `std/amqptest.xo:2174`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2174)

### run_conn {#run_conn}

```xo
fn run_conn(b: Broker, g: task.Group, sc: ServerConn, id: Int, wake: Chan[Bool]) -> () ! amqp.AmqpErr uses (net.listen, clock)
```

[Source: `std/amqptest.xo:2188`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2188)

### serve_conn {#serve_conn}

```xo
fn serve_conn(b: Broker, g: task.Group, sc: ServerConn, id: Int, wake: Chan[Bool]) uses (net.listen, clock)
```

[Source: `std/amqptest.xo:2218`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2218)

### accept_loop {#accept_loop}

```xo
fn accept_loop(b: Broker, g: task.Group, l: Listener) uses (net.listen, clock)
```

[Source: `std/amqptest.xo:2227`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L2227)
