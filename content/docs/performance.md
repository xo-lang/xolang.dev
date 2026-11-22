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

The numbers here are from **0.55.0** on the linux/arm64 timing host (12
CPUs): the release benchmarks, compile time, build memory, binary size and
std's tests
([release-vs-go-v0.55.0-linux-arm64.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md)) and the HTTP server against
Go at its defaults and tuned, with 0.54.0 as a third server
([release-vs-go-v0.55.0-linux-arm64-http.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-http.md)), all with the published
release archive; and the survey of every `bench/perf` case of 2026-11-07
([xo-vs-go-survey-2026-11-07.md](https://github.com/xo-lang/xo/blob/main/bench/results/xo-vs-go-survey-2026-11-07.md)).
Go is go1.26.11 for the 0.55.0 rows. Earlier releases' numbers are listed
at the end.

Last verified: 2026-11-22.

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
([release-vs-go-v0.55.0-linux-arm64.md lines 118-422](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md#L118-L422)).
Wall time and peak memory (max RSS), Xo over Go:

| workload | wall | max RSS |
|---|---|---|
| fib | 0.936 | 0.166 |
| **sieve** | **1.201 (slower)** | 0.382 |
| **nbody** | **1.107 (slower)** | 0.189 |
| sort | 0.726 | 0.241 |
| interp | 0.3 | 0.216 |
| collatz | 0.914 | 0.259 |
| strings | 0.274 | 1.011 (even) |
| coll putget | 0.572 | 0.561 |
| coll get | 0.561 | 0.686 |
| coll push | 0.239 | 0.83 |
| coll update | 0.59 | 0.564 |
| coll iter | 0.232 | 0.67 |
| coll copymut | 0.618 | 0.511 |
| coll branch | 0.01 | 0.357 |
| conc spawn | 0.336 | 0.162 |
| conc fanout | 0.495 | 0.199 |
| conc pingpong | 0.898 | 0.172 |
| conc mutex | 0.289 | 0.146 |
| **conc rwmutex** | **1.123 (slower)** | 0.171 |
| **conc pmap** | **1.027 (slower)** | 0.231 |

- **Four rows are slower than Go**, as in 0.46.0's run: sieve 1.201
  (1.053 to 1.288), nbody 1.107 (1.02 to 1.357), rwmutex 1.123 (1.103 to
  1.147) and pmap 1.027 (1.014 to 1.038). `xo bench` calls the rwmutex
  and pmap rows too short to judge (a run of about 5 and 55 ms), so treat
  them as open items, not settled differences.
- **coll branch (0.01) is not a typical speedup.** The workload copies a
  map 2,000 times and adds one key to each copy. Xo's collections are
  values with structural sharing, so a copy is cheap and only the changed
  part is written, where Go's twin calls `maps.Clone` for each copy. It
  shows what that representation saves on this pattern, not how fast Xo
  code is in general.
- Peak memory is lower on every row but strings (1.011, within noise):
  0.146 to 0.83 of Go's.

## Test time: std's tests against Go's

`xo test --std-module` of the base64 and json ports against `go test` of
the Go packages they were ported from, cold (every cache emptied) and
after an edit (one function appended to the module under test), 3 rounds
([lines 424-502](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md#L424-L502)):

| test | wall | max RSS |
|---|---|---|
| base64 cold | 0.814 | **2.069 (more)** |
| base64 edit | 0.605 | **1.472 (more)** |
| json cold | 0.447 | **2.15 (more)** |
| json edit | 0.341 | **1.8 (more)** |

The edit rows are a rerun: the first run's edit rows tested the unedited
std, through a bench bug since fixed
([lines 430-436](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md#L430-L436)). Earlier releases' edit rows on Linux
ran with the same bench and are not compared here.

## HTTP server: Go at its defaults and tuned

The same JSON server in both languages (`bench/perf/jitter`), 12 rounds a
row
([release-vs-go-v0.55.0-linux-arm64-http.md lines 25-50](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-http.md#L25-L50)).
Go is measured twice: at its defaults (`GOGC=100`), and **tuned** with
`GOGC=off GOMEMLIMIT=1GiB`, which trades memory for fewer collections.
`/alloc` builds and encodes a JSON object per request; `/hello` writes a
fixed body. cN is the number of connections.

| row | server | req/s | p99 µs | CPU µs/req | peak RSS KB |
|---|---|---|---|---|---|
| /alloc c32 | Xo | 172,589 | 438 | 33.2 | 4,388 |
| /alloc c32 | Go | 28,262 | 5,452 | 118.3 | 19,948 |
| /alloc c32 | Go tuned | 132,220 | 679 | 42.9 | 1,012,888 |
| /alloc c256 | Xo | 186,712 | 3,282 | 32.0 | 10,716 |
| /alloc c256 | Go | 57,217 | 37,685 | 81.9 | 40,308 |
| /alloc c256 | Go tuned | 139,411 | 5,962 | 41.9 | 1,015,520 |
| /hello c32 | Xo | 364,054 | 227 | 7.7 | 3,182 |
| /hello c32 | Go | 273,557 | 637 | 12.5 | 17,780 |
| /hello c32 | Go tuned | 306,382 | 276 | 11.6 | 986,248 |
| /hello c256 | Xo | 883,072 | 873 | 6.5 | 6,742 |
| /hello c256 | Go | 479,421 | 2,664 | 10.2 | 24,044 |
| /hello c256 | Go tuned | 710,194 | 1,162 | 8.0 | 986,196 |

Xo over Go, requests a second
([lines 52-69](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-http.md#L52-L69)):

| row | over Go | over Go tuned |
|---|---|---|
| /alloc c32 | 6.107 | 1.305 |
| /alloc c256 | 3.263 | 1.339 |
| /hello c32 | 1.331 | 1.188 |
| /hello c256 | 1.842 | 1.243 |

- Go's default `/alloc` row is weak because its collector runs about
  1,000 times a second on this server's small live heap (counted in the
  0.44.0 run: 12,559 to 12,710 collections in about 12 s of load,
  against 115 with the memory limit;
  [release-vs-go-v0.44.0-http-gotuned.md lines 74-102](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.44.0-http-gotuned.md#L74-L102)).
  Compare with the tuned column for Go's best case: Xo serves 1.31 to
  1.34 times its rate on `/alloc`, at 0.004 (c32) and 0.011 (c256) of its
  peak memory.
- At fixed open loop rates (10,000 and 20,000 requests a second, 64
  connections) all three serve the rate; Xo's p99 is 116 and 140 µs, Go's
  389 and 779 µs, tuned Go's 128 and 157 µs
  ([lines 31-38](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-http.md#L31-L38)).

### Against 0.54.0

The released 0.54.0 ran as a third server in the same rounds, built at
four code alignments so that placement cannot decide it
([lines 54-69](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64-http.md#L54-L69)): requests a second are within 2% on every
row (`/alloc` 1.006 at c32 and 1.018 at c256, `/hello` 1.009 and 0.993).

## Compile time, binary size and build memory

Xo 0.55.0 against Go 1.26.11 on linux/arm64, one build each, wall
milliseconds and the build's peak resident memory, each tool with its
default caches (Go's build cache; Xo's back-end caches and its run cache)
([release-vs-go-v0.55.0-linux-arm64.md lines 22-48](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md#L22-L48)).
Cold empties every cache; warm is the third unchanged build; edit is a
build after one function is appended. The like-for-like row is `coll`,
one program on each side:

| | cold ms | warm ms | after an edit ms | peak MB cold / warm / edit | binary MB |
|---|---|---|---|---|---|
| Go | 1380 | 20 | 81 | 299 / 23 / 70 | 2.31 |
| Xo | 1298 | 11 | 96 | **404** / 13 / 76 | **2.62** |

- **Cold builds** take about as long as Go's (1218 to 1396 ms for the Xo
  programs, 1340 to 1380 ms for Go's three) but **peak higher: 392 to 432
  MB against Go's 290 to 313 MB.** 0.50.1 peaked at 227 to 236 MB on the
  same programs
  ([release-vs-go-v0.50.1-linux-arm64.md lines 24-44](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1-linux-arm64.md#L24-L44)),
  so this is a regression in 0.55.0.
- **Unchanged rebuilds** take 8 to 21 ms and 13 MB, against Go's 18 to 20
  ms and 21 to 24 MB: Xo's run cache answers them. The second build after
  a cold one is slower (62 to 115 ms): it is the first that compiles
  against std's precompiled variants, which the cold build starts in the
  background.
- **After an edit**, Xo takes 59 to 96 ms against Go's 70 to 81 ms:
  faster on some programs, slower on others (`coll` 96 against 81).
- **Binaries are larger than Go's**: 2.51 to 2.64 MB against Go's 2.30
  to 2.31 MB (0.50.1: 2.14 to 2.31 MB).
- **A large program** (0.50.1, on the Mac): a program linking the Azure
  compute client (armcompute, 63 files) against Go's armcompute v9.0.0
  ([release-vs-go-v0.50.1.md lines 122-133](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1.md#L122-L133)): cold 0.66 s
  and 262 MB against Go's 4.6 s and 924 MB (with std's variants already
  built, as after any earlier build; 3.4 s and 545 MB for a fresh
  install's first program), unchanged 38 ms against 106, an edit 226 ms
  against 304, binary 6.11 MB against 9.28.

## Where Xo is behind or even

- **The four slower run rows** above: sieve, nbody, rwmutex and pmap.
- **Cold build memory and binary size**, above: both grew since 0.50.1
  and are now above Go's.
- **Warm rebuilds with the run cache off**: a diagnostic, not the
  default: `coll` then rebuilds unchanged in 78 ms at 76 MB against Go's
  20 ms at 23 MB
  ([lines 49-71](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.55.0-linux-arm64.md#L49-L71)): the front end still reads std's
  declarations and checks the program's modules on every build.
- **Test builds use more memory**: `xo test` of the base64 and json
  ports takes 0.341 to 0.814 of `go test`'s wall time, but 2.069 and 2.15
  times its peak memory cold and 1.472 and 1.8 times after an edit
  (0.50.1's cold rows: 1.093 and 1.135). The peak is the compiler's own
  heap, not the test binary: parse trees of std's declarations, and
  every std module that imports the edited one checked again
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

- **Host**: every row on this page but the large program (the Mac) ran on
  the linux/arm64 timing host
  (Linux aarch64, 12 CPUs, 39 GB); the HTTP rows put the server on CPUs
  0 to 5 and the load generator on 6 to 11.
- **Go**: go1.26.11 for the 0.55.0 rows; go1.26.1 for the 0.50.1, 0.44.0
  and survey rows.
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

- 0.50.1 on linux/arm64 (compile, test) and the Mac:
  [release-vs-go-v0.50.1-linux-arm64.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.50.1-linux-arm64.md).
- The 0.46.0 cycle (release benchmarks and HTTP, main 6fe10a957):
  [release-vs-go-a67d277d6-linux-arm64.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-a67d277d6-linux-arm64.md).
- 0.40.0 on darwin/arm64 (the release benchmarks, compile time, binary
  size and std's tests):
  [release-vs-go-v0.40.0.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.40.0.md).
- 0.44.0's HTTP run against Go at its defaults and tuned:
  [release-vs-go-v0.44.0-http-gotuned.md](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.44.0-http-gotuned.md).
- Every release's report is in
  [bench/results](https://github.com/xo-lang/xo/tree/main/bench/results)
  (`release-vs-go-*.md`).
