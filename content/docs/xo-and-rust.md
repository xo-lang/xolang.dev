---
title: "Xo and Rust"
linkTitle: "Xo and Rust"
description: "How Xo and Rust differ, where Rust is the better choice today, where Xo is, and measured numbers with their sources."
weight: 7
toc: true
---

Part of the comparison series that starts with [Xo and Go](../xo-and-go/).
It is not a "which is better" page. Rust and Xo both reject whole classes
of bugs at compile time and both compile to native code without a
garbage collector, but they make different trades: Rust gives the
programmer control over memory and aliasing, Xo takes that control away
in exchange for a smaller language. Rust is also mature and production
proven; Xo is experimental. This page says where each is the better
choice and what the measurements show, including the many rows where
Rust is faster.

**Versions.** Claims about Rust are checked against Rust's own
documentation (the book, the reference, the standard library and Cargo
docs) as of **Rust 1.99.1** (the newest release, 2026-10-15), which is
also the Rust the measurements used. The Xo in the measurements is a
build of main between 0.26.0 and 0.27.0 (it reports itself as 0.26.0);
they will be rerun with the released 0.27.0. Last verified: 2026-10-23.

## Short version

**Choose Rust** when you need the fastest code for compute and
floating point work, the smallest memory footprint, control over
allocation and layout, no runtime at all (embedded, kernels, libraries
called from C), many targets, a large ecosystem (crates.io, tokio,
serde), or a stable language with a long compatibility record. In the
measurements below Rust was faster on most compute rows, on JSON, on
locks, and used a quarter of Xo's memory as a web server.

**Consider Xo** when you want much of the same compile-time safety
(no null, no unhandled errors, exhaustive matches, no data races)
without lifetimes, borrowing rules, or choosing an async runtime; when
you want a dependency's capabilities limited and recorded; when
integer overflow should fault in every build; and when much of the code
is written by AI agents working from structured compiler feedback. As a
web server Xo served more requests per second than axum on tokio in the
measurements below, with lower tail latency, but used more CPU per
request.

## What each is for

- **Rust**: "A language empowering everyone to build reliable and
  efficient software", "with no runtime or garbage collector", whose
  "type system and ownership model guarantee memory-safety and
  thread-safety" ([rust-lang.org](https://www.rust-lang.org/)).
- **Xo**: backends, tools, and web services, designed so AI agents can
  write, check, cross compile, and debug programs with fast, structured
  feedback ([Why Xo?](../faq/)).

## The language

