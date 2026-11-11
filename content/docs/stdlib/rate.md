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
- const [`MAX_NANOS`](#MAX_NANOS)
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
- fn [`inf_duration`](#inf_duration)
- fn [`time_end`](#time_end)
- fn [`time_start`](#time_start)
- fn [`add_sat`](#add_sat)
- fn [`sub_sat`](#sub_sat)
- fn [`delay_from`](#delay_from)
- fn [`cancel_at`](#cancel_at)
- fn [`allow_at`](#allow_at)
- fn [`reserve_at`](#reserve_at)
- fn [`advance`](#advance)
- fn [`duration_from_tokens`](#duration_from_tokens)
- fn [`tokens_from_duration`](#tokens_from_duration)

## Constants

### INF {#INF}

```xo
pub const INF: Float = 1.7976931348623157e308
```

A limit that allows every event (rate.Inf).

[Source: `std/rate.xo:14`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L14)

### MAX_NANOS {#MAX_NANOS}

```xo
const MAX_NANOS: Int = Int.max
```

[Source: `std/rate.xo:153`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L153)

## Types

### LimitState {#LimitState}

```xo
pub struct LimitState {
  pub limit: Float
  pub burst: Int
  pub tokens: Float
  pub last: Time
  pub last_event: Time
}
```

A limiter's state. Internal: use the methods.

[Source: `std/rate.xo:17`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L17)

### Limiter {#Limiter}

```xo
pub struct Limiter {
  pub st: Mutex[LimitState]
  pub clock: Clock
}
```

A token bucket: `limit` tokens a second, at most `burst` at once.
A handle: copies share the bucket, and tasks may use it at once.

[Source: `std/rate.xo:27`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L27)

#### Limiter.limit {#Limiter.limit}

```xo
pub fn (l: Limiter) limit() -> Float
```

[Source: `std/rate.xo:76`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L76)

#### Limiter.burst {#Limiter.burst}

```xo
pub fn (l: Limiter) burst() -> Int
```

[Source: `std/rate.xo:78`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L78)

#### Limiter.tokens {#Limiter.tokens}

```xo
pub fn (l: Limiter) tokens() -> Float uses clock
```

The tokens in the bucket now (negative while reservations wait).

[Source: `std/rate.xo:81`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L81)

#### Limiter.allow {#Limiter.allow}

```xo
pub fn (l: Limiter) allow() -> Bool uses clock
```

Whether one event may happen now; takes its token if so (rate.Allow).

[Source: `std/rate.xo:87`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L87)

#### Limiter.allow_n {#Limiter.allow_n}

```xo
pub fn (l: Limiter) allow_n(n: Int) -> Bool uses clock
```

Whether n events may happen now; takes n tokens if so.

[Source: `std/rate.xo:90`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L90)

#### Limiter.reserve {#Limiter.reserve}

```xo
pub fn (l: Limiter) reserve() -> Reservation uses clock
```

Reserves a token for an event: act after `delay()`, or `cancel()` to
give the token back (rate.Reserve). Not ok when n is over the burst.

[Source: `std/rate.xo:94`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L94)

#### Limiter.reserve_n {#Limiter.reserve_n}

```xo
pub fn (l: Limiter) reserve_n(n: Int) -> Reservation uses clock
```

[Source: `std/rate.xo:96`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L96)

#### Limiter.wait {#Limiter.wait}

```xo
pub fn (l: Limiter) wait() -> () ! RateErr uses clock
```

Sleeps on the clock until one event may happen (rate.Wait).

[Source: `std/rate.xo:99`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L99)

#### Limiter.wait_n {#Limiter.wait_n}

```xo
pub fn (l: Limiter) wait_n(n: Int) -> () ! RateErr uses clock
```

Sleeps until n events may happen; Exceeds when n is over the burst.

[Source: `std/rate.xo:102`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L102)

#### Limiter.set_limit {#Limiter.set_limit}

```xo
pub fn (l: Limiter) set_limit(limit: Float) uses clock
```

Changes the limit, the tokens so far kept (rate.SetLimit).

[Source: `std/rate.xo:123`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L123)

#### Limiter.set_burst {#Limiter.set_burst}

```xo
pub fn (l: Limiter) set_burst(burst: Int) uses clock
```

Changes the burst (rate.SetBurst).

[Source: `std/rate.xo:133`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L133)

### Reservation {#Reservation}

```xo
pub struct Reservation {
  pub ok: Bool
  pub lim: Limiter
  pub tokens: Int
  pub time_to_act: Time
  pub limit: Float
  pub made: Time
  pub wait: Duration
}
```

The tokens an event reserved and when it may happen (rate.Reservation).

[Source: `std/rate.xo:33`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L33)

#### Reservation.ok {#Reservation.ok}

```xo
pub fn (r: Reservation) ok() -> Bool
```

False when the limiter can never allow the event (n over the burst).

[Source: `std/rate.xo:143`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L143)

#### Reservation.delay {#Reservation.delay}

```xo
pub fn (r: Reservation) delay() -> Duration uses clock
```

How long to wait before acting: 0 when now is fine; the longest
Duration when not ok.

[Source: `std/rate.xo:147`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L147)

#### Reservation.cancel {#Reservation.cancel}

```xo
pub fn (r: Reservation) cancel() uses clock
```

Gives back the reservation's tokens, as far as later reservations
have not counted on them (rate.CancelAt).

[Source: `std/rate.xo:151`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L151)

### RateErr {#RateErr}

```xo
pub enum RateErr {
  Exceeds(n: Int, burst: Int)
  Canceled
}
```

Why wait failed.

[Source: `std/rate.xo:46`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L46)

#### RateErr.display {#RateErr.display}

```xo
pub fn (e: RateErr) display() -> Str
```

`rate: Wait(n=5) exceeds limiter's burst 3`, `rate: canceled`.

[Source: `std/rate.xo:54`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L54)

## Functions

### new {#new}

```xo
pub fn new(limit: Float, burst: Int, clock: Clock) -> Limiter
```

A limiter of limit tokens a second and a bucket of burst, full
(rate.NewLimiter); limit 0 with burst 0 allows nothing, INF everything.

[Source: `std/rate.xo:63`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L63)

### every {#every}

```xo
pub fn every(interval: Duration) -> Float
```

The limit of one token per interval (rate.Every; INF for 0 or less).

[Source: `std/rate.xo:69`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L69)

### inf_duration {#inf_duration}

```xo
fn inf_duration() -> Duration
```

[Source: `std/rate.xo:155`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L155)

### time_end {#time_end}

```xo
fn time_end() -> Time
```

The latest Time: an event that waits InfDuration (a limit of 0) acts
then. Go's Time reaches year 2293 there; Xo's Unix nanoseconds stop
at 2262, so t + wait saturates.

[Source: `std/rate.xo:160`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L160)

### time_start {#time_start}

```xo
fn time_start() -> Time
```

The earliest Time Xo's Unix nanoseconds reach: time_end()'s mirror.

[Source: `std/rate.xo:163`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L163)

### add_sat {#add_sat}

```xo
fn add_sat(t: Time, d: Duration) -> Time
```

t + d, or time_end() past it and time_start() before it: Go's
Time.Add reaches years Xo's Time does not, and never faults.

[Source: `std/rate.xo:167`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L167)

### sub_sat {#sub_sat}

```xo
fn sub_sat(a: Time, b: Time) -> Duration
```

a - b, saturating as Go's Time.Sub does.

[Source: `std/rate.xo:180`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L180)

### delay_from {#delay_from}

```xo
fn delay_from(r: Reservation, t: Time) -> Duration
```

[Source: `std/rate.xo:192`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L192)

### cancel_at {#cancel_at}

```xo
fn cancel_at(r: Reservation, t: Time)
```

[Source: `std/rate.xo:220`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L220)

### allow_at {#allow_at}

```xo
fn allow_at(l: Limiter, t: Time, n: Int) -> Bool
```

[Source: `std/rate.xo:249`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L249)

### reserve_at {#reserve_at}

```xo
fn reserve_at(l: Limiter, t: Time, n: Int, max_future: Duration) -> Reservation
```

[Source: `std/rate.xo:270`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L270)

### advance {#advance}

```xo
fn advance(s: LimitState, t: Time) -> Float
```

[Source: `std/rate.xo:293`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L293)

### duration_from_tokens {#duration_from_tokens}

```xo
fn duration_from_tokens(limit: Float, tokens: Float) -> Duration
```

[Source: `std/rate.xo:302`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L302)

### tokens_from_duration {#tokens_from_duration}

```xo
fn tokens_from_duration(limit: Float, d: Duration) -> Float
```

[Source: `std/rate.xo:316`](https://github.com/xo-lang/xo/blob/main/std/rate.xo#L316)
