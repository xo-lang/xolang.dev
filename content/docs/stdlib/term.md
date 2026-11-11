---
title: "std/term"
linkTitle: "term"
description: "Colors for terminal output that follow the user's settings: NO_COLOR, FORCE_COLOR, TERM=dumb, and..."
toc: true
module: "std/term"
source: "https://github.com/xo-lang/xo/blob/main/std/term.xo"
generated: "scripts/sync-content.py from `xo doc std/term`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Painter`](#Painter)
  - method [`Painter.bold`](#Painter.bold)
  - method [`Painter.dim`](#Painter.dim)
  - method [`Painter.underline`](#Painter.underline)
  - method [`Painter.red`](#Painter.red)
  - method [`Painter.green`](#Painter.green)
  - method [`Painter.yellow`](#Painter.yellow)
  - method [`Painter.blue`](#Painter.blue)
  - method [`Painter.magenta`](#Painter.magenta)
  - method [`Painter.cyan`](#Painter.cyan)
  - method [`Painter.gray`](#Painter.gray)
- fn [`color_enabled`](#color_enabled)
- fn [`painter`](#painter)
- fn [`strip`](#strip)

## Types

### Painter {#Painter}

```xo
struct Painter {
  on: Bool
}
```

Wraps text in ANSI styles when `on`, else returns it unchanged. Make
one with `painter`; `Painter{on: false}` in tests.

[Source: `std/term.xo:10`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L10)

#### Painter.bold {#Painter.bold}

```xo
fn (p: Painter) bold(s: Str) -> Str
```

[Source: `std/term.xo:21`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L21)

#### Painter.dim {#Painter.dim}

```xo
fn (p: Painter) dim(s: Str) -> Str
```

[Source: `std/term.xo:22`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L22)

#### Painter.underline {#Painter.underline}

```xo
fn (p: Painter) underline(s: Str) -> Str
```

[Source: `std/term.xo:23`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L23)

#### Painter.red {#Painter.red}

```xo
fn (p: Painter) red(s: Str) -> Str
```

[Source: `std/term.xo:24`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L24)

#### Painter.green {#Painter.green}

```xo
fn (p: Painter) green(s: Str) -> Str
```

[Source: `std/term.xo:25`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L25)

#### Painter.yellow {#Painter.yellow}

```xo
fn (p: Painter) yellow(s: Str) -> Str
```

[Source: `std/term.xo:26`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L26)

#### Painter.blue {#Painter.blue}

```xo
fn (p: Painter) blue(s: Str) -> Str
```

[Source: `std/term.xo:27`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L27)

#### Painter.magenta {#Painter.magenta}

```xo
fn (p: Painter) magenta(s: Str) -> Str
```

[Source: `std/term.xo:28`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L28)

#### Painter.cyan {#Painter.cyan}

```xo
fn (p: Painter) cyan(s: Str) -> Str
```

[Source: `std/term.xo:29`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L29)

#### Painter.gray {#Painter.gray}

```xo
fn (p: Painter) gray(s: Str) -> Str
```

[Source: `std/term.xo:30`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L30)

## Functions

### color_enabled {#color_enabled}

```xo
fn color_enabled(out: Stdio, env: Env) -> Bool uses (stdio, env)
```

Whether to color standard output: NO_COLOR set and not empty is off;
FORCE_COLOR or CLICOLOR_FORCE set, not empty, and not "0" is on;
TERM=dumb is off; otherwise on when standard output is a terminal.

[Source: `std/term.xo:17`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L17)

### painter {#painter}

```xo
fn painter(out: Stdio, env: Env) -> Painter uses (stdio, env)
```

A Painter that colors when `color_enabled(out, env)`.

[Source: `std/term.xo:19`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L19)

### strip {#strip}

```xo
fn strip(s: Str) -> Str
```

s without ANSI escape sequences (to measure or log painted text).

[Source: `std/term.xo:33`](https://github.com/xo-lang/xo/blob/main/std/term.xo#L33)
