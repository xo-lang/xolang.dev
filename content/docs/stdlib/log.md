---
title: "std/log"
linkTitle: "log"
description: "Logging performs the `log` effect (core 6.1, decision 0156); `configure` performs `stdio`."
toc: true
module: "std/log"
source: "https://github.com/xo-lang/xo/blob/main/std/log.xo"
generated: "scripts/sync-content.py from `xo doc std/log`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Logger`](#logger)
  - method [`Logger.with`](#loggerwith)
  - method [`Logger.debug`](#loggerdebug)
  - method [`Logger.info`](#loggerinfo)
  - method [`Logger.warn`](#loggerwarn)
  - method [`Logger.error`](#loggererror)
- type [`Level`](#level)
- type [`Format`](#format)
- type [`Record`](#record)
- fn [`debug`](#debug)
- fn [`info`](#info)
- fn [`warn`](#warn)
- fn [`error`](#error)
- fn [`enabled`](#enabled)
- fn [`configure`](#configure)
- fn [`with`](#with)

## Types

### Logger

```xo
struct Logger {}
```

A logger that adds fields to every record it writes (log/slog's
Logger.With; decision 0413): a value, so a handler can make one per
request and pass it on. A record's own fields override a logger's of
the same name. A logger made in a dependency's code keeps that
dependency as its records' module (decision 0173).

[Source: `std/log.xo:22`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L22)

#### Logger.with

```xo
fn (l: Logger) with(fields: Map[Str, Debug]) -> Logger
```

[Source: `std/log.xo:24`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L24)

#### Logger.debug

```xo
fn (l: Logger) debug(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:25`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L25)

#### Logger.info

```xo
fn (l: Logger) info(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:26`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L26)

#### Logger.warn

```xo
fn (l: Logger) warn(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:27`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L27)

#### Logger.error

```xo
fn (l: Logger) error(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:28`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L28)

### Level

```xo
enum Level {
  Debug
  Info
  Warn
  Error
}
```

[Source: `std/log.xo:30`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L30)

### Format

```xo
enum Format {
  Text
  Json
}
```

[Source: `std/log.xo:37`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L37)

### Record

```xo
struct Record {
  level: Level
  msg: Str
  fields: Map[Str, Str]
  module: Str
}
```

One log record as captured in tests (std.md 6, 8.6). Field values are
their text form. module is the dependency that wrote the record
("\<module path>@\<version>", decision 0173), "" for the main module.

[Source: `std/log.xo:45`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L45)

## Functions

### debug

```xo
fn debug(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:5`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L5)

### info

```xo
fn info(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:6`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L6)

### warn

```xo
fn warn(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:7`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L7)

### error

```xo
fn error(msg: Str, fields: Map[Str, Debug] = {}) uses log
```

[Source: `std/log.xo:8`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L8)

### enabled

```xo
fn enabled(level: Level) -> Bool uses log
```

Whether a record of `level` would be written under the configured
level (decision 0558): a call to `debug`, `info`, `warn` or `error`
is compiled as `if enabled(level) { call }`, so its arguments are not
evaluated otherwise; also for work that is not an argument (a costly
dump).

[Source: `std/log.xo:14`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L14)

### configure

```xo
fn configure(out: Stdio, level: Level = Level.Info, format: Format = Format.Text) uses stdio
```

[Source: `std/log.xo:15`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L15)

### with

```xo
fn with(fields: Map[Str, Debug]) -> Logger
```

[Source: `std/log.xo:23`](https://github.com/xo-lang/xo/blob/main/std/log.xo#L23)
