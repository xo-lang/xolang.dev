---
title: "What Go trades for its design vs Xo"
date: 2026-11-03T18:00:00-05:00
draft: false
description: "Go's runtime and toolchain make deliberate trades: heap headroom for cheap concurrent collection, growable stacks for cheap goroutines, package-level caching for simple builds, fused multiply-add for speed. This post walks through how each one works inside Go 1.26.1, what it costs, what Xo does instead, and the measurements, including the places where Go is faster."
---

Go is a set of trades, made on purpose and written down. A tracing
collector that runs beside your code buys short pauses and costs heap
headroom. Goroutine stacks that start small and grow buy cheap
concurrency and cost a stack per blocked goroutine. Xo, a language
whose compiler is written in Xo, made different choices in the same
places. This post takes each trade in turn: what Go does, why, what it
costs, what Xo does instead, and what we measured. Go wins some of
these, and those are here too, with the reason.

Two rules hold for every number below. Each Xo or Go figure links to
the committed results file and line it comes from. Each claim about
Go's internals links to Go's source, specification or documentation at
go1.26.1.

Ratios are Xo divided by Go: below 1.0, Xo used less time or memory;
above 1.0, Go did. The machines are an M-series Mac (darwin/arm64) and a
12-CPU linux/arm64 host; Go is 1.26.1 throughout.

{{< figure "go-trades-summary" "Every comparison in this post, Xo divided by Go on a log scale. Sources are in the table at the end." "A dot plot. Below 1.0, where Xo used less: push peak memory 0.40, putget 0.88, /alloc p99 at 10,000 requests a second 0.28 and p99.9 0.27, the HTTP service edit build 0.64, fib edit build 0.80. Above 1.0, where Go used less: coll warm build peak memory 1.88, nbody 1.06, strconv itoa 1.35, strings trim 1.62, bcrypt hash 1.44. Also below 1.0, from the standard library: walkdir entries 0.91, dns mx 0.93, otp sha512 0.94, idna mixed 0.94, norm nfc 0.70." >}}

### Memory: headroom for a collector that runs beside you

