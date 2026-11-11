---
title: "std/sqlite"
linkTitle: "sqlite"
description: "A SQLite driver for std/sql's open_driver, over the SQLite library (public domain) linked into th..."
toc: true
module: "std/sqlite"
source: "https://github.com/xo-lang/xo/blob/main/std/sqlite.xo"
generated: "scripts/sync-content.py from `xo doc std/sqlite`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Config`](#Config)
- fn [`driver`](#driver)
- fn [`config`](#config)
- fn [`version`](#version)

## Types

### Config {#Config}

```xo
struct Config {
  path: Str
  uri: Bool
  keys: List[Str]
  busy_ms: Int
  pragmas: List[Str]
}
```

A parsed DSN (see the module comment).

[Source: `std/sqlite.xo:30`](https://github.com/xo-lang/xo/blob/main/std/sqlite.xo#L30)

## Functions

### driver {#driver}

```xo
fn driver(fs: Fs) -> sql.Driver[fs]
```

The driver, opening database files through fs; its Db's operations
perform fs.

[Source: `std/sqlite.xo:40`](https://github.com/xo-lang/xo/blob/main/std/sqlite.xo#L40)

### config {#config}

```xo
fn config(dsn: Str) -> Config ! sql.SqlErr
```

The DSN's parts; Param for an unknown `_` key or a bad value.

[Source: `std/sqlite.xo:43`](https://github.com/xo-lang/xo/blob/main/std/sqlite.xo#L43)

### version {#version}

```xo
fn version() -> Str uses fs
```

The SQLite library's version, e.g. "3.54.1".

[Source: `std/sqlite.xo:46`](https://github.com/xo-lang/xo/blob/main/std/sqlite.xo#L46)
