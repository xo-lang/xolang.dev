---
title: "From one Mac to EC2, to CI, and back: where Xo's tests run"
date: 2026-10-16T10:11:00-04:00
description: "Xo's tests started on one Mac, grew onto Graviton machines in EC2, became on-demand GitHub Actions jobs on self-hosted runners, and then came back to the Mac with Docker for Linux and Windows. What each step bought, what it cost, and what Docker still cannot do."
---

Xo is developed by AI agents working in parallel, and every change they
make has to be verified: the compiler builds itself, the test programs
run on every backend, and the output must not change. Where that
verification runs has changed four times in a week. This post is about
each step: why we took it, what it cost, and why most of it is back on
one Mac. As usual, AI agents did the work and the project owner set the
direction.

## Step 1: one Mac and a lock

Everything started on the development Mac (an M4 Pro with 12 cores and
24 GB). The test policy is tiered so the common case is cheap:

- Every commit runs `go test -short` over the repository, about 10
  seconds.
- Before a merge, `-short` plus the full tests of only the packages the
  change touched.
- The full suite only before a release or after a large merge.
- The self-hosted compiler's own tests have their own tiers
  (`XO_SELFHOST_TIER`): `short`, `merge` (the default, about 4 minutes on
  the Mac), and `full` (every backend).

With several agents in separate worktrees, memory is the limit, not
cores. So every heavy run (the full tests of the compiler and backend
packages, self builds, benchmarks) goes through one machine-wide lock
script, one at a time, and each agent logs its steps to a file the lead
session watches. That kept the Mac from running out of memory, at the
price of a queue.

## Step 2: Graviton machines in EC2

Some runs did not fit on the Mac at all. A self build with 16 jobs
peaks at 19.86 GB, most of the Mac's memory, and the compiler's full
test tier peaked at about 157 GB. So the full tier moved to arm64
Graviton machines in EC2 (r8g), driven by a script from the Mac that
started a machine, ran the suite and stopped it. The full tier took
3,474 and 3,490 seconds cold on an r8g.8xlarge (32 vCPU, 256 GB), about
58 minutes.

The Mac is still the faster machine core for core: a self build takes
59.00 s on the Mac against 87.84 s at 8 jobs and 49.83 s at 16 jobs on
the r8g.8xlarge, about 1.3 to 1.5 times faster per core. EC2 bought
memory, not speed.

It also bought chores. The queue lived in scripts on the Mac, so it
needed the Mac and a lead session awake, and the knowledge base gained
entries such as an instance that outlived its shutdown timer and a
terminate that was never confirmed.

## Step 3: on-demand CI on self-hosted runners

On 2026-10-14 the owner chose GitHub Actions on self-hosted linux/arm64
runners, the same warm EC2 machines adopted into Terraform (decision
0225). The rules were deliberate:

- **Nothing runs on push, pull request or a schedule.** Every run is
  started by hand, by an agent or the owner, so work in progress never
  burns machine time and merge conflicts don't trigger failures.
- **Warm machines, not fresh ones.** The runners keep their caches, so a
  self build is never cold. A webhook starts a stopped machine when a
  job is queued, and machines stop themselves after five idle minutes.
- **One executable policy.** The `auto` suite encodes the test policy
  above (short, the touched packages' full tests, the compiler's merge
  tier, the fixed point when the change touches what the self build
  compiles), so the policy lives in one script that runs the same on any
  machine.

It worked well. From the first runs:

| What | Time |
|---|---|
| `short` (vet and `go test -short`, every package) | 51 s |
| a stopped machine to a running job, through the webhook | 17 s |
| the self rebuild fixed point | 2 min 24 s |
| `auto` on a change to the compiler and a test golden | 6.5 min |
| the Windows suite on a Windows runner | 5 min 33 s to 6 min 43 s |

And it was cheap. On-demand machines cost about $0.94 an hour
(r8g.4xlarge) and $1.89 (r8g.8xlarge): about 2 cents for a `short` run
and about $2 for a full tier run. Stopped machines still pay for their
disks, about $9.60 a month each, or about $38 a month for the four
runners. GitHub charged nothing for self-hosted runners when we
checked on 2026-10-14.

## Step 4: arm64 only, then back to the Mac

The same day, the owner narrowed what has to pass: "testing on just the
fastest machine and arch". Agents verify on the Mac, on arm64. Linux on
x86-64 and Windows became best effort: a failure seen only there is
recorded as a known issue, not chased by default. Every change that
touches what the compiler builds itself from must still pass the self
rebuild fixed point on arm64, so a miscompile can never build the next
compiler.

Then the zero-C push started, the work that replaced the C runtime with
Xo, and the owner turned CI off for its duration. Speed of iteration
mattered more than a second machine's opinion, and the Mac, being
faster per core, was the quicker place to get an answer. Releases kept
coming: seeds for all five platforms (darwin/arm64, linux/arm64,
linux/amd64, windows/amd64 and darwin/amd64) are built on the Mac, the
first natively and the other four cross compiled in about 25 seconds
each.

## Docker fills the gaps

What the Mac could not do natively was run Linux and Windows programs.
Docker Desktop fixed most of that:

- **Linux on arm64, natively.** `scripts/docker-linux.sh` runs a Debian
  container with clang and lld, the checkout mounted read only. Every
  test program passes there on linux/arm64 with both native backends
  (178 of 178 when first run, 179 of 179 since). It also found real bugs
  that the Mac never showed, such as an LLVM thread-local address that
  the optimizer folded, crashing parked tasks on Linux.
- **Linux on x86-64, emulated.** The same script runs linux/amd64
  containers, about 3 times slower for a build, which is fine for
  occasional checks. Two x86-64 unwinder bugs were found this way.
- **Windows under Wine.** `scripts/docker-wine.sh` runs Debian's Wine
  under Box64 in a native arm64 container, which handles Windows
  structured exceptions; Windows' stack overflow handler, now written in
  Xo, passes there.
- **Exact instruction counts.** valgrind's callgrind in a linux/arm64
  container counts instructions per function, which is how we compare
  our two backends function by function.

## What it costs, honestly

Each step traded something:

- **The Mac alone** is the fastest per core and costs nothing extra,
  but its memory admits one heavy run at a time, and the queue grows
  when many agents finish at once.
- **EC2** gave memory the Mac lacks, at the cost of scripts and machines
  to babysit.
- **CI** removed the babysitting and was cheap per run, but it is
  slower than the Mac for the runs agents make most often, and idle
  machines still cost money for their disks.
- **Docker** brings Linux and Windows to the Mac for free, with limits.
  The Docker VM has 8 GB, too little for a self build inside it, so the
  Linux compiler is cross built on the Mac first. Emulated x86-64 is
  slow. Wine is not Windows: some file system and process tests fail
  there for reasons that have nothing to do with Xo. valgrind runs one
  thread at a time, so it shows no real contention, and Go 1.26 programs
  crash under valgrind 3.24 at start, so Go baselines cannot be counted
  that way.

The CI setup is still in the repository, and a run can be started by
hand whenever a change needs more memory than the Mac has. For now, one
fast Mac, a lock, and Docker are where Xo's tests run.
