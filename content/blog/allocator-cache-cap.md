---
title: "Capping the allocator's cache: how 0.36.0 grew a small program's memory, and how 0.37.0 takes it back"
date: 2026-11-03
draft: true
description: "Xo 0.36.0's release benchmarks showed a small program peaking at 1.18 to 1.32 times its 0.35.0 memory. The extra was not live data: it was freed memory the allocator kept for reuse. 0.37.0 caps that cache at a quarter of the bytes in use, and the same programs now peak below 0.35.0 and below Go."
---

Every Xo release is measured against the one before it and against Go,
on the same programs. Xo 0.36.0's comparison flagged one result we did
not expect: `coll putget`, a small program that fills and reads a map,
peaked at 1.18 times its 0.35.0 memory on macOS and 1.32 times on
Linux. Its speed had not changed. This post covers how we found where
the memory went, what we changed for 0.37.0, and how Go handles the same
problem. Every figure links to the committed file it comes from.

### What the release benchmark saw

`coll` is bench/perf/xo, a set of collection workloads; `putget` makes 3 million
puts over 50,000 map keys and reads them back, and `push` appends 3 million
integers to a list and sums them. Against 0.35.0, the release run measured
([release-vs-go-v0.36.0.md, lines 33 to 38](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.36.0.md#L33-L38)):

- **macOS putget:** peak memory 1.182 times 0.35.0's (7,280 to 8,608 KB), wall time within noise.
- **macOS push:** 1.101 times (50,928 to 56,064 KB).
- **Linux putget:** 1.317 times (10,352 to 13,634 KB), wall time within noise.

A program that does the same work at the same speed but holds more
memory at its peak is holding memory it is not using.

### Where it went

Two bisects over the 0.36.0 commits named two changes
([decision 0448, lines 1062 to 1063](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0448-compiler-memory.md#L1062-L1063)):

1. **A new list growth curve** (c78bc379d, decision 0452). Lists now grow
   the way Go's slices do: doubling up to 256 elements, then about 1.25
   times. That saves memory in large programs, but a list that keeps
   growing reallocates more often, and each reallocation frees the old
   block.
2. **Page and large blocks** (5523fb8dd, decision 0425). Blocks of 16 KiB
   and over got their own memory, and a freed large block's mapping is kept
   in a cache (up to 16 mappings and 64 MB) so the next large allocation
   can reuse it instead of asking the kernel again.

Together they explain the rise. Every reallocation of a growing list
frees a large block, and the cache keeps it. A kept mapping's pages stay
resident, and resident pages count toward peak memory whether or not the
program uses them. At exit, putget held 14 cached mappings (8 MB) for a
heap that peaked at 6.4 MB
([decision 0448, lines 1064 to 1067](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0448-compiler-memory.md#L1064-L1067)).
The extra memory was not live data. It was freed memory kept for reuse.

### Two fixes

**Grow with room to spare.** A list or string that grows past the heap's
size classes now reserves room for four times its size, not twice
(8238745f4). It reallocates less often, so it frees fewer blocks to
cache.

**Cap the cache.** Removing the cache outright fixed the memory: putget's
peak fell to 0.624 of the build with the cache on macOS and 0.683 on Linux. But
the compiler itself needs the cache. Without it, Linux builds of `coll` ran
1.039 times as long, a concurrency benchmark's build 1.072 times, and the
compiler's build of itself 1.018 times
([decision 0448, lines 1069 to 1071](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0448-compiler-memory.md#L1069-L1071)).
So 0.37.0 keeps the cache but bounds it by the program's size: a freed
mapping is kept only while the cache stays under a quarter of the bytes
the program has in use. A small program caches little. The compiler, with
tens of megabytes to gigabytes in use, keeps all of its reuse.

{{< figure "alloc-cache-cap" "Illustrative, not measured, and not to scale. Left: Xo 0.37.0 keeps freed large blocks for reuse only while they total under a quarter of the bytes in use. Right: Go's heap grows from the live heap toward the goal its last collection set (with GOGC=100, twice the live heap at that collection) and drops back at each collection; the goal is the most the heap may reach before the next one, not what Go holds all the time. Pages the collections free are returned by the background scavenger, which keeps about 10% over what the goal implies." "Two panels of memory over a run. In Xo's, the kept freed blocks stay under a dashed line at 1.25 times live bytes. In Go's, the heap rises from the live heap to a stepped dashed goal line and drops at each collection, a sawtooth." >}}

### The results

Peak memory (maximum resident set size, KB, median of 7 runs) of the
same `coll` binary built at each step, and of the same workloads written
in Go (bench/perf/go), on macOS; the 0.37.0 row is the released build,
b6421a8c5
([alloc-cache-cap-2026-11-03.md, lines 44 to 56 and 104 to 116](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-cache-cap-2026-11-03.md#L44-L56)):

| Build | putget | push |
|---|---|---|
| Xo 0.35.0 | 7,296 | 50,944 |
| Xo 0.36.0 | 8,624 | 56,096 |
| + room for 4n | 8,288 | 41,568 |
| + cache capped | 6,304 | 26,832 |
| Xo 0.37.0 | 6,288 | 26,784 |
| Go 1.26.1 | 8,784 | 57,936 |

On Linux (arm64, transparent huge pages on, the default huge page
mode), the same builds; 0.37.0 also ships decision 0469 (see below)
([alloc-cache-cap-2026-11-03.md, lines 79 to 102 and 104 to 116](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-cache-cap-2026-11-03.md#L79-L116)):

| Build | putget | push |
|---|---|---|
| Xo 0.35.0 | 10,352 | 54,780 |
| Xo 0.36.0 | 14,348 | 58,108 |
| + room for 4n | 12,712 | 44,332 |
| + cache capped | 10,684 | 33,752 |
| Xo 0.37.0 | 8,772 | 31,840 |
| Go 1.26.1 | 9,988 | 74,276 |

0.36.0's putget is bimodal on Linux (about 12,900 or 14,400 KB a run),
which is why its median here differs from the release run's 13,634 KB.
Go's push varies the most: from 66,236 to 88,380 KB across these 7 runs,
and from 55,992 to 103,240 KB in the job that measured 0.37.0.
macOS has no huge page advice, so decision 0469 changes nothing there.

{{< figure "alloc-cache-cap-results" "Peak memory of coll putget and push for each build, relative to Xo 0.35.0 (1.0), with Go 1.26.1 for comparison. 0.37.0 is the released build (b6421a8c5), which also ships decision 0469." "Grouped bars, relative to Xo 0.35.0. macOS putget: 0.36.0 1.18, plus 4n 1.14, plus cap 0.86, 0.37.0 0.86, Go 1.20; push: 1.10, 0.82, 0.53, 0.53, Go 1.14. Linux putget: 0.36.0 1.39, plus 4n 1.23, plus cap 1.03, 0.37.0 0.85, Go 0.96; push: 1.06, 0.81, 0.62, 0.58, Go 1.36." >}}

The compiler keeps its speed. With the cap, the build of `coll` without a
binary cache ran at 0.991 of the uncapped time on macOS, the compiler's
build of itself at 1.000 on macOS and 1.003 on Linux, and the Linux edit
builds within noise
([decision 0448, lines 1077 to 1087](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0448-compiler-memory.md#L1077-L1087)).

### How Go bounds it

Go solves the same problem differently, and the comparison is worth
making exactly, so the figures below come from Go 1.26.1's runtime
source.

Go does not free an object when the program stops using it. The heap
grows until it reaches a **heap goal**, then a collection runs. With the
default GOGC=100 the goal is the heap that survived the last collection
plus 100% of it (plus stacks and globals): about twice the live heap
([mgcpacer.go, lines 1292 to 1304](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcpacer.go#L1292-L1304)),
and never under 4 MiB
([mgcpacer.go, lines 58 to 60](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcpacer.go#L58-L60)).

Pages that a collection frees are returned to the kernel by the
**scavenger**. Its goal is to keep the memory Go retains at about 10% over
what the heap goal implies (`retainExtraPercent = 10`), and its background
worker uses about 1% of the program's CPU time (`scavengePercent = 1`).
It also skips chunks of the heap that were densely used in the last cycle,
since they are likely to be reused and returning them would break up huge
pages
([mgcscavenge.go, lines 19 to 26, 70 to 78 and 103 to 126](https://github.com/golang/go/blob/go1.26.1/src/runtime/mgcscavenge.go#L19-L126)).

So Go also keeps freed memory for reuse, bounded relative to the heap,
and returns it gradually in the background. Xo frees memory as soon as a
value's last reference goes, so its live bytes track the program's real
use closely. Its bound on large blocks is simpler: a cap on the freed blocks it keeps,
checked when a block is freed. The quarter is
our choice for 0.37.0, not a figure derived from Go's.

### Huge pages, and what is left

On Linux, part of the peak is huge pages: the heap asks the kernel for
2 MiB pages once a thread allocates densely (decision 0456), and until
now the main thread's first 4 MiB chunk asked for them from the start,
so even a small program's first allocations could fault in a whole
2 MiB page. Decision 0469 drops that exception for 0.37.0: the main
thread asks for huge pages by the same rule as every other thread.
With the cache capped, putget peaked at 10,704 KB in the default mode;
without the exception it peaks at 8,696 KB, and with huge pages turned
off (`XO_THP=off`) at 5,604 KB, 0.54 of 0.35.0
([alloc-cache-cap-2026-11-03.md, lines 58 to 77](https://github.com/xo-lang/xo/blob/main/bench/results/alloc-cache-cap-2026-11-03.md#L58-L77)).

That last gap, about 3 MB for a program this small, is what huge pages
still cost putget, in exchange for fewer page faults and TLB misses in
programs that allocate a lot. Whether a small program should wait longer
before asking for them is the next question for the heap.

As always, the results files and decisions linked above have the full
numbers, including the runs that did not go our way.
