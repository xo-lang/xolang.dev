---
title: "Xo and Go"
linkTitle: "Xo and Go"
description: "How Xo and Go relate, where Go is the better choice today, where Xo is, and measured numbers with their sources."
weight: 6
toc: true
---

Xo and Go share most of their design: few keywords, one formatter, static
binaries, fast builds, and structured, readable code. Xo differs where Go
lets a bug compile: errors are `Result` values you must handle, optionals
replace nil, sum types have exhaustive `match`, values are not shared
pointers, concurrency is structured, and side effects are in signatures.
Go is mature and production proven; Xo is experimental. In the 0.55.0
linux/arm64 measurements Xo took less time than Go on 6 of the 20 runtime
workloads and more on 2 (sieve and n-body); the other 12 ran under 100 ms,
too short for a wall time verdict ([below](#benchmarks)).

The first page of a comparison series (also [Xo and Rust](../xo-and-rust/),
[Xo and TypeScript](../xo-and-typescript/), and [Xo and Python](../xo-and-python/)). It is not a "which is better"
page: Xo started as a language compiled through Go, it keeps much of Go's
design, and Go is the more mature tool for most work today. This page
says how the two relate, where each one is the better choice, and what
the measurements show, including the rows where Xo is slower.

**Versions.** Claims about Go are checked against Go's own documentation
as of Go 1.27.4 (the newest release, 2026-11-10). The measurements
below were taken against **Go 1.26.11**, the Go installed on the
measuring machines; the comparison has not moved to 1.27 yet.
Xo figures are from xo 0.55.0 unless a row says otherwise.
Last verified: 2026-11-22.

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
  formatter, static binaries, and strong standard library (which of Go's
  176 packages Xo covers, with a maturity level per module:
  [Standard library coverage](../std-coverage/)).

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

The Mac Studio (Apple M5 Ultra, 30 cores, 96 GB, darwin/arm64), both tools
with their default caches; cold empties every cache of each, and warm is
the third unchanged build:

| | Go 1.26.11 | xo 0.55.0 |
|---|---|---|
| Cold build of a small program | 1.34 to 1.40 s | 1.03 to 1.95 s (llvm-nbody 13.11 s; 1.09 s with the run cache off) |
| Second build, nothing changed | 0.04 to 0.05 s | 0.05 to 0.08 s |
| Warm build, nothing changed | 0.04 s | 0.01 to 0.03 s |
| Build after a one-function edit | 0.10 to 0.12 s | 0.05 to 0.08 s |
| Peak build memory (cold) | 341 to 355 MB | 331 to 362 MB |
| Peak build memory (warm / edit) | 29 to 30 MB / 69 to 72 MB | 9 to 10 MB / 53 to 64 MB |
| Binary size (same programs, default builds) | 2.39 to 2.43 MB | 1.63 to 1.82 MB |
| Binary size, CRUD server, shipping flags (xo 0.55.0 and Go 1.26.11 on the linux/arm64 timing host, 2026-11-22) | 5.50 MB (`go build -trimpath -ldflags="-s -w"`; 7.95 MB without the flags) | 3.02 MB (`xo build --release`; 9.27 MB without the flag) |

Source: [release-vs-go-v0.55.0.md, lines 1 to 45](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0.md#L1-L45). The shipping-flags row: [twins-build-2026-11-22.md, lines 38 to 41](https://github.com/xo-lang/xo/blob/main/bench/results/twins-build-2026-11-22.md#L38-L41).
**Xo rebuilds a small program after an edit faster than Go**, and its
cold builds take about as long (since 0.34 an edit compiles only your own
code against a prebuilt standard library, and since 0.35 it links only
your code too). **Go's second unchanged build is faster**: xo writes its
parts pack on the second build and reads it from the third, where xo is
faster. Xo's warm and edit builds peak lower than Go's.

On linux/arm64 (host 1, 12 cores, 39 GB) xo's cold builds took 1.22 to
1.40 s against Go's 1.34 to 1.38 s and its edits 0.06 to 0.10 s against
0.07 to 0.08 s; there **xo's cold builds peaked higher** (392 to 432 MB
against 290 to 313 MB) and **its binaries were larger** (2.51 to 2.64 MB
against 2.30 to 2.31 MB)
([release-vs-go-v0.55.0-linux-arm64.md, lines 1 to 47](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md#L1-L47)).

A large program, a client of Azure's armcompute (Xo's port against Go's
armcompute v9.0.0, on the Mac): with std's variants already built, xo's
cold build took 816 ms and peaked at 481 MB against Go's 4,766 to 5,578
ms and 893 to 920 MB, an edit 235 ms against 331 to 352 ms, and the
binary is 7.99 MB against 9.30 MB; the first program after a fresh
install builds cold in 2,709 ms
([release-vs-go-v0.55.0.md, lines 113 to 133](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0.md#L113-L133)).

In the 0.55.0 comparison on the Mac, `xo test --std-module` took 0.655 of
`go test -count=1`'s time on encoding/base64 cold and 0.506 after an
edit, and 0.40 and 0.347 on encoding/json cold and after an edit, with
1.22 to 1.66 times Go's peak memory
([release-vs-go-v0.55.0.md, lines 278 to 346](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0.md#L278-L346)); on
linux/arm64 the same four took 0.814, 0.605, 0.447 and 0.341 of Go's
time, with 1.47 to 2.15 times its peak memory
([release-vs-go-v0.55.0-linux-arm64.md, lines 424 to 501](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md#L424-L501)).
These runs started at load 5.

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
- **Memory while running**: on the twenty workloads of the 0.55.0
  linux/arm64 comparison, Xo's peak memory was 0.083 to 0.77 of Go's on
  nineteen, and within noise of it on strings (0.994)
  ([release-vs-go-v0.55.0-linux-arm64-run.md, lines 29 to 333](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-run.md#L29-L333)).
  The HTTP server's /alloc page peaked at 4,388 KB against tuned Go's
  1,012,888 KB
  ([release-vs-go-v0.55.0-linux-arm64-http.md, lines 1 to 69](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-http.md#L1-L69)).
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
- In a study of 2026-10-08 (Xo before its first tag, v0.7.0, at spec
  core draft 0.5) with two independent authors who each planted 30 safety
  bugs, Xo caught 23 to 29 (25 to 29 with warnings), against 13 for Go
  with strict analyzers and 9 for plain Go. Agents passed their own tests on the
  first try about as often in both, and Xo programs were about half the
  size; but Go needed no spec in the agent's context, while Xo needed
  about 30k tokens of it per session
  ([three-arm-2026-10-08.md, lines 34 to 47](https://github.com/xo-lang/xo/blob/main/bench/results/three-arm-2026-10-08.md#L34-L47)).

## Benchmarks

**Method.** The 0.55.0 comparison builds the same programs twice, once
in Go and once in Xo (bench/perf's Go twins: compute, collections,
concurrency), and runs each workload under `xo bench --ab` with Go as A
and Xo as B, 3 rounds (run as 4, so each side goes first equally often);
a verdict is "better" or "worse" only when the 95% interval excludes 1.0.
Each pair runs its work REPEAT times on both sides (the count is in each
row's heading in the file), so the faster side takes about a second and
every row gets a wall time verdict. **Machine**: host 1, Linux aarch64,
12 cores, 39 GB, load 0 to 3 at the start of each row. **Versions**: xo
0.55.0 and Go 1.26.11. **Date**: 2026-11-22. Ratios are Xo over Go;
under 1.0 means Xo took less
([release-vs-go-v0.55.0-linux-arm64-run.md, lines 1 to 333](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-run.md#L1-L333)).

| workload | wall time, Xo / Go | verdict |
|---|---|---|
| collections: branch | 0.001 | better |
| collections: iter | 0.076 | better |
| strings | 0.261 | better |
| concurrency: spawn | 0.298 | better |
| interpreter | 0.303 | better |
| concurrency: mutex | 0.319 | better |
| collections: copymut, putget, get, update | 0.428 to 0.5 | better |
| concurrency: fanout | 0.467 | better |
| collections: push | 0.598 | better |
| sort | 0.758 | better |
| fib | 0.885 | better |
| concurrency: ping-pong | 0.929 | better |
| collatz | 0.995 | better |
| n-body (floating point) | **1.007** | worse |
| concurrency: parallel map | **1.023** | worse |
| sieve | **1.35** | worse |
| concurrency: rwmutex | **7.913** | worse |

Each row's raw output, with CPU time, peak memory, spreads and intervals,
is in the same file. Four rows are slower than Go: n-body, the parallel
map and sieve by 1 to 35%, and rwmutex by about 8 times: 64 tasks
contending on one reader-writer lock, a gap the earlier short run (5 ms
a side) could not judge.

**Standard library, wall time** (lower is better; linux/arm64 timing
host, xo 0.55.0 against Go 1.26.11, 2026-11-21; native Xo against Go's
packages; median of 5 runs a side):

| Workload | Xo / Go | Source |
|---|---|---|
| JSON decode (1,000 small user records) | 0.297 | [survey, line 328](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L328) |
| JSON encode (1,000 small user records) | 0.544 | [survey, line 329](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L329) |
| multipart parse | 0.464 | [survey, line 388](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L388) |
| regexp match | **1.065** | [survey, line 454](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L454) |
| regexp find_all | 0.796 | [survey, line 453](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L453) |
| time format | 0.875 | [survey, line 553](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L553) |
| time parse | 0.576 | [survey, line 556](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L556) |
| time civil fields | 0.355 | [survey, line 551](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L551) |
| csv parse | 0.794 | [survey, line 194](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L194) |
| WebSocket echo, 64 B text, 20,000 round trips (gorilla/websocket) | 0.937 | [survey, line 623](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L623) |
| WebSocket echo, 16 KB binary, 5,000 round trips | 0.368 | [survey, line 620](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L620) |
| WebSocket handshakes, 500 | 0.701 | [survey, line 621](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-21.txt#L621) |

**Network** (native Xo against Go's net/http and crypto/tls, xo 0.55.0
against go1.26.11 on the linux/arm64 timing host, 2026-11-22; Xo's rate
over Go's, higher is better for Xo). Reps are interleaved (Go, Xo, Go,
Xo) so a load burst hits both alike; the table gives the median of 5
reps, and the file gives every rep
([net-vs-go-2026-11-22-linux-arm64.md, lines 9 to 19](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-11-22-linux-arm64.md#L9-L19)).
An HTTP server pair on host 1 (scripts/release-vs-go.sh's http section,
xo 0.55.0, 2026-11-21, 12 rounds a row) compares Go at its defaults
(GOGC=100) and Go tuned with `GOGC=off GOMEMLIMIT=1GiB`; Go's /alloc is
json.Marshal written by hand, as Xo's derive encodes. Xo's /alloc (a
JSON page) served 6.107 times default Go's requests a second at 32
connections and 1.305 times tuned Go's, at 4,388 KB of peak memory
against tuned Go's 1,012,888 KB; at 256 connections 3.263 and 1.339
times. /hello served 1.331 and 1.188 times at 32 connections, 1.842 and
1.243 at 256. At a fixed 20,000 requests a second, Xo's /alloc p99 was
140 us against Go's 779 and tuned Go's 157, at 0.436 and 0.923 of their
CPU per request
([release-vs-go-v0.55.0-linux-arm64-http.md, lines 1 to 69](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-http.md#L1-L69)).

| workload | Xo / Go (median) | reps | source |
|---|---|---|---|
| HTTP/2, 100 streams | 1.508 | 5 | [line 26](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-11-22-linux-arm64.md#L26) |
| HTTP/2, 1 stream | 1.221 | 5 | [line 25](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-11-22-linux-arm64.md#L25) |
| HTTP/2, 256 MiB download | 1.305 | 5 | [line 27](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-11-22-linux-arm64.md#L27) |
| TLS 1.3 handshakes (x25519, P-256, resumed) | 1.344 to 1.417 | 5 | [lines 28 to 30](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-11-22-linux-arm64.md#L28-L30) |
| TLS 1.3 bulk, AES-128-GCM | 0.993 | 5 | [line 31](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-11-22-linux-arm64.md#L31) |
| TLS 1.2 bulk, ChaCha20-Poly1305 | **0.944** | 5 | [line 32](https://github.com/xo-lang/xo/blob/main/bench/results/net-vs-go-2026-11-22-linux-arm64.md#L32) |

TLS 1.3 AES-GCM bulk is even with Go (0.97 to 1.01 per rep); TLS 1.2
ChaCha20-Poly1305 bulk is the one gap, every rep 0.94 to 0.96.

These are a young compiler's numbers on one machine; the slower rows
are the work queue. Every release reruns the comparison
(`bench/results/release-vs-go-vX.Y.Z.md`) and this page's tables are
refreshed from it.
