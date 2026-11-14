---
title: "Two CPUs, three threads: chasing an HTTP server's tail under a container quota"
date: 2026-11-14T15:25:00-05:00
description: "In a 2 CPU container, Xo's HTTP server had a p99 of 58 ms where Go's was 5. The cause was a thread nobody counted, and CFS throttling stalled every thread for the rest of each 100 ms period. How we found it in /proc, the fix, a monitor that backs off like Go's sysmon, the last throttle we could not remove, and a fair comparison at equal load."
---

Most servers run in containers, and most containers have a CPU limit.
`docker run --cpus=2` does not hide the host's other CPUs from the
program. It sets a quota, and when the program's threads have used 200
ms of CPU in a 100 ms period, the kernel stops all of them until the
next period starts. A runtime that sizes itself from the CPU count
gets that wrong in two ways. This post covers both, how we found
them, and what remains. As usual, AI agents did the work and the
project owner set the direction (decisions
[0638](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0638-public-runtime-checks-threads-metrics.md),
[0640](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0640-root-helper-takes-worker-slot.md)
and
[0641](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0641-monitor-polls-network.md)).
Every figure below is from those decisions; the tables are collected
in
[bench/results/cpu-quota-2026-11-14.md](https://github.com/xo-lang/xo/blob/main/bench/results/cpu-quota-2026-11-14.md).

## The setup

All runs use one machine: a 28 CPU linux/amd64 host. The server runs
in a systemd scope with `CPUQuota=200%`, which writes the same
`cpu.max 200000 100000` that `docker --cpus=2` does, and `nproc` still
says 28. The program is
the CRUD server in bench/perf/http. Its load generator runs outside
the scope and sends 10 s of requests after 2 s of warmup. Go 1.26.11
is the reference. Since Go 1.25, GOMAXPROCS follows the quota, so Go
runs 2 Ps here.

## Symptom: 28 workers in a 2 CPU container

Xo's scheduler started one worker per CPU, so it started 28. At 128
connections:

| config | requests/s | p50 | p99 | CPU per request |
|---|---|---|---|---|
| Xo, 28 workers (default) | 61.7k | 589 us | 58.2 ms | 32.4 us |
| Xo, XO_THREADS=2 | 106.3k | 637 us | 26.6 ms | 18.8 us |
| Go | 88.3k | 1.18 ms | 5.03 ms | 21.6 us |

Twenty-eight workers sharing two CPUs' worth of quota cost 42% of the
throughput, and the p99 was more than ten times Go's. The first fix
is the same one Go made. Xo now reads the quota from the process's
cgroup, as Go 1.25 does (the lowest `cpu.max` from the process's
cgroup up to the root, or the v1 CFS quota), and starts
`max(2, ceil(limit))` workers. A program that wants a different
number sets `XO_THREADS`.

The second row shows that this was not enough. With exactly two
workers, Xo served 20% more requests than Go, but its p99 was still
26.6 ms against Go's 5.

## Cause: a thread nobody counted

The kernel keeps a count of how often it throttles a cgroup: in a 12 s
run at 128 connections, 99 to 119 throttles, 5.6 to 7.4 s in total
with every thread stopped. Go had 0 or 1. Reading each thread's
`/proc/PID/task/TID/stat` showed three threads using about 7.6 s of CPU
each, though two workers were configured. The third was the **root
thread**, the one that runs `main`. In Xo, while `main` waits on a
task it runs other tasks itself, which saves a thread switch on every
wait (decision 0077). So `XO_THREADS=2` meant three threads running
Xo code. Three busy threads on a quota of two use up each period's
budget early, and then everything stalls until the period ends. A
request that arrived during a stall waited for the rest of the
period, and those waits are the p99.

Two checks confirmed it. The same build pinned to 2 CPUs with no
quota had a p99 of about 4.0 ms at 115k to 132k requests a second.
And `XO_THREADS=1` under the quota (one worker plus the root, two
busy threads) had 0 throttles.

Go's model is the other way round: `GOMAXPROCS=N` is N Ps, and a
thread runs Go code only while it holds one. Decision 0640 brings Xo
in line. **The root's loop counts as one of the N.** The pool starts
and wakes workers only up to N minus the roots currently in their
loop, never below one worker. Every check of "are all workers busy?"
uses the same count. Starting and waking are the only places where
the count is applied, so the path that runs a task has no extra cost.

| connections | build | requests/s | p99 | throttles (time) |
|---|---|---|---|---|
| 128 | before | 105k to 107k | 25.0 to 26.1 ms | 119 (7.3 to 7.8 s) |
| 128 | after | 129k to 130k | 3.94 to 3.97 ms | 2 to 3 (1 to 2 ms) |
| 128 | Go | 87k to 90k | 4.93 to 5.15 ms | 0 |
| 32 | before | 76k to 78k | 3.99 to 4.06 ms | 86 to 92 |
| 32 | after | 79k to 83k | 3.46 to 3.71 ms | 0 |
| 32 | Go | 70k to 72k | 3.09 to 3.12 ms | 0 |

At 128 connections the p99 fell from 25 ms to under 4, and throughput
rose by a fifth, because the work no longer pays for stalls.

## The monitor learns to back off

Two or three short throttles per run were left. Sampling every thread
each 100 ms period pointed at the scheduler's **monitor** thread. It
wakes deferred tasks and asks a fiber to yield once that fiber has
run past its 10 ms slice. While deferred wakes or waiting work
existed, it woke every 1 ms, and under load that was always.

Go's sysmon solves the same problem: it sleeps 20 us at first and
doubles the sleep after 50 idle cycles, up to 10 ms. Xo's monitor now
starts at 1 ms and doubles after 50 ticks in a row that do nothing,
up to 10 ms. Any tick that acts sets it back to 1 ms. Two details
mattered:

- A tick that only finds work pending does not reset the backoff.
  Under load, "pending" flips on and off as workers move between
  items. With the reset, the backoff never took hold (10,900 ticks in
  a 14 s run).
- A wake for preemption first looks one slice (10 ms) later, because
  no fiber can need preempting before it has run for a slice.

| c=128, 5 runs | before | backoff |
|---|---|---|
| throttles per run | 4, 3, 2, 1, 6 | 0, 0, 0, 1, 1 |
| throttled time | 0.5 to 9.9 ms | 0 to 0.8 ms |
| monitor ticks in 10 s | about 10,050 | about 1,135 |

Throughput and p99 did not change; the two builds were run in
alternating order. Deferral latency, read from `XO_TRACE`, was the
same in our benchmarks. The one wait that gets longer is a deferral
that only the monitor can serve, during a long busy stretch: up to 10
ms instead of 1 ms. Go accepts the same bound when sysmon takes a P
back from a thread stuck in a system call.

## Chasing the last throttle

About one throttle per run was still left in some runs. The next suspects were the two
helper threads that tick every 10 ms: the monitor and the network
poller. We gave each thread a name per role in an experiment build
and sampled `/proc/PID/task/*/schedstat` every 125 ms. In every window
that contained a throttle, the root and the worker ran 96% each, and
the two helpers ran about 0.2 ms each.

Go has only one such thread: sysmon polls the network itself when no
one else has polled for 10 ms. So decision 0641 tried the same thing
in Xo. The monitor did the poller's fallback poll, and the poller
thread slept while the monitor was awake. The poller thread's CPU
dropped to zero, but throttles did not fall: 3 against 2 over 8
alternated pairs. With no monitor thread at all, 8 runs on each side
throttled 1 and 3 times. We rejected 0641 and did not merge the code.

What is left is a property of the kernel, not of Xo's threads. CFS
hands the quota to each CPU in 5 ms slices
(`sched_cfs_bandwidth_slice_us` is 5000). Once two threads use 96% of
a 2 CPU quota, any brief run on a third CPU strands part of a slice.
The result is about one throttle of 0.1 to 0.5 ms in a quarter of the
12 s runs, whichever helper threads run. Removing it entirely would
mean leaving headroom, which means serving fewer requests.

## The fair comparison

The runs above push both servers to saturation, where Xo serves more
requests than Go, so they are not doing the same work. For a like for
like comparison we paced the load generator to a fixed rate across
its 128 workers and ran 6 runs per side, alternating:

| target | server | served | CPU | p99 | throttles |
|---|---|---|---|---|---|
| 70,000 rps | Xo | 69.0k to 69.2k | 115% to 122% | 3.5 to 3.8 ms | 0 |
| 70,000 rps | Go | 69.7k to 69.8k | 169% to 172% | 3.7 to 4.1 ms | 0 |
| 88,000 rps | Xo | 87.4k to 87.6k | 147% to 150% | 3.7 to 4.0 ms | 0 |
| 88,000 rps | Go | 86.7k to 87.5k | 188% | 5.1 to 5.2 ms | 2 in 6 runs |

At Go's throughput Xo used 20% to 30% less CPU (147% to 150% against
188% at 88k requests a second, 115% to 122% against 169% to 172% at
70k) and had no throttles in 12 runs. At 88k its p99 was 3.7 to 4.0 ms
against Go's 5.1 to 5.2. The floor described above shows up only at
saturation.

## What we took from it

- **Count every thread that runs your code.** A helper that runs
  tasks while it waits is a runner, and a quota counts it like any
  other.
- **Throttle counts beat averages.** CPU use looked fine, but the
  scope's `cpu.stat` (`nr_throttled`, `throttled_usec`) and per-thread
  `/proc` stats showed the stalls directly.
- **Compare at equal work.** At saturation the faster server is also
  the busier one. A fixed rate separates "serves more" from "stalls
  more".
- **Some floors belong to the kernel.** After two fixes and one
  rejected experiment, the remaining throttle comes from how CFS
  hands out quota. We wrote that down in decision 0640 rather than
  chase it further.
