---
title: "std/sql"
linkTitle: "sql"
description: "see spec/std.md 10"
toc: true
module: "std/sql"
source: "https://github.com/xo-lang/xo/blob/main/std/sql.xo"
generated: "scripts/sync-content.py from `xo doc std/sql`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`SqlValue`](#sqlvalue)
- type [`Isolation`](#isolation)
- type [`SqlErr`](#sqlerr)
  - method [`SqlErr.display`](#sqlerrdisplay)
- type [`ExecResult`](#execresult)
- type [`Db`](#db)
  - method [`Db.query`](#dbquery)
  - method [`Db.rows`](#dbrows)
  - method [`Db.each`](#dbeach)
  - method [`Db.copy_from`](#dbcopy_from)
  - method [`Db.query_one`](#dbquery_one)
  - method [`Db.exec`](#dbexec)
  - method [`Db.query_as`](#dbquery_as)
  - method [`Db.query_one_as`](#dbquery_one_as)
  - method [`Db.begin`](#dbbegin)
  - method [`Db.ping`](#dbping)
  - method [`Db.close`](#dbclose)
- type [`Tx`](#tx)
  - method [`Tx.query`](#txquery)
  - method [`Tx.rows`](#txrows)
  - method [`Tx.each`](#txeach)
  - method [`Tx.copy_from`](#txcopy_from)
  - method [`Tx.query_one`](#txquery_one)
  - method [`Tx.exec`](#txexec)
  - method [`Tx.query_as`](#txquery_as)
  - method [`Tx.query_one_as`](#txquery_one_as)
  - method [`Tx.commit`](#txcommit)
  - method [`Tx.rollback`](#txrollback)
- type [`Row`](#row)
  - method [`Row.columns`](#rowcolumns)
  - method [`Row.decode`](#rowdecode)
  - method [`Row.value`](#rowvalue)
  - method [`Row.is_null`](#rowis_null)
  - method [`Row.int`](#rowint)
  - method [`Row.str`](#rowstr)
  - method [`Row.float`](#rowfloat)
  - method [`Row.bool`](#rowbool)
  - method [`Row.time`](#rowtime)
  - method [`Row.int_opt`](#rowint_opt)
  - method [`Row.str_opt`](#rowstr_opt)
  - method [`Row.float_opt`](#rowfloat_opt)
  - method [`Row.bool_opt`](#rowbool_opt)
  - method [`Row.time_opt`](#rowtime_opt)
  - method [`Row.bytes`](#rowbytes)
  - method [`Row.bytes_opt`](#rowbytes_opt)
  - method [`Row.json`](#rowjson)
  - method [`Row.ints`](#rowints)
  - method [`Row.strs`](#rowstrs)
  - method [`Row.items`](#rowitems)
- type [`Rows`](#rows)
  - method [`Rows.columns`](#rowscolumns)
  - method [`Rows.next`](#rowsnext)
  - method [`Rows.next_as`](#rowsnext_as)
  - method [`Rows.close`](#rowsclose)
- type [`Driver`](#driver)
- type [`DriverConn`](#driverconn)
- type [`DriverRows`](#driverrows)
- type [`DriverCursor`](#drivercursor)
- fn [`null`](#null)
- fn [`int`](#int)
- fn [`str`](#str)
- fn [`float`](#float)
- fn [`bool`](#bool)
- fn [`time`](#time)
- fn [`bytes`](#bytes)
- fn [`json`](#json)
- fn [`array`](#array)
- fn [`quote_ident`](#quote_ident)
- fn [`open`](#open)
- fn [`memory`](#memory)
- fn [`open_driver`](#open_driver)

## Types

### SqlValue

```xo
enum SqlValue {
  Null
  Integer(n: Int)
  Text(s: Str)
  Real(f: Float)
  Flag(b: Bool)
  At(t: Time)
  Blob(b: Bytes)
  JsonText(s: Str)
  Array(items: List[SqlValue])
}
```

A query parameter. `$1` is `args[0]`.

[Source: `std/sql.xo:19`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L19)

### Isolation

```xo
enum Isolation {
  Default
  ReadUncommitted
  ReadCommitted
  RepeatableRead
  Serializable
}
```

A transaction's isolation level (Go's sql.IsolationLevel, the four of
standard SQL); Default is the server's own.

[Source: `std/sql.xo:50`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L50)

### SqlErr

```xo
enum SqlErr {
  Syntax(msg: Str)
  Constraint(msg: Str, code: Str, name: Str)
  Param(msg: Str)
  NoTable(name: Str)
  NoRows
  NoColumn(name: Str)
  Mismatch(column: Str, msg: Str)
  Conn(msg: Str)
  Driver(msg: Str)
  Server(code: Str, msg: Str)
  TxDone
  Closed
  Canceled
}
```

[Source: `std/sql.xo:58`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L58)

#### SqlErr.display

```xo
fn (e: SqlErr) display() -> Str
```

Plain text (decision 0358): `syntax error: MSG`, MSG for a Constraint,
Param or Driver, `no such table: NAME`, `no rows in result set`,
`no such column: NAME`, `column COL: MSG`, `connection: MSG`,
`MSG (SQLSTATE CODE)`, `transaction already committed or rolled back`,
`database is closed`, `canceled`.

[Source: `std/sql.xo:89`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L89)

### ExecResult

```xo
struct ExecResult {
  rows_affected: Int
  last_insert_id: Int
}
```

[Source: `std/sql.xo:91`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L91)

### Db

```xo
struct Db[fx: Effects] {}
```

[Source: `std/sql.xo:97`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L97)

#### Db.query

```xo
fn (d: Db) query(q: Str, args: List[SqlValue] = []) -> List[Row] ! SqlErr uses net.dial
```

[Source: `std/sql.xo:113`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L113)

#### Db.rows

```xo
fn (d: Db) rows(q: Str, args: List[SqlValue] = []) -> Rows ! SqlErr uses net.dial
```

`query` as a cursor: the rows are read from the connection as `next`
asks (the Postgres driver; the in memory database and the Go backend
read the result whole), so a result larger than memory can be walked.
The connection stays taken until `next` returns None or an error, or
`close`; use `each` or `defer rows.close()`.

[Source: `std/sql.xo:119`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L119)

#### Db.each

```xo
fn (d: Db) each(q: Str, args: List[SqlValue], f: fn(Row) -> () ! SqlErr) -> () ! SqlErr uses net.dial
```

`rows`, calling f on each row and closing in every path; an error from
f ends the walk and is returned.

[Source: `std/sql.xo:122`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L122)

#### Db.copy_from

```xo
fn (d: Db) copy_from(table: Str, columns: List[Str], rows: fn() -> List[SqlValue]? ! SqlErr) -> Int ! SqlErr uses net.dial
```

Loads rows with COPY FROM STDIN in the text format (decision 0479, pgx's
CopyFrom): `rows` is called until it returns None, each row a list of
values in the order of `columns`; the result is the number of rows
copied. An error from `rows` cancels the COPY (the server rolls it
back) and is returned. `table` and `columns` are identifiers, quoted by
the driver (`quote_ident`); values are never interpolated. The in
memory database inserts the rows one by one; a driver without COPY
returns Driver.

[Source: `std/sql.xo:131`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L131)

#### Db.query_one

```xo
fn (d: Db) query_one(q: Str, args: List[SqlValue] = []) -> Row ! SqlErr uses net.dial
```

[Source: `std/sql.xo:132`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L132)

#### Db.exec

```xo
fn (d: Db) exec(q: Str, args: List[SqlValue] = []) -> ExecResult ! SqlErr uses net.dial
```

[Source: `std/sql.xo:133`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L133)

#### Db.query_as

```xo
fn (d: Db) query_as[T: SqlRow](q: Str, args: List[SqlValue] = []) -> List[T] ! SqlErr uses net.dial
```

`query` with every row decoded into `T` (`derive SqlRow`, std.md 10.4).

[Source: `std/sql.xo:135`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L135)

#### Db.query_one_as

```xo
fn (d: Db) query_one_as[T: SqlRow](q: Str, args: List[SqlValue] = []) -> T ! SqlErr uses net.dial
```

`query_one` with the row decoded into `T`.

[Source: `std/sql.xo:137`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L137)

#### Db.begin

```xo
fn (d: Db) begin(isolation: Isolation = Isolation.Default, read_only: Bool = false) -> Tx ! SqlErr uses net.dial
```

A transaction (Go's DB.BeginTx): isolation and read_only are Go's
sql.TxOptions. A driver's connection gets `SET TRANSACTION ...` with
them right after BEGIN (nothing for the defaults); the in memory
database is serializable whatever the level, and refuses a write in a
read only transaction with Server("25006", ...), as Postgres does.

[Source: `std/sql.xo:143`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L143)

#### Db.ping

```xo
fn (d: Db) ping() -> () ! SqlErr uses net.dial
```

[Source: `std/sql.xo:144`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L144)

#### Db.close

```xo
fn (d: Db) close() -> () ! SqlErr
```

[Source: `std/sql.xo:145`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L145)

### Tx

```xo
struct Tx[fx: Effects] {}
```

[Source: `std/sql.xo:98`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L98)

#### Tx.query

```xo
fn (t: Tx) query(q: Str, args: List[SqlValue] = []) -> List[Row] ! SqlErr uses net.dial
```

[Source: `std/sql.xo:147`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L147)

#### Tx.rows

```xo
fn (t: Tx) rows(q: Str, args: List[SqlValue] = []) -> Rows ! SqlErr uses net.dial
```

`Db.rows` inside the transaction: the transaction's connection is
busy until the cursor ends or is closed.

[Source: `std/sql.xo:150`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L150)

#### Tx.each

```xo
fn (t: Tx) each(q: Str, args: List[SqlValue], f: fn(Row) -> () ! SqlErr) -> () ! SqlErr uses net.dial
```

[Source: `std/sql.xo:151`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L151)

#### Tx.copy_from

```xo
fn (t: Tx) copy_from(table: Str, columns: List[Str], rows: fn() -> List[SqlValue]? ! SqlErr) -> Int ! SqlErr uses net.dial
```

[Source: `std/sql.xo:152`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L152)

#### Tx.query_one

```xo
fn (t: Tx) query_one(q: Str, args: List[SqlValue] = []) -> Row ! SqlErr uses net.dial
```

[Source: `std/sql.xo:153`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L153)

#### Tx.exec

```xo
fn (t: Tx) exec(q: Str, args: List[SqlValue] = []) -> ExecResult ! SqlErr uses net.dial
```

[Source: `std/sql.xo:154`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L154)

#### Tx.query_as

```xo
fn (t: Tx) query_as[T: SqlRow](q: Str, args: List[SqlValue] = []) -> List[T] ! SqlErr uses net.dial
```

[Source: `std/sql.xo:155`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L155)

#### Tx.query_one_as

```xo
fn (t: Tx) query_one_as[T: SqlRow](q: Str, args: List[SqlValue] = []) -> T ! SqlErr uses net.dial
```

[Source: `std/sql.xo:156`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L156)

#### Tx.commit

```xo
fn (t: Tx) commit() -> () ! SqlErr uses net.dial
```

[Source: `std/sql.xo:157`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L157)

#### Tx.rollback

```xo
fn (t: Tx) rollback() -> () ! SqlErr uses net.dial
```

[Source: `std/sql.xo:158`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L158)

### Row

```xo
struct Row {}
```

[Source: `std/sql.xo:99`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L99)

#### Row.columns

```xo
fn (r: Row) columns() -> List[Str]
```

[Source: `std/sql.xo:169`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L169)

#### Row.decode

```xo
fn (r: Row) decode[T: SqlRow]() -> T ! SqlErr
```

Decodes the row into a struct with `derive SqlRow`: each field from the
column of the same name (std.md 10.4).

[Source: `std/sql.xo:172`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L172)

#### Row.value

```xo
fn (r: Row) value(name: Str) -> SqlValue ! SqlErr
```

The column's value as the driver read it (pgx's Rows.Values, one
column; NoColumn for an unknown name).

[Source: `std/sql.xo:175`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L175)

#### Row.is_null

```xo
fn (r: Row) is_null(name: Str) -> Bool ! SqlErr
```

[Source: `std/sql.xo:176`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L176)

#### Row.int

```xo
fn (r: Row) int(name: Str) -> Int ! SqlErr
```

[Source: `std/sql.xo:177`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L177)

#### Row.str

```xo
fn (r: Row) str(name: Str) -> Str ! SqlErr
```

[Source: `std/sql.xo:178`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L178)

#### Row.float

```xo
fn (r: Row) float(name: Str) -> Float ! SqlErr
```

[Source: `std/sql.xo:179`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L179)

#### Row.bool

```xo
fn (r: Row) bool(name: Str) -> Bool ! SqlErr
```

[Source: `std/sql.xo:180`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L180)

#### Row.time

```xo
fn (r: Row) time(name: Str) -> Time ! SqlErr
```

[Source: `std/sql.xo:181`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L181)

#### Row.int_opt

```xo
fn (r: Row) int_opt(name: Str) -> Int? ! SqlErr
```

[Source: `std/sql.xo:182`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L182)

#### Row.str_opt

```xo
fn (r: Row) str_opt(name: Str) -> Str? ! SqlErr
```

[Source: `std/sql.xo:183`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L183)

#### Row.float_opt

```xo
fn (r: Row) float_opt(name: Str) -> Float? ! SqlErr
```

[Source: `std/sql.xo:184`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L184)

#### Row.bool_opt

```xo
fn (r: Row) bool_opt(name: Str) -> Bool? ! SqlErr
```

[Source: `std/sql.xo:185`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L185)

#### Row.time_opt

```xo
fn (r: Row) time_opt(name: Str) -> Time? ! SqlErr
```

[Source: `std/sql.xo:186`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L186)

#### Row.bytes

```xo
fn (r: Row) bytes(name: Str) -> Bytes ! SqlErr
```

[Source: `std/sql.xo:187`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L187)

#### Row.bytes_opt

```xo
fn (r: Row) bytes_opt(name: Str) -> Bytes? ! SqlErr
```

[Source: `std/sql.xo:188`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L188)

#### Row.json

```xo
fn (r: Row) json[T: Json](name: Str) -> T ! SqlErr
```

A json or jsonb column (or text) decoded into T; a decode error is
Mismatch(column, msg).

[Source: `std/sql.xo:191`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L191)

#### Row.ints

```xo
fn (r: Row) ints(name: Str) -> List[Int] ! SqlErr
```

An array of integers; a NULL element is Mismatch.

[Source: `std/sql.xo:193`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L193)

#### Row.strs

```xo
fn (r: Row) strs(name: Str) -> List[Str] ! SqlErr
```

[Source: `std/sql.xo:194`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L194)

#### Row.items

```xo
fn (r: Row) items(name: Str) -> List[SqlValue] ! SqlErr
```

An array's elements as values.

[Source: `std/sql.xo:196`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L196)

### Rows

```xo
struct Rows[fx: Effects] {}
```

A result read row by row (decision 0479, Go's *sql.Rows): holds a
connection from `rows` to the last row or `close`.

[Source: `std/sql.xo:102`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L102)

#### Rows.columns

```xo
fn (r: Rows) columns() -> List[Str]
```

[Source: `std/sql.xo:160`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L160)

#### Rows.next

```xo
fn (r: Rows) next() -> Row? ! SqlErr uses net.dial
```

The next row, None after the last (the connection is then released).

[Source: `std/sql.xo:162`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L162)

#### Rows.next_as

```xo
fn (r: Rows) next_as[T: SqlRow]() -> T? ! SqlErr uses net.dial
```

`next` decoded into `T` (`derive SqlRow`).

[Source: `std/sql.xo:164`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L164)

#### Rows.close

```xo
fn (r: Rows) close() uses net.dial
```

Reads and discards the rest of the result and releases the connection;
idempotent.

[Source: `std/sql.xo:167`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L167)

### Driver

```xo
interface Driver[fx: Effects] {
  fn connect(self, net: Net, dsn: Str) -> DriverConn[fx] ! SqlErr uses (net.dial, fx)
}
```

A database driver written in Xo (decision 0278): opened with
`open_driver`, which gives it std/sql's pool, transactions, and
cancellation. It dials through the Net it is given.

[Source: `std/sql.xo:201`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L201)

### DriverConn

```xo
interface DriverConn[fx: Effects] {
  fn query(self, q: Str, args: List[SqlValue]) -> DriverRows[fx] ! SqlErr uses (net.dial, fx)
  fn exec(self, q: Str, args: List[SqlValue]) -> ExecResult ! SqlErr uses (net.dial, fx)
  fn begin(self) -> () ! SqlErr uses (net.dial, fx)
  fn commit(self) -> () ! SqlErr uses (net.dial, fx)
  fn rollback(self) -> () ! SqlErr uses (net.dial, fx)
  fn ping(self) -> () ! SqlErr uses (net.dial, fx)
  fn copy_from(self, table: Str, columns: List[Str], rows: fn() -> List[SqlValue]? ! SqlErr) -> Int ! SqlErr uses (net.dial, fx)
  fn close(self) uses (net.dial, fx)
  fn is_broken(self) -> Bool
}
```

One connection of a Driver, used by one task at a time. Its waits are
cancellation points that return Canceled.

[Source: `std/sql.xo:207`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L207)

### DriverRows

```xo
struct DriverRows[fx: Effects] {
  columns: List[Str]
  rows: List[List[SqlValue]]
  cursor: DriverCursor[fx]? = None
}
```

The result of DriverConn.query: column names and rows of values. A
driver may return a few rows (or none) and a cursor for the rest
(decision 0479): Db.rows reads them as asked, Db.query reads them all.

[Source: `std/sql.xo:224`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L224)

### DriverCursor

```xo
interface DriverCursor[fx: Effects] {
  fn next(self) -> List[SqlValue]? ! SqlErr uses (net.dial, fx)
  fn rest(self) -> List[List[SqlValue]] ! SqlErr uses (net.dial, fx)
  fn close(self) uses (net.dial, fx)
}
```

The rest of a result still on the connection. The connection is not
used again until the cursor is read to the end or closed.

[Source: `std/sql.xo:232`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L232)

## Functions

### null

```xo
fn null() -> SqlValue
```

[Source: `std/sql.xo:34`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L34)

### int

```xo
fn int(n: Int) -> SqlValue
```

[Source: `std/sql.xo:35`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L35)

### str

```xo
fn str(s: Str) -> SqlValue
```

[Source: `std/sql.xo:36`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L36)

### float

```xo
fn float(f: Float) -> SqlValue
```

[Source: `std/sql.xo:37`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L37)

### bool

```xo
fn bool(b: Bool) -> SqlValue
```

[Source: `std/sql.xo:38`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L38)

### time

```xo
fn time(t: Time) -> SqlValue
```

[Source: `std/sql.xo:39`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L39)

### bytes

```xo
fn bytes(b: Bytes) -> SqlValue
```

[Source: `std/sql.xo:40`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L40)

### json

```xo
fn json[T: Json](v: T) -> SqlValue
```

JsonText of `json.encode_str(v)`.

[Source: `std/sql.xo:42`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L42)

### array

```xo
fn array(items: List[SqlValue]) -> SqlValue
```

[Source: `std/sql.xo:43`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L43)

### quote_ident

```xo
fn quote_ident(name: Str) -> Str
```

An SQL identifier in double quotes, a double quote doubled (Postgres's
quote_ident, pgx's Identifier.Sanitize).

[Source: `std/sql.xo:46`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L46)

### open

```xo
fn open(net: Net, driver: Str, dsn: Str, max_open: Int = 10, max_idle: Int = 2, max_lifetime: Duration = 30m, roots: Bytes = b"") -> Db ! SqlErr uses net.dial
```

Opens a database: "postgres" (decision 0278; `roots` is PEM for
sslmode verify-ca and verify-full) natively. `max_open` bounds concurrent
operations and open transactions (waiting is a cancellation point),
`max_idle` and `max_lifetime` are passed to the driver.

[Source: `std/sql.xo:108`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L108)

### memory

```xo
fn memory(schema: Str = "") -> Db ! SqlErr
```

An in memory database, optionally created with `schema` (`;` separated
statements). Needs no capability.

[Source: `std/sql.xo:111`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L111)

### open_driver

```xo
fn open_driver[fx: Effects](net: Net, d: Driver[fx], dsn: Str, max_open: Int = 10, max_idle: Int = 2, max_lifetime: Duration = 30m) -> Db[fx] ! SqlErr uses (net.dial, fx)
```

A Db over d: `max_open` connections at most (operations and open
transactions; waiting is a cancellation point), `max_idle` kept open
when unused, each closed after `max_lifetime`. Connects once before it
returns, so a wrong password or host fails here.

[Source: `std/sql.xo:245`](https://github.com/xo-lang/xo/blob/main/std/sql.xo#L245)
