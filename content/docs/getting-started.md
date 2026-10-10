---
title: "Getting started"
description: "Install the xo toolchain, then check, run, and test a first program."
weight: 10
---

Xo is experimental, and the language may change before 1.0.

## Build the toolchain

{{< source-status >}}

The toolchain is built from source with Go 1.26 or later. From a checkout of
the repository:

```
go build -o .tools/bin/xo ./cmd/xo
export PATH="$PWD/.tools/bin:$PATH"
```

## A first program

Make a directory and create the module:

```
$ mkdir hello && cd hello
$ xo init example.com/hello
wrote xo.mod
```

Then add `main.xo`:

```
fn greet(name: Str) -> Str {
  "hello, ${name}"
}

test "greet" {
  expect(greet("Ada")) == "hello, Ada"
}

fn main(os: Os) {
  os.stdio.println(greet("world"))
}
```

Then check, run, and test it:

```
$ xo check .
1 module(s), 0 error(s), 0 warning(s)
$ xo run .
hello, world
$ xo test .
ok: 1 passed, 0 failed, 0 skipped
```

`main` receives the operating system as a capability (`os`). Code that needs
the network, files, or the clock gets them from `main`, so a function's
signature shows what it can touch.

## Diagnostics for agents

`xo check --json` reports every problem as JSON with a stable `XOnnnn` code,
notes, and machine applicable fixes. `xo explain <code>` describes any code.
Every code is listed, with an example and a fix, in the
[diagnostics reference](../diagnostics/).

## Next

- Take the [tour](../tour/): twelve short steps, each with a program that
  checks, runs, and passes its tests.
- Read the [core specification](../spec/core/) for everything in full.
- See the realistic example service in `examples/notes-service` in the
  repository: HTTP and JSON, `std/sql`, auth middleware, a background job,
  and graceful shutdown.
