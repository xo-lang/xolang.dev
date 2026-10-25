---
title: "Xo and TypeScript"
linkTitle: "Xo and TypeScript"
description: "How Xo and TypeScript on Node.js differ, where TypeScript is the better choice today, where Xo is, and measured numbers with their sources."
weight: 8
toc: true
---

Part of the comparison series that starts with [Xo and Go](../xo-and-go/).
It is not a "which is better" page. TypeScript on Node.js is one of the
most used stacks for web backends, with the largest package ecosystem
there is and the same language in the browser and on the server. Xo is
an experimental compiled language. This page compares writing a backend
in each: the language, safety, deployment, and measurements, including
the rows where Node does as well as Xo or better.

**Versions.** Claims about TypeScript are checked against the
TypeScript handbook, and claims about Node.js against the Node.js
documentation, as of 2026-10-23. The newest releases that day were
TypeScript 7.0 and Node.js 26.12.1 (Current) and 24.22.1 (LTS). The
measurements used **Node.js 22.22.1** and **TypeScript 5.9.3**, the
versions pinned in the benchmark's package-lock.json; they will be
rerun on a current LTS. The Xo in the measurements is a build of main
between 0.26.0 and 0.27.0 (it reports itself as 0.26.0). Last
verified: 2026-10-23.

## Short version

**Choose TypeScript** when the team already writes it, when code is
shared with a browser front end, when you need npm's ecosystem, fast
iteration without a compile step for running code, or the tooling and
hosting that support Node everywhere. It is mature and production
proven; Xo is experimental (spec draft 0.10, no 1.0 yet).

