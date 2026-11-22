---
title: "Hunting a slow heap growth under huge pages"
date: 2026-11-20T09:00:00-05:00
description: "A server with a small, flat live heap grew its resident memory 7 to 10% over an hour on Linux, under Xo's default huge page policy. How we found the two bugs behind it (one hour runs, per-minute heap counters, and turning off one path at a time), the fix that made a second, quieter bug worse, and the rule that came out of it."
draft: false
---

On Linux, Xo's heap asks the kernel for transparent huge pages only where
a thread allocates densely. The policy is called `XO_THP=dense` and it is
Linux's default ([decision 0456](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0456-thp-dense.md)).
This post is about two bugs in it that took an hour of running to show,
the method that found them, and a fix forward that the first fix needed.

## Why the heap has a huge page policy at all

A huge page on arm64 and x86-64 Linux is 2 MiB. One page table entry
covers it, so a program that touches a lot of memory spends less time in
TLB misses. The cost is density: the first touch of a 2 MiB range that
the kernel backs with a huge page makes all 2 MiB resident, even if the
program uses a few kilobytes of it.

Xo's heap hands each thread its own 4 MiB chunks. Under the kernel's
`always` setting, with no advice from the program, those chunks were 13
to 23% filled, and a heap holding 2,000 TLS connections took 95 to 108 MB
against 40 to 56 MB with huge pages off (decision 0456's context).
Turning them off everywhere (`XO_THP=off`, [decision 0454](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0454-heap-huge-pages.md))
cost the compiler's self build 7.5% CPU. So dense sits in between:

- every chunk is mapped `MADV_NOHUGEPAGE` at first;
- a thread's record opens only the first 2 MiB half of its first chunk;
  when it uses that half up, it advises the second half `MADV_HUGEPAGE`
  and opens it;
- once a record has used a whole chunk, that chunk and the next one are
  advised `MADV_HUGEPAGE`, since the thread has shown it fills memory.

None of this is on the allocation fast path. It all happens when a record
needs more memory (`heapos.chunk`, `reserve`, `extend`, `thp_filled` in
`std/native/llrt/heapos.xo`).

## The symptom

Every std module in Xo has to pass a stress run before it counts as
Proven: 64 tasks for 30 minutes, with a bound on how much the resident
set grows from a mark partway in to the end. grpcreflect's server passed
at 30 minutes. At 60 minutes, on linux/arm64, it grew 7 to 10% from
minute 30 to the end, past the 5% bound, while its heap's chunk count
rose from 16 to 22 (commit 912f87eb2). The live heap itself was small and
flat. Nothing was leaking: memory was being mapped and made resident
faster than the program needed it.

Two other things made this slow to see:

- **30 minutes was too short.** At 30 minutes the bound is 10%, and the
  runs with the bug and without it both passed (the gotcha
  [dense-thp-pool-run-drops-half.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/gotchas/dense-thp-pool-run-drops-half.md)).
  Every experiment needed a full hour.
- **Runs sharing a host lie.** Two 60 minute runs started together on an
  18 core host grew 34% and 25%. The same two trees run one after the
  other grew 3% and 3%, and 3% and 2% (commit ce495969a). Each stress
  program runs 64 tasks; two of them starve each other and do a third of
  the work, so the heap they measure is shaped by scheduling, not by the
  allocator. From then on, every comparison ran alone, with an exclusive
  lease, both sides on the same host.

## The method

The tools were all ones Xo already ships:

- `XO_HEAPSTATS=pages`, which prints the heap's chunks, its pages and
  their free blocks at exit, including how many pooled units a record
  took;
- the per-minute heap lines a stress program logs from `/debug/sched`,
  so a run shows when chunks were added, not only how many there were at
  the end;
- and a diagnostic branch, never pushed, where each piece of dense's
  policy could be turned off on its own.

Then one hour run per question. With huge pages off entirely, chunks
stayed at 16 and the heap took no pooled units. With dense on but its
halves turned off (`dense_halves()` returning false, so chunks are
reserved and extended as under off), chunks also stayed at 16 and growth
stayed at 4 to 6%. With the halves on, the heap took 240 to 369 pooled
units and chunks rose to 22 (the gotcha). So the halves were the cause.

One guess was wrong on the way. When a record reuses a pooled run,
`pool_take` advised it `MADV_HUGEPAGE` again, which looked like it would
let the kernel fill in pages the sweep had given back. Turning only that
advice off still grew 7.0% on both 60 minute runs. The misplaced advice
was coming from somewhere else.

## The two bugs

Reading `heapos.xo` with the halves pinned down found both (912f87eb2):

1. **The reserved half was dropped.** When a record needs memory,
   `heap_grow` calls `pool_take` (reuse a run of pages another record
   gave back) before `chunk()` extends the record's own chunk. A record
   whose first half was used up, with its second half still reserved,
   took a pooled run instead. `pool_take` then marked the record's
   limit word as if it had no half left, so the reserved half was never
   opened and the record mapped a new chunk sooner. That is the chunk
   count rising from 16 to 22.
2. **The huge page advice landed in the wrong place.** When that pooled
   run was used up, `chunk()` passed the run's end to `thp_filled` as if
   it were the end of a filled chunk. `thp_filled` advised the 4 MiB
   before it `MADV_HUGEPAGE`. That range was inside some other chunk,
   and among its pages were units the sweep had given back to the kernel.
   khugepaged, the kernel thread that collapses advised ranges into huge
   pages, filled them in again. That is the resident set creeping up
   while the live heap stayed flat.

The fix: `pool_take` returns false while the record can still extend into
its own half, it marks the limit word as a run rather than an empty half,
and `chunk()` passes no filled end after a run. `heapos_test.xo` got one
test for each bug, and both fail before the fix on linux/arm64.

## The fix made a quieter bug louder

The guard after the fix did not pass. On linux/arm64 host 2,
grpcreflect's 60 minute stress grew 14%, where it had grown 2% before.
Separately, another agent's gate failed `TestRuntimeHeapIdleTHP`: an idle
program's resident set fell to about 6.4 MB, then at about 140 seconds
AnonHugePages rose from 0 to 6 MB and the resident set to 12 MB (commit
385cc9dd8 and the gotcha's follow-up).

The first fix opens reserved halves instead of taking pooled runs, so
far more memory sat in halves that had been advised `MADV_HUGEPAGE`.
That exposed two paths that had always been wrong but rarely ran:

- `advise()`, which the idle age pass and trim use to give a free page
  block back, called only `MADV_DONTNEED`. A block inside an advised half
  kept the half's huge page advice, so khugepaged filled it in again.
- `thp_filled` advised the whole used chunk `MADV_HUGEPAGE` when the next
  chunk was mapped, which replaced the `MADV_NOHUGEPAGE` that
  `advise_run` had put on runs the sweep gave back while the chunk
  filled.

The fix forward: `advise()` also advises the block's chunk
`MADV_NOHUGEPAGE` under dense, as the scavenger already did ([decision
0676](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0676-heap-returns-idle-memory.md)),
and `thp_filled` advises only the new chunk. Each change was measured on
its own with `TestRuntimeHeapIdleTHP` on the linux/amd64 host, in KiB
over the program's start after 150 seconds idle (385cc9dd8):

| Tree | KiB over start |
|---|---|
| neither change | 9440 |
| `thp_filled` change only | 9468 |
| `advise()` change only | 3836 |
| both changes | 240 |
| 912f87eb2 reversed | 3804 |

`advise()`'s change does most of the work, and `thp_filled`'s change
only counts once `advise()` stops leaving advice behind. Both fixes
together leave the idle program within 240 KiB of where it started. Each
change has a test in `heapos_test.xo` that reads the process's `smaps`
and finds no huge page mapping where there should be none, and each
fails without its change.

With both fixes in, grpcreflect's stress ran 60 minutes three times on
linux/arm64 host 3 (64 tasks, arm64 backend, at c719f98f0): every answer as
expected, and the resident set grew 2.0%, 8.0% and 4.0% from the mark
(the median of minutes 30 to 32) to the end (the median of the last 3
minutes), with a peak of 94 to 98 MB
([std/evidence/grpcreflect/stress.md](https://github.com/xo-lang/xo/blob/main/std/evidence/grpcreflect/stress.md)).

## What we keep from it

- **A rule for the heap.** Every path that gives pages back under dense
  also turns huge pages off for them, and no later advice turns them on
  again until the memory is reused. Three paths broke that rule in three
  different ways (a misplaced range, a missing `MADV_NOHUGEPAGE`, a
  whole-chunk re-advice), so it is now written down as a rule, not left
  as three separate fixes.
- **Measure long enough, and alone.** A bug that shows only between
  minute 30 and minute 60 needs one hour runs, and runs that share a
  host measure each other. Both are now in the knowledgebase as gotchas,
  and the stress bar past 30 minutes takes its mark halfway and allows 5%.
- **Disable one thing at a time.** Each one hour run answered one
  question: off against dense, halves against no halves, advice against
  no advice. The guess that looked most likely (`pool_take`'s re-advice)
  was the one the runs ruled out.
- **A fix can raise the traffic on old code.** The first fix was right,
  and it made a path that rarely ran start running all the time. The
  guard caught it the same day, and a test the gate already ran
  (`TestRuntimeHeapIdleTHP`) showed it in a few minutes rather than an
  hour.
