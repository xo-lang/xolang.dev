---
title: "Xo and Go"
linkTitle: "Xo and Go"
description: "How Xo and Go relate, where Go is the better choice today, where Xo is, and measured numbers with their sources."
weight: 6
toc: true
---

The first page of a comparison series. It is not a "which is better"
page: Xo started as a language compiled through Go, it keeps much of Go's
design, and Go is the more mature tool for most work today. This page
says how the two relate, where each one is the better choice, and what
the measurements show, including the rows where Xo is slower.

**Versions.** Claims about Go are checked against Go's own documentation
as of Go 1.27.3 (the newest release, 2026-10-19). The measurements
below were taken against **Go 1.26.1**, the Go installed on the
measuring machine; they will be rerun against 1.27 at the next release.
Xo figures are from xo 0.27.0 unless a row says otherwise.
Last verified: 2026-10-23.

## Short version

**Choose Go** when you need a stable, widely known language with a
compatibility promise in force today, a large ecosystem, many targets,
fast incremental builds, mature debugger and profiler support on every
platform, or a team that already knows it. Go is production proven at
very large scale; Xo is experimental (spec draft 0.10, no 1.0 yet).

**Consider Xo** when you want the compiler to reject more mistakes
before a program runs (unhandled errors, nil, missing match cases, data
races, undeclared side effects), when you want a dependency's
capabilities limited and recorded, and when much of the code is written
by AI agents that work from structured compiler feedback. Xo can still
use any Go package through its Go backend.

## What each is for

- **Go**: "a language for writing server programs that would be easy to
  maintain over time", with a goal of "removing obstacles to working on
  large code bases" ([Go FAQ](https://go.dev/doc/faq)).
- **Xo**: backends, tools, and web services, designed so AI agents can
  write, check, cross compile, and debug programs with fast, structured
  feedback ([Why Xo?](../faq/)). It keeps Go's small keyword set, single
  formatter, static binaries, and strong standard library.

## The language

