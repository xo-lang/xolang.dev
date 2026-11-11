---
title: "std/amqptest"
linkTitle: "amqptest"
description: "Serve it on a listener (the test world's in memory listeners work) and dial it with std/amqp."
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

## Types

### QueueOptions {#QueueOptions}

```xo
struct QueueOptions {
  sessions: Bool = false
  lock_ms: Int = 60000
  max_delivery_count: Int = 10
}
```

One entity's settings.

[Source: `std/amqptest.xo:8`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L8)

### FakeMsg {#FakeMsg}

```xo
struct FakeMsg {
  seq: Int
  m: amqp.Message
  delivery_count: Int = 0
  lock_token: Bytes = b""
  locked_until: Int = 0
  lock_conn: Int = 0
  scheduled_ms: Int = 0
  enqueued_ms: Int = 0
  session: Str = ""
  deferred: Bool = false
  dead_reason: Str = ""
  dead_description: Str = ""
}
```

A message held by a queue. Internal: use the Broker's methods.

[Source: `std/amqptest.xo:18`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L18)

### FakeSession {#FakeSession}

```xo
struct FakeSession {
  id: Str
  state: Bytes = b""
  locked_until: Int = 0
  owner: Int = 0
  updated_ms: Int = 0
}
```

A session of a session enabled queue. Internal.

[Source: `std/amqptest.xo:36`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L36)

### FakeQueue {#FakeQueue}

```xo
struct FakeQueue {
  name: Str
  opts: QueueOptions
  is_topic: Bool = false
  msgs: List[FakeMsg] = []
  dead: List[FakeMsg] = []
  next_seq: Int = 1
  sessions: List[FakeSession] = []
}
```

A queue, or a topic's subscription (named `topic/Subscriptions/name`), or a topic (no messages).
Internal.

[Source: `std/amqptest.xo:47`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L47)

### FakeFail {#FakeFail}

```xo
struct FakeFail {
  op: Str
  status: Int
  condition: Str
  description: Str
  left: Int
}
```

An injected failure. Internal.

[Source: `std/amqptest.xo:58`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L58)

### FakePart {#FakePart}

```xo
struct FakePart {
  events: List[amqp.Message] = []
}
```

One partition of an event hub: the events in order, each with its x-opt annotations. Internal.

[Source: `std/amqptest.xo:70`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L70)

### FakeHub {#FakeHub}

```xo
struct FakeHub {
  name: Str
  groups: List[Str]
  parts: List[FakePart]
  created_ms: Int
  rr: Int = 0
  geo_factor: Int = 1
}
```

An event hub (decision 0521). Internal.

[Source: `std/amqptest.xo:75`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L75)

### HubOwner {#HubOwner}

```xo
struct HubOwner {
  path: Str
  key: Str
  epoch: Int
}
```

A receiver link that owns a partition of a consumer group at an epoch. Internal.

[Source: `std/amqptest.xo:87`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L87)

### BrokerState {#BrokerState}

```xo
struct BrokerState {
  queues: List[FakeQueue] = []
  hubs: List[FakeHub] = []
  owners: List[HubOwner] = []
  tokens: List[(Str, Str)] = []
  attaches: List[(Str, Str, List[Str])] = []
  expiries: List[(Str, Int)] = []
  rejected: List[Str] = []
  require_token: Bool = false
  fails: List[FakeFail] = []
  wakes: List[(Int, Chan[Bool])] = []
  conns: List[(Int, ServerConn)] = []
  next_conn: Int = 1
  next_lock: Int = 1
  slow_mgmt_ms: Int = 0
  gen: Int = 0
  detaches: List[(Int, Str, amqp.WireError)] = []
  closes: List[(Int, amqp.WireError?)] = []
}
```

The broker's state. Internal.

[Source: `std/amqptest.xo:96`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L96)

### Broker {#Broker}

```xo
struct Broker {
  st: Mutex[BrokerState]
  clock: Clock
}
```

A broker. A handle: copies share it.

[Source: `std/amqptest.xo:122`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L122)

#### Broker.serve {#Broker.serve}

```xo
fn (b: Broker) serve(g: task.Group, l: Listener) uses (net.listen, clock)
```