**Consider Xo** when you want types the program cannot run without
(TypeScript's are erased and checked only by `tsc`), errors in function
signatures, integers that do not lose precision, all CPU cores in one
process, and one static binary to deploy. In the measurements below Xo
was 2 to 9 times faster than Node on compute, concurrency and JSON,
served 4 times the requests of a single Node process at the median,
and used a small fraction of its memory.

## What each is for

- **TypeScript**: "JavaScript with syntax for types"
  ([typescriptlang.org](https://www.typescriptlang.org/)).
  **Node.js**: "an asynchronous event-driven JavaScript runtime",
  "designed to build scalable network applications"
  ([About Node.js](https://nodejs.org/en/about)).
- **Xo**: backends, tools, and web services, designed so AI agents can
  write, check, cross compile, and debug programs with fast, structured
  feedback ([Why Xo?](../faq/)).

## The language

| | TypeScript | Xo |
|---|---|---|
| Types at run time | Erased: "Type annotations never change the runtime behavior of your program" ([handbook](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)). Node runs `.ts` files by stripping the types, and "no type checking is performed" ([Node TypeScript docs](https://nodejs.org/api/typescript.html)); checking is a separate `tsc` step | Checked by the compiler; a program that does not check does not build or run |
| Absent values | `null` and `undefined`; "By default, values like `null` and `undefined` are assignable to any other type", unless `strictNullChecks` is on ([handbook](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)) | No null; `T?` is `Option[T]`, and the compiler makes you handle `None` ([core 2.5](../spec/core/)) |
| Errors | Exceptions; a function's type does not say what it throws | `T ! E`; an unhandled `Result` does not compile; `?` propagates and records an error trace ([core 2.6, 11.1](../spec/core/)) |
| Sum types | Unions with narrowing, discriminated by a field; exhaustiveness by a `never` check | Enums with payloads and exhaustive `match`, with guards ([core 2, 3](../spec/core/)) |
| Numbers | One `number` type, a double: integers are exact only up to 2^53 − 1 ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)); `bigint` for more | `Int` (64 bit, overflow faults), sized integers, `Float`, and `BigInt` in std/big ([core 2.1](../spec/core/), [std 33](../spec/std/)) |
| Values | Objects and arrays are shared references | Value semantics with copy-on-write; mutation is visible in signatures (`var` parameters) ([core 5](../spec/core/)) |
| Concurrency | One JavaScript thread per process with an event loop and `async`/`await`; more cores through `worker_threads`, `child_process` or `cluster` ([About Node.js](https://nodejs.org/en/about)) | Tasks spread over every core in one process; structured concurrency (`scope`), cancellation without a parameter, channels, `select`, `Mutex` ([core 7](../spec/core/)) |
| Side effects | Not in signatures | Effects in signatures (`uses (net, fs)`), capability values passed from `main`, and fakes for tests ([core 6](../spec/core/)) |

## Memory

- **Node** runs JavaScript on V8, with a tracing garbage collector.
- **Xo** native builds use reference counting: a value is freed when
  its last reference goes, with no collector pauses. HTTP handlers get
  request scoped arenas by default ([FAQ](../faq/),
  [core 10](../spec/core/)).
- Measured: a running Node program started at about 40 MB of RSS in
  these benchmarks, Xo's at 2.6 to 7.4 MB; the CRUD server peaked at
  63.5 MB against 18.4 MB (sources below).

## Safety and security

| | TypeScript on Node | Xo |
|---|---|---|
| Memory safety | Memory safe (a garbage collected runtime) | Memory safe; C reached through `use c` is outside the guarantee and listed by `xo audit` |
| Data races | JavaScript on one thread has none; memory shared between workers (`SharedArrayBuffer`) needs `Atomics` | Values never alias mutably, so data races are impossible except through `Mutex` and `Atomic`, which are synchronized ([core 5](../spec/core/)) |
| Integer overflow | Above 2^53 − 1 a `number` silently rounds ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)) | Faults: a bug report, not a wrong number ([core 2, 8](../spec/core/)) |
| Capabilities | Any package can use the file system, network, and processes. Node's `--permission` flag restricts them for the whole process (stable since 22.13), but it is "a 'seat belt' approach" that "does not protect against malicious code" ([permissions](https://nodejs.org/api/permissions.html)) | Code reaches the file system, network, environment, or processes only through capability values it was given, per function; a module can be held to a ceiling (`uses none`) ([core 6](../spec/core/), [Dependencies](../dependencies/)) |
| Supply chain | `package-lock.json` pins versions with integrity hashes; `npm install` runs a package's `preinstall`, `install`, and `postinstall` scripts ([npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts)); `npm audit` reports known vulnerabilities | `xo.lock` hashes each module version; no dependency code runs at fetch or build setup ([decision 0156](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0156-supply-chain-hardening.md)); an **effect lock** fails an update that adds an effect until accepted, and `xo audit` lists each dependency's effects ([Dependencies](../dependencies/)). There is no vulnerability database yet |

## Toolchain and deployment

- **Running code.** Node runs TypeScript directly (type stripping, on
  by default since 22.18 and 23.6), with no build step; `tsc` checks.
  Xo compiles to a native binary first (`xo run` does both).
- **Deploying.** A Node service ships its source, `node_modules`, and a
  Node runtime, or a single executable application, which Node marks
  "Active development" ([SEA docs](https://nodejs.org/api/single-executable-applications.html)).
  Xo ships one static binary, and `xo build --targets=all` cross
  compiles for linux, darwin and windows on arm64 and x86-64, plus
  WASI, from any host ([core 11](../spec/core/)).
- **Browser.** TypeScript runs in every browser. Xo builds WASI
  programs, not browser front ends.

**Build, size and startup** (the CRUD server of the benchmarks below and
a hello program; Node 22.22.1, TypeScript 5.9.3, esbuild 0.28.2; one
build each, Apple M4 Pro, 2026-10-24):

| | TypeScript on Node | xo 0.29.0 |
|---|---|---|
| Cold build | `tsc` over the project 0.69 s; esbuild bundle of the server 0.37 s | 2.3 s (CRUD server) |
| Rebuild, nothing changed or one function edited | `tsc` 0.52 s (it keeps no cache); esbuild 0.16 to 0.17 s | 0.03 s unchanged, 0.50 s after an edit |
| Peak build memory | `tsc` 201 MB; esbuild 76 MB | 992 MB cold, 547 MB after an edit |
| What ships | a 3 KB bundle plus the 108 MB Node runtime, or a 107 MB single executable application (4.9 s to build) | a 2.3 MB binary (`xo build --release`; 6.2 MB with debug information) |
| Hello startup, wall | 46.2 ms | 2.8 ms (0.061 of Node's) |
| Hello startup, peak memory | 36.5 MB | 2.6 MB |

Source: [twins-build-2026-10-24.md, lines 20, 26 to 27, 31, 39 to 40, 49 to 51 and 66 to 69](https://github.com/xo-lang/xo/blob/main/bench/results/twins-build-2026-10-24.md#L20-L69).
A cold build and a build after an edit are faster in TypeScript and use far less memory (Xo's no-change build, 0.03 s, is the exception); Xo's program
starts 16 times faster and ships as one file of 2.3 MB (`xo build --release`) against
Node's 107 MB single executable. The single executable application was
checked by starting it and creating a user.

## Writing it with AI agents

TypeScript is among the languages models know best, and its editor
tooling is excellent. Xo is designed for the agent's loop:

- `xo check --json` reports every problem with a stable `XOnnnn` code
  and machine-applicable fixes; codes never change meaning
  ([diagnostics](../diagnostics/)).
- TypeScript habits (`any`, arrow functions, C style `for`, `await`,
  camelCase locals, and others, 29 cases) get a diagnostic that names
  TypeScript and gives the Xo form, with a fix.
- `xo def`, `xo refs`, `xo query`, `xo edit`, and `xo mcp` answer
  semantic questions and make edits through resolved symbols.

## Benchmarks

**Method.** The same programs written twice, each in its own language's
idiom (Node: async tasks on the event loop for spawn, fanout and
ping-pong; `worker_threads` with a `SharedArrayBuffer` and `Atomics` for
mutex and parallel map; `JSON.parse` and `JSON.stringify`; `node:http`
for the server), and run under `xo bench --ab` with Node as A and Xo as
B, 10 interleaved rounds; a verdict is "better" or "worse" only when the
95% interval excludes 1.0, and the file asks that ratios within 10% be
read as ties. Every program prints a checksum and the run stops if
Node's and Xo's differ. There is no rwmutex row: Node has no read write
lock. **Machine**: Apple M4 Pro (12 cores), macOS 27, darwin/arm64,
with other jobs running (each row waited for a load under 5).
**Versions**: Node.js 22.22.1, TypeScript 5.9.3; Xo from main between
0.26.0 and 0.27.0, native backend. **Date**: 2026-10-23. Ratios are Xo
over Node; under 1.0 means Xo took less
([node-vs-xo-2026-10-23.md, lines 1 to 10 and 94 to 99](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L1-L10)).

| workload | wall time, Xo / Node | verdict | source |
|---|---|---|---|
| parallel map (worker threads) | 0.115 | better | [line 43](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L43) |
| mutex (worker threads) | 0.116 | better | [line 38](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L38) |
| JSON encode | 0.25 | better | [line 61](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L61) |
| ping-pong | 0.34 | better | [line 33](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L33) |
| fib (recursive, 40) | 0.38 | better | [line 15](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L15) |
| JSON decode | 0.41 | better | [line 51](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L51) |
| fanout | 0.49 | better | [line 28](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L28) |
| spawn | 0.99 | within noise | [line 23](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L23) |

Two caveats. The short rows include Node's start (46 ms for a hello program, above), a large part of
a 60 to 90 ms run; the fib and parallel map rows are long enough to show
the engine. And Xo spreads tasks over every core where Node's event loop
uses one: on spawn the wall time was the same but **Xo used 4.6 times
Node's CPU** (line 24), and on fanout about twice (line 29, too coarse
for a verdict). Xo's peak memory was 0.035 to 0.17 of Node's on every
row (lines 18 to 69).

**HTTP**: the users CRUD API (`node:http` in one process, against Xo's
std/http with request arenas), 32 workers on loopback, 10 s measured
after a 2 s warmup, the median of 3 runs
([lines 85 to 91](https://github.com/xo-lang/xo/blob/main/bench/results/node-vs-xo-2026-10-23.md#L85-L91)):

| | Node | Xo | Xo / Node |
|---|---|---|---|
| requests/s | 30,891 | 124,648 | 4.0 |
| p50 latency | 528 µs | 214 µs | 0.41 |
| p99 latency | 9,857 µs | 1,023 µs | 0.10 |
| p99.9 latency | 27,468 µs | 2,613 µs | 0.095 |
| server CPU per request | 19.39 µs | 17.56 µs | 0.91 |
| peak RSS | 63.5 MB | 18.4 MB | 0.29 |

Read this table with its runs (lines 75 to 83). Node's three runs
were far apart: 80,335, 30,891 and 20,432 requests/s. In its best run
Node used **12.10 µs of CPU per request, less than Xo's 17.56** in the
same round; Xo's lead in throughput comes from using more than one
core. Node is measured as one process because a cluster of workers
would give each worker its own in-memory store, which is not the same
program (line 98); a Node deployment behind a load balancer with a
shared database would scale across cores that way.

These are a young compiler's numbers on one machine. The comparison is
rerun from `bench/perf/node/run.sh` and this page's tables are refreshed
from its results file.
