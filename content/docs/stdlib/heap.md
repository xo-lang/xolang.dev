---
title: "std/heap"
linkTitle: "heap"
description: "A binary heap ordered by a comparison the caller gives, after Go's container/heap (heap.go: Init,..."
toc: true
module: "std/heap"
source: "https://github.com/xo-lang/xo/blob/main/std/heap.xo"
generated: "scripts/sync-content.py from `xo doc std/heap`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Heap`](#Heap)
  - method [`Heap.push`](#Heap.push)
  - method [`Heap.pop`](#Heap.pop)
  - method [`Heap.peek`](#Heap.peek)
  - method [`Heap.get`](#Heap.get)
  - method [`Heap.remove`](#Heap.remove)
  - method [`Heap.fix`](#Heap.fix)
  - method [`Heap.len`](#Heap.len)
  - method [`Heap.is_empty`](#Heap.is_empty)
  - method [`Heap.to_list`](#Heap.to_list)
- fn [`new`](#new)
- fn [`tracked`](#tracked)
- fn [`from_list`](#from_list)

## Types

### Heap {#Heap}

```xo
struct Heap[T] {
  _items: List[T]
  _less: fn(T, T) -> Bool
  _moved: fn(T, Int)
}
```

A binary heap: the element for which `less` holds against all others
comes out first. A value, as List: a copy shares the elements until one
of them is written. Equal elements come out in no particular order.

[Source: `std/heap.xo:11`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L11)

#### Heap.push {#Heap.push}

```xo
fn (var h: Heap[T]) push(x: T)
```

Adds x in O(log n) (heap.Push).

[Source: `std/heap.xo:29`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L29)

#### Heap.pop {#Heap.pop}

```xo
fn (var h: Heap[T]) pop() -> T?
```

The least element, removed, in O(log n); None when empty (heap.Pop).

[Source: `std/heap.xo:31`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L31)

#### Heap.peek {#Heap.peek}

```xo
fn (h: Heap[T]) peek() -> T?
```

The least element, kept; None when empty.

[Source: `std/heap.xo:33`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L33)

#### Heap.get {#Heap.get}

```xo
fn (h: Heap[T]) get(i: Int) -> T?
```

The element at heap position i (0 is the least); None out of range.

[Source: `std/heap.xo:35`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L35)

#### Heap.remove {#Heap.remove}

```xo
fn (var h: Heap[T]) remove(i: Int) -> T?
```

The element at position i, removed, in O(log n); None out of range
(heap.Remove).

[Source: `std/heap.xo:38`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L38)

#### Heap.fix {#Heap.fix}

```xo
fn (var h: Heap[T]) fix(i: Int, x: T)
```

Replaces the element at position i by x and restores the order, in
O(log n) (heap.Fix after changing it); a fault when i is out of range.

[Source: `std/heap.xo:41`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L41)

#### Heap.len {#Heap.len}

```xo
fn (h: Heap[T]) len() -> Int
```

[Source: `std/heap.xo:42`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L42)

#### Heap.is_empty {#Heap.is_empty}

```xo
fn (h: Heap[T]) is_empty() -> Bool
```

[Source: `std/heap.xo:43`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L43)

#### Heap.to_list {#Heap.to_list}

```xo
fn (h: Heap[T]) to_list() -> List[T]
```

The elements in heap order (the least first, the rest not sorted).

[Source: `std/heap.xo:45`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L45)

## Functions

### new {#new}

```xo
fn new[T](less: fn(T, T) -> Bool) -> Heap[T]
```

An empty heap; less(a, b) is true when a comes out before b.

[Source: `std/heap.xo:21`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L21)

### tracked {#tracked}

```xo
fn tracked[T](less: fn(T, T) -> Bool, moved: fn(T, Int)) -> Heap[T]
```

An empty heap that calls moved(x, i) each time an element x lands at
position i (a push, a sift, the element a remove moves into the gap), so
a caller can keep the position of each element for `remove` and `fix`.

[Source: `std/heap.xo:25`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L25)

### from_list {#from_list}

```xo
fn from_list[T](items: List[T], less: fn(T, T) -> Bool) -> Heap[T]
```

The heap of items, in O(n) (heap.Init).

[Source: `std/heap.xo:27`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L27)
