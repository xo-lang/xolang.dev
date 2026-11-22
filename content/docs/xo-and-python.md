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
The compute, concurrency and JSON measurements (2026-11-22) used
**CPython 3.13.5**, the Python of the linux/arm64 timing host, against
the released Xo 0.55.0, as did the HTTP rows, with the packages pinned
with hashes in the benchmark's requirements.txt (uvicorn 0.37.0, uvloop
0.23.0, httptools 0.9.0, Starlette 0.48.0).
Last verified: 2026-11-22.

## Short version

**Choose Python** when the work is scripting, data, or machine
learning, when a library you need exists only for Python, when the team
knows it, or when the speed of writing matters more than the speed of
running. It is mature, everywhere, and production proven; Xo is
experimental (spec draft 0.10, no 1.0 yet).

**Consider Xo** when the service is CPU bound or concurrent, when you
want types the compiler enforces, errors in function signatures, every
core in one process, and one static binary to deploy. In the
measurements below Xo was 3 to 50 times faster than CPython on
compute, concurrency and JSON, and served 2.6 times the requests of
Python's asyncio server at 0.81 of its CPU per request, **but asyncio
had lower p99.9 latency**.

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
a hello program; CPython 3.13.5; every cold build with its own empty
caches, on the linux/arm64 timing host, 2026-11-22):

| | Python | xo 0.55.0 |
|---|---|---|
| Before the first run | nothing to build; the first import of the server compiles it to bytecode: 0.03 to 0.05 s | a 2.81 s cold build |
| After an edit | the next import recompiles the module: 0.03 to 0.05 s | a 0.63 s build |
| What ships | 7.9 KB of server source, 30.2 MB of installed packages (uvicorn, Starlette, uvloop, httptools and their dependencies), and the interpreter: 35.5 MB for its binary and standard library | a 3.0 MB binary (`xo build --release`; 9.3 MB with debug information) |
| Hello startup, wall (median) | 5.6 ms | 0.56 ms (0.10 of Python's) |
| Hello startup, peak memory | 7.5 MB | 0.95 MB |

Source: [twins-build-2026-11-22.md, lines 5 to 30, 38 to 39, 51 to 53 and 69 to 72](https://github.com/xo-lang/xo/blob/main/bench/results/twins-build-2026-11-22.md#L5-L72).
Python has no build to wait for; Xo's build costs seconds once and
about 0.6 s after a change, and in return its program starts 10 times
faster and ships as one file.

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
excludes 1.0. Each program runs its work REPEAT times in one process so
Xo's side takes about a second; the fib, ping-pong and parallel map rows
ran 4 rounds because one Python run takes 20 to 53 s. Every program
prints a checksum and the run stops if Python's and Xo's differ. There
is no rwmutex row: the standard library has no read write lock.
**Machine**: the linux/arm64 timing host (12 CPUs, Linux 7.0), each row
starting at a load under 3; parallel map, which keeps every core busy,
runs with a load limit of 15. **Versions**: CPython 3.13.5 with the GIL;
the released xo 0.55.0, native backend. **Date**: 2026-11-22. Ratios
are Xo over Python; under 1.0 means Xo took less
([python-vs-xo-2026-11-22.md, lines 1 to 24](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L1-L24)).

| workload | wall time, Xo / Python | verdict | source |
|---|---|---|---|
| parallel map (multiprocessing) | 0.020 | better (4 rounds) | [line 57](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L57) |
| fib (recursive, 40) | 0.029 | better (4 rounds) | [line 29](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L29) |
| spawn | 0.045 | better | [line 37](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L37) |
| ping-pong | 0.045 | better (4 rounds) | [line 47](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L47) |
| fanout | 0.11 | better | [line 42](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L42) |
| JSON encode | 0.14 | better | [line 75](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L75) |
| mutex | 0.30 | better | [line 52](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L52) |
| JSON decode | 0.33 | better | [line 65](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-2026-11-22.md#L65) |

On mutex Xo's threads ran on more cores than Python's 8 threads under
the GIL: 0.53 of Python's CPU time against 0.30 of its wall time (line
53). Xo's peak memory was 0.049 to 0.17 of Python's on every row (lines
31 to 77).

**HTTP** (2026-11-22, CPython 3.13.5 and xo 0.55.0 on the linux/arm64
timing host): the users CRUD API, given twice for Python: the standard
library's `asyncio.Protocol`, and Starlette on uvicorn with uvloop and
httptools, each in one process, against Xo's std/http with request
arenas; 32 workers on loopback, 10 s measured after a 2 s warmup, the
median of 3 runs
([python-vs-xo-http-2026-11-22.md, lines 36 to 38](https://github.com/xo-lang/xo/blob/main/bench/results/python-vs-xo-http-2026-11-22.md#L36-L38)):

| | Python asyncio | Python Starlette | Xo | Xo / asyncio |
|---|---|---|---|---|
| requests/s | 67,763 | 39,382 | 179,364 | 2.6 |
| p50 latency | 437 µs | 769 µs | 141 µs | 0.32 |
| p99 latency | 1,019 µs | 1,622 µs | 926 µs | 0.91 |
| p99.9 latency | 1,317 µs | 1,846 µs | 2,463 µs | **1.87** |
| server CPU per request | 14.70 µs | 25.39 µs | 11.91 µs | 0.81 |
| peak RSS | 18.7 MB | 33.5 MB | 14.0 MB | 0.75 |

**Python's asyncio server had lower p99.9 latency than Xo** in all three
runs (1,295 to 1,345 µs against Xo's 2,363 to 2,647; lines 18 to 29).
It is the standard library's low-level protocol API on one thread, with
no framework; Xo's server spreads connections over every core and used
less CPU per request in every run (11.83 to 11.93 µs against 14.68 to
14.83). A Python service written with a framework is closer to the
Starlette column: Xo served 4.6 times its requests at 0.47 of its CPU
per request.

These are a young compiler's numbers on one machine. The comparison is
rerun from `bench/perf/python/run.sh` and this page's tables are
refreshed from its results file.
