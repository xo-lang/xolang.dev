---
title: "Performance"
linkTitle: "Performance"
description: "Measured speed, memory, compile time and binary size of Xo against Go, every figure linked to the committed results file it comes from, including the rows where Xo is behind."
weight: 17
toc: true
---

This page collects the measurements of Xo against Go that each release
records. Every number links to the results file in the repository where
it was measured, with the host, the Go version and the raw output. Rows
where Xo is slower or uses more memory are listed as plainly as the rows
where it is faster.

The numbers here are from the **0.40.0** release run
([release-vs-go-v0.40.0.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.40.0.md))
and the **0.44.0** HTTP run against Go at its defaults and tuned
([release-vs-go-v0.44.0-http-gotuned.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.44.0-http-gotuned.md)),
plus the survey of every `bench/perf` case of 2026-11-07
([xo-vs-go-survey-2026-11-07.md](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-07.md)).
Go is go1.26.1 throughout.

Last verified: 2026-11-10.

## How to read the ratios

- A ratio is **Xo over Go**: below 1 means Xo took less time (or memory),
  above 1 means Xo took more.
- Run rows come from [`xo bench --ab`](/docs/toolchain/), which runs the
  two programs alternately, A = Go and B = Xo, takes the median of each
  metric over the rounds, and reports B / A with a 95% interval and a
  verdict (better, worse or within noise). A ratio is only called a
  difference when its interval excludes 1.
- HTTP rows are medians over rounds of a load generator on the same host,
  the server on six CPUs and the load generator on the other six.

## Run time: the release benchmarks

