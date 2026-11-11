---
title: "std/backoff"
linkTitle: "backoff"
description: "Exponential backoff with jitter and a retry loop, cenkalti/backoff v4's ExponentialBackOff and Re..."
toc: true
module: "std/backoff"
source: "https://github.com/xo-lang/xo/blob/main/std/backoff.xo"
generated: "scripts/sync-content.py from `xo doc std/backoff`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Backoff`](#Backoff)
  - method [`Backoff.delay`](#Backoff.delay)
- fn [`retry`](#retry)
- fn [`retry_notify`](#retry_notify)
- fn [`always`](#always)

## Types

### Backoff {#Backoff}

```xo
struct Backoff {
  initial: Duration = 500ms
  multiplier: Float = 1.5
  randomization: Float = 0.5
  max_interval: Duration = 60s
  max_elapsed: Duration = 15m
  max_tries: Int = 0
}
```

The schedule (cenkalti/backoff v4's defaults): the first delay is
`initial`, each next one `multiplier` times the last up to
`max_interval`, each randomized within `randomization` of itself.

[Source: `std/backoff.xo:10`](https://github.com/xo-lang/xo/blob/main/std/backoff.xo#L10)

#### Backoff.delay {#Backoff.delay}

```xo
fn (b: Backoff) delay(attempt: Int, rand: Rand) -> Duration uses rand
```

The delay before retry number attempt (0 for the first retry):
`initial` times `multiplier` attempt times, capped at `max_interval`,
randomized with one `rand.float()`.

[Source: `std/backoff.xo:26`](https://github.com/xo-lang/xo/blob/main/std/backoff.xo#L26)

## Functions

### retry {#retry}

```xo
fn retry[T, E, fx: Effects](b: Backoff, clock: Clock, rand: Rand, op: fn() -> T ! E uses fx, retryable: fn(E) -> Bool) -> T ! E uses (clock, rand, fx)
```

Calls op until it succeeds, `retryable(e)` is false, or a limit of b
runs out, and then answers op's last result; sleeps on clock between
tries (a cancellation point: a cancelled task unwinds there).

[Source: `std/backoff.xo:31`](https://github.com/xo-lang/xo/blob/main/std/backoff.xo#L31)

### retry_notify {#retry_notify}

```xo
fn retry_notify[T, E, fx: Effects, rx: Effects, nx: Effects](b: Backoff, clock: Clock, rand: Rand, op: fn() -> T ! E uses fx, retryable: fn(E) -> Bool uses rx, notify: fn(E, Duration) -> () uses nx) -> T ! E uses (clock, rand, fx, rx, nx)
```

retry, calling notify(e, d) with each error before sleeping d
(cenkalti/backoff v4's RetryNotify): to log or count the retries.
retryable and notify may have effects of their own (each its own
effect variable: op's need not include a log's).

[Source: `std/backoff.xo:37`](https://github.com/xo-lang/xo/blob/main/std/backoff.xo#L37)

### always {#always}

```xo
fn always[E]() -> fn(E) -> Bool
```

A retryable that retries every error.

[Source: `std/backoff.xo:40`](https://github.com/xo-lang/xo/blob/main/std/backoff.xo#L40)