| | Rust | Xo |
|---|---|---|
| Absent values | No null; `Option<T>` | No null; `T?` is `Option[T]`, and the compiler makes you handle `None` ([core 2.5](../spec/core/)) |
| Errors | `Result<T, E>` and `?`. `Result` is `#[must_use]`: ignoring one is a warning by default, not an error ([std::result](https://doc.rust-lang.org/std/result/index.html)) | `T ! E`; an unhandled `Result` does not compile; `?` propagates and records an error trace ([core 2.6, 11.1](../spec/core/)) |
| Sum types | Enums with data and exhaustive `match` | Enums with payloads and exhaustive `match`, with guards ([core 2, 3](../spec/core/)) |
| Generics | Generics with trait bounds, monomorphized | Generics with constraints ([core 2.7](../spec/core/)) |
| Values and aliasing | Ownership and borrowing: one mutable reference or many shared ones, checked by the borrow checker, with lifetimes in signatures where needed | Value semantics with copy-on-write; no references to annotate; mutation is visible in signatures (`var` parameters) ([core 5](../spec/core/)) |
| Concurrency | Threads in std; `async`/`await` in the language, but "Most languages that support async bundle a runtime, but Rust does not" ([the book, 17.1](https://doc.rust-lang.org/book/ch17-01-futures-and-syntax.html)); tokio is the usual choice | Tasks in the language with one built-in scheduler; structured concurrency (`scope`), cancellation without a parameter, channels and `select` ([core 7](../spec/core/)) |
| Side effects | Not in signatures | Effects in signatures (`uses (net, fs)`), capability values passed from `main`, and fakes for tests ([core 6](../spec/core/)) |
| Escape hatch | `unsafe` blocks for raw pointers, FFI and other operations the compiler cannot check | No raw pointers in Xo code; C and Go code through `use c` and `use go`, which `xo audit` lists ([Dependencies](../dependencies/)) |

## Memory

- **Rust** frees memory when its owner goes out of scope, with no
  collector. Shared ownership uses `Rc` or `Arc` (reference counting),
  and "Rust allows memory leaks by using `Rc<T>` and `RefCell<T>`":
  a cycle is never freed ([the book, 15.6](https://doc.rust-lang.org/book/ch15-06-reference-cycles.html)).
- **Xo** native builds use reference counting for every heap value: a
  value is freed when its last reference goes, with no collector pauses.
  Value semantics leave no cycles to leak. HTTP handlers get request
  scoped arenas by default ([FAQ](../faq/), [core 10](../spec/core/)).
- The difference in practice: Rust moves and borrows without touching a
  count, so most Rust code pays nothing; Xo pays for counts as values
  move. `xo vet --cost` points at the loops where that, or a
  copy-on-write copy, is expensive. In the measurements below Rust's
  programs used less memory on most rows (Xo's runtime and scheduler
  start larger), and Xo's used less on the rows that build large
  collections (sieve, sort, strings).

## Safety and security

| | Rust | Xo |
|---|---|---|
| Memory safety | Safe Rust is memory safe; `unsafe` code can break it, and the guarantee depends on every `unsafe` block in the program and its dependencies being correct | Memory safe without an `unsafe` keyword; C reached through `use c` is outside the guarantee and listed by `xo audit` |
| Data races | "Safe Rust guarantees an absence of data races", but "Rust does not prevent general race conditions" (deadlocks, wrong ordering) ([Rustonomicon](https://doc.rust-lang.org/nomicon/races.html)) | Values never alias mutably, so data races are impossible except through `Mutex` and `Atomic`, which are synchronized ([core 5](../spec/core/)); race conditions are possible too, and `xo test --explore=N` runs N seeded schedules to find them |
| Integer overflow | Panics in debug builds; in release builds (`--release`) "Rust performs two's complement wrapping" unless `overflow-checks` is set ([the book, 3.2](https://doc.rust-lang.org/book/ch03-02-data-types.html)) | Faults in every build: a bug report, not a wrong number ([core 2, 8](../spec/core/)); wrapping is explicit (`wrapping_add`, [std 2](../spec/std/)) |
| Capabilities | Any crate can open files, sockets, or processes; a build script (`build.rs`) is compiled and run "just before building the package" with the user's permissions ([Cargo book](https://doc.rust-lang.org/cargo/reference/build-scripts.html)) | Code reaches the file system, network, environment, or processes only through capability values it was given; a module can be held to a ceiling (`uses none`); no dependency code runs at fetch or build setup: no build scripts, no install hooks ([core 6](../spec/core/), [decision 0156](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0156-supply-chain-hardening.md)) |
| Supply chain | `Cargo.lock` pins versions and records checksums; the [RustSec advisory database](https://rustsec.org/) and `cargo audit` report known vulnerabilities | `xo.lock` hashes each module version, plus an **effect lock**: an update that adds an effect fails until accepted, and `xo audit` lists each dependency's effects, escape hatches, and vouches ([Dependencies](../dependencies/)). There is no vulnerability database yet |

## Compiler and toolchain

- **Build speed.** Not measured against Rust yet. The measured
  comparison of build times is the one against Go
  ([Xo and Go](../xo-and-go/#compiler-and-toolchain)); a Rust row is on
  the list for the next release's run.
- **Targets.** Rust lists 8 Tier 1 host targets ("guaranteed to work")
  and many more at Tier 2 and 3
  ([platform support](https://doc.rust-lang.org/rustc/platform-support.html));
  cross compiling adds a target with `rustup` and usually needs a linker
  for it. Xo: `xo build --targets=all` builds linux/amd64, linux/arm64,
  darwin/amd64, darwin/arm64, windows/amd64, and wasip1/wasm from any
  host with its own backends and linkers, no C toolchain
  ([core 11](../spec/core/)).
- **Tests and fuzzing.** Rust has `cargo test`, doc tests, and fuzzing
  through external crates (cargo-fuzz). Xo has `test` blocks, property
  tests, deterministic concurrency tests (`xo test --explore=N`), and
  contract fuzzing of `requires`/`ensures` contracts, on the Go backend
  only today ([core 9](../spec/core/)).
- **Formatting and lints.** Both have one formatter (`rustfmt`, `xo
  fmt`); Rust has Clippy, Xo has `xo vet`.

## Writing it with AI agents

Rust is far better known: models have seen much more Rust than Xo, and
`rust-analyzer` and the compiler's error messages are excellent. The
cost for an agent is the borrow checker and lifetimes, which can take
several rounds to satisfy. Xo is designed for the agent's loop:

- `xo check --json` reports every problem with a stable `XOnnnn` code
  and machine-applicable fixes; codes never change meaning
  ([diagnostics](../diagnostics/)).
- Rust habits (`Vec<T>`, `vec![]`, `impl` blocks, `.unwrap()`, `&self`,
  `format!`, `as` casts, and others, 24 cases) get a diagnostic that
  names Rust and gives the Xo form, with a fix.
- `xo def`, `xo refs`, `xo query`, `xo edit`, and `xo mcp` answer
  semantic questions and make edits through resolved symbols.

## Benchmarks

**Method.** The same programs written twice, each in its own language's
idiom (Rust: plain loops, `sort_unstable`, tokio tasks and std threads,
serde_json, axum on tokio), and run under `xo bench --ab` with Rust as A
and Xo as B, 10 interleaved rounds; a verdict is "better" or "worse"
only when the 95% interval excludes 1.0, and the file asks that ratios
within 10% be read as ties. Every program prints a checksum and the run
stops if Rust's and Xo's differ. **Machine**: Apple M4 Pro (12 cores),
macOS 27, darwin/arm64, with other jobs running (each row waited for a
load under 5). **Versions**: rustc 1.99.1 with opt-level 3, one codegen
unit, thin LTO and `panic = "abort"`; axum 0.8.9, tokio 1.54.1,
serde_json 1.0.154; Xo from main between 0.26.0 and 0.27.0, native
backend. **Date**: 2026-10-23. Ratios are Xo over Rust; under 1.0 means
Xo took less
([rust-vs-xo-2026-10-23.md, lines 1 to 12 and 146 to 151](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L1-L12)).

**Compute**

| workload | wall time, Xo / Rust | verdict | source |
|---|---|---|---|
| strings | 0.44 | better | [line 47](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L47) |
| sort | 0.93 | better | [line 32](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L32) |
| sieve | 0.99 | within noise | [line 22](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L22) |
| interpreter | **1.22** | worse | [line 37](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L37) |
| fib | **1.31** | worse | [line 17](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L17) |
| collatz | **1.42** | worse | [line 42](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L42) |
| n-body (floating point) | **2.23** | worse | [line 27](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L27) |

Peak memory: Xo used about 1.4 times Rust's on fib, nbody, interp and
collatz (2.6 MB against 1.8 MB), and 0.28 to 0.47 of Rust's on sieve,
sort and strings (lines 20 to 50).

**Concurrency** (Rust on tokio's default multi thread runtime and std
threads; the three async rows are also given on tokio's current thread
runtime, the Rust idiom for many small tasks that never need a second
thread)

| workload | wall time, Xo / Rust | verdict | source |
|---|---|---|---|
| ping-pong (multi thread runtime) | 0.033 | better | [line 65](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L65) |
| fanout (multi thread runtime) | 0.87 | better | [line 60](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L60) |
| parallel map (std threads) | **1.27** | worse | [line 80](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L80) |
| spawn (multi thread runtime) | **1.39** | worse | [line 55](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L55) |
| ping-pong (current thread runtime) | **1.49** | worse | [line 95](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L95) |
| mutex | **1.98** | worse | [line 70](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L70) |
| rwmutex | **2.48** | worse | [line 75](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L75) |
| fanout (current thread runtime) | **2.62** | worse | [line 90](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L90) |
| spawn (current thread runtime) | **3.31** | worse | [line 85](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L85) |

The large ping-pong win is tokio's multi thread runtime waking another
worker on every hop; on the current thread runtime, which is how a Rust
programmer would write that program, Rust is faster. Xo used more CPU
than Rust on spawn (2.3 times) and parallel map (1.33 times), less on
multi thread ping-pong, and 1.1 to 3.4 times Rust's peak memory on
every concurrency row (lines 55 to 98).

**JSON** (serde_json against Xo's std/json; 1,000 users, 100 rounds)

| workload | wall time, Xo / Rust | verdict | source |
|---|---|---|---|
| decode | **1.54** | worse | [line 103](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L103) |
| encode | **1.53** | worse | [line 113](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L113) |

For scale, the same file's Go column: Xo took 0.36 of Go's
encoding/json time to decode and 0.71 to encode (lines 108 and 118).

**HTTP**: the users CRUD API (axum on tokio with serde_json, against
Xo's std/http with request arenas), 32 workers on loopback, 10 s
measured after a 2 s warmup, the median of 3 runs
([lines 137 to 143](https://github.com/xo-lang/xo/blob/main/bench/results/rust-vs-xo-2026-10-23.md#L137-L143)):

| | Rust (axum) | Xo | Xo / Rust |
|---|---|---|---|
| requests/s | 117,564 | 135,452 | 1.15 |
| p50 latency | 213 µs | 205 µs | 0.96 |
| p99 latency | 1,193 µs | 823 µs | 0.69 |
| p99.9 latency | 5,578 µs | 1,786 µs | 0.32 |
| server CPU per request | 17.61 µs | 21.14 µs | **1.20** |
| peak RSS | 5.0 MB | 18.7 MB | **3.7** |

Xo served more requests in each of the three runs (lines 128 to 135),
but **axum used less CPU per request and about a quarter of Xo's
memory**. The runs' spread is wide (the third reached about
half the rate of the first two, for every server), so read the throughput ratio as "about
the same to somewhat faster", not as 15%.

These are a young compiler's numbers on one machine; the slower rows
are the work queue (floating point, locks, task spawn, JSON). The
comparison is rerun from `bench/perf/rust/run.sh` and this page's tables
are refreshed from its results file.