Darwin arm64 (24 GB), `xo bench --ab`, 3 rounds, Go as A and Xo as B
([release-vs-go-v0.40.0.md lines 80-360](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.40.0.md#L80-L360)).
Wall time and peak memory (max RSS), Xo over Go:

| workload | wall | max RSS |
|---|---|---|
| fib | 0.98 | 0.631 |
| sieve | 0.975 (within noise) | 0.293 |
| **nbody** | **1.026 (slower)** | 0.62 |
| sort | 0.818 | 0.353 |
| interp | 0.286 | 0.612 |
| collatz | 0.9 | 0.621 |
| strings | 0.5 | 0.741 |
| coll putget | 0.701 | 0.676 |
| coll get | 0.599 | 0.83 |
| coll push | 0.747 | 0.498 |
| coll update | 0.642 | 0.686 |
| coll iter | 0.264 | 0.83 |
| coll copymut | 0.687 | 0.583 |
| coll branch | 0.027 (see below) | 0.372 |
| conc spawn | 0.428 | 0.393 |
| conc fanout | 0.658 | 0.371 |
| conc pingpong | 0.916 | 0.642 |
| conc mutex | 0.301 | 0.576 |
| conc rwmutex | 0.822 | 0.563 |
| conc pmap | 0.986 | 0.793 |

- **nbody is the one slower row**: 1.026 (1.023 to 1.027), a floating
  point loop. It was 1.037 in the pre-cut run, so it is not a regression
  of the release.
- **coll branch (0.027) is not a typical speedup.** The workload copies a
  map 2,000 times and adds one key to each copy. Xo's collections are
  values with structural sharing, so a copy is cheap and only the changed
  part is written, where Go's twin calls `maps.Clone` for each copy. It
  shows what that representation saves on this pattern, not how fast Xo
  code is in general.
- fib, sieve, nbody and pmap are within 3% of Go.


### The 0.46.0 cycle on linux/arm64

The same workloads on the linux/arm64 offload host (12 CPUs) on
2026-11-10, Xo from main a67d277d6, Go 1.26.1, 3 rounds
([release-vs-go-a67d277d6-linux-arm64.md lines 53-333](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64.md#L53-L333)):

| workload | wall | max RSS |
|---|---|---|
| fib | 0.892 | 0.343 |
| **sieve** | **1.191 (slower)** | 0.371 |
| **nbody** | **1.02 (slower)** | 0.343 |
| sort | 0.775 | 0.209 |
| interp | 0.316 | 0.343 |
| collatz | 0.894 | 0.222 |
| strings | 0.288 | 0.586 |
| coll putget | 0.615 | 0.676 |
| coll get | 0.508 | 0.635 |
| coll push | 0.704 | 0.421 |
| coll update | 0.592 | 0.537 |
| coll iter | 0.181 | 0.634 |
| coll copymut | 0.691 | 0.483 |
| coll branch | 0.009 | 0.34 |
| conc spawn | 0.388 | 0.201 |
| conc fanout | 0.485 | 0.193 |
| conc pingpong | 0.904 | 0.221 |
| conc mutex | 0.318 | 0.221 |
| **conc rwmutex** | **1.127 (slower)** | 0.216 |
| **conc pmap** | **1.06 (slower)** | 0.241 |

- Four rows are slower than Go here: sieve (1.191), rwmutex (1.127),
  pmap (1.06) and nbody (1.02). Sieve and rwmutex were within noise or
  faster on darwin in 0.40.0, so these two are open items for the next
  release, not settled differences.
- `xo test` of std's base64 and json takes 0.793 and 0.462 of `go test`'s
  wall time cold, 0.893 and 0.241 after an edit
  ([lines 340-399](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64.md#L340-L399)).

## HTTP server: Go at its defaults and tuned

The same JSON server in both languages (`bench/perf/jitter`), on the
linux/arm64 offload host (12 CPUs), 3 rounds a row
([release-vs-go-v0.44.0-http-gotuned.md lines 28-72](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.44.0-http-gotuned.md#L28-L72)).
Go is measured twice: at its defaults (`GOGC=100`), and **tuned** with
`GOGC=off GOMEMLIMIT=1GiB`, which trades memory for fewer collections.
`/alloc` builds and encodes a JSON object per request; `/hello` writes a
fixed body. cN is the number of connections.

| row | server | req/s | p99 µs |
|---|---|---|---|
| /alloc c32 | Xo | 169,349 | 458 |
| /alloc c32 | Go | 29,481 | 5,086 |
| /alloc c32 | Go tuned | 140,526 | 600 |
| /alloc c256 | Xo | 177,945 | 5,154 |
| /alloc c256 | Go | 57,479 | 38,204 |
| /alloc c256 | Go tuned | 140,810 | 5,944 |
| /hello c32 | Xo | 359,094 | 219 |
| /hello c32 | Go | 278,936 | 627 |
| /hello c32 | Go tuned | 313,314 | 262 |
| /hello c256 | Xo | 894,177 | 815 |
| /hello c256 | Go | 489,516 | 2,580 |
| /hello c256 | Go tuned | 732,005 | 1,083 |

The cost of each request and the server's peak memory, same rows:

| row | server | CPU µs/req | peak RSS KB |
|---|---|---|---|
| /alloc c32 | Xo | 33.9 | 5,664 |
| /alloc c32 | Go | 105.2 | 19,736 |
| /alloc c32 | Go tuned | 41.3 | 1,013,192 |
| /alloc c256 | Xo | 33.7 | 10,956 |
| /alloc c256 | Go | 81.3 | 41,044 |
| /alloc c256 | Go tuned | 41.5 | 1,014,880 |
| /hello c32 | Xo | 7.1 | 4,660 |
| /hello c32 | Go | 12.2 | 17,760 |
| /hello c32 | Go tuned | 11.3 | 986,100 |
| /hello c256 | Xo | 5.8 | 6,620 |
| /hello c256 | Go | 10.0 | 24,116 |
| /hello c256 | Go tuned | 7.9 | 986,028 |

Xo over Go, requests a second (from the same file's ratio lines):

| row | over Go | over Go tuned |
|---|---|---|
| /alloc c32 | 5.744 | 1.205 |
| /alloc c256 | 3.096 | 1.264 |
| /hello c32 | 1.287 | 1.146 |
| /hello c256 | 1.827 | 1.222 |

- Go's default `/alloc` row is weak because its collector runs about
  1,000 times a second on this server's small live heap (12,559 to 12,710
  collections in about 12 s of load, against 115 with the memory limit;
  [lines 74-102](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.44.0-http-gotuned.md#L74-L102)).
  Compare with the tuned column for Go's best case: Xo serves 1.21 to
  1.26 times its rate on `/alloc`, at 0.006 (c32) and 0.011 (c256) of its
  peak memory.
- At fixed open loop rates (10,000 and 20,000 requests a second, 64
  connections) all three serve the rate; Xo's p99 is 110 and 143 µs, Go's
  386 and 651 µs, tuned Go's 128 and 152 µs.


### The 0.46.0 cycle, against Go and 0.44.0

The same server and host on 2026-11-10, Xo from main a67d277d6 (the
0.46.0 cycle), 12 rounds a row, with the released 0.44.0 as a third
server ([release-vs-go-a67d277d6-linux-arm64-http.md lines 20-64](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64-http.md#L20-L64)):

| row | Xo req/s | 0.44.0 req/s | Go req/s | Go tuned req/s | Xo peak RSS KB | Go peak RSS KB |
|---|---|---|---|---|---|---|
| /alloc c32 | 170,708 | 160,828 | 28,270 | 134,609 | 4,548 | 19,768 |
| /alloc c256 | 192,669 | 176,798 | 57,088 | 139,783 | 11,066 | 40,548 |
| /hello c32 | 349,973 | 352,247 | 271,626 | 304,420 | 3,334 | 17,868 |
| /hello c256 | 867,203 | 875,940 | 476,093 | 707,965 | 6,768 | 23,980 |

Against 0.44.0, built at four code alignments so that placement cannot
decide it ([lines 66-93](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64-http.md#L66-L93)): `/alloc` is 6.4% (c32) and 9.3%
(c256) faster, at about 8% less CPU per request; `/hello` is 0.6% (c32)
and 1.0% (c256) slower, a small difference whose ranges do not overlap.

## Compile time, binary size and build memory

Darwin arm64, one build each, wall milliseconds and the build's peak
resident memory
([release-vs-go-v0.40.0.md lines 55-78](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.40.0.md#L55-L78)).
The like-for-like row is `coll`, one program on each side:

| | cold ms | warm ms | after an edit ms | peak MB cold / warm / edit | binary MB |
|---|---|---|---|---|---|
| Go | 1690 | 50 | 130 | 308 / 26 / 68 | 2.43 |
| Xo | 1120 | 100 | 110 | 251 / 52 / 52 | 1.50 |

The other groups are not like-for-like (Go builds one binary per group,
Xo one per workload), but every Xo workload binary is 1.31 to 1.47 MB
against Go's 2.39 to 2.40 MB group binaries, and its cold builds take
1060 to 1420 ms.

## Where Xo is behind or even

- **Warm rebuilds of a larger program**: with the whole-build cache off,
  `coll` rebuilds unchanged in 100 ms against Go's 50 ms, at twice Go's
  warm memory (52 against 26 MB). With that cache on, the default, an
  unchanged rebuild takes 13 to 14 ms and 14 MB on linux/arm64
  ([lines 9-14](https://github.com/xo-lang/xo/blob/main/bench/results/perf-gaps-2026-11-10.md#L9-L14)).
  Most of the 100 ms was code generation repeated on every build: a
  program under 256 functions skipped the code cache. The fix, in the
  release after 0.46.0, halves coll's warm rebuild (110 to 53 ms on
  linux/arm64,
  [lines 19-37](https://github.com/xo-lang/xo/blob/main/bench/results/perf-gaps-2026-11-10.md#L19-L37)).
- **Test builds use more memory**: `xo test` of the base64 and json
  ports runs in 0.35 to 0.65 of `go test`'s wall time, but at 1.10 to
  1.82 times its peak memory
  ([lines 363-425](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.40.0.md#L363-L425)).
  After an edit it peaks at 202 to 233 MB against `go test`'s 106 to 158
  MB on linux/arm64. The peak is the compiler's own heap, not the test
  binary: parse trees, and every std module that imports the edited one
  checked again
  ([lines 41-60](https://github.com/xo-lang/xo/blob/main/bench/results/perf-gaps-2026-11-10.md#L41-L60)).
- **nbody** (floating point): 1.026, above.
- **Standard library ports** still slower than Go's packages in the
  2026-11-07 survey of 387 cases (geometric mean 0.724, 65 cases more than
  10% slower;
  [lines 21-43](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-07.md#L21-L43)).
  The largest gaps, as measured then:
  - time formatting and parsing with a layout: 1.65 to 3.02 times Go;
  - metrics counters and histograms: 4.25 and 2.72 times client_golang
    (a fix since cut them to 0.781 and 0.667 of their time,
    [std/changes/metrics.md](https://github.com/xo-lang/xo/blob/main/std/changes/metrics.md));
  - JSON string writing (`jsontoken/write`): 1.73 times Go; after a fix
    it takes 77.4 ms against the survey's 61.6 ms for Go, still behind
    ([std/changes/json.md](https://github.com/xo-lang/xo/blob/main/std/changes/json.md));
  - logging below the level: 1.79 times Go before calls below the level
    stopped evaluating their arguments (not yet re-timed,
    [std/changes/log.md](https://github.com/xo-lang/xo/blob/main/std/changes/log.md));
  - text tables (`tabwriter`), CSV reading, IPv6 parsing and
    Windows-1252 decoding: 1.34 to 1.54 times Go.

  Each fix is logged with its timing in the module's
  [change log](https://github.com/xo-lang/xo/tree/main/std/changes).

## Method

- **Hosts**: the release benchmarks, compile and test rows on a Darwin
  arm64 Mac (24 GB); the HTTP server and the survey on a linux/arm64
  Graviton host with 12 CPUs.
- **Go**: go1.26.1 for every row on this page.
- **Rounds**: 3 per row for the release benchmarks and the HTTP run, 5
  per case for the survey (alternating, medians of wall time).
- **Ratios**: Xo's median over Go's median for the same metric.
  `xo bench --ab` also prints the 95% interval and calls a row better or
  worse only when the interval excludes 1. Run it yourself with
  `xo bench --ab A B` on two built programs (see the
  [toolchain reference](/docs/toolchain/)).
- **Scripts**: `scripts/release-vs-go.sh` (run, compile, test, HTTP),
  `scripts/release-vs-go-http.sh` (both Go columns) and
  `scripts/twincheck -time` (the survey), all in the repository.
- This page is refreshed with each release's run.
