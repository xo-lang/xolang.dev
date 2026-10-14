---
title: "Getting started"
description: "Install the xo toolchain, then check, run, and test a first program."
weight: 10
---

Xo is experimental, and the language may change before 1.0.

## Build the toolchain

{{< source-status >}}

The toolchain is built from source, and `xo` is written in Xo, so an
existing `xo` builds the next one. From a checkout of the repository,
one command does it:

```
go run ./scripts/xobuild
export PATH="$PWD/bin:$PATH"
```

It builds `bin/xo` from the checkout and prints its path; `bin/xo`
finds the standard library at `../std`. It uses an `xo` you already
have when there is one (set `XO_SEED` to choose it). On a machine with
no `xo` at all, it needs Go 1.26 or later and git once: it builds the
first `xo` from the `go-compiler-final` tag, the last version of Xo's
original compiler written in Go, and follows a short recorded chain of
intermediate versions to today's. After that, any `xo` rebuilds the
next without Go (`scripts/bootstrap-xo.sh`).

On an arm64 host (Apple silicon, arm64 Linux) `xo` is built with the
arm64 backend and takes several minutes. The very first build on a
machine with no `xo` also builds the seed and the intermediate
versions, so it is much longer: over half an hour on a busy Mac. On an x86-64 host it is built
with the LLVM backend, which needs clang and is much slower: about 36
minutes and 10 GB of memory on a 16 vCPU Linux machine. The whole path
from nothing has been tested on macOS and arm64 Linux.

The native backends need a C toolchain: `--backend=llvm` needs clang,
and `--backend=arm64` needs a C compiler driver (`cc`: clang or gcc).

To build programs, the Go backend (the default) needs Go 1.24 or newer
on the `PATH` (or `XO_GO` set to its go command); an older Go is
reported as [`XO1502`](/docs/diagnostics/xo1502/), and no Go at all as
[`XO1503`](/docs/diagnostics/xo1503/). The native backends
(`--backend=arm64`, `--backend=llvm`) need no Go, with one exception:
building a program that names time zones reads them from Go's
`zoneinfo.zip`. With no Go installed, set `XO_ZONEINFO` to a
`zoneinfo.zip`, or build with `--tzdata=system` to use the system's zone
files. Shipping the zone data with Xo is planned.

## A first program

Make a directory and create the module:

```
$ mkdir hello && cd hello
$ xo init example.com/hello
wrote xo.mod
added xo.work to .gitignore
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
