---
title: "std/go"
linkTitle: "go"
description: "Bindings written by `xo bind` (internal/gobind) import this module for `go.Error`; user code need..."
toc: true
module: "std/go"
source: "https://github.com/xo-lang/xo/blob/main/std/go.xo"
generated: "scripts/sync-content.py from `xo doc std/go`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Error`](#error)
  - method [`Error.display`](#errordisplay)
  - method [`Error.message`](#errormessage)
  - method [`Error.go_type`](#errorgo_type)
- type [`Any`](#any)
  - method [`Any.display`](#anydisplay)
  - method [`Any.type_name`](#anytype_name)
  - method [`Any.is_nil`](#anyis_nil)
  - method [`Any.as_int`](#anyas_int)
  - method [`Any.as_float`](#anyas_float)
  - method [`Any.as_bool`](#anyas_bool)
  - method [`Any.as_str`](#anyas_str)
  - method [`Any.as_bytes`](#anyas_bytes)
  - method [`Any.as_list`](#anyas_list)
  - method [`Any.as_map`](#anyas_map)
  - method [`Any.as_handle`](#anyas_handle)
- type [`Out`](#out)
  - method [`Out.any`](#outany)
  - method [`Out.get`](#outget)
- type [`Recv`](#recv)
  - method [`Recv.recv`](#recvrecv)
  - method [`Recv.try_recv`](#recvtry_recv)
  - method [`Recv.each`](#recveach)
- fn [`error`](#error)
- fn [`any`](#any)
- fn [`out`](#out)

## Types

### Error

```xo
struct Error {}
```

An error returned by a Go function: the `error` of a Go `(T, error)`
result, which a binding maps to `T ! go.Error`. Its text is captured at
the boundary, so `display` performs no Go call.

[Source: `std/go.xo:10`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L10)

#### Error.display

```xo
fn (e: Error) display() -> Str
```

The Go error's `Error()` text.

[Source: `std/go.xo:13`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L13)

#### Error.message

```xo
fn (e: Error) message() -> Str
```

The Go error's `Error()` text (same as `display`).

[Source: `std/go.xo:16`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L16)

#### Error.go_type

```xo
fn (e: Error) go_type() -> Str
```

The Go dynamic type of the error, for example `*url.Error`.

[Source: `std/go.xo:19`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L19)

### Any

```xo
struct Any {}
```

A Go `any` (`interface{}`) value a `use go` binding takes or returns
(decision 0412): opaque to Xo. Make one with `go.any(x)` (a list
literal written for a `...any` parameter converts its elements
implicitly); read one with the `as_*` methods, None on another Go
type. Compares as Go's `==` on the interface. A value a replay rebuilt
only displays, unless its function is `replay rerun` (core 11.3).

[Source: `std/go.xo:33`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L33)

#### Any.display

```xo
fn (a: Any) display() -> Str
```

The value as Go's `%v`.

[Source: `std/go.xo:36`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L36)

#### Any.type_name

```xo
fn (a: Any) type_name() -> Str
```

The value's Go type, as Go's `%T` (`int`, `*sql.Rows`, `<nil>`).

[Source: `std/go.xo:39`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L39)

#### Any.is_nil

```xo
fn (a: Any) is_nil() -> Bool
```

Whether the value is Go's nil, or a nil pointer, slice or map.

[Source: `std/go.xo:42`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L42)

#### Any.as_int

```xo
fn (a: Any) as_int() -> Int?
```

The value as an Int when it is one of Go's integer types and fits.

[Source: `std/go.xo:45`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L45)

#### Any.as_float

```xo
fn (a: Any) as_float() -> Float?
```

The value as a Float when it is a float64 or float32.

[Source: `std/go.xo:48`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L48)

#### Any.as_bool

```xo
fn (a: Any) as_bool() -> Bool?
```

The value as a Bool when it is one.

[Source: `std/go.xo:51`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L51)

#### Any.as_str

```xo
fn (a: Any) as_str() -> Str?
```

The value as a Str when its Go kind is string.

[Source: `std/go.xo:54`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L54)

#### Any.as_bytes

```xo
fn (a: Any) as_bytes() -> Bytes?
```

The value as Bytes when it is a []byte (copied).

[Source: `std/go.xo:57`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L57)

#### Any.as_list

```xo
fn (a: Any) as_list() -> List[Any]?
```

The elements of a Go slice or array.

[Source: `std/go.xo:60`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L60)

#### Any.as_map

```xo
fn (a: Any) as_map() -> Map[Str, Any]?
```

The entries of a Go map with string keys.

[Source: `std/go.xo:63`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L63)

#### Any.as_handle

```xo
fn (a: Any) as_handle[T]() -> T?
```

The `use go` handle of type T that holds the value, when the value's
Go type is T's.

[Source: `std/go.xo:67`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L67)

### Out

```xo
struct Out[T] {}
```

A Go pointer a Go function fills through `any` (`rows.scan`,
`json.unmarshal`): pass `.any()`, read `.get()` after the call.

[Source: `std/go.xo:77`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L77)

#### Out.any

```xo
fn (o: Out[T]) any() -> Any
```

The pointer, as the `go.Any` the Go function takes.

[Source: `std/go.xo:84`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L84)

#### Out.get

```xo
fn (o: Out[T]) get() -> T
```

The value Go wrote; a fault when Go wrote another type.

[Source: `std/go.xo:87`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L87)

### Recv

```xo
struct Recv[T] {}
```

A Go channel Xo receives from (decision 0421): a `<-chan T` or
`chan T` a Go function, field or variable gives Xo. Sending and
closing are Go's; a nil Go channel is a closed one.

[Source: `std/go.xo:92`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L92)

#### Recv.recv

```xo
fn (r: Recv[T]) recv() -> T? uses go
```

The next value; None once the channel is closed and empty. Waits in
Go: a cancellation point (the task's cancellation or
`task.with_timeout` ends the wait).

[Source: `std/go.xo:97`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L97)

#### Recv.try_recv

```xo
fn (r: Recv[T]) try_recv() -> T?? uses go
```

The next value if one is ready: None when none is, Some(None) once
the channel is closed.

[Source: `std/go.xo:101`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L101)

#### Recv.each

```xo
fn (r: Recv[T]) each[fx: Effects](f: fn(T) uses fx) uses go, fx
```

Calls f with each value until the channel is closed.

[Source: `std/go.xo:104`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L104)

## Functions

### error

```xo
fn error(message: Str) -> Error
```

A Go error with text `message` (Go's `errors.New`), for an Xo
function a Go library calls to return (decision 0416): an Xo
callback's `! go.Error` is the callback's Go `error`. An Error that
came from Go goes back as that Go error, so Go's `errors.Is` sees it.

[Source: `std/go.xo:25`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L25)

### any

```xo
fn any[T](x: T) -> Any
```

An Xo value as the Go value a binding passes for it: Int as int64,
Float as float64, Str as string, Bytes as []byte, Duration as
time.Duration, Time as time.Time, a handle as its Go value, a List as a
slice, a Map as a map, an Option as its value or nil.

[Source: `std/go.xo:73`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L73)

### out

```xo
fn out[T]() -> Out[T]
```

A new Go pointer to the zero value of T's Go type (T a value type
`go.any` takes, a handle, or `go.Any`).

[Source: `std/go.xo:81`](https://github.com/xo-lang/xo/blob/main/std/go.xo#L81)