| | Go | Xo |
|---|---|---|
| Absent values | `nil` is the zero value of pointers, slices, maps, channels, functions, and interfaces; assigning to a `nil` map panics ([spec](https://go.dev/ref/spec)) | No `nil`; `T?` is `Option[T]`, and the compiler makes you handle `None` ([core 2.5](../spec/core/)) |
| Errors | Multiple results with an `error` value; ignoring it compiles. The Go team stopped pursuing new error syntax in 2025 ([blog](https://go.dev/blog/error-syntax)) | `T ! E` (`Result`); an unhandled `Result` does not compile; `?` propagates and records an error trace ([core 2.6, 11.1](../spec/core/)) |
| Sum types | None: "they overlap in confusing ways with interfaces" ([FAQ](https://go.dev/doc/faq)) | Enums with payloads and exhaustive `match`, with guards ([core 2, 3](../spec/core/)) |
| Generics | Type parameters since Go 1.18 ([release notes](https://go.dev/doc/go1.18)) | Generics with constraints ([core 2.7](../spec/core/)) |
| Values | Pointers and shared mutable slices and maps | Value semantics with copy-on-write; mutation is visible in signatures (`var` parameters) ([core 5](../spec/core/)) |
| Concurrency | Goroutines and channels; cancellation through `context.Context` | Structured concurrency: tasks live inside a `scope`, cancellation flows down without a `ctx` parameter, channels and `select` ([core 7](../spec/core/)) |
| Side effects | Not in signatures | Effects in signatures (`uses (net, fs)`), capability values passed from `main`, and fakes for tests ([core 6](../spec/core/)) |

## Memory

- **Go** uses a concurrent, non-moving, tracing mark-sweep garbage
  collector, tuned by `GOGC` and the soft limit `GOMEMLIMIT`
  ([GC guide](https://go.dev/doc/gc-guide)). Cycles are collected.
- **Xo** native builds (the default) use reference counting: a value is
  freed when its last reference goes, with no collector pauses. Value
  semantics leave no cycles to collect. HTTP handlers get request
  scoped arenas by default. `--backend=go` uses Go's collector instead
  ([FAQ](../faq/), [core 10](../spec/core/)).
- Reference counting has a cost Go does not pay: counts go up and down
  as values move. `xo vet --cost` points at the loops where that, or a
  copy-on-write copy, is expensive.

## Safety and security

| | Go | Xo |
|---|---|---|
| Memory safety | Safe without data races. With them, Go's memory model says races on interfaces, maps, slices, and strings "can in turn lead to arbitrary memory corruption" ([memory model](https://go.dev/ref/mem)) | Values never alias mutably, so data races are impossible except through `Mutex` and `Atomic`, which are synchronized ([core 5](../spec/core/)) |
| Finding races | `-race` (ThreadSanitizer) finds races that happen at run time, at "5-10x" memory and "2-20x" time for a typical program ([race detector](https://go.dev/doc/articles/race_detector)) | Prevented by the type system; `xo build --race` (ThreadSanitizer) is there too ([decision 0273](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0273-native-race-prebuilt-tsan.md)) |
| Integer overflow | Wraps; "Overflow does not cause a run-time panic" ([spec](https://go.dev/ref/spec)) | Faults: a bug report, not a wrong number ([core 2, 8](../spec/core/)); wrapping is explicit (`wrapping_add`, [std 2](../spec/std/)) |
| Capabilities | Any package can open files, sockets, or processes | Code reaches the file system, network, environment, or processes only through capability values it was given; a module can be held to a ceiling (`uses none`) ([core 6](../spec/core/), [Dependencies](../dependencies/)) |
| Supply chain | `go.sum` hashes each module version, and the checksum database `sum.golang.org` is a transparent log that keeps proxies and moved tags from serving different code ([modules reference](https://go.dev/ref/mod)); `govulncheck` reports known vulnerabilities your code reaches ([docs](https://go.dev/doc/security/vuln/)) | `xo.lock` hashes each module version, a checksum log and proxies ([core 4.2, 4.3](../spec/core/)), plus an **effect lock**: an update that adds an effect (a dependency that starts using the network) fails until accepted, and `xo audit` lists each dependency's effects, escape hatches, and vouches ([Dependencies](../dependencies/)). There is no vulnerability database yet |

## Compiler and toolchain

| | Go 1.26.1 | xo 0.27.0 |
|---|---|---|
| Cold build of a small program | 1.6 to 1.9 s | 1.8 to 2.3 s |
| Warm build, nothing changed | 0.04 s | 0.27 to 0.34 s |
| Build after a one-function edit | 0.11 to 0.14 s | 0.27 to 0.36 s |
| Peak build memory (cold) | 0.30 to 0.33 GB | 0.49 to 0.50 GB |
| Binary size (same programs) | 2.39 to 2.43 MB | 1.85 to 1.94 MB |

Source: [release-vs-go-v0.27.0.md, lines 17 to 24 and 31 to 51](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.27.0.md#L17-L51).
**Go builds faster**, by far on warm builds, and uses less memory to
build. Unchanged warm builds are Xo's largest gap to Go (0.42 to 0.64 s
in 0.26.0, 0.27 to 0.34 s now).

For tests the picture is mixed: on five std modules a cold `xo test`
build took 2.8 to 5.8 s against `go test`'s 2.4 to 8.3 s, with far less
CPU, because Go compiles each imported std package from source while xo
links a prebuilt runtime; warm, Xo was 2 to 7 times slower, and after an
edit 1.7 to 2.2 times slower on the native backend
([test-speed-vs-go-2026-10-21.md, lines 74 to 86](https://github.com/xo-lang/xo/blob/main/bench/results/test-speed-vs-go-2026-10-21.md#L74-L86)).

- **Cross compiling.** Go: set `GOOS` and `GOARCH`; "you are always
  cross-compiling", across 43 valid pairs
  ([install docs](https://go.dev/doc/install/source)). Xo: `xo build
  --targets=all` builds linux/amd64, linux/arm64, darwin/amd64,
  darwin/arm64, windows/amd64, and wasip1/wasm from any host with its own
  backends, no C toolchain; windows/arm64 and every other Go target
  through `--backend=go` ([core 11](../spec/core/)).
- **Debug info.** Go writes compressed DWARF into the binary on every
  platform ([gdb docs](https://go.dev/doc/gdb)), which Delve reads; on
  macOS, Apple's own tools read none of it by default, and on Windows
  there is no PDB. Xo embeds uncompressed DWARF in the executable on
  macOS and Linux, writes a `.dSYM` on request, and writes a PDB on
  Windows that WinDbg and Visual Studio read. The details, with every
  tool's output: [Where macOS keeps a program's debug info](/blog/macos-debug-info/).
- **Tests and fuzzing.** Go has `go test` and, since 1.18, native
  fuzzing on amd64 and arm64
  ([fuzzing docs](https://go.dev/doc/security/fuzz/)). Xo has `test`
  blocks, property tests, deterministic concurrency tests (`xo test
  --explore=N` runs N schedules), and contract fuzzing: `xo test` fuzzes
  every function with `requires`/`ensures` contracts, and a shrunk
  failure becomes a permanent test ([core 9](../spec/core/)). Contract
  fuzzing runs on the Go backend only today.
- **Formatting.** Both have one formatter (`gofmt`, `xo fmt`); `xo
  build --ci` fails on an unformatted file or a leftover `dbg(...)`.

## Deployment and runtime

- Both produce static binaries.
- **Memory while running**: on the twenty workloads of the 0.27.0
  comparison, Xo's peak memory was 0.38 to 0.99 of Go's
  ([release-vs-go-v0.27.0.md, line 16](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.27.0.md#L16)).
  A CRUD server under 1,024 connections peaked at 47 to 60 MB against
  Go's 66 to 78 MB
  ([net-vs-go-2026-10-22.md, line 33](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-22.md#L33)).
- **Startup**: not measured as a comparison yet; it is on the list for
  the next release's run.
- **Platforms**: Go runs on many more operating systems and
  architectures. Xo's native backends cover darwin, linux, and windows
  on arm64 and x86-64, plus WASI.

## Writing it with AI agents

Go is the better known language: models have seen far more Go than Xo,
and Go's tooling (`gopls`, `go vet`, `staticcheck`) is mature. Xo is
designed for the agent's loop:

- `xo check --json` reports every problem with a stable `XOnnnn` code
  and machine-applicable fixes; codes never change meaning
  ([diagnostics](../diagnostics/)).
- Habits from other languages (`nil`, `?:`, `x as T`, `**`, Python
  comprehensions) get a diagnostic that names the language and the Xo
  form, with a fix.
- `xo def`, `xo refs`, `xo query`, `xo edit`, and `xo mcp` answer
  semantic questions and make edits through resolved symbols.
- In a study with two independent authors who each planted 30 safety
  bugs, Xo prevented or caught 23 to 29, against 13 for Go with strict
  analyzers and 9 for plain Go. Agents passed their own tests on the
  first try about as often in both, and Xo programs were about half the
  size; but Go needed no spec in the agent's context, while Xo needed
  about 30k tokens of it per session
  ([three-arm-2026-10-08.md, lines 34 to 47](https://github.com/xo-lang/xo/blob/main/bench/results/three-arm-2026-10-08.md#L34-L47)).

## Benchmarks

**Method.** The 0.27.0 comparison builds the same programs twice, once
in Go and once in Xo (bench/perf's Go twins: compute, collections,
concurrency), and runs each workload under `xo bench --ab` with Go as A
and Xo as B, 10 interleaved rounds; a verdict is "better" or "worse"
only when the 95% interval excludes 1.0. **Machine**: Apple M4 Pro
(12 cores), 24 GB, macOS 27, darwin/arm64, with other jobs running
(load 4 to 5 at the start of each run). **Versions**: the released xo
0.27.0 archive and Go 1.26.1. **Date**: 2026-10-23. Ratios are Xo over
Go; under 1.0 means Xo took less.
([release-vs-go-v0.27.0.md, lines 1 to 24](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.27.0.md#L1-L24))

| workload | wall time, Xo / Go | verdict |
|---|---|---|
| collections: branch | 0.025 | better |
| collections: iter | 0.27 | better |
| interpreter | 0.42 | better |
| strings | 0.44 | better |
| concurrency: mutex | 0.46 | better |
| collections: putget, update, copymut, get, push | 0.60 to 0.72 | better |
| sort | 0.81 | better |
| fib, collatz, sieve | 0.96 to 0.97 | better |
| concurrency: fanout, ping-pong | 0.89, 1.12 | within noise |
| concurrency: parallel map | **1.07** | worse |
| concurrency: spawn | **1.20** | worse |
| n-body (floating point) | **1.57** | worse |
| concurrency: rwmutex | **3.58** | worse |

Each row's raw output, with spreads and intervals:
[release-vs-go-v0.27.0.md, lines 56 to 317](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.27.0.md#L56-L317).
The rwmutex row is lock bound: one task at a time can make progress.
Go's goroutines stay with the waking P, so the loop runs nearly on one
core, while Xo spreads the 64 tasks over all its workers at once and
they contend; the gap exists only with more than one worker
([rwmutex-vs-go-2026-10-23.md, lines 13 to 16 and 50 to 55](https://github.com/xo-lang/xo/blob/main/bench/results/rwmutex-vs-go-2026-10-23.md#L50-L55)).

**Standard library, instructions retired** (fewer is better; Apple M4
Pro, Go 1.26.1, 2026-10-21; native Xo against Go's packages):

| workload | Xo / Go | source |
|---|---|---|
| JSON decode (small documents) | 0.33 | [json-vs-go, line 45](https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md#L45) |
| JSON encode (small documents) | 0.43 | [json-vs-go, line 46](https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md#L46) |
| multipart parse | **1.15** | [json-vs-go, line 50](https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md#L50) |
| regexp match | **7.55** | [regexp-time-csv-vs-go, line 29](https://github.com/xo-lang/xo/blob/main/bench/results/regexp-time-csv-vs-go-2026-10-21.md#L29) |
| regexp find_all | **2.83** | [regexp-time-csv-vs-go, line 30](https://github.com/xo-lang/xo/blob/main/bench/results/regexp-time-csv-vs-go-2026-10-21.md#L30) |
| time format | **10.06** | [regexp-time-csv-vs-go, line 33](https://github.com/xo-lang/xo/blob/main/bench/results/regexp-time-csv-vs-go-2026-10-21.md#L33) |
| time parse | **10.37** | [regexp-time-csv-vs-go, line 34](https://github.com/xo-lang/xo/blob/main/bench/results/regexp-time-csv-vs-go-2026-10-21.md#L34) |
| time civil fields | 0.41 | [regexp-time-csv-vs-go, line 35](https://github.com/xo-lang/xo/blob/main/bench/results/regexp-time-csv-vs-go-2026-10-21.md#L35) |
| csv parse | **1.67** | [regexp-time-csv-vs-go, line 37](https://github.com/xo-lang/xo/blob/main/bench/results/regexp-time-csv-vs-go-2026-10-21.md#L37) |

**Network** (native Xo against Go's net/http, crypto/tls, and
gorilla/websocket, 2026-10-23; Xo's rate over Go's, higher is better
for Xo). The Mac was not quiet: load 5.0 to 5.7 at the start of each
run, rising to 23 during the CRUD rounds. Reps are interleaved (Xo, Go,
Xo, Go) so a load burst hits both alike; the table gives the median and
the number of reps, and the file gives every rep. TLS, HTTP/2,
WebSocket, and HTTP/1.1 rows run natively on macOS; the CRUD row runs in
linux/arm64 Docker on the same Mac
([net-vs-go-2026-10-23.md, lines 7 to 30](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L7-L30)).

| workload | Xo / Go (median) | reps | source |
|---|---|---|---|
| HTTP/2, 100 streams | 2.1 | 3 | [line 40](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L40) |
| HTTP/2, 1 stream | 1.22 | 3 | [line 39](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L39) |
| HTTP/2, 256 MiB download | 1.35 | 5 | [line 36](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L36) |
| TLS 1.3 bulk, AES-128-GCM | 1.37 | 4 | [line 37](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L37) |
| TLS 1.2 bulk, ChaCha20-Poly1305 | 1.17 | 5 | [line 38](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L38) |
| TLS 1.3 handshakes (x25519, P-256, resumed) | 1.04 to 1.46 | 3 | [lines 41 to 43](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L41-L43) |
| WebSocket echo, 64 B, 1 connection | **0.97** | 5 | [line 54](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L54) |
| WebSocket echo, 64 B, 16 connections | 1.20 | 5 | [line 55](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L55) |
| CRUD server, 1,024 connections (Docker) | 1.06 requests/s; 0.87 of Go's CPU per request | 5 | [lines 66 to 67](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L66-L67) |
| HTTP/1.1 server rows (plain, item, items, echo, router) | 1.08 to 1.43 requests/s; 0.39 to 0.63 of Go's CPU per request | 3 | [lines 81 to 87](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-23.md#L81-L87) |

The single-connection WebSocket row is within the spread of its reps
(0.86 to 1.46). An earlier run on 2026-10-22 under heavier load showed
gaps on the bulk TLS and download rows (0.61 to 0.76,
[net-vs-go-2026-10-22.md](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-10-22.md#L23-L33));
the re-measure with interleaved reps did not reproduce them.

These are a young compiler's numbers on one machine; the slower rows
are the work queue. Every release reruns the comparison
(`bench/results/release-vs-go-vX.Y.Z.md`) and this page's tables are
refreshed from it.
