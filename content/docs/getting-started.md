---
title: "Getting started"
description: "Install the xo toolchain, then check, run, and test a first program."
weight: 10
---

Xo is experimental, and the language may change before 1.0.

## Build the toolchain

{{< source-status >}}

The toolchain is built from source, and `xo` is written in Xo, so an
existing `xo` builds the next one. If you already have an `xo`, from a
checkout of the repository:

```
XO_SEED=/path/to/xo go run ./scripts/xobuild
export PATH="$PWD/bin:$PATH"
```

It builds `bin/xo` from the checkout and prints its path; `bin/xo`
finds the standard library at `../std`. Without `XO_SEED` it looks for
an earlier build of the checkout, or `xo` on your `PATH`, and stops with
an error if it finds none.

With no `xo` at all, build from source:

```
go run ./scripts/xobuild --from-source
export PATH="$PWD/bin:$PATH"
```

This needs Go 1.26 or later and git, once. It builds the
`go-compiler-final` tag, the last version of Xo's original compiler
written in Go, then a short recorded chain of intermediate versions,
then the checkout. It is slow: the last measurement, on 2026-10-13, was 25 to 37 minutes on a 16 vCPU machine.
After that, any `xo` rebuilds the next without Go
(`scripts/bootstrap-xo.sh`).

On an arm64 host (Apple silicon, arm64 Linux) `xo` is built with the
arm64 backend. On an x86-64 host it is built with the LLVM backend,
which needs clang.

Programs build to native code by default, and what that needs depends
on the backend:

- `--backend=arm64`, the default on arm64 hosts: nothing. Xo's own
  assembler and linkers build the binary, with no C toolchain, unless
  the program calls C with `use c`.
- `--backend=amd64`, the default on x86-64 hosts: nothing, for Linux,
  Intel Macs, and Windows.
- `--backend=llvm`: clang.
- `--backend=go`, needed for `use go`: Go 1.24 or newer on the `PATH`
  (or `XO_GO` set to its go command); an older Go is reported as
  [`XO1502`](/docs/diagnostics/xo1502/), and no Go at all as
  [`XO1503`](/docs/diagnostics/xo1503/).

Time zone data ships with Xo's standard library, so no backend needs Go
for it.

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
