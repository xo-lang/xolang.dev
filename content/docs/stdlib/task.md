---
title: "std/task"
linkTitle: "task"
description: "Semaphore, Once, and Group are opaque handles: copies share the same permits, result, or group."
toc: true
module: "std/task"
source: "https://github.com/xo-lang/xo/blob/main/std/task.xo"
generated: "scripts/sync-content.py from `xo doc std/task`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Timed`](#timed)
- type [`Isolated`](#isolated)
- type [`Fault`](#fault)
- type [`Budgeted`](#budgeted)
- type [`Budget`](#budget)
- type [`Group`](#group)
  - method [`Group.spawn`](#groupspawn)
  - method [`Group.spawn_background`](#groupspawn_background)
- type [`Semaphore`](#semaphore)
  - method [`Semaphore.with`](#semaphorewith)
- type [`Once`](#once)
  - method [`Once.get`](#onceget)
- fn [`budget`](#budget)
- fn [`with_budget`](#with_budget)
- fn [`with_timeout`](#with_timeout)
- fn [`isolate`](#isolate)
- fn [`is_canceled`](#is_canceled)
- fn [`stop_requested`](#stop_requested)
- fn [`stopping`](#stopping)
- fn [`deadline`](#deadline)
- fn [`map_concurrent`](#map_concurrent)
- fn [`map_concurrent_until`](#map_concurrent_until)
- fn [`semaphore`](#semaphore)
- fn [`once`](#once)

## Types

### Timed

```xo
enum Timed[E] {
  TimedOut
  Failed(from E)
} derive Display
```

[Source: `std/task.xo:5`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L5)

### Isolated

```xo
enum Isolated[E] {
  Faulted(info: Fault)
  Failed(from E)
} derive Display
```

[Source: `std/task.xo:10`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L10)

### Fault

```xo
struct Fault {
  msg: Str
  location: Str
  frames: List[Str]
} derive Display
```

[Source: `std/task.xo:15`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L15)

### Budgeted

```xo
enum Budgeted[E] {
  Exceeded(resource: Str)
  Failed(from E)
} derive Display
```

The outcome of task.with_budget (decision 0173): a ceiling was passed
(resource is "cpu", "alloc", or "steps"), or f failed.

[Source: `std/task.xo:23`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L23)

### Budget

```xo
struct Budget {
  cpu: Duration
  alloc: Int
  steps: Int
}
```

Ceilings on the work of a call run by task.with_budget (decision
0173): running time, bytes allocated, and steps (loop iterations and
calls). Zero means no ceiling.

[Source: `std/task.xo:31`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L31)

### Group

```xo
struct Group {}
```

A task group (core 7.1): created by `s.group()` or given as `os.tasks`.
Its tasks belong to the scope that created it.

[Source: `std/task.xo:63`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L63)

#### Group.spawn

```xo
fn (g: Group) spawn[T, E, fx: Effects](f: fn() -> T ! E uses fx) -> Task[T, E] uses fx
```

[Source: `std/task.xo:64`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L64)

#### Group.spawn_background

```xo
fn (g: Group) spawn_background[E, fx: Effects](f: fn() -> () ! E uses fx) uses fx
```

[Source: `std/task.xo:65`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L65)

### Semaphore

```xo
struct Semaphore {}
```

[Source: `std/task.xo:67`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L67)

#### Semaphore.with

```xo
fn (s: Semaphore) with[R, E, fx: Effects](f: fn() -> R ! E uses fx) -> R ! E uses fx
```

[Source: `std/task.xo:69`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L69)

### Once

```xo
struct Once[T, E] {}
```

Single flight with a shared result (decision 0043): the first caller of
`get` runs f; concurrent and later callers wait for and share its result.
If the running caller is cancelled before f finishes, the next waiter
runs f instead. A failed result is shared too.

[Source: `std/task.xo:75`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L75)

#### Once.get

```xo
fn (o: Once[T, E]) get[fx: Effects](f: fn() -> T ! E uses fx) -> T ! E uses fx
```

[Source: `std/task.xo:77`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L77)

## Functions

### budget

```xo
fn budget(cpu: Duration = 0s, alloc: Int = 0, steps: Int = 0) -> Budget
```

[Source: `std/task.xo:37`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L37)

### with_budget

```xo
fn with_budget[T, E, fx: Effects](clock: Clock, b: Budget, f: fn() -> T ! E uses fx) -> T ! Budgeted[E] uses (clock, fx)
```

Runs f in a child scope under the budget b: when a ceiling is passed
the scope is canceled, its tasks unwind at their next loop iteration or
call, and the result is Err(Exceeded(resource)).

[Source: `std/task.xo:42`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L42)

### with_timeout

```xo
fn with_timeout[T, E, fx: Effects](clock: Clock, d: Duration, f: fn() -> T ! E uses fx) -> T ! Timed[E] uses (clock, fx)
```

[Source: `std/task.xo:44`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L44)

### isolate

```xo
fn isolate[T, E, fx: Effects](f: fn() -> T ! E uses fx) -> T ! Isolated[E] uses fx
```

[Source: `std/task.xo:45`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L45)

### is_canceled

```xo
fn is_canceled() -> Bool
```

[Source: `std/task.xo:46`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L46)

### stop_requested

```xo
fn stop_requested() -> Bool
```

The first shutdown signal arrived (core 7.5).

[Source: `std/task.xo:48`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L48)

### stopping

```xo
fn stopping() -> Chan[()]
```

A channel closed when a stop is requested (core 7.5).

[Source: `std/task.xo:50`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L50)

### deadline

```xo
fn deadline(clock: Clock) -> Time? uses clock
```

The nearest with_timeout deadline the current task works under, as an
instant on clock, or None (decision 0430). A task keeps the deadline
in force where it was spawned.

[Source: `std/task.xo:54`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L54)

### map_concurrent

```xo
fn map_concurrent[T, R, E, fx: Effects](items: List[T], limit: Int, f: fn(T) -> R ! E uses fx) -> List[Result[R, E]] uses fx
```

[Source: `std/task.xo:56`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L56)

### map_concurrent_until

```xo
fn map_concurrent_until[T, R, E, fx: Effects](clock: Clock, d: Duration, items: List[T], limit: Int, f: fn(T) -> R ! E uses fx) -> List[Result[R, Timed[E]]] uses (clock, fx)
```

Like map_concurrent, but items not finished after d are cancelled and
give Err(TimedOut); finished results are kept, in input order.

[Source: `std/task.xo:59`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L59)

### semaphore

```xo
fn semaphore(permits: Int) -> Semaphore
```

[Source: `std/task.xo:68`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L68)

### once

```xo
fn once[T, E]() -> Once[T, E]
```

[Source: `std/task.xo:76`](https://github.com/xo-lang/xo/blob/main/std/task.xo#L76)
