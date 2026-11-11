---
title: "std/debug"
linkTitle: "debug"
description: "A router a server mounts to profile and inspect itself while it runs: CPU and heap profiles, the ..."
toc: true
module: "std/debug"
source: "https://github.com/xo-lang/xo/blob/main/std/debug.xo"
generated: "scripts/sync-content.py from `xo doc std/debug`; edit the doc comments in the Xo repo, not this file"
---
## Index

- fn [`router`](#router)
- fn [`heap_start`](#heap_start)
- fn [`mem_budget`](#mem_budget)
- fn [`mem_label`](#mem_label)
- fn [`mem_mapped`](#mem_mapped)
- fn [`mem_peak`](#mem_peak)
- fn [`mem_total`](#mem_total)
- fn [`mem_trim`](#mem_trim)

## Functions

### router {#router}

```xo
fn router(clock: Clock, auth: fn(http.Request) -> Bool) -> http.Router uses clock
```

The router of the debug routes, to mount under a prefix of the
server's own (`r.mount("/debug", debug.router(clock, auth))`):

- `GET /profile?seconds=N&hz=H`: a CPU profile of the next N seconds
  (default 30, at most 300) at H samples per second of CPU time
  (default 100, at most 1000), answered as decision 0240's container
  (`Content-Type: application/x-xo-profile`; `xo prof URL` converts it
  to pprof files and a text summary). One profile runs at a time (409
  while one does); 501 where profiles cannot be taken (a build without
  `--profile-support`, windows, wasm). On the Go backend the answer is
  a pprof profile of Go's runtime/pprof.
- `GET /heap`: the sampled heap profile, in the same container; 409
  until the sampler runs (`XO_PROF=heap`, or `heap_start()`).
- `GET /sched`: the scheduler's counters as `name value` lines (the
  counts of `XO_RTSTATS`, zero until they are on: `?on=1` turns them
  on), and on the native backends `heap_live`, the blocks allocated
  and not yet freed, when the heap counts (`XO_LEAKCHECK`,
  `XO_HEAPSTATS` or `XO_RTSTATS` at start), and on Linux and macOS
  `fds_open`, the process's open file descriptors (files, sockets,
  pipes, the poller's own), and on the native backends
  `timers_pending`, the event loop's timers (sleeps, deadlines,
  timeouts), `heap_chunks`, the 4 MiB chunks the heap's size classes
  were carved from, and `heap_cache_bytes`, the bytes of freed large
  blocks kept mapped for reuse.

A request for which `auth` answers false gets 403.

[Source: `std/debug.xo:34`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L34)

### heap_start {#heap_start}

```xo
fn heap_start(rate: Int = 0) -> Bool
```

Starts the heap sampler while the program runs, every `rate` bytes on
average (0: 512 KiB, Go's MemProfileRate); false when it runs already
or cannot start here.
It cannot be stopped: its cost (a sample every `rate` bytes and a
table of the sampled objects) stays for the life of the process.

[Source: `std/debug.xo:41`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L41)

### mem_budget {#mem_budget}

```xo
fn mem_budget(bytes: Int)
```

Sets the heap's memory budget (decision 0349): past `bytes` mapped
from the system the program stops with status 70, "fatal error:
memory budget exceeded" and the label below; 0 turns it off.
`XO_MAX_MEM` sets it at start. Native backends only (the Go backend
ignores it).

[Source: `std/debug.xo:48`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L48)

### mem_label {#mem_label}

```xo
fn mem_label(text: Str)
```

Records the text the budget's stop prints after `while:` (at most 255
bytes; "" clears it): what the program is doing, for the report.

[Source: `std/debug.xo:52`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L52)

### mem_mapped {#mem_mapped}

```xo
fn mem_mapped() -> Int
```

The bytes the heap uses (what the budget measures: its chunks and
records as mapped, its large blocks as handed out, not the room a
growing block reserves); 0 on the Go backend.

[Source: `std/debug.xo:57`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L57)

### mem_peak {#mem_peak}

```xo
fn mem_peak() -> Int
```

The most mem_mapped has been (the high-water mark); 0 on the Go
backend.

[Source: `std/debug.xo:61`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L61)

### mem_total {#mem_total}

```xo
fn mem_total() -> Int
```

The machine's physical memory in bytes, 0 when unknown (Windows and
the Go backend for now).

[Source: `std/debug.xo:65`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L65)

### mem_trim {#mem_trim}

```xo
fn mem_trim()
```

Gives the system the pages of the free heap blocks of 16 KiB and over
of every worker thread (decisions 0448 and 0505: a task's frees land on
whichever thread ran it) and of the central lists, and on every target unmaps the cached large
blocks of 1 MiB and over: for a program that knows its live memory just
fell, as xo does after its phases that free the most. It waits up to
about 20 ms for the idle workers' trims; a worker busy in a task trims
at its next switch, which may come after it returns. The pages come
back on the next use of those blocks (a page fault each), and the next
such large block maps anew. Nothing on the Go and wasm backends.

[Source: `std/debug.xo:76`](https://github.com/xo-lang/xo/blob/main/std/debug.xo#L76)
