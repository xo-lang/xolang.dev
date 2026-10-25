---
title: "Xo and Python"
linkTitle: "Xo and Python"
description: "How Xo and Python differ, where Python is the better choice today, where Xo is, and measured numbers with their sources."
weight: 9
toc: true
---

Part of the comparison series that starts with [Xo and Go](../xo-and-go/).
It is not a "which is better" page. Python is one of the most used
languages there is, with a huge ecosystem for data, scripting, machine
learning and web services, and it is fast to write. Xo is an
experimental compiled language. This page compares writing a backend in
each, including the place where Python's standard library server did
better than Xo: CPU per request.

**Versions.** Claims about Python are checked against the Python
documentation as of **Python 3.15.1** (the newest release, 2026-10-21).
The measurements used **CPython 3.13.12** from Homebrew, with the
packages pinned with hashes in the benchmark's requirements.txt
(uvicorn 0.37.0, uvloop 0.23.0, httptools 0.9.0, Starlette 0.48.0); they
will be rerun on a current release. The Xo in the measurements is a
build of main between 0.26.0 and 0.27.0 (it reports itself as 0.26.0).
Last verified: 2026-10-23.

## Short version

**Choose Python** when the work is scripting, data, or machine
learning, when a library you need exists only for Python, when the team
knows it, or when the speed of writing matters more than the speed of
running. It is mature, everywhere, and production proven; Xo is
experimental (spec draft 0.10, no 1.0 yet).

**Consider Xo** when the service is CPU bound or concurrent, when you
want types the compiler enforces, errors in function signatures, every
core in one process, and one static binary to deploy. In the
measurements below Xo was 4 to more than 100 times faster than CPython on
compute, concurrency and JSON, and served 1.6 times the requests of
Python's asyncio server, **but asyncio used about two thirds of Xo's
CPU per request and had lower tail latency**.

## What each is for

