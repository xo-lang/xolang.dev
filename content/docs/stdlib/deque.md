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

- type [`Deque`](#Deque)
  - method [`Deque.push_back`](#Deque.push_back)
  - method [`Deque.push_front`](#Deque.push_front)
  - method [`Deque.pop_front`](#Deque.pop_front)
  - method [`Deque.pop_back`](#Deque.pop_back)
  - method [`Deque.front`](#Deque.front)
  - method [`Deque.back`](#Deque.back)
  - method [`Deque.get`](#Deque.get)
  - method [`Deque.len`](#Deque.len)
  - method [`Deque.is_empty`](#Deque.is_empty)
  - method [`Deque.to_list`](#Deque.to_list)
  - method [`Deque.grow`](#Deque.grow)
- fn [`new`](#new)

## Types

### Deque {#Deque}

```xo
pub struct Deque[T] {
  ring: List[T?]
  head: Int
  n: Int
}
```

A double ended queue. A value, as List: a copy shares the elements
until one of them is written, which then copies the ring once (O(n)).

[Source: `std/deque.xo:14`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L14)

#### Deque.push_back {#Deque.push_back}

```xo
pub fn (var d: Deque[T]) push_back(x: T)
```

[Source: `std/deque.xo:32`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L32)

#### Deque.push_front {#Deque.push_front}

```xo
pub fn (var d: Deque[T]) push_front(x: T)
```

[Source: `std/deque.xo:40`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L40)

#### Deque.pop_front {#Deque.pop_front}

```xo
pub fn (var d: Deque[T]) pop_front() -> T?
```

The first element, removed; None when empty.

[Source: `std/deque.xo:51`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L51)

#### Deque.pop_back {#Deque.pop_back}

```xo
pub fn (var d: Deque[T]) pop_back() -> T?
```

The last element, removed; None when empty.

[Source: `std/deque.xo:63`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L63)

#### Deque.front {#Deque.front}

```xo
pub fn (d: Deque[T]) front() -> T?
```

[Source: `std/deque.xo:74`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L74)

#### Deque.back {#Deque.back}

```xo
pub fn (d: Deque[T]) back() -> T?
```

[Source: `std/deque.xo:76`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L76)

#### Deque.get {#Deque.get}

```xo
pub fn (d: Deque[T]) get(i: Int) -> T?
```

Element i from the front; None out of range.

[Source: `std/deque.xo:79`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L79)

#### Deque.len {#Deque.len}

```xo
pub fn (d: Deque[T]) len() -> Int
```

[Source: `std/deque.xo:86`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L86)

#### Deque.is_empty {#Deque.is_empty}

```xo
pub fn (d: Deque[T]) is_empty() -> Bool
```

[Source: `std/deque.xo:88`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L88)

#### Deque.to_list {#Deque.to_list}

```xo
pub fn (d: Deque[T]) to_list() -> List[T]
```

The elements front to back (iterate with `for x in d.to_list()`).

[Source: `std/deque.xo:91`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L91)

#### Deque.grow {#Deque.grow}

```xo
fn (var d: Deque[T]) grow()
```

The ring in order from the front, twice as large (at least 8 slots).

[Source: `std/deque.xo:102`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L102)

## Functions

### new {#new}

```xo
pub fn new[T](cap: Int = 0) -> Deque[T]
```

[Source: `std/deque.xo:22`](https://github.com/xo-lang/xo/blob/main/std/deque.xo#L22)
