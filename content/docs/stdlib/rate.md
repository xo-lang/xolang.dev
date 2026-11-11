---
title: "std/rate"
linkTitle: "rate"
description: "A token bucket rate limiter, golang.org/x/time/rate's Limiter: limit tokens a second fill a bucke..."
toc: true
module: "std/rate"
source: "https://github.com/xo-lang/xo/blob/main/std/rate.xo"
generated: "scripts/sync-content.py from `xo doc std/rate`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`INF`](#INF)
- type [`LimitState`](#LimitState)
- type [`Limiter`](#Limiter)
  - method [`Limiter.limit`](#Limiter.limit)
  - method [`Limiter.burst`](#Limiter.burst)
  - method [`Limiter.tokens`](#Limiter.tokens)
  - method [`Limiter.allow`](#Limiter.allow)
  - method [`Limiter.allow_n`](#Limiter.allow_n)
  - method [`Limiter.reserve`](#Limiter.reserve)
  - method [`Limiter.reserve_n`](#Limiter.reserve_n)
  - method [`Limiter.wait`](#Limiter.wait)
  - method [`Limiter.wait_n`](#Limiter.wait_n)
  - method [`Limiter.set_limit`](#Limiter.set_limit)
  - method [`Limiter.set_burst`](#Limiter.set_burst)
- type [`Reservation`](#Reservation)
  - method [`Reservation.ok`](#Reservation.ok)
  - method [`Reservation.delay`](#Reservation.delay)
  - method [`Reservation.cancel`](#Reservation.cancel)
- type [`RateErr`](#RateErr)
  - method [`RateErr.display`](#RateErr.display)
- fn [`new`](#new)
- fn [`every`](#every)

## Constants

### INF {#INF}

```xo
const INF: Float = 1.7976931348623157e308
```

A limit that allows every event (rate.Inf).

[Source: `std/rate.xo:9`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L9)

## Types

### LimitState {#LimitState}

```xo
struct LimitState {
  limit: Float
  burst: Int
  tokens: Float
  last: Time
  last_event: Time
}
```

A limiter's state. Internal: use the methods.

[Source: `std/rate.xo:12`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L12)

### Limiter {#Limiter}

```xo
struct Limiter {
  st: Mutex[LimitState]
  clock: Clock
}
```

A token bucket: `limit` tokens a second, at most `burst` at once.
A handle: copies share the bucket, and tasks may use it at once.

[Source: `std/rate.xo:22`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L22)

#### Limiter.limit {#Limiter.limit}

```xo
fn (l: Limiter) limit() -> Float
```

[Source: `std/rate.xo:57`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L57)

#### Limiter.burst {#Limiter.burst}

```xo
fn (l: Limiter) burst() -> Int
```

[Source: `std/rate.xo:58`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L58)

#### Limiter.tokens {#Limiter.tokens}

```xo
fn (l: Limiter) tokens() -> Float uses clock
```

The tokens in the bucket now (negative while reservations wait).

[Source: `std/rate.xo:60`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L60)

#### Limiter.allow {#Limiter.allow}

```xo
fn (l: Limiter) allow() -> Bool uses clock
```

Whether one event may happen now; takes its token if so (rate.Allow).

[Source: `std/rate.xo:62`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L62)

#### Limiter.allow_n {#Limiter.allow_n}

```xo
fn (l: Limiter) allow_n(n: Int) -> Bool uses clock
```

Whether n events may happen now; takes n tokens if so.

[Source: `std/rate.xo:64`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L64)

#### Limiter.reserve {#Limiter.reserve}

```xo
fn (l: Limiter) reserve() -> Reservation uses clock
```

Reserves a token for an event: act after `delay()`, or `cancel()` to
give the token back (rate.Reserve). Not ok when n is over the burst.

[Source: `std/rate.xo:67`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L67)

#### Limiter.reserve_n {#Limiter.reserve_n}

```xo
fn (l: Limiter) reserve_n(n: Int) -> Reservation uses clock
```

[Source: `std/rate.xo:68`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L68)

#### Limiter.wait {#Limiter.wait}

```xo
fn (l: Limiter) wait() -> () ! RateErr uses clock
```

Sleeps on the clock until one event may happen (rate.Wait).

[Source: `std/rate.xo:70`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L70)

#### Limiter.wait_n {#Limiter.wait_n}

```xo
fn (l: Limiter) wait_n(n: Int) -> () ! RateErr uses clock
```

Sleeps until n events may happen; Exceeds when n is over the burst.

[Source: `std/rate.xo:72`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L72)

#### Limiter.set_limit {#Limiter.set_limit}

```xo
fn (l: Limiter) set_limit(limit: Float) uses clock
```

Changes the limit, the tokens so far kept (rate.SetLimit).

[Source: `std/rate.xo:74`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L74)

#### Limiter.set_burst {#Limiter.set_burst}

```xo
fn (l: Limiter) set_burst(burst: Int) uses clock
```

Changes the burst (rate.SetBurst).

[Source: `std/rate.xo:76`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L76)

### Reservation {#Reservation}

```xo
struct Reservation {
  ok: Bool
  lim: Limiter
  tokens: Int
  time_to_act: Time
  limit: Float
  made: Time
  wait: Duration
}
```

The tokens an event reserved and when it may happen (rate.Reservation).

[Source: `std/rate.xo:28`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L28)

#### Reservation.ok {#Reservation.ok}

```xo
fn (r: Reservation) ok() -> Bool
```

False when the limiter can never allow the event (n over the burst).

[Source: `std/rate.xo:79`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L79)

#### Reservation.delay {#Reservation.delay}

```xo
fn (r: Reservation) delay() -> Duration uses clock
```

How long to wait before acting: 0 when now is fine; the longest
Duration when not ok.

[Source: `std/rate.xo:82`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L82)

#### Reservation.cancel {#Reservation.cancel}

```xo
fn (r: Reservation) cancel() uses clock
```

Gives back the reservation's tokens, as far as later reservations
have not counted on them (rate.CancelAt).

[Source: `std/rate.xo:85`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L85)

### RateErr {#RateErr}

```xo
enum RateErr {
  Exceeds(n: Int, burst: Int)
  Canceled
}
```

Why wait failed.

[Source: `std/rate.xo:41`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L41)

#### RateErr.display {#RateErr.display}

```xo
fn (e: RateErr) display() -> Str
```

`rate: Wait(n=5) exceeds limiter's burst 3`, `rate: canceled`.

[Source: `std/rate.xo:49`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L49)

## Functions

### new {#new}

```xo
fn new(limit: Float, burst: Int, clock: Clock) -> Limiter
```

A limiter of limit tokens a second and a bucket of burst, full
(rate.NewLimiter); limit 0 with burst 0 allows nothing, INF everything.

[Source: `std/rate.xo:53`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L53)

### every {#every}

```xo
fn every(interval: Duration) -> Float
```

The limit of one token per interval (rate.Every; INF for 0 or less).

[Source: `std/rate.xo:55`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L55)
