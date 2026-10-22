---
title: "The toolchain: binaries and commands"
description: "What the xo toolchain is made of, how to build it, which backend builds which target, and every command with an example."
weight: 12
---

Xo is experimental, and the commands and flags below may change before
1.0. The specification's [section 10.1](/docs/spec/core/#101-commands)
is the authoritative list of commands and flags; this page is the
practical guide to it.

## What `xo` is

`xo` is one binary: the compiler, the formatter, the test runner, the
module tools, and the editor and agent servers. It is written in Xo
(the self-hosted compiler, built from `compiler/xo` in the repository;
you may see it called xo1 in the project's notes). The original
compiler, written in Go, was deleted on 2026-10-13; its last version is
tagged `go-compiler-final` and serves only as the seed on a machine
with no `xo` at all.

### The layout

An installed toolchain is a directory, and `xo` finds the rest of the
toolchain relative to itself:

```
bin/xo          the toolchain
bin/xo-gobind   a helper that binds Go packages for use go
lib/xo/         std (with the IANA time zone database), third_party,
                race (the ThreadSanitizer runtime for --race, where the
                platform has one)
```

The [release archives](https://github.com/xo-lang/xo/releases/latest)
unpack into this layout ([Getting started](/docs/getting-started/#install)).

Keep the layout: `bin/xo` looks for the standard library and the
runtime in `../lib/xo`, so a copy of `bin/xo` on its own does not work.
Put `bin` on your `PATH`, or link `bin/xo` from a directory on your
`PATH` (symbolic links are followed). Set `XO_STD` to point at the
standard library when it lives somewhere else, as it does in a
checkout.

### Building it from source

From a checkout of the repository:

```
XO_SEED=/path/to/xo go run ./scripts/xobuild   # builds bin/xo, prints its path
go run ./scripts/xobuild                       # with an earlier build or xo on PATH
go run ./scripts/xobuild --from-source         # with no xo at all (slow)
```

The seed is `XO_SEED`, else the checkout's earlier `bin/xo`, an earlier
build in your cache, or `xo` on your `PATH`; the project also keeps
prebuilt seeds for its own machines, which are private, not public
downloads. With no seed found, `xobuild` stops with an error.
`--from-source` is the way in with no `xo`: it needs Go 1.26 or later
and git once, builds the `go-compiler-final` tag, follows a recorded
chain of intermediate versions, then builds the checkout (25 to 37
minutes on a 16 vCPU machine when last measured, on 2026-10-13). `bin/xo` finds the standard library at
`../std`. On an arm64 host `xo` is built with the arm64 backend; on an
x86-64 host with the LLVM backend (clang needed). After that, any Xo
`xo` rebuilds itself without Go (`scripts/bootstrap-xo.sh`; see
[the bootstrap post](/blog/bootstrap/) for how that is checked).
[Getting started](/docs/getting-started/) walks through a first program.

## Backends and targets

`--backend` picks how a program is built; with none, `xo build`, `xo
run`, and `xo test` build natively (decision 0248): the arm64 backend on
arm64 hosts, the LLVM backend elsewhere. Each backend needs different
tools on the machine.

| Backend | Flag | Builds for | Needs |
|---|---|---|---|
| arm64 (default on arm64 hosts) | none, or `--backend=arm64` | darwin/arm64 and linux/arm64 | nothing: Xo's own assembler and linkers |
| LLVM (default elsewhere) | none, or `--backend=llvm` | the host, including x86-64 Linux and Intel Macs | clang |
| Go | `--backend=go` | every target in `--targets`: linux, darwin, windows (amd64 and arm64), and wasip1/wasm | the `go` command, Go 1.24 or newer (or `XO_GO` naming it) |
| WebAssembly (experimental) | `--backend=wasm` | WASI preview 1 | nothing else; the module runs under any WASI runtime |

- Native builds manage memory by reference counting, with no tracing
  garbage collector; a construct a native build does not support yet is
  error `XO1201` at compile time (`xo check --no-gc` reports them
  without building). The Go backend uses Go's garbage collector.
- On a Mac, a native build links with Xo's own Mach-O linker and writes
  a `.dSYM` with the line tables beside the binary; `--ld=cc` uses the
  system linker instead.
- `--targets=linux/arm64` builds a static Linux binary from any host,
  the Mac included, linked by Xo's own ELF linker with no C library
  (decision 0243). A Linux program with no `use c` links no C library;
  `XO_NOLIBC=0` links glibc through `cc` instead.
- `--targets=all` needs `--backend=go`: it builds linux/amd64,
  linux/arm64, darwin/amd64, darwin/arm64, windows/amd64,
  windows/arm64, and wasip1/wasm, one binary per target.
- Windows (x86-64) and Intel Macs build natively through the LLVM
  backend; this work is in progress and tested on a smaller scale than
  the arm64 hosts.
- `use c` works only on the native backends. `use go` needs
  `--backend=go`: without it, such a program is a usage error naming the
  Go package.
- The flags only the Go backend has (`--hybrid`, `--holes`, `xo test
  --explore`, `xo run --seed` and `--record`) choose it when no backend is
  given, and `--race` chooses the LLVM backend (ThreadSanitizer).
- A program that names time zones embeds them from the IANA database
  that ships with the standard library (no Go needed); with
  `--tzdata=system` it reads the system's zone files at run time
  instead.

## Commands

`xo help` lists every command, and `xo help <command>` or
`-h`/`--help` prints a command's usage. Every command that reports
diagnostics or results accepts `--json`, and `xo query` answers in JSON
by default when its output is not a terminal. The examples run in a
module directory.

A directory argument covers every directory below it, skipping
`testdata`, `vendor/`, and names starting with `.` or `_`. So
`xo check .` checks every module under the current directory, and the
Go-style pattern `./...` (or `cmd/...`) means the same thing:
`xo check ./...`, `xo test ./...`. A pattern that matches no `.xo`
files is an error, and `xo run` takes one directory, not a pattern.

### Build, run, and test

| Command | What it does | Example |
|---|---|---|
| `xo build` | Build binaries | `xo build -o hello .` |
| `xo run` | Build for the host and run; arguments after `--` go to the program | `xo run . -- --port 8080` |
| `xo test` | Run the test blocks, property tests, and contract fuzzing, with deterministic scheduling | `xo test --cases=500 .` |

Useful flags of all three: `--backend`, `--no-gc`, `-o`, `--json`,
`--tzdata=embedded|system`, `--race` (ThreadSanitizer, on the LLVM
backend). `xo build` and `xo run` take `--stamp NAME=VALUE` (sets a
string constant for this build). `xo build` also takes `--targets`,
`--ld`, `--ci` (fail on unformatted code or a leftover `dbg`),
`--release`, `-s` (no debug information or local symbols), and
`--debug-info` (line tables in a release build too). `xo test` takes
`--seed=N`, `--explore=N`, `--cases=N`, `--run=NAME`, `-v`, and `--real`
(tests that declare effects run with real capabilities). `xo run` and
`xo test` take `--profile` and `--trace` (below).

Contract fuzzing runs on every backend (decision 0250); a contract whose
generated native test does not check yet is skipped and counted per
module (`MODULE: contract fuzzing needs --backend=go: N contracts not
fuzzed`, the reason under `-v`).

### Profiles, traces, and tracebacks

These are the native runtime's, so they work on the arm64 and LLVM
backends (the default); a Go backend program uses Go's own tools.

| What | How | Output |
|---|---|---|
| CPU profile | `xo run --profile=cpu .`, or `XO_PROF=cpu` on any native binary | `xo-cpu.pprof` (`go tool pprof` reads it) and `xo-cpu.txt`, a text summary with the top functions and their lines |
| Heap profile | `--profile=heap` or `XO_PROF=heap` (`cpu,heap` for both) | `xo-heap.pprof` and `xo-heap.txt` |
| Execution trace | `xo run --trace=t.raw .`, or `XO_TRACE=t.raw`, then `xo trace t.raw` | `t.raw.json` for [ui.perfetto.dev](https://ui.perfetto.dev) (each worker's task runs, the wakes between them) and a summary: time parked by reason, runnable latency, the top wakers |
| Traceback | `XO_TRACEBACK=1` | an uncaught fault prints the frames, with source lines, down to `main` |
| Data races | `xo run --race .` (also `xo build`, `xo test`) | ThreadSanitizer reports, with the call stack |
| A running server's profile | `xo prof URL`, the server serving `std/debug`'s routes (`/debug/profile?seconds=N`, `/debug/heap`) | the same summary as for a profile file |

`xo test --profile` and `xo test --trace` write one file per test
process. A file that exists is never overwritten. `xo build --release`
leaves the profiler and the trace recorder out unless `--profile-support`
or `--trace-support`. Native binaries carry DWARF line tables, so
`lldb` and other debuggers show `.xo` lines.

### Check and edit

| Command | What it does | Example |
|---|---|---|
| `xo check` | Parse and type check, no code generation | `xo check --fix .` |
| `xo fmt` | Format to the one canonical layout | `xo fmt --check .` |
| `xo fix` | Apply every machine fix until none applies | `xo fix --dry-run .` |
| `xo vet` | Advisory checks that never fail the build | `xo vet .` |
| `xo vet --cost` | Builds the program and notes costs the source does not show (XO0907 to XO0911: a copied map, an element counted up and down each iteration, a large copy in a loop, a view that keeps a large input alive) | `xo vet --cost .` |
| `xo query` | Semantic queries: `type`, `def`, `callers`, `effects`, `holes`, `api`, `imports`, `deps`, `hash` | `xo query callers greet` |
| `xo edit` | Semantic edits: `rename`, `add-field`, `change-sig`, rechecked before writing | `xo edit rename --dry-run greet salute` |
| `xo doc` | Documentation from doc comments | `xo doc .` |
| `xo explain` | The long explanation of a diagnostic code | `xo explain XO0201` |

`xo check --fix` is the agent loop's check: it applies every
unambiguous fix, reformats what it changed, and reports what remains.

### Modules and dependencies

| Command | What it does | Example |
|---|---|---|
| `xo init` | Start a module | `xo init example.com/hello` |
| `xo get` | Require a module version, printing its API and effect changes | `xo get github.com/acme/billing@v1.4.1` |
| `xo mod tidy` | Tidy `xo.mod` and `xo.lock` | `xo mod tidy` |
| `xo mod accept-effects` | Record a dependency's wider effects in `xo.lock` | `xo mod accept-effects github.com/acme/billing` |
| `xo vendor` | Copy dependencies into `vendor/` | `xo vendor` |
| `xo audit` | Supply chain report: each dependency's effects, escape hatches, and the capabilities you pass it | `xo audit .` |
| `xo publish` | Check a release of your module against its previous tag | `xo publish --check` |

`xo mod clean` empties the module cache, and `xo mod proxy serve`
serves it as a module proxy. Every module command takes `--offline`.
See [Dependencies and capabilities](/docs/dependencies/) for effect
ceilings and vouches.

### Bindings

| Command | What it does | Example |
|---|---|---|
| `xo bind` | Generate bindings of Go packages for `use go` (runs `xo-gobind`) | `xo bind github.com/google/uuid` |
| `xo bind --c` | Generate bindings of C headers for `use c` | `xo bind --c --link z zlib.h` |

You rarely need to run these yourself: `xo check` and the builds bind a
missing package or header on first use.

### Servers and debugging

| Command | What it does | Example |
|---|---|---|
| `xo lsp` | Language Server Protocol server over stdio, for editors | configure your editor to run `xo lsp` |
| `xo mcp` | Model Context Protocol server over stdio, for agents: check, query, edit, explain, fmt, test, build | configure your agent to run `xo mcp` |
| `xo serve` | A resident checker on a Unix socket; `xo check` and `xo query` use it when it answers | `xo serve` |
| `xo dump` | The task tree of a running program (Go backend builds) | `xo dump 4121` |
| `xo trace` | The JSON and summary of an execution trace | `xo trace t.raw` |
| `xo replay` | Replay a run recorded with `xo run --record=trace.xotrace` (Go backend), or a crash bundle (`.xocrash`) | `xo replay trace.xotrace` |
| `xo version` | The toolchain version and host | `xo version` |

## Environment variables

| Variable | What it does |
|---|---|
| `XO_STD` | Where the standard library is, when `xo` is not in the toolchain layout |
| `XO_SEED` | The `xo` that `go run ./scripts/xobuild` builds the next one with |
| `XO_GO` | The `go` command the Go backend uses, when it is not `go` on the `PATH` |
| `XO_ZONEINFO` | Another time zone database (a `zoneinfo.zip`) instead of the one in the standard library |
| `XO_NOLIBC=0` | Link a Linux native program with the C library (the default for one with no `use c` is none) |
| `XO_PROF` | `cpu`, `heap`, or `cpu,heap`: profile a native program (`XO_PROF_HZ`, `XO_PROF_OUT`) |
| `XO_TRACE` | A file to record a native program's execution trace into |
| `XO_TRACEBACK` | `1`: an uncaught fault prints its frames |
| `XO_THREADS` | How many worker threads a native program's scheduler uses |

## Coming later

Developer harnesses written in Xo, under an `xo dev` command, are
planned (decision 0209) but do not exist yet.
