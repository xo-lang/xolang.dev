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
- type [`Ring`](#ring)
  - method [`Ring.middleware`](#ringmiddleware)
  - method [`Ring.record`](#ringrecord)
  - method [`Ring.spans`](#ringspans)
  - method [`Ring.handler`](#ringhandler)
- fn [`ring`](#ring)
- fn [`id`](#id)

## Types

### Span

```xo
struct Span {
  id: Str
  name: Str
  start_ms: Int
  micros: Int
  status: Int
} derive Json
```

One timed piece of work of a request: the request's id, the span's name
(`request` for the whole request, a program's own for the rest), when it
started (Unix milliseconds), how long it took (microseconds), and the
response status for `request` spans (0 otherwise).

[Source: `std/trace.xo:12`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L12)

### Ring

```xo
struct Ring {
  buf: Mutex[List[Span]]
  cap: Int
}
```

A bounded ring of the last `cap` spans. Cloning shares it. Its fields
are internal.

[Source: `std/trace.xo:22`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L22)

#### Ring.middleware

```xo
fn (r: Ring) middleware(rand: Rand, clock: Clock) -> fn(http.Request, http.Next) -> http.Response uses (rand, clock)
```

The request id middleware (`router.wrap(ring.middleware(rand, clock))`):
takes the id from the `X-Request-Id` header (when it is 1 to 64
printable characters) or makes a random 64 bit one, puts it in the
request (`id(req)`), answers it in the `X-Request-Id` header, and
records a `request` span.

[Source: `std/trace.xo:35`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L35)

#### Ring.record

```xo
fn (r: Ring) record(id: Str, name: Str, start: Time, d: Duration)
```

Records a span of the work started at `start` that took `d`, for the
request `id`.

[Source: `std/trace.xo:42`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L42)

#### Ring.spans

```xo
fn (r: Ring) spans(min: Duration, n: Int) -> List[Span]
```

The spans, newest first, of at most `n` (all when n \<= 0) whose
duration is at least `min`.

[Source: `std/trace.xo:46`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L46)

#### Ring.handler

```xo
fn (r: Ring) handler(auth: fn(http.Request) -> Bool) -> fn(http.Request) -> http.Response
```

A handler answering the spans as JSON (`?slow=MILLIS&n=N`; defaults 0
and 100): `router.handle("GET /debug/requests", ring.handler(auth))`;
a request for which `auth` answers false gets 403.

[Source: `std/trace.xo:51`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L51)

## Functions

### ring

```xo
fn ring(cap: Int = 1000) -> Ring
```

A ring of the last `cap` spans (default 1000).

[Source: `std/trace.xo:28`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L28)

### id

```xo
fn id(req: http.Request) -> Str
```

The id of a request that passed through the middleware, else "".

[Source: `std/trace.xo:38`](https://github.com/xo-lang/xo/blob/main/std/trace.xo#L38)
