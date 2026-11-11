---
title: "std/bufio"
linkTitle: "bufio"
description: "A buffered reader over any `Stream` (a Conn, a ServerConn, a TLS connection), after Go's bufio.Re..."
toc: true
module: "std/bufio"
source: "https://github.com/xo-lang/xo/blob/main/std/bufio.xo"
generated: "scripts/sync-content.py from `xo doc std/bufio`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`BufErr`](#BufErr)
  - method [`BufErr.display`](#BufErr.display)
- type [`Reader`](#Reader)
  - method [`Reader.read`](#Reader.read)
  - method [`Reader.read_until`](#Reader.read_until)
  - method [`Reader.read_line`](#Reader.read_line)
  - method [`Reader.read_exact`](#Reader.read_exact)
  - method [`Reader.peek`](#Reader.peek)
  - method [`Reader.buffered`](#Reader.buffered)
- fn [`reader`](#reader)

## Types

### BufErr {#BufErr}

```xo
enum BufErr {
  Net(err: NetErr)
  TooLong
  UnexpectedEof
}
```

Why a read failed: the stream's own error (a timeout, a cancellation,
a reset), a record longer than the limit given (a caller closes the
connection), or the stream ending before `read_exact`
had its bytes. Displays as the stream's error text, `bufio: record too
long` and `bufio: unexpected EOF`.

[Source: `std/bufio.xo:13`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L13)

#### BufErr.display {#BufErr.display}

```xo
fn (e: BufErr) display() -> Str
```

[Source: `std/bufio.xo:19`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L19)

### Reader {#Reader}

```xo
struct Reader {}
```

A reader over a stream (move only: its buffer belongs to it, and bytes
it read are not given back to the stream).

[Source: `std/bufio.xo:23`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L23)

#### Reader.read {#Reader.read}

```xo
fn (var r: Reader) read(max: Int) -> Bytes? ! NetErr uses net
```

Up to max bytes: what is buffered, else one read of the stream; None at
the end of the stream (Go's Read).

[Source: `std/bufio.xo:30`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L30)

#### Reader.read_until {#Reader.read_until}

```xo
fn (var r: Reader) read_until(delim: UInt8, limit: Int = 1048576) -> Bytes? ! BufErr uses net
```

The bytes up to and including the next `delim` (Go's ReadBytes). None
at the end of the stream with nothing left; at its end with bytes left
and no delimiter, those bytes are the last record. `TooLong` when
`limit` bytes come without a delimiter, so a peer cannot grow it
without bound; the chunks of the record already gathered are dropped
and the current chunk stays buffered, so a caller closes the connection.

[Source: `std/bufio.xo:37`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L37)

#### Reader.read_line {#Reader.read_line}

```xo
fn (var r: Reader) read_line(limit: Int = 1048576) -> Str? ! BufErr uses net
```

The next line without its "\n" or "\r\n" (Go's ReadString('\n') with the
line ending trimmed, as bufio.Scanner's ScanLines), invalid UTF-8
replaced by U+FFFD; a last line without an ending is a line. None at
the end with nothing left.

[Source: `std/bufio.xo:42`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L42)

#### Reader.read_exact {#Reader.read_exact}

```xo
fn (var r: Reader) read_exact(n: Int) -> Bytes ! BufErr uses net
```

Exactly n bytes (Go's io.ReadFull); `UnexpectedEof` when the stream ends
first (what was read is lost); n 0 is empty.

[Source: `std/bufio.xo:45`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L45)

#### Reader.peek {#Reader.peek}

```xo
fn (var r: Reader) peek(n: Int) -> Bytes ! BufErr uses net
```

The next n bytes without consuming them (Go's Peek), fewer only when the
stream ends first. Reads from the stream to fill.

[Source: `std/bufio.xo:48`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L48)

#### Reader.buffered {#Reader.buffered}

```xo
fn (r: Reader) buffered() -> Int
```

The bytes buffered and not yet read (Go's Buffered).

[Source: `std/bufio.xo:50`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L50)

## Functions

### reader {#reader}

```xo
fn reader(s: Stream, size: Int = 4096) -> Reader
```

A reader over s that reads `size` bytes at a time (Go's NewReaderSize;
4096 is Go's default, and at least 16 is used).

[Source: `std/bufio.xo:27`](https://github.com/xo-lang/xo/blob/main/std/bufio.xo#L27)
