---
title: "Edit, build, run: how Xo 0.34 cut the edit loop to a third"
date: 2026-10-29T07:30:00-04:00
description: "An edit in Xo 0.33 rebuilt the whole program, standard library included: 231 ms for a small benchmark, 571 for an HTTP service. Xo 0.34 compiles std once and links it as a store: 70 and 156 ms, faster than go build of the same edit. The design, the measured path, and the optimization strategies we learned on the way."
---

Xo 0.34 compiles your program separately from its standard library, on
darwin and linux (arm64 and amd64) and on windows/amd64, so an edit no
longer rebuilds std. This post is how we got there and what we learned.
Every number cites a committed results file in the
[xo repository](https://github.com/xo-lang/xo), linked where it appears.

## The problem

An edit in Xo 0.33 rebuilt the whole program: your code and every standard library function it reaches went through checking, SSA, reference counting insertion, inlining, emission and linking again. A one-line change to the `llvm-fib` benchmark took 229.0 ms median ([sepcomp-edit-fib-2026-10-28.md, line 7](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-fib-2026-10-28.md#L7)); Go's twin of the same edit, with its package cache, takes 100 ms ([release-vs-go-v0.33.0.md, line 13](https://github.com/xo-lang/xo/blob/main/bench/results/release-vs-go-v0.33.0.md#L13)). The HTTP service, which reaches far more of std, took 579.5 ms ([sepcomp-edit-http-2026-10-28.md, line 7](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-http-2026-10-28.md#L7)).

The phase table says where the time went. For fib, std's functions dominated every middle phase: ssa 37.8 ms, insert_rc 23.0, inline 23.4 ([sepcomp-edit-fib-2026-10-28.md, line 15 to 17](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-fib-2026-10-28.md#L15-L17)). None of that work depends on the line you changed.

## The design: compile std once, link it as a store

Decision 0388 splits the build into std, compiled once per xo, target and concurrency setting, and the program, compiled on every edit.

1. **std's variants.** `xo dev stdcache` builds std on its own into two artifacts, kept in the backend cache: a *store* (std's machine code, prelaid for the linker) and *facts* (what the program's compiler needs to know about each std function without its body: borrowed parameters, whether it faults, can be canceled, needs concurrency, a constant result, and an inlinable body where one helps).
2. **Separate compilation.** With the facts, a std function is an extern in the program's SSA: the program's passes see a call with known properties, not a body to lower again. Only the program's own functions and the generic instances it uses are compiled.
3. **Atoms.** The store keeps every std function, literal and unwind entry as an atom of its own, so the link keeps exactly what the program reaches and drops the rest, as a whole-program link would.
4. **Stage 2.** The checker reads std's declarations from a record instead of parsing std, and parses only the std files it needs (generic functions, a constant's initializer).
5. **The default.** A build for the host uses std's variants from the cache when they are there; a miss builds the whole program as before and starts the variants' build in the background, so no build is slower than 0.33's.

## The measured path

At the 0.34 cut, an edit builds in a third of 0.33's time, faster than `go build` of the same edit:

| edit, median | 0.33.0 | 0.34 | go build | file |
|---|---|---|---|---|
| fib | 230.8 ms | 70.2 ms | 87.7 ms | [sepcomp-edit-final-2026-10-29.md, line 7](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L7) |
| HTTP service | 570.5 ms | 156.0 ms | 245.5 ms | [sepcomp-edit-final-2026-10-29.md, line 8](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L8) |

It got there in two steps. Separate compilation alone (stage 3, std's bodies no longer lowered) took fib from 229.0 to 111.5 ms and HTTP from 579.5 to 225.0 ms ([sepcomp-edit-fib-2026-10-28.md, line 7 to 8](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-fib-2026-10-28.md#L7-L8), [sepcomp-edit-http-2026-10-28.md, line 7 to 8](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-http-2026-10-28.md#L7-L8)).

The middle phases are where the time came back: fib's ssa 37.8 to 15.7 ms, insert_rc 23.0 to 2.4, inline 23.4 to 3.0, emit 7.4 to 1.0 ([sepcomp-edit-fib-2026-10-28.md, line 15 to 18](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-fib-2026-10-28.md#L15-L18)); HTTP's ssa 93.9 to 27.9, insert_rc 59.5 to 10.1, inline 60.5 to 11.8 ([sepcomp-edit-http-2026-10-28.md, line 15 to 17](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-http-2026-10-28.md#L15-L17)). The link is now the largest phase of an HTTP edit (41.2 and 43.5 ms, [sepcomp-edit-http-2026-10-28.md, line 20](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-http-2026-10-28.md#L20)) and the next target.

Stage 2 then took the check: fib's check went from 32 to 37 ms to 18 to 19 ms, parsing 9 std files instead of 102 ([sepcomp-edit-stage2-2026-10-28.md, line 29 to 30](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-stage2-2026-10-28.md#L29-L30)); the HTTP service's from 59 to 64 ms to 27 ms in quiet rounds ([sepcomp-edit-stage2-2026-10-28.md, line 34 to 35](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-stage2-2026-10-28.md#L34-L35)). With it on by default, and the link and run cache work since, the cut's phases read: fib check 30.5 to 17.4 ms and ssa 39.0 to 6.4; HTTP check 54.9 to 25.1 and ssa 91.8 to 13.3 ([sepcomp-edit-final-2026-10-29.md, line 16 to 17](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L16-L17)). The link is now the largest phase of both edits: 16.6 of fib's 70.2 ms and 38.0 of HTTP's 156.0 ([sepcomp-edit-final-2026-10-29.md, line 22](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L22)).

And the programs it builds run as fast. Against whole-program builds of every release-vs-go workload, separate compilation is within noise or better on every row ([sepcomp-runtime-2026-10-28.md, line 33 to 54](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L33-L54)), the empty program's start is within noise too: 2.627 against 2.646 ms ([sepcomp-runtime-2026-10-28.md, line 29](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L29)), and the HTTP server serves 144,895 against 145,268 requests a second at 26.07 against 26.43 us of CPU each ([sepcomp-runtime-2026-10-28.md, line 64 to 65](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L64-L65)). The one row outside, collatz at 1.048 ([sepcomp-runtime-2026-10-28.md, line 11](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L11)), is the same machine code at another address (below).

## Optimization strategies we learned

**Decide with an A/B, explain with a profile.** Every speed claim here is an interleaved `xo bench --ab` with a 95 percent interval; sampling and instruction counts only explained. The machine's own load decides how many rounds count: with seven sessions on one Mac, an idle load of 4.4 to 5 made a fixed limit of 6 drop almost every round, and the guard now measures from the load before the run ([bench-fixed-load-limit.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/bench-fixed-load-limit.md)).

**Same instructions, different speed: placement.** collatz's separately compiled loop is instruction for instruction the one the whole program has ([sepcomp-runtime-2026-10-28.md, line 13](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L13)), yet ran 4.9 percent more cycles ([sepcomp-runtime-2026-10-28.md, line 11](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L11)). Shifting the whole program by XO_ARM64_PAD's 16 offsets gives the answer: the whole program spans 1794.9 to 1824.9 M cycles, the separate one 1781.1 to 1914.3 M, overlapping, the separate build's best below the whole program's ([sepcomp-runtime-2026-10-28.md, line 20](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L20)). The same instruction stream moved 38 percent across placements in interp ([interp-placement-2026-10-28.md, line 40](https://github.com/xo-lang/xo/blob/main/bench/results/interp-placement-2026-10-28.md#L40)). A code change is judged by its distribution over placements, not the one address it lands at.

**When startup is slow, ask dyld.** The separately compiled empty program started 6 percent slower with 3.5M more instructions ([sepcomp-runtime-2026-10-28.md, line 24](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L24)). Same code paths, same thread count; on linux/arm64, where there is no dyld, the two starts differed by under 3K instructions under callgrind. `DYLD_PRINT_BINDINGS` gave it away: 112 binds against 54, imports of std functions the link had already stripped, seven of them weak symbols libSystem lacks ([sepcomp-runtime-2026-10-28.md, line 27](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L27)). Binding only what kept code calls fixed it, and dropping the unneeded sanitizer imports made every program start faster.

**Make literals atoms.** The first separately compiled binaries carried 413.6 KB of `__TEXT,__const` against 30.9 KB ([sepcomp-runtime-2026-10-28.md, line 26](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-runtime-2026-10-28.md#L26)): each object's strings were one block, so keeping one function kept them all. One symbol per literal let the link keep only the ones a kept function names.

**Profile short programs carefully.** At 10 kHz the profiler slowed a 109 ms build 5 to 10 times and charged a task fiber's work to the main thread ([profiler-high-rate-distortion.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/profiler-high-rate-distortion.md)); at 1 kHz a 3 ms program yields no samples at all. For the empty program the answer came from counting instead: `/usr/bin/time -l` instructions and cycles, lldb breakpoints on the poller's start, callgrind's exact counts in Docker.

**Keep each run of an A/B in its own world.** One of our A/Bs measured a change that only removes work and came back 1.5 to 2.1 times slower: two scripts shared one scratch directory holding both sides' caches, std's variants and the binaries, and each began by deleting it, so a run could lose its std variant mid-measurement and rebuild it inside a timed build ([ab-scripts-shared-output-dir.md, line 8 to 9](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/ab-scripts-shared-output-dir.md#L8-L9)). The fix is a private directory per run, removed on exit, and a sanity check that a build's total equals the sum of its steps.

## What's next

- The link: now the largest phase of an edit, 38.0 of the HTTP service's 156.0 ms ([sepcomp-edit-final-2026-10-29.md, line 22](https://github.com/xo-lang/xo/blob/main/bench/results/sepcomp-edit-final-2026-10-29.md#L22)).
- More of the check from the record: the std files a build still parses
  for generic functions and constants.
