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

The numbers here are from the **0.46.0** cycle on the linux/arm64 timing
host (12 CPUs): the release benchmarks and std's tests
([release-vs-go-a67d277d6-linux-arm64.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64.md)) and the HTTP server against
Go at its defaults and tuned, with 0.44.0 as a third server
([release-vs-go-a67d277d6-linux-arm64-http.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64-http.md)), both measured on
main 6fe10a957, 53 commits before the v0.46.0 tag; compile time, build
memory, binary size and std's tests of the published 0.50.1 on the same host
([release-vs-go-v0.50.1-linux-arm64.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1-linux-arm64.md)), with a large program on the Mac; and the survey of every `bench/perf` case of 2026-11-07
([xo-vs-go-survey-2026-11-07.md](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-07.md)).
Go is go1.26.1 throughout. Earlier releases' numbers are listed at the
end.

Last verified: 2026-11-11.

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

`xo bench --ab`, 3 rounds, Go as A and Xo as B
([release-vs-go-a67d277d6-linux-arm64.md lines 53-333](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64.md#L53-L333)).
Wall time and peak memory (max RSS), Xo over Go:

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

- **Four rows are slower than Go**: sieve 1.191 (1.152 to 1.231),
  rwmutex 1.127 (1.122 to 1.134), pmap 1.06 (1.032 to 1.06) and nbody
  1.02 (1.018 to 1.023). Sieve and rwmutex were within noise or faster
  in 0.40.0's run on darwin/arm64, so they are open items for the next
  release, not settled differences.
- **coll branch (0.009) is not a typical speedup.** The workload copies a
  map 2,000 times and adds one key to each copy. Xo's collections are
  values with structural sharing, so a copy is cheap and only the changed
  part is written, where Go's twin calls `maps.Clone` for each copy. It
  shows what that representation saves on this pattern, not how fast Xo
  code is in general.
- Peak memory is lower on every row: 0.193 to 0.676 of Go's.

## Test time: std's tests against Go's

`xo test --std-module` of the base64 and json ports against `go test` of
the Go packages they were ported from, cold (every cache emptied) and
after an edit (one function appended to the module under test), 3 rounds,
with Xo 0.50.1
([lines 120-182](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1-linux-arm64.md#L120-L182)):

| test | wall | max RSS |
|---|---|---|
| base64 cold | 0.767 | **1.093 (more)** |
| base64 edit | 0.374 | 1.003 (even) |
| json cold | 0.452 | **1.135 (more)** |
| json edit | 0.209 | 0.921 |

## HTTP server: Go at its defaults and tuned

The same JSON server in both languages (`bench/perf/jitter`), 12 rounds a
row
([release-vs-go-a67d277d6-linux-arm64-http.md lines 20-45](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64-http.md#L20-L45)).
Go is measured twice: at its defaults (`GOGC=100`), and **tuned** with
`GOGC=off GOMEMLIMIT=1GiB`, which trades memory for fewer collections.
`/alloc` builds and encodes a JSON object per request; `/hello` writes a
fixed body. cN is the number of connections.

| row | server | req/s | p99 µs | CPU µs/req | peak RSS KB |
|---|---|---|---|---|---|
| /alloc c32 | Xo | 170,708 | 478 | 32.2 | 4,548 |
| /alloc c32 | Go | 28,270 | 5,410 | 117.4 | 19,768 |
| /alloc c32 | Go tuned | 134,609 | 659 | 42.3 | 1,013,020 |
| /alloc c256 | Xo | 192,669 | 4,914 | 30.9 | 11,066 |
| /alloc c256 | Go | 57,088 | 37,725 | 81.8 | 40,548 |
| /alloc c256 | Go tuned | 139,783 | 5,998 | 41.8 | 1,015,388 |
| /hello c32 | Xo | 349,973 | 228 | 7.5 | 3,334 |
| /hello c32 | Go | 271,626 | 635 | 12.6 | 17,868 |
| /hello c32 | Go tuned | 304,420 | 277 | 11.6 | 985,984 |
| /hello c256 | Xo | 867,203 | 892 | 6.1 | 6,768 |
| /hello c256 | Go | 476,093 | 2,694 | 10.2 | 23,980 |
| /hello c256 | Go tuned | 707,965 | 1,174 | 8.0 | 986,124 |

Xo over Go, requests a second
([lines 47-64](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64-http.md#L47-L64)):

| row | over Go | over Go tuned |
|---|---|---|
| /alloc c32 | 6.039 | 1.268 |
| /alloc c256 | 3.375 | 1.378 |
| /hello c32 | 1.288 | 1.150 |
| /hello c256 | 1.821 | 1.225 |

- Go's default `/alloc` row is weak because its collector runs about
  1,000 times a second on this server's small live heap (counted in the
  0.44.0 run: 12,559 to 12,710 collections in about 12 s of load,
  against 115 with the memory limit;
  [release-vs-go-v0.44.0-http-gotuned.md lines 74-102](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.44.0-http-gotuned.md#L74-L102)).
  Compare with the tuned column for Go's best case: Xo serves 1.27 to
  1.38 times its rate on `/alloc`, at 0.004 (c32) and 0.011 (c256) of its
  peak memory.
- At fixed open loop rates (10,000 and 20,000 requests a second, 64
  connections) all three serve the rate; Xo's p99 is 110 and 139 µs, Go's
  387 and 731 µs, tuned Go's 128 and 152 µs
  ([lines 26-33](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64-http.md#L26-L33)).

### Against 0.44.0

The released 0.44.0 ran as a third server in the same rounds, built at
four code alignments so that placement cannot decide it
([lines 66-93](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64-http.md#L66-L93)): `/alloc` is 6.4% (c32) and 9.3% (c256)
faster than 0.44.0, at about 8% less CPU per request; `/hello` is 0.6%
(c32) and 1.0% (c256) slower, a small difference whose ranges do not
overlap.

## Compile time, binary size and build memory

Xo 0.50.1 against Go 1.26.1 on linux/arm64, one build each, wall
milliseconds and the build's peak resident memory, each tool with its
default caches (Go's build cache; Xo's back-end caches and its run cache)
([release-vs-go-v0.50.1-linux-arm64.md lines 24-44](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1-linux-arm64.md#L24-L44)).
Cold empties every cache; warm is the third unchanged build; edit is a
build after one function is appended. The like-for-like row is `coll`,
one program on each side:

| | cold ms | warm ms | after an edit ms | peak MB cold / warm / edit | binary MB |
|---|---|---|---|---|---|
| Go | 1300 | 20 | 79 | 313 / 21 / 68 | 2.30 |
| Xo | 1203 | 11 | 67 | 233 / 12 / 66 | 2.25 |

- **Cold builds** are a little faster than Go's (1150 to 1376 ms for the
  Xo programs, 1300 to 1362 ms for Go's three) at a lower peak (227 to
  236 MB against 301 to 313 MB).
- **Unchanged rebuilds** take 5 to 18 ms and 12 MB, against Go's 19 to 20
  ms and 21 to 23 MB: Xo's run cache answers them. The second build after
  a cold one is slower (51 to 82 ms): it is the first that compiles
  against std's precompiled variants, which the cold build starts in the
  background.
- **After an edit**, every program rebuilds faster than Go's: 49 to 75 ms
  against Go's 70 to 79 ms.
- **Binaries are about Go's size on linux/arm64**: 2.14 to 2.31 MB
  against Go's 2.29 to 2.30 MB.
- **A large program**: a program linking the Azure compute client
  (armcompute, 63 files) against Go's armcompute v9.0.0, on the Mac
  ([release-vs-go-v0.50.1.md lines 122-133](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1.md#L122-L133)): cold 0.66 s
  and 262 MB against Go's 4.6 s and 924 MB (with std's variants already
  built, as after any earlier build; 3.4 s and 545 MB for a fresh
  install's first program), unchanged 38 ms against 106, an edit 226 ms
  against 304, binary 6.11 MB against 9.28.

## Where Xo is behind or even

- **The four slower run rows** above: sieve, rwmutex, pmap and nbody.
- **Warm rebuilds with the run cache off**: a diagnostic, not the
  default: `coll` then rebuilds unchanged in 92 ms at 65 MB against Go's
  20 ms at 21 MB
  ([lines 51-72](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1-linux-arm64.md#L51-L72)): the front end still reads std's
  declarations and checks the program's modules on every build.
- **Cold test builds use more memory**: `xo test` of the base64 and
  json ports takes 0.209 to 0.767 of `go test`'s wall time, but 1.093
  and 1.135 times its peak memory on a cold run, above (after an edit
  1.003 and 0.921, against 1.937 and 1.442 in 0.46.0).
  The peak is the compiler's own heap, not the test binary: parse trees
  of std's declarations, and every std module that imports the edited
  one checked again
  ([perf-gaps-2026-11-10.md lines 41-60](https://github.com/xo-lang/xo/blob/main/bench/results/perf-gaps-2026-11-10.md#L41-L60)).
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

- **Host**: every row on this page ran on the linux/arm64 timing host
  (Linux aarch64, 12 CPUs, 39 GB); the HTTP rows put the server on CPUs
  0 to 5 and the load generator on 6 to 11.
- **Go**: go1.26.1 for every row on this page.
- **Rounds**: 3 per row for the release benchmarks and std's tests, 12
  for the HTTP rows (3 at each of four code alignments), 5 per case for
  the survey (alternating, medians of wall time).
- **Ratios**: Xo's median over Go's median for the same metric.
  `xo bench --ab` also prints the 95% interval and calls a row better or
  worse only when the interval excludes 1. Run it yourself with
  `xo bench --ab A B` on two built programs (see the
  [toolchain reference](/docs/toolchain/)).
- **Scripts**: `scripts/release-vs-go.sh` (run, compile, test, HTTP),
  `scripts/release-vs-go-http.sh` (both Go columns) and
  `scripts/twincheck -time` (the survey), all in the repository.
- This page is refreshed with each release's run.

## Earlier releases

- 0.40.0 on darwin/arm64 (the release benchmarks, compile time, binary
  size and std's tests):
  [release-vs-go-v0.40.0.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.40.0.md).
- 0.44.0's HTTP run against Go at its defaults and tuned:
  [release-vs-go-v0.44.0-http-gotuned.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.44.0-http-gotuned.md).
- Every release's report is in
  [bench/results](https://github.com/xo-lang/xo/tree/main/bench/results)
  (`release-vs-go-*.md`).