Serves the connections `l` accepts, each in a task of `g`; returns at once. The tasks end when
`g` is cancelled or `l` is closed.

[Source: `std/amqptest.xo:189`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L189)

#### Broker.queue {#Broker.queue}

```xo
fn (b: Broker) queue(name: Str, opts: QueueOptions = QueueOptions{})
```

Declares a queue (a queue is also created, with the defaults, by the first link to it).

[Source: `std/amqptest.xo:192`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L192)

#### Broker.event_hub {#Broker.event_hub}

```xo
fn (b: Broker) event_hub(name: Str, partitions: Int, consumer_groups: List[Str] = ["$Default"])
```

Declares an event hub with `partitions` partitions (ids "0", "1", ...), receivable by each consumer group
at `hub/ConsumerGroups/cg/Partitions/id` and sendable at `hub` or `hub/Partitions/id`.

[Source: `std/amqptest.xo:195`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L195)

#### Broker.event_hub_geo_factor {#Broker.event_hub_geo_factor}

```xo
fn (b: Broker) event_hub_geo_factor(hub: Str, factor: Int)
```

Sets the georeplication_factor an event hub's READ reports (1 when declared; above 1 means
geo-replication is enabled, as Event Hubs v2 reads it).

[Source: `std/amqptest.xo:198`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L198)

#### Broker.events {#Broker.events}

```xo
fn (b: Broker) events(hub: Str, partition: Int) -> List[amqp.Message]
```

The events a partition holds, with their x-opt-sequence-number, x-opt-offset and x-opt-enqueued-time
message annotations.

[Source: `std/amqptest.xo:201`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L201)

#### Broker.topic {#Broker.topic}

```xo
fn (b: Broker) topic(name: Str)
```

Declares a topic: a message sent to it is copied to every subscription.

[Source: `std/amqptest.xo:203`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L203)

#### Broker.subscription {#Broker.subscription}

```xo
fn (b: Broker) subscription(topic: Str, name: Str, opts: QueueOptions = QueueOptions{})
```

Declares the subscription `topic/Subscriptions/name`, receivable at that address.

[Source: `std/amqptest.xo:205`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L205)

#### Broker.put {#Broker.put}

```xo
fn (b: Broker) put(queue: Str, m: amqp.Message)
```

Puts a message on a queue (or a topic) as if a client had sent it.

[Source: `std/amqptest.xo:208`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L208)

#### Broker.ready {#Broker.ready}

```xo
fn (b: Broker) ready(queue: Str) -> List[amqp.Message]
```

The messages that can be delivered now, in order, as a client would receive them.

[Source: `std/amqptest.xo:210`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L210)

#### Broker.locked {#Broker.locked}

```xo
fn (b: Broker) locked(queue: Str) -> Int
```

The number of messages locked by a receiver.

[Source: `std/amqptest.xo:212`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L212)

#### Broker.dead_letters {#Broker.dead_letters}

```xo
fn (b: Broker) dead_letters(queue: Str) -> List[amqp.Message]
```

The messages in the dead letter queue.

[Source: `std/amqptest.xo:214`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L214)

#### Broker.scheduled {#Broker.scheduled}

```xo
fn (b: Broker) scheduled(queue: Str) -> List[amqp.Message]
```

The messages scheduled for later.

[Source: `std/amqptest.xo:216`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L216)

#### Broker.deferred {#Broker.deferred}

```xo
fn (b: Broker) deferred(queue: Str) -> List[amqp.Message]
```

The deferred messages.

[Source: `std/amqptest.xo:218`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L218)

#### Broker.tokens {#Broker.tokens}

```xo
fn (b: Broker) tokens() -> List[(Str, Str)]
```

The `(audience, token)` pairs the broker accepted through $cbs, in order.

[Source: `std/amqptest.xo:220`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L220)

#### Broker.attaches {#Broker.attaches}

```xo
fn (b: Broker) attaches() -> List[(Str, Str, List[Str])]
```

Every link a client attached, in order: its address (a sender's target, a receiver's source),
the client's role ("sender" or "receiver") and the Attach's desired capabilities.

[Source: `std/amqptest.xo:223`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L223)

#### Broker.reject_token {#Broker.reject_token}

```xo
fn (b: Broker) reject_token(token: Str)
```

