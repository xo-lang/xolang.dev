---
title: "std/deque"
linkTitle: "deque"
description: "A double ended queue on a ring buffer: O(1) at both ends (amortized: it doubles when full), as a ..."
toc: true
module: "std/deque"
source: "https://github.com/xo-lang/xo/blob/main/std/deque.xo"
generated: "scripts/sync-content.py from `xo doc std/deque`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Deque`](#deque)
  - method [`Deque.push_back`](#dequepush_back)
  - method [`Deque.push_front`](#dequepush_front)
  - method [`Deque.pop_front`](#dequepop_front)
  - method [`Deque.pop_back`](#dequepop_back)
  - method [`Deque.front`](#dequefront)
  - method [`Deque.back`](#dequeback)
  - method [`Deque.get`](#dequeget)
  - method [`Deque.len`](#dequelen)
  - method [`Deque.is_empty`](#dequeis_empty)
  - method [`Deque.to_list`](#dequeto_list)
- fn [`new`](#new)

## Types

### Deque

```xo
struct Deque[T] {}
```

A double ended queue. A value, as List: a copy shares the elements
until one of them is written, which then copies the ring once (O(n)).

[Source: `std/deque.xo:10`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L10)

#### Deque.push_back

```xo
fn (var d: Deque[T]) push_back(x: T)
```

[Source: `std/deque.xo:13`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L13)

#### Deque.push_front

```xo
fn (var d: Deque[T]) push_front(x: T)
```

[Source: `std/deque.xo:14`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L14)

#### Deque.pop_front

```xo
fn (var d: Deque[T]) pop_front() -> T?
```

The first element, removed; None when empty.

[Source: `std/deque.xo:16`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L16)

#### Deque.pop_back

```xo
fn (var d: Deque[T]) pop_back() -> T?
```

The last element, removed; None when empty.

[Source: `std/deque.xo:18`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L18)

#### Deque.front

```xo
fn (d: Deque[T]) front() -> T?
```

[Source: `std/deque.xo:19`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L19)

#### Deque.back

```xo
fn (d: Deque[T]) back() -> T?
```

[Source: `std/deque.xo:20`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L20)

#### Deque.get

```xo
fn (d: Deque[T]) get(i: Int) -> T?
```

Element i from the front; None out of range.

[Source: `std/deque.xo:22`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L22)

#### Deque.len

```xo
fn (d: Deque[T]) len() -> Int
```

[Source: `std/deque.xo:23`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L23)

#### Deque.is_empty

```xo
fn (d: Deque[T]) is_empty() -> Bool
```

[Source: `std/deque.xo:24`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L24)

#### Deque.to_list

```xo
fn (d: Deque[T]) to_list() -> List[T]
```

The elements front to back (iterate with `for x in d.to_list()`).

[Source: `std/deque.xo:26`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L26)

## Functions

### new

```xo
fn new[T](cap: Int = 0) -> Deque[T]
```

[Source: `std/deque.xo:12`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L12)
