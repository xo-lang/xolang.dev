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
  - method [`Heap.swap`](#Heap.swap)
  - method [`Heap.up`](#Heap.up)
  - method [`Heap.down`](#Heap.down)
- fn [`new`](#new)
- fn [`tracked`](#tracked)
- fn [`from_list`](#from_list)

## Types

### Heap {#Heap}

```xo
pub struct Heap[T] {
  _items: List[T]
  _less: fn(T, T) -> Bool
  _moved: fn(T, Int)
}
```

A binary heap: the element for which `less` holds against all others
comes out first. A value, as List: a copy shares the elements until one
of them is written. Equal elements come out in no particular order.

[Source: `std/heap.xo:15`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L15)

#### Heap.push {#Heap.push}

```xo
pub fn (var h: Heap[T]) push(x: T)
```

Adds x in O(log n) (heap.Push).

[Source: `std/heap.xo:45`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L45)

#### Heap.pop {#Heap.pop}

```xo
pub fn (var h: Heap[T]) pop() -> T?
```

The least element, removed, in O(log n); None when empty (heap.Pop).

[Source: `std/heap.xo:52`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L52)

#### Heap.peek {#Heap.peek}

```xo
pub fn (h: Heap[T]) peek() -> T?
```

The least element, kept; None when empty.

[Source: `std/heap.xo:57`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L57)

#### Heap.get {#Heap.get}

```xo
pub fn (h: Heap[T]) get(i: Int) -> T?
```

The element at heap position i (0 is the least); None out of range.

[Source: `std/heap.xo:60`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L60)

#### Heap.remove {#Heap.remove}

```xo
pub fn (var h: Heap[T]) remove(i: Int) -> T?
```

The element at position i, removed, in O(log n); None out of range
(heap.Remove).

[Source: `std/heap.xo:64`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L64)

#### Heap.fix {#Heap.fix}

```xo
pub fn (var h: Heap[T]) fix(i: Int, x: T)
```

Replaces the element at position i by x and restores the order, in
O(log n) (heap.Fix after changing it); a fault when i is out of range.

[Source: `std/heap.xo:80`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L80)

#### Heap.len {#Heap.len}

```xo
pub fn (h: Heap[T]) len() -> Int
```

[Source: `std/heap.xo:91`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L91)

#### Heap.is_empty {#Heap.is_empty}

```xo
pub fn (h: Heap[T]) is_empty() -> Bool
```

[Source: `std/heap.xo:93`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L93)

#### Heap.to_list {#Heap.to_list}

```xo
pub fn (h: Heap[T]) to_list() -> List[T]
```

The elements in heap order (the least first, the rest not sorted).

[Source: `std/heap.xo:96`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L96)

#### Heap.swap {#Heap.swap}

```xo
fn (var h: Heap[T]) swap(i: Int, j: Int)
```

Swaps positions i and j and reports both.

[Source: `std/heap.xo:99`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L99)

#### Heap.up {#Heap.up}

```xo
fn (var h: Heap[T]) up(j0: Int)
```

[Source: `std/heap.xo:108`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L108)

#### Heap.down {#Heap.down}

```xo
fn (var h: Heap[T]) down(i0: Int, n: Int) -> Bool
```

Go's down: sifts position i0 down within the first n; true if it moved.

[Source: `std/heap.xo:121`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L121)

## Functions

### new {#new}

```xo
pub fn new[T](less: fn(T, T) -> Bool) -> Heap[T]
```

An empty heap; less(a, b) is true when a comes out before b.

[Source: `std/heap.xo:22`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L22)

### tracked {#tracked}

```xo
pub fn tracked[T](less: fn(T, T) -> Bool, moved: fn(T, Int)) -> Heap[T]
```

An empty heap that calls moved(x, i) each time an element x lands at
position i (a push, a sift, the element a remove moves into the gap), so
a caller can keep the position of each element for `remove` and `fix`.

[Source: `std/heap.xo:29`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L29)

### from_list {#from_list}

```xo
pub fn from_list[T](items: List[T], less: fn(T, T) -> Bool) -> Heap[T]
```

The heap of items, in O(n) (heap.Init).

[Source: `std/heap.xo:34`](https://github.com/xo-lang/xo/blob/main/std/heap.xo#L34)