**What Go does.** Go's collector is a concurrent mark and sweep with a
write barrier, "non-generational and non-compacting"
([runtime/mgc.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgc.go#L7-L9)).
It stops the world twice per cycle, briefly: at sweep termination and
at mark termination
([mgc.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgc.go#L24-L37)).
Everything else runs while your goroutines run.

To decide when to start a cycle, the pacer sets a heap goal. With the
default `GOGC=100`, the goal is the heap that survived the last
collection plus that much again, where "that much" also counts the
stacks and globals the collector had to scan
([runtime/mgcpacer.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcpacer.go#L1291-L1304)):

```go
c.heapMarked + (c.heapMarked+c.lastStackScan.Load()+c.globalsScan.Load())*uint64(gcPercent)/100
```

The goal never goes below 4 MiB at `GOGC=100` (by default)
([mgcpacer.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcpacer.go#L58-L60)).
`GOMEMLIMIT` can lower it, never raise it
([mgcpacer.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcpacer.go#L1002-L1008)).
Memory the collector frees goes back to the operating system through a
background scavenger capped at about 1% of the program's CPU time,
which keeps roughly 10% more than the goal implies
([runtime/mgcscavenge.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcscavenge.go#L103-L126)).

**Why.** Marking costs work proportional to the live heap. Letting the
heap grow to twice its live size before the next cycle spreads that
cost over as many allocations as there are live bytes, so the
collector's share of CPU stays bounded no matter how fast the program
allocates. The [GC guide](https://go.dev/doc/gc-guide#GOGC) covers the
trade in depth.

**What it costs.** Between collections the heap holds garbage: up to
the goal, not all the time, but the peak a container limit or a
machine's memory has to cover is the goal.

**What Xo does instead.** Xo counts references. A value is freed when
its last reference goes away, so the heap holds what is live plus
whatever freed memory the allocator keeps for reuse; since 0.37.0 that
cache is capped at a quarter of the bytes in use (the
[previous post](/blog/allocator-cache-cap/) has the details). There is
no collector to pace and no goal to grow toward.

**Measured.** Peak memory of the 0.37.0 release build against Go, in
the same job, 7 runs each
([alloc-cache-cap-2026-11-03.md, lines 110 to 112](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-cache-cap-2026-11-03.md#L110-L112)):

| program | host | Xo | Go |
|---|---|---|---|
| coll putget (3 million map puts and reads) | Linux | 8,772 KB | 9,996 KB |
| coll push (append 3 million integers) | Linux | 31,840 KB | 80,380 KB |
| coll putget | macOS | 6,288 KB | 8,864 KB |
| coll push | macOS | 26,784 KB | 58,016 KB |

Push is the case the heap goal predicts: a list that keeps doubling,
where each old backing array is garbage until the next cycle. Go's peak
also varies the most there, 55,992 to 103,240 KB across runs
([line 116](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-cache-cap-2026-11-03.md#L116)), because
where a cycle lands relative to a doubling decides how much garbage the
peak includes.

**Pauses.** Go's stop-the-world phases are short; the cost of a
collector shows more in the far tail, when a request lands during
marking and its goroutine is made to help mark in proportion to what it
allocates
([runtime/mgcmark.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcmark.go#L495-L499)). On a JSON endpoint (`/alloc`: a 200-item page
built and encoded per request) at the same offered load, 10,000
requests a second from 64 connections, 5 rounds each
([release-vs-go-v0.36.0.md, lines 498 to 500](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.36.0.md#L498-L500)):

| server | p50 | p99 | p99.9 | max | CPU per request |
|---|---|---|---|---|---|
| Xo 0.36.0 | 79 us | 111 us | 138 us | 211 us | 52.7 us |
| Go 1.26.1 | 100 us | 392 us | 507 us | 864 us | 122.2 us |

Two cautions. Go's handler spends more than twice Xo's CPU per request,
so its tail holds encoding time as well as collection; the table does
not split the two. And on the plain `/hello` endpoint, where almost
nothing is allocated, the worst single requests of both servers are 4 to
14 ms and Xo's max is lower in only 8 and 4 of 20 rounds: the host's
pauses, not either runtime's
([jitter-2026-10-30.md, lines 37 to 41](https://github.com/xo-lang/xo/blob/main/bench/results/jitter-2026-10-30.md#L37-L41)).

**What Xo pays instead.** Reference counting does work on every copy
and every drop that a tracing collector never does. That cost shows up
below, in the string trims.

### Stacks: a goroutine keeps its stack while it waits

**What Go does.** A goroutine starts with a small stack: 2 KiB minimum
([runtime/stack.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go#L75-L83)),
or since Go 1.19 the average stack size the last collection scanned
([stack.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go#L1386-L1429)).
When a function needs more, the runtime allocates a stack twice the size
and copies the old one into it
([stack.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go#L1148-L1150));
a collection halves a stack that uses less than a quarter of itself
([stack.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/stack.go#L1285-L1299)).
A goroutine blocked on a network read is parked by the netpoller
([runtime/netpoll.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/netpoll.go#L548-L575))
and keeps its stack and its `g` record, 448 bytes plus per-architecture
register state on 64-bit systems
([runtime/sizeof_test.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/sizeof_test.go#L18-L24)).

**Why.** Goroutine per connection is the simplest server model there
is: straight-line code, blocking calls, no callbacks. Small growable
stacks make it affordable for hundreds of thousands of goroutines.

**What it costs.** A blocked goroutine costs its stack, sized to what
it used at its deepest. Go's design is very good at this: on our idle
connection server, Go held 21 KB per idle HTTP/1 connection at 5,000
connections and 44 KB per idle HTTP/2-over-TLS connection, its goroutine
stacks included, all in one heap
([decision 0449, lines 15 to 20 and 32 to 33](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0449-idle-connection-memory.md#L15-L33)).

**What Xo did first, and lost.** Xo's tasks run on fibers, each with its
own mapped stack and a guard page below it. At 5,000 idle HTTP/2
connections that was 91 KB per connection against Go's 44, 10,323
memory mappings against Go's 108, and a hard ceiling: Linux's default
limit of 65,530 mappings stops an Xo server near 32,000 idle connections
([decision 0449, lines 15 to 40](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0449-idle-connection-memory.md#L15-L40)).
Go has no such ceiling, because a goroutine stack is heap memory.

**What Xo does instead.** Rather than make each stack cheaper, Xo stopped
keeping one for an idle connection. A connection waiting for bytes is a
registration in the poller, and its fiber's stack goes back to a cache;
when bytes arrive, a task starts on a fresh stack, handles them and parks
again (decision 0449). At 40,000 idle connections
([decision 0449, lines 202 to 205 and 224 to 228](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0449-idle-connection-memory.md#L202-L228)):

| connections | Xo per connection |
|---|---|
| 40,000 HTTP/1 | 6.4 KB |
| 40,000 HTTP/2 over TLS | about 23 KB |

Go was measured at 1,000 and 5,000 connections, not 40,000, so the fair
reading is "Xo below Go's 44 to 53 KB", not a ratio. Parking also costs
time when it is used wrongly: parking every connection between requests
cost a busy server 10.6% of its throughput, so a connection whose last
request came within 2 ms waits on its own stack instead, which brings
the cost to 0.6%, within noise
([decision 0449, lines 234 to 248](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0449-idle-connection-memory.md#L234-L248)).

### Builds: a cache per package, a full link per binary

**What Go does.** `go build` keys every compile on an action ID, a hash
of everything that goes into it
([cmd/go/internal/cache/cache.go](https://github.com/golang/go/blob/go1.26.1/src/cmd/go/internal/cache/cache.go#L28-L34)).
A package's key includes the content ID of each package it imports
([cmd/go/internal/work/exec.go](https://github.com/golang/go/blob/go1.26.1/src/cmd/go/internal/work/exec.go#L428-L432)),
and a content ID is a hash of the whole compiled archive
([buildid.go](https://github.com/golang/go/blob/go1.26.1/src/cmd/go/internal/work/buildid.go#L691-L700)).
So a change to a function body changes that package's archive, which
changes the key of every package that imports it, which recompiles
them too, up the import graph. The link is skipped only when nothing
changed; any change relinks the whole binary
([exec.go](https://github.com/golang/go/blob/go1.26.1/src/cmd/go/internal/work/exec.go#L1595)).

**Why.** Package-level keys are simple and always correct: `go help
cache` promises the cache "correctly accounts for changes to Go source
files, compilers, compiler options, and so on". The Go compiler is fast
enough that recompiling a package's importers is usually cheap.

**What it costs.** An edit to a package near the bottom of the import
graph recompiles everything above it, and every edit relinks the whole
binary.

**What Xo does instead.** Xo 0.34 compiles each module separately and
keeps the standard library's compiled records, so an edit rebuilds the
edited module and links. Median of 20 edits on the Mac, each followed by
a build
([sepcomp-edit-final-2026-10-29.md, lines 5 to 8](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L5-L8)):

| edit | Xo 0.33.0 | Xo 0.34 | go build |
|---|---|---|---|
| fib | 230.8 ms | 70.2 ms | 87.7 ms |
| an HTTP service | 570.5 ms | 156.0 ms | 245.5 ms |

**Where Go wins: a build with nothing to do.** When nothing changed, Go
finds every package in its cache and skips the link. On the release
comparison
([release-vs-go-v0.36.0.md, lines 116, 117 and 126](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.36.0.md#L116-L126)),
`coll` builds a second time in 30 ms with Go against 130 ms with Xo,
and a warm build peaks at 25 MB of memory with Go against 47 MB with Xo.
Cold builds go the other way (1,370 ms Go, 920 ms Xo), and Xo's binaries
are smaller (1.39 MB against 2.43 MB for `coll`).

### Floats: fused multiply-add and reproducibility

**What Go does.** The specification lets a compiler fuse operations:
"An implementation may combine multiple floating-point operations into
a single fused operation, possibly across statements, and produce a
result that differs from the value obtained by executing and rounding
the instructions individually"
([spec, Floating-point operators](https://go.dev/ref/spec#Floating_point_operators)).
On arm64 the gc compiler turns `a + x*y` into one `FMADD` instruction
([ARM64.rules](https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/ssa/_gen/ARM64.rules#L1772-L1782)),
as it does on loong64, ppc64, riscv64 and s390x. On amd64 it fuses only
when built for `GOAMD64=v3` or later
([AMD64.rules](https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/ssa/_gen/AMD64.rules#L1519-L1520)).
An explicit conversion, `float64(x*y) + z`, rounds the product and
prevents the fusion.

**Why.** A fused multiply-add is one instruction instead of two, and it
rounds once instead of twice, so each fused operation is at least as
accurate as the pair it replaces.

**What it costs.** Reproducibility, not accuracy. The same Go program
can print different digits on arm64 and on an amd64 build below v3,
because one fused and the other rounded in between.

**What Xo does instead.** Xo rounds every operation, on every backend
and every architecture: `a * b + c` is a multiply and an add, each
rounded, and a fused operation is written `a.fma(b, c)`
([decision 0385](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0385-explicit-fma.md)). A test
program fails if any backend fuses
([decision 0287, lines 41 to 43](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0287-strconv-math-netip.md#L41-L43)).
The same program prints the same digits on every backend and
architecture.

**Where Go wins: nbody.** The n-body simulation is all `x*y + z`. Go
runs it in 162.3 ms against Xo's 171.3 ms, 1.056 times
([release-vs-go-v0.36.0.md, line 175](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.36.0.md#L175)).
Xo executes 13% fewer instructions (2.616 G against 3.015 G) and still
takes 5.6 to 6.9% more cycles
([nbody-vs-go-2026-10-27.md, lines 17 to 22](https://github.com/xo-lang/xo/blob/main/bench/results/nbody-vs-go-2026-10-27.md#L17-L22)):
Go's inner loop has 8 `fmadd`/`fmsub` per pair of bodies, and each one
is a single rounding and a single latency on a dependency chain where
Xo's is two
([lines 24 to 26 and 53 to 58](https://github.com/xo-lang/xo/blob/main/bench/results/nbody-vs-go-2026-10-27.md#L24-L58)).
No other cause was found. This is the price of reproducible floats, and
Xo pays it on purpose.

### Interface calls, escape analysis and bounds checks

Go calls an interface method through the function table of its `itab`
([internal/abi/iface.go](https://github.com/golang/go/blob/go1.26.1/src/internal/abi/iface.go#L14-L18)), devirtualizes
calls it can prove or, with a profile, guesses
([devirtualize.go](https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/devirtualize/devirtualize.go#L5-L11)),
keeps values that do not escape on the stack
([escape.go](https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/escape/escape.go#L23)) and removes
bounds checks its prove pass can show are redundant
([prove.go](https://github.com/golang/go/blob/go1.26.1/src/cmd/compile/internal/ssa/prove.go#L1496)); `go build
-gcflags='-m -d=ssa/check_bce/debug=1'` prints both decisions. We have no
committed measurement of Xo against Go for any of these, so this post
makes no claim about them. The one number we have is Xo's own, from 2026-10-18: bounds
check branches are 4.71% of the instructions Xo executes on its
collection benchmark
([go-compiler-audit-2026-10-18.md, line 54](https://github.com/xo-lang/xo/blob/main/bench/results/go-compiler-audit-2026-10-18.md#L54)).

### Where Go is faster, and why

Beyond nbody and the warm build, the clearest losses are in the
standard library, measured against Go's own packages on the Linux host
(15 rounds each, or 6 to 7 with `--early` where noted).

**strconv itoa, 1.35** ([std-twin-strconv-2026-11-03.md, line 3](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-strconv-2026-11-03.md#L3), 6 rounds with `--early`; it was 1.52 before a change to how views are returned, [std-twin-rows2-2026-11-03.md, line 78](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md#L78)).
Go formats 0 to 99 as a slice of a constant 200-byte table, with no
allocation
([internal/strconv/itoa.go](https://github.com/golang/go/blob/go1.26.1/src/internal/strconv/itoa.go#L150-L174));
larger numbers are cut into 9-digit chunks done in 32-bit arithmetic,
two digits per step
([itoa.go](https://github.com/golang/go/blob/go1.26.1/src/internal/strconv/itoa.go#L191-L207)). Both languages then
allocate the result string, and that is where Xo's time goes
([std-twin-rows3-2026-11-03.md, lines 38 to 39](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md#L38-L39)).
Go's small allocation takes a free slot from the current processor's
cache without a lock
([runtime/malloc.go](https://github.com/golang/go/blob/go1.26.1/src/runtime/malloc.go#L27-L33)) and never frees it
one at a time: a later sweep reclaims it with the rest. Xo frees each
string when it is dropped. The memory column goes the other way: Xo
peaks at 0.143 of Go's memory on the same run.

**strings trim, 1.62** ([std-twin-trimchars-2026-11-03.md, line 20](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-trimchars-2026-11-03.md#L20), 6 rounds with `--early`).
A Go substring is a pointer and a length into the same bytes, and the
collector keeps those bytes alive as long as any substring points into
them: taking one costs nothing, and dropping one costs nothing. Go's trim
also tests ASCII cut sets against a 32-byte bitmap
([strings.go](https://github.com/golang/go/blob/go1.26.1/src/strings/strings.go#L952-L993)). An Xo trim result is a
view too, and until this week each view held a counted reference to its
text, so taking and dropping one were an increment and a decrement: the
row was 2.24
([std-twin-rows2-2026-11-03.md, line 45](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md#L45)).
Xo now returns a view of a borrowed argument without a count, which
took it to about 1.55
([std-twin-trimchars-2026-11-03.md, lines 9 and 13](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-trimchars-2026-11-03.md#L9-L13)).
What is left has no single cause: the profile spreads over the ASCII
bitmap and the Unicode rune loops
([line 14](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-trimchars-2026-11-03.md#L14)).

**bcrypt hash, 1.44** ([std-twin-rows9-2026-11-03.md, lines 21 and 38](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows9-2026-11-03.md#L21-L38)).
Blowfish's state is four S-boxes of 256 32-bit words, which Go's
x/crypto stores as `[256]uint32`
([blowfish/cipher.go](https://github.com/golang/crypto/blob/v0.58.0/blowfish/cipher.go#L27)); Xo's integers are 64-bit, so its state is 8 KiB against Go's 4
KiB, and each word is masked back to 32 bits. Removing Xo's bounds checks
here did not help (1.42 to 1.58 on the Mac), so they are not the cost.
These rows are being re-measured.

Some rows that were losses earlier are even or better now. Walking a
directory tree was 1.54: Xo's walk asked for each entry's status, with
`statx` 36% of its profile, where Go's `WalkDir` takes each entry's type
from the directory read itself and calls `Lstat` only when the file
system does not report one
([path/filepath/path.go](https://github.com/golang/go/blob/go1.26.1/src/path/filepath/path.go#L419-L423),
[os/file_unix.go](https://github.com/golang/go/blob/go1.26.1/src/os/file_unix.go#L478-L487);
[std-twin-rows4-2026-11-03.md, lines 10 to 13](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows4-2026-11-03.md#L10-L13)).
Xo now has the same walk, `walk_dir_entries`, which takes the type from
the directory read and stats nothing: 0.91 of Go's `WalkDir`
([std-twin-walkdir-2026-11-03.md, line 9](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-walkdir-2026-11-03.md#L9)).
jpeg decode
is 1.007 and decode with RGBA conversion 1.039 of Go's wall, at under
half its peak memory
([std-twin-rows6-2026-11-03.md, lines 7 to 8](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows6-2026-11-03.md#L7-L8)).
A DNS MX lookup is 0.928, where it was 4.66: a lookup now waits for its
reply on the netpoller while other tasks run
([dns-netpoll-2026-11-03.md, lines 38 and 40](https://github.com/xo-lang/xo/blob/main/bench/results/dns-netpoll-2026-11-03.md#L38-L40)).
TOTP with SHA-512 is 0.937, after SHA-512 moved to arm64's SHA-512
instructions
([std-twin-otp-2026-11-03.md, line 13](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-otp-2026-11-03.md#L13)).
Every IDNA workload is at or below Go's x/net/idna (mixed 0.94, long
0.94)
([std-twin-idna-2026-11-03.md, lines 50 to 57](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-idna-2026-11-03.md#L50-L57)),
and Unicode normalization is below x/text's: NFC 0.70
([std-twin-norm-2026-11-03.md, line 35](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-norm-2026-11-03.md#L35)),
NFD 0.925 and NFKC 0.70
([lines 24 to 25](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-norm-2026-11-03.md#L24-L25)).

### Every comparison in one place

| comparison | Xo | Go | Xo / Go | source |
|---|---|---|---|---|
| coll push peak memory, Linux, 0.37.0 | 31,840 KB | 80,380 KB | 0.40 | [alloc-cache-cap-2026-11-03.md#L112](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-cache-cap-2026-11-03.md#L112) |
| coll putget peak memory, Linux, 0.37.0 | 8,772 KB | 9,996 KB | 0.88 | [alloc-cache-cap-2026-11-03.md#L112](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-cache-cap-2026-11-03.md#L112) |
| /alloc p99 at 10,000 req/s | 111 us | 392 us | 0.28 | [release-vs-go-v0.36.0.md#L498-L500](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.36.0.md#L498-L500) |
| /alloc p99.9 at 10,000 req/s | 138 us | 507 us | 0.27 | same |
| edit build, HTTP service | 156.0 ms | 245.5 ms | 0.64 | [sepcomp-edit-final-2026-10-29.md#L8](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L8) |
| edit build, fib | 70.2 ms | 87.7 ms | 0.80 | [sepcomp-edit-final-2026-10-29.md#L7](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L7) |
| coll warm build peak memory | 47 MB | 25 MB | 1.88 | [release-vs-go-v0.36.0.md#L117-L126](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.36.0.md#L117-L126) |
| nbody wall | 171.3 ms | 162.3 ms | 1.056 | [release-vs-go-v0.36.0.md#L175](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.36.0.md#L175) |
| strconv itoa | 116.3 ms | 86.24 ms | 1.348 | [std-twin-strconv-2026-11-03.md#L3](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-strconv-2026-11-03.md#L3) |
| walkdir, entries only | 248.7 ms | 272.1 ms | 0.91 | [std-twin-walkdir-2026-11-03.md#L9](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-walkdir-2026-11-03.md#L9) |
| strings trim | 26.28 ms | 16.27 ms | 1.62 | [std-twin-trimchars-2026-11-03.md#L20](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-trimchars-2026-11-03.md#L20) |
| bcrypt hash | 1,754 | 1,219 | 1.439 | [std-twin-rows9-2026-11-03.md#L21](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows9-2026-11-03.md#L21) |
| dns mx | 19.38 ms | 20.87 ms | 0.928 | [dns-netpoll-2026-11-03.md#L38](https://github.com/xo-lang/xo/blob/main/bench/results/dns-netpoll-2026-11-03.md#L38) |
| otp sha512 | 181.1 ms | 193.1 ms | 0.937 | [std-twin-otp-2026-11-03.md#L13](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-otp-2026-11-03.md#L13) |
| idna mixed | 20.22 ms | 21.49 ms | 0.94 | [std-twin-idna-2026-11-03.md#L52](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-idna-2026-11-03.md#L52) |
| norm nfc | 64.49 ms | 91.55 ms | 0.70 | [std-twin-norm-2026-11-03.md#L35](https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-norm-2026-11-03.md#L35) |

Ratios with two figures given are computed from those medians; the
rest are the `--ab` ratios the files report. None of this says one
design is better. Go's choices buy a simple model and fast warm builds,
and they cost memory headroom and a tail; Xo's choices buy steady
memory and reproducible floats, and they cost time on every reference
count and every unfused multiply-add.
