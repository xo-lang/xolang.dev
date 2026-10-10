---
title: "A playground with no server"
date: 2026-10-10T18:00:00-04:00
description: "The Xo playground checks, compiles, and runs your code inside your browser tab, with the real Go compiler and linker built for WebAssembly."
---

Xo has a [playground](/play/). Type a program, press run, and it is checked,
compiled, and run. What is unusual is where: all of it happens inside your
browser tab. There is no build server, and your code never leaves your
machine.

## Why not a server?

Most playgrounds for compiled languages, including Go's and Rust's, send
your code to a server, which compiles and runs it in a sandbox. That works,
but it means a public service whose whole job is to run code written by
strangers. It has to be isolated, rate limited, monitored, and paid for, and
it is a target. xolang.dev is a static site, and we wanted the playground to
stay that way.

## How it works

Xo's first toolchain compiles Xo to Go, so a playground needs three things:
the Xo compiler, a Go compiler, and a place to run the result. All three are
WebAssembly:

1. **Check and generate.** The Xo compiler, built for WebAssembly, checks
   your program (the same diagnostics as `xo check`, with the same codes and
   fixes) and generates its Go source. It runs as you type.
2. **Compile and link.** The real Go compiler and linker (`cmd/compile` and
   `cmd/link`), also built for WebAssembly, compile the generated packages
   and link them against precompiled archives of Xo's runtime and the Go
   standard library. The output is a WebAssembly program.
3. **Run.** The program runs in a separate worker, with the WASI system
   interface over an empty in-memory file system. The test button builds
   the program's `test` blocks instead and runs them as `xo test -v` does.

The tools see a small in-memory file system, as if they were running on a
tiny computer. A build and run of a tour program takes about two seconds.

## Safe by construction

Because nothing runs on our side, the security question changes from "how
do we protect our servers" to "how do we protect you from code you did not
write", for example a shared link someone sent you:

- **No network.** A program can call only the WASI functions the runner
  provides, and none of them open a connection. The page's Content Security
  Policy also blocks every connection except to xolang.dev.
- **No files.** The program sees an empty file system; it cannot read
  anything on your machine.
- **Limits.** A run stops after 10 seconds, after 1 MB of output, or when
  it reaches 1 GB of memory. The stop button ends it at any time.
- **Shared links run only when you say so.** The code is stored in the
  link itself, after the `#`, which browsers never send to a server.
  Opening a link checks the code; it runs only when you press run.

## What it costs you

A download. Checking needs the Xo compiler (about 7 MB); the first run also
fetches the Go compiler, linker, and libraries (about 26 MB more). The page
asks before downloading anything, and the files are cached, so it happens
once per browser and version.

## What it cannot do (yet)

- **Servers.** A program that uses `std/http` can be checked but not run: a
  browser tab cannot listen on a port. Try the [web service
  example](/play/) anyway; the checker still works.
- **Any Go package.** `use go` works with 28 common standard packages
  (`strings`, `net/url`, `regexp`, `time`, and more), bound ahead of time.
  With the `xo` toolchain installed, `use go` binds any Go package.

Open the [playground](/play/), pick an example, and press run, or follow
the "Run it in the playground" link under any step of the [tour](/docs/tour/). The "mistakes"
examples show what the compiler catches before anything runs.
