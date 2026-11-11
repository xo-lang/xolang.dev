---
title: "std/trace"
linkTitle: "trace"
description: "Request ids and a bounded ring of spans (what took how long inside a request), with no exporter: ..."
toc: true
module: "std/trace"
source: "https://github.com/xo-lang/xo/blob/main/std/trace.xo"
generated: "scripts/sync-content.py from `xo doc std/trace`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Span`](#span)
- type [`SpanKind`](#spankind)
- type [`StatusCode`](#statuscode)
- type [`AttrValue`](#attrvalue)
- type [`Attr`](#attr)
- type [`Event`](#event)
- type [`Ring`](#ring)
  - method [`Ring.middleware`](#ringmiddleware)
  - method [`Ring.record`](#ringrecord)
  - method [`Ring.spans`](#ringspans)
  - method [`Ring.handler`](#ringhandler)
- type [`Recorder`](#recorder)
  - method [`Recorder.start`](#recorderstart)
- type [`Active`](#active)
  - method [`Active.ids`](#activeids)
  - method [`Active.set_attributes`](#activeset_attributes)
  - method [`Active.add_event`](#activeadd_event)
  - method [`Active.set_status`](#activeset_status)
  - method [`Active.end`](#activeend)
- fn [`ring`](#ring)
- fn [`id`](#id)
- fn [`recorder`](#recorder)

## Types

### Span

```xo
struct Span {
  id: Str
  name: Str
  start_ms: Int
  micros: Int
  status: Int
  trace_id as ",omitempty": Str = ""
  span_id as ",omitempty": Str = ""
  parent_id as ",omitempty": Str = ""
  kind as ",omitempty": SpanKind? = None
  attributes as ",omitempty": List[Attr] = []
  events as ",omitempty": List[Event] = []
  status_code as ",omitempty": StatusCode? = None
  status_message as ",omitempty": Str = ""
  start_ns as ",omitempty": Int = 0
  end_ns as ",omitempty": Int = 0
  scope as ",omitempty": Str = ""
  scope_version as ",omitempty": Str = ""
  schema_url as ",omitempty": Str = ""
} derive Json
```

One timed piece of work of a request: the request's id, the span's name
(`request` for the whole request, a program's own for the rest), when it
started (Unix milliseconds), how long it took (microseconds), and the
response status for `request` spans (0 otherwise).

The fields after `status` are OpenTelemetry's (decision 0580); all default to "as before" and
are left out of the JSON when empty, so a span that sets none of them reads and writes as it
did. `trace_id` (32 hex digits), `span_id` and `parent_id` (16; "root" makes a root span) name
the span; "" derives them as std/otlp always has. `kind` None keeps the request/internal rule,
`status_code` None the HTTP status rule. `start_ns` and `end_ns` (Unix nanoseconds, when
above 0) replace `start_ms` and `micros` in an export. `scope`, `scope_version` and
`schema_url` name the instrumentation scope ("" is the exporter's Resource scope).

[Source: `std/trace.xo:20`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L20)

### SpanKind

```xo
enum SpanKind { Unspecified, Internal, Server, Client, Producer, Consumer } derive Json
```

OTLP's SpanKind (the declaration order is OTLP's numbers).

[Source: `std/trace.xo:42`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L42)

### StatusCode

```xo
enum StatusCode { Unset, Ok, Error } derive Json
```

OTLP's Status.code.

[Source: `std/trace.xo:45`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L45)

### AttrValue

```xo
enum AttrValue {
  Str(v: Str)
  Int(v: Int)
  Float(v: Float)
  Bool(v: Bool)
} derive Json
```

An attribute value: OTLP's scalar AnyValue kinds.

[Source: `std/trace.xo:48`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L48)

### Attr

```xo
struct Attr {
  key: Str
  value: AttrValue
} derive Json
```

One attribute: a key and its value.

[Source: `std/trace.xo:56`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L56)

### Event

```xo
struct Event {
  name: Str
  time_ns: Int
  attributes as ",omitempty": List[Attr] = []
} derive Json
```

A timestamped event inside a span (`time_ns` is Unix nanoseconds).

[Source: `std/trace.xo:62`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L62)

### Ring

```xo
struct Ring {
  buf: Mutex[List[Span]]
  cap: Int
}
```

A bounded ring of the last `cap` spans. Cloning shares it. Its fields
are internal.

[Source: `std/trace.xo:70`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L70)

#### Ring.middleware

```xo
fn (r: Ring) middleware(rand: Rand, clock: Clock) -> fn(http.Request, http.Next) -> http.Response uses (rand, clock)
```

The request id middleware (`router.wrap(ring.middleware(rand, clock))`):
takes the id from the `X-Request-Id` header (when it is 1 to 64
printable characters) or makes a random 64 bit one, puts it in the
request (`id(req)`), answers it in the `X-Request-Id` header, and
records a `request` span.

[Source: `std/trace.xo:83`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L83)

#### Ring.record

```xo
fn (r: Ring) record(id: Str, name: Str, start: Time, d: Duration)
```

Records a span of the work started at `start` that took `d`, for the
request `id`.

[Source: `std/trace.xo:90`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L90)

#### Ring.spans

```xo
fn (r: Ring) spans(min: Duration, n: Int) -> List[Span]
```

The spans, newest first, of at most `n` (all when n \<= 0) whose
duration is at least `min`.

[Source: `std/trace.xo:94`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L94)

#### Ring.handler

```xo
fn (r: Ring) handler(auth: fn(http.Request) -> Bool) -> fn(http.Request) -> http.Response
```

A handler answering the spans as JSON (`?slow=MILLIS&n=N`; defaults 0
and 100): `router.handle("GET /debug/requests", ring.handler(auth))`;
a request for which `auth` answers false gets 403.

[Source: `std/trace.xo:138`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L138)

### Recorder

```xo
struct Recorder {
  ring: Ring
  clock: Clock
  rand: Rand
}
```

Starts and ends spans into a Ring with ids from `rand` and times from `clock`. Cloning shares it.

[Source: `std/trace.xo:97`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L97)

#### Recorder.start

```xo
fn (r: Recorder) start(name: Str, parent: (Str, Str)? = None, kind: SpanKind = SpanKind.Internal, attributes: List[Attr] = [], scope: Str = "", scope_version: Str = "", schema_url: Str = "") -> Active uses (clock, rand)
```

Starts a span. `parent` is the (trace id, span id) of its parent; None starts a new trace (16
random bytes; span ids are 8; never all zero). The span's id (the request id of the Ring) is
its trace id.

[Source: `std/trace.xo:118`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L118)

### Active

```xo
struct Active {
  ring: Ring
  clock: Clock
  span: Mutex[Span]
  done: Mutex[Bool]
}
```

A span in progress. Its ids are known at start, so a caller can hand them to children. Cloning
shares it. Its fields are internal.

[Source: `std/trace.xo:108`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L108)

#### Active.ids

```xo
fn (a: Active) ids() -> (Str, Str)
```

The (trace id, span id) of the span, as hex.

[Source: `std/trace.xo:121`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L121)

#### Active.set_attributes

```xo
fn (a: Active) set_attributes(attrs: List[Attr])
```

Adds attributes; a key already set takes the new value (OpenTelemetry's last value wins).

[Source: `std/trace.xo:124`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L124)

#### Active.add_event

```xo
fn (a: Active) add_event(name: Str, attributes: List[Attr] = []) uses clock
```

Adds an event stamped now.

[Source: `std/trace.xo:127`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L127)

#### Active.set_status

```xo
fn (a: Active) set_status(code: StatusCode, message: Str = "")
```

Sets the status. A message is kept for Error only, as OpenTelemetry Go does.

[Source: `std/trace.xo:130`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L130)

#### Active.end

```xo
fn (a: Active) end() uses clock
```

Ends the span now and records it into the Ring; ending again does nothing.

[Source: `std/trace.xo:133`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L133)

## Functions

### ring

```xo
fn ring(cap: Int = 1000) -> Ring
```

A ring of the last `cap` spans (default 1000).

[Source: `std/trace.xo:76`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L76)

### id

```xo
fn id(req: http.Request) -> Str
```

The id of a request that passed through the middleware, else "".

[Source: `std/trace.xo:86`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L86)

### recorder

```xo
fn recorder(ring: Ring, clock: Clock, rand: Rand) -> Recorder
```

A recorder writing into `ring`.

[Source: `std/trace.xo:104`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L104)