A put-token with this token is answered with 401.

[Source: `std/amqptest.xo:225`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L225)

#### Broker.require_token {#Broker.require_token}

```xo
fn (b: Broker) require_token(on: Bool)
```

Links to entities are refused (`amqp:unauthorized-access`) until a put-token whose audience
ends with the entity's name was accepted and has not expired.

[Source: `std/amqptest.xo:228`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L228)

#### Broker.session_state {#Broker.session_state}

```xo
fn (b: Broker) session_state(queue: Str, session: Str) -> Bytes
```

The state of a session of a session enabled queue, as set by a client.

[Source: `std/amqptest.xo:230`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L230)

#### Broker.fail_next {#Broker.fail_next}

```xo
fn (b: Broker) fail_next(op: Str, status: Int, condition: Str, description: Str)
```

The next use of operation `op` fails with an error: an attach, a transfer, a disposition or a
put-token is refused with `condition`; a management operation (`renew-lock`, `peek-message`,
`schedule-message`, `cancel-scheduled-message`, `receive-by-sequence-number`,
`update-disposition`, `renew-session-lock`, `get-session-state`, `set-session-state`) answers
`status` with `condition` and `description`.

[Source: `std/amqptest.xo:237`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L237)

#### Broker.fail {#Broker.fail}

```xo
fn (b: Broker) fail(op: Str, status: Int, condition: Str, description: Str)
```

Like `fail_next`, until `clear_failures`.

[Source: `std/amqptest.xo:239`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L239)

#### Broker.clear_failures {#Broker.clear_failures}

```xo
fn (b: Broker) clear_failures()
```

[Source: `std/amqptest.xo:240`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L240)

#### Broker.slow_management {#Broker.slow_management}

```xo
fn (b: Broker) slow_management(ms: Int)
```

Holds every management reply back by `ms` milliseconds.

[Source: `std/amqptest.xo:242`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L242)

#### Broker.detach_links {#Broker.detach_links}

```xo
fn (b: Broker) detach_links(queue: Str, error: amqp.WireError)
```

Detaches every link to `queue` with `error` (for example `amqp:link:detach-forced`).

[Source: `std/amqptest.xo:244`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L244)

#### Broker.disconnect_all {#Broker.disconnect_all}

```xo
fn (b: Broker) disconnect_all(error: amqp.WireError? = None)
```

Closes every connection, with `error` in the Close frame when given, otherwise by dropping the
transport.

[Source: `std/amqptest.xo:247`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L247)

### SvLink {#SvLink}

```xo
struct SvLink {
  handle: Int
  remote: Int
  channel: Int
  name: Str
  sends: Bool
  kind: Int
  queue: Str
  credit: Int = 0
  delivery_count: Int = 0
  presettled: Bool = false
  session_id: Str = ""
  partial: Bytes = b""
  partial_id: Int = 0
  partial_settled: Bool = false
  partial_active: Bool = false
  partial_format: Int = 0
  replies: List[amqp.Message] = []
  unsettled: List[(Int, Int)] = []
  detached: Bool = false
  hub: Str = ""
  cg: Str = ""
  part: Int = -1
  pos: Int = 0
  epoch: Int = 0
  hkey: Str = ""
}
```

A link of one connection. Internal.

[Source: `std/amqptest.xo:128`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L128)

### SvSession {#SvSession}

```xo
struct SvSession {
  channel: Int
  next_in: Int = 0
  next_out: Int = 0
  remote_window: Int = 0
  ended: Bool = false
  in_used: Int = 0
}
```

A session of one connection. Internal.

[Source: `std/amqptest.xo:165`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L165)

### SvConn {#SvConn}

```xo
struct SvConn {
  id: Int
  max_frame: Int = 65536
  sess: List[SvSession] = []
  links: List[SvLink] = []
  seen_gen: Int = 0
}
```

One connection's state. Internal.

[Source: `std/amqptest.xo:176`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L176)

## Functions

### new {#new}

```xo
fn new(clock: Clock) -> Broker
```

A new broker; `clock` times message locks, scheduled messages and token expiry.

[Source: `std/amqptest.xo:185`](https://github.com/xo-lang/xo/blob/main/std/amqptest.xo#L185)
