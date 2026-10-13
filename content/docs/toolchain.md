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
(the self-hosted compiler, built from `selfhost/xo` in the repository;
you may see it called xo1 in the project's notes). The original
implementation, written in Go, is frozen and serves as the seed that
builds the first Xo compiler on a machine.

### The layout

An installed toolchain is a directory, and `xo` finds the rest of the
toolchain relative to itself:

```
bin/xo          the toolchain
bin/xo-gobind   a helper that binds Go packages for use go
lib/xo/         std, third_party, the prebuilt native runtime, zoneinfo.zip
```

Keep the layout: `bin/xo` looks for the standard library and the
runtime in `../lib/xo`, so a copy of `bin/xo` on its own does not work.
Put `bin` on your `PATH`, or link `bin/xo` from a directory on your
`PATH` (symbolic links are followed). Set `XO_STD` to point at the
standard library when it lives somewhere else, as it does in a
checkout.

### Building it from source

From a checkout of the repository, the Go seed (Go 1.26 or later)
builds the first Xo `xo`. On an arm64 host (Apple silicon, arm64
Linux):

```
go build -o .tools/bin/xo-seed ./cmd/xo
XO_SELF_DRIVER=0 .tools/bin/xo-seed build --backend=arm64 -o .tools/bin/xo selfhost/xo
export XO_STD="$PWD/std"
```

On an x86-64 host, with clang installed:

```
go build -o .tools/bin/xo-seed ./cmd/xo
XO_SELF_DRIVER=0 XO_LLVM_SPLIT=12 XO_LLVM_LTO=none \
  .tools/bin/xo-seed build --backend=llvm -o .tools/bin/xo selfhost/xo
export XO_STD="$PWD/std"
```

The arm64 build takes a few minutes; the x86-64 build took about 36
minutes and 10 GB of memory on a 16 vCPU Linux machine. After that,
any Xo `xo` rebuilds itself without Go (`scripts/bootstrap-xo.sh`; see
[the bootstrap post](/blog/bootstrap/) for how that is checked).
[Getting started](/docs/getting-started/) walks through a first program.

## Backends and targets

`--backend` picks how a program is built. Each backend needs different
tools on the machine.

| Backend | Flag | Builds for | Needs |
|---|---|---|---|
| Go (default) | `--backend=go` or none | every target in `--targets`: linux, darwin, windows (amd64 and arm64), and wasip1/wasm | the `go` command, Go 1.24 or newer (or `XO_GO` naming it) |
| LLVM | `--backend=llvm` | the host, including x86-64 Linux and Intel Macs | clang |
| arm64 | `--backend=arm64` | darwin/arm64 and linux/arm64 | a C compiler driver (`cc`), or none with `--ld=macho` and a prebuilt runtime |
| WebAssembly (experimental) | `--backend=wasm` | WASI preview 1 | nothing else; the module runs under any WASI runtime |

- `--no-gc` builds on a native backend whose memory is reference
  counted instead of collected: arm64 on arm64 hosts, LLVM otherwise.
  `--backend=llvm` and `--backend=arm64` already imply it. A construct
  a native build does not support yet is error `XO1201` at compile
  time.
- `--targets=all` (Go backend) builds linux/amd64, linux/arm64,
  darwin/amd64, darwin/arm64, windows/amd64, windows/arm64, and
  wasip1/wasm, one binary per target.
- `--ld=macho` links an arm64 program with Xo's own assembler and
  linker, with no `cc`. It needs the prebuilt runtime in `lib/xo` of a
  packaged toolchain (or `XO_RTPACK`). On a Mac it is the default when
  that runtime is present. `--ld=cc` uses the system linker.
- Windows (x86-64) and Intel Macs build natively through the LLVM
  backend; this work is in progress and tested on a smaller scale than
  the arm64 hosts.
- Linux programs with no C library at all are an opt-in experiment
  (`XO_NOLIBC=1` with a native backend), in progress: they refuse
  `use c` and TLS for now.
- `use c` works only on the native backends, and `use go` only on the
  Go backend.
- A program that names time zones reads them from Go's
  `zoneinfo.zip`, `lib/xo/zoneinfo.zip`, `XO_ZONEINFO`, or with
  `--tzdata=system`, from the system's zone files.

## Commands

Every command that reports diagnostics or results accepts `--json`,
and `xo query` answers in JSON by default when its output is not a
terminal. The examples run in a module directory.

### Build, run, and test

| Command | What it does | Example |
|---|---|---|
| `xo build` | Build binaries | `xo build --targets=all -o out .` |
| `xo run` | Build for the host and run; arguments after `--` go to the program | `xo run --backend=arm64 . -- --port 8080` |
| `xo test` | Run the test blocks, property tests, and contract fuzzing, with deterministic scheduling | `xo test --explore=100 .` |

Useful flags of all three: `--backend`, `--no-gc`, `-o`, `--json`,
`--tzdata=embedded|system`. `xo build` and `xo run` take
`--stamp NAME=VALUE` (sets a string constant for this build).
`xo build` also takes `--targets`, `--ld`,
`--ci` (fail on unformatted code or a leftover `dbg`), and `--release`.
`xo test` takes `--seed=N`, `--explore=N`, `--cases=N`, `--run=NAME`,
`-v`, and `--real` (tests that declare effects run with real
capabilities).

### Check and edit

| Command | What it does | Example |
|---|---|---|
| `xo check` | Parse and type check, no code generation | `xo check --fix .` |
| `xo fmt` | Format to the one canonical layout | `xo fmt --check .` |
| `xo fix` | Apply every machine fix until none applies | `xo fix --dry-run .` |
| `xo vet` | Advisory checks that never fail the build | `xo vet .` |
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
| `xo dump` | The task tree of a running program | `xo dump 4121` |
| `xo replay` | Replay a run recorded with `xo run --record=trace.xotrace` (Go backend), or a crash bundle (`.xocrash`) | `xo replay trace.xotrace` |
| `xo version` | The toolchain version and host | `xo version` |

## Environment variables

| Variable | What it does |
|---|---|
| `XO_STD` | Where the standard library is, when `xo` is not in the toolchain layout (a checkout: `$PWD/std`) |
| `XO_GO` | The `go` command the Go backend uses, when it is not `go` on the `PATH` |
| `XO_ZONEINFO` | A `zoneinfo.zip` for programs that name time zones |
| `XO_RTPACK` | A directory of prebuilt native runtimes, instead of `lib/xo/rtpack` |
| `XO_NOLIBC=1` | Linux native builds with no C library (opt-in, in progress) |

Two more apply only to the Go seed when it builds the first Xo `xo`:
`XO_SELF_DRIVER=0` makes the seed do the build itself (as in the
commands above), and `XO1` points it at an Xo compiler you already
built.

## Coming later

Developer harnesses written in Xo, under an `xo dev` command, are
planned (decision 0209) but do not exist yet.