- **Python**: "a programming language that lets you work quickly and
  integrate systems more effectively"
  ([python.org](https://www.python.org/)).
- **Xo**: backends, tools, and web services, designed so AI agents can
  write, check, cross compile, and debug programs with fast, structured
  feedback ([Why Xo?](../faq/)).

## The language

| | Python | Xo |
|---|---|---|
| Types | Dynamic. "The Python runtime does not enforce function and variable type annotations"; type checkers, IDEs, and linters use them ([typing](https://docs.python.org/3/library/typing.html)) | Static, checked by the compiler; a program that does not check does not build or run |
| Absent values | `None`, which any variable can hold | No null; `T?` is `Option[T]`, and the compiler makes you handle `None` ([core 2.5](../spec/core/)) |
| Errors | Exceptions; a function's signature does not say what it raises | `T ! E`; an unhandled `Result` does not compile; `?` propagates and records an error trace ([core 2.6, 11.1](../spec/core/)) |
| Sum types | Classes and unions in annotations; `match` (since 3.10) with no exhaustiveness check at run time | Enums with payloads and exhaustive `match`, with guards ([core 2, 3](../spec/core/)) |
| Integers | "Integers have unlimited precision" ([built-in types](https://docs.python.org/3/library/stdtypes.html)) | `Int` is 64 bit and overflow faults; `BigInt` in std/big ([core 2.1](../spec/core/), [std 33](../spec/std/)) |
| Values | Objects, lists, and dicts are shared references | Value semantics with copy-on-write; mutation is visible in signatures (`var` parameters) ([core 5](../spec/core/)) |
| Concurrency | `asyncio` tasks on one thread; threads under the global interpreter lock; `multiprocessing` for more cores. A free-threaded build without the GIL exists since 3.13 as an optional build, with 1% to 8% overhead on single-threaded code ([free threading](https://docs.python.org/3/howto/free-threading-python.html)) | Tasks spread over every core in one process; structured concurrency (`scope`), cancellation without a parameter, channels, `select`, `Mutex` ([core 7](../spec/core/)) |
| Side effects | Not in signatures | Effects in signatures (`uses (net, fs)`), capability values passed from `main`, and fakes for tests ([core 6](../spec/core/)) |

## Memory

- **CPython** uses reference counting, with a collector that
  "supplements the reference counting" to free cycles
  ([gc](https://docs.python.org/3/library/gc.html)).
- **Xo** native builds use reference counting too, with no cycle
  collector: value semantics leave no cycles. HTTP handlers get request
  scoped arenas by default ([FAQ](../faq/), [core 10](../spec/core/)).
- Measured: Xo's programs peaked at 0.11 to 0.29 of Python's memory on
  every row; the asyncio CRUD server peaked at 23.1 MB against Xo's
  19.1 MB (sources below).

## Safety and security

| | Python | Xo |
|---|---|---|
| Type errors | Found at run time, or before it by an external type checker | Found by the compiler |
| Data races | Threads take turns under the GIL; shared state still needs a `threading.Lock`, and the optional free-threaded build runs threads in parallel | Values never alias mutably, so data races are impossible except through `Mutex` and `Atomic`, which are synchronized ([core 5](../spec/core/)) |
| Integer overflow | None: integers grow | Faults: a bug report, not a wrong number ([core 2, 8](../spec/core/)) |
| Capabilities | Any package can use the file system, network, and processes | Code reaches the file system, network, environment, or processes only through capability values it was given; a module can be held to a ceiling (`uses none`) ([core 6](../spec/core/), [Dependencies](../dependencies/)) |
| Supply chain | pip's hash-checking mode (`--require-hashes`) protects against tampering; by default installing "involves running arbitrary code from distributions" ([secure installs](https://pip.pypa.io/en/stable/topics/secure-installs/)) | `xo.lock` hashes each module version; no dependency code runs at fetch or build setup ([decision 0156](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0156-supply-chain-hardening.md)); an **effect lock** fails an update that adds an effect until accepted, and `xo audit` lists each dependency's effects ([Dependencies](../dependencies/)). There is no vulnerability database yet |

## Toolchain and deployment

- **Running code.** Python runs source directly, with no build step.
  Xo compiles to a native binary first (`xo run` does both).
- **Deploying.** A Python service ships its source, its packages
  (often in a virtual environment or container), and an interpreter.
  Xo ships one static binary, and `xo build --targets=all` cross
  compiles for linux, darwin and windows on arm64 and x86-64, plus
  WASI, from any host ([core 11](../spec/core/)).

**Build, size and startup** (the CRUD server of the benchmarks below and
a hello program; CPython 3.13.12; Apple M4 Pro, 2026-10-24):

| | Python | xo 0.29.0 |
|---|---|---|
| Before the first run | nothing to build; the first import of the server compiles it to bytecode: 0.04 to 0.07 s | a 2.3 s cold build |
| After an edit | the next import recompiles the module: 0.04 to 0.07 s | a 0.50 s build |
| What ships | 7.9 KB of server source, 25.8 MB of installed packages (uvicorn, Starlette, uvloop, httptools), and a 77.7 MB interpreter installation | a 2.3 MB binary (`xo build --release`; 6.2 MB with debug information) |
| Hello startup, wall | 17.5 ms | 2.7 ms (0.153 of Python's) |
| Hello startup, peak memory | 13.9 MB | 2.6 MB |

Source: [twins-build-2026-10-24.md, lines 20, 28 to 29, 39 to 40, 52 to 54 and 70 to 73](https://github.com/xo-lang/xo/blob/main/bench/results/twins-build-2026-10-24.md#L20-L73).
Python has no build to wait for; Xo's build costs seconds once and
about half a second after a change, and in return its program starts
6 times faster and ships as one file.

## Writing it with AI agents

Python is the language models know best, and agents write it fluently.
Its weakness for an agent is that many mistakes show up only when the
code runs. Xo is designed for the agent's loop:

- `xo check --json` reports every problem with a stable `XOnnnn` code
  and machine-applicable fixes; codes never change meaning
  ([diagnostics](../diagnostics/)).
- Python habits (`def`, `elif`, `True`, `None`, `print`, `range`,
  comprehensions, `lambda`, `**`, f-strings, and others, 29 cases) get a
  diagnostic that names Python and gives the Xo form, with a fix.
- `xo def`, `xo refs`, `xo query`, `xo edit`, and `xo mcp` answer
  semantic questions and make edits through resolved symbols.

## Benchmarks

**Method.** The same programs written twice, each in its own language's
idiom (Python: `asyncio` tasks for spawn, fanout and ping-pong, 8
threads under `threading.Lock` for mutex, `multiprocessing` with one
process per CPU for parallel map, `json.loads` and `json.dumps`), and
run under `xo bench --ab` with Python as A and Xo as B, interleaved
rounds; a verdict is "better" or "worse" only when the 95% interval
excludes 1.0. The fib and parallel map rows ran 3 rounds because one
Python run takes seconds ("too few rounds" in the file): read those as
orders of magnitude. Every program prints a checksum and the run stops
if Python's and Xo's differ. There is no rwmutex row: the standard
library has no read write lock. **Machine**: Apple M4 Pro (12 cores),
macOS 27, darwin/arm64, with other jobs running (each row waited for a
load under 5). **Versions**: CPython 3.13.12 with the GIL; Xo from main
between 0.26.0 and 0.27.0, native backend. **Date**: 2026-10-23. Ratios
are Xo over Python; under 1.0 means Xo took less
([python-vs-xo-2026-10-23.md, lines 1 to 11 and 99 to 104](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L1-L11)).

| workload | wall time, Xo / Python | verdict | source |
|---|---|---|---|
| ping-pong | 0.009 | better | [line 34](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L34) |
| parallel map (multiprocessing) | 0.019 | 3 rounds | [line 44](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L44) |
| fib (recursive, 40) | 0.025 | 3 rounds | [line 16](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L16) |
| JSON encode | 0.13 | better | [line 62](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L62) |
| spawn | 0.135 | better | [line 24](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L24) |
| mutex | 0.15 | better | [line 39](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L39) |
| fanout | 0.165 | better | [line 29](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L29) |
| JSON decode | 0.25 | better | [line 52](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L52) |

Xo's tasks use more cores than Python's: on spawn and fanout Xo used 0.51
and 0.63 of Python's CPU against 0.135 and 0.165 of its wall time
(lines 25 and 30).

**HTTP**: the users CRUD API, given twice for Python: the standard
library's `asyncio.Protocol`, and Starlette on uvicorn with uvloop and
httptools, each in one process, against Xo's std/http with request
arenas; 32 workers on loopback, 10 s measured after a 2 s warmup, the
median of 3 runs
([lines 89 to 96](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-10-23.md#L89-L96)):

| | Python asyncio | Python Starlette | Xo | Xo / asyncio |
|---|---|---|---|---|
| requests/s | 82,798 | 32,782 | 134,468 | 1.62 |
| p50 latency | 349 µs | 925 µs | 201 µs | 0.58 |
| p99 latency | 906 µs | 1,970 µs | 937 µs | **1.03** |
| p99.9 latency | 1,618 µs | 4,028 µs | 2,316 µs | **1.43** |
| server CPU per request | 11.80 µs | 30.30 µs | 18.03 µs | **1.53** |
| peak RSS | 23.1 MB | 37.6 MB | 19.1 MB | 0.83 |

**Python's asyncio server used less CPU per request than Xo**, in all
three runs (11.71 to 12.22 µs against Xo's 17.94 to 18.50; lines 76 to
87), and its p99.9 latency was lower in all three. It is the standard
library's low-level protocol API on one thread, with no framework;
Xo's server spreads connections over every core, which bought 1.6
times the throughput at that CPU cost. A Python service written with a
framework is closer to the Starlette column: Xo served 4.1 times its
requests at 0.60 of its CPU per request.

These are a young compiler's numbers on one machine. The comparison is
rerun from `bench/perf/python/run.sh` and this page's tables are
refreshed from its results file.
