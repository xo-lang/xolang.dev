---
title: "From one Mac to warm machines: how Xo's test setup grew up in three days"
date: 2026-10-13T13:30:00-04:00
description: "Many AI agents, one 24 GB Mac, and a test suite that takes an hour on a big machine. How Xo's testing moved to EC2, what broke on the way, where it landed, and what it saved."
---

Xo is built by many AI agents working in parallel, and almost every
change touches a compiler that has to be checked against every backend.
Between 2026-10-11 and 2026-10-13 the way those checks run changed five
times. This post is the story of those changes: what forced each one,
what broke, and where it landed. The agents did the work; the project
owner set the rules at each step.

## Stage 1: one Mac, many agents

At first everything ran on one Mac with 24 GB of memory. Each agent ran
its own heavy tests, and when several full test suites ran at once
they exhausted the machine's memory.

Two fixes came first. A machine-wide lock lets only one heavy run go
at a time, and the self-hosting tests were split into tiers: a short
tier for every commit, a merge tier of a few minutes, and a full tier
that runs every backend. Only the short and merge tiers stay cheap
enough to run all the time.

## Stage 2: the full tier on EC2

The full tier was the problem: it compares the compiler written in Xo
with the Go one on every backend. A script now launches an arm64
(Graviton) instance on EC2 for each full run. There, the tier first
took more than three hours on a 32 vCPU machine; running its parts in
parallel on a 32 vCPU, 247 GB machine brought it to 3,490 s, just under
an hour.

Getting there took a few tries. The first instance, with 63 GB, ran out
of memory when seven copies of the arm64 code generator ran at once,
5 to 13 GB each, next to a 10 GB test process. The memory-heavy
instance type fixed that.

## Stage 3: from spot to on demand

The early runs used spot instances, which are cheaper but can be taken
back. Three runs were reclaimed mid-run, one after six minutes and one
27 packages into 44, and then spot capacity for those machine types ran
out entirely. A full run needs about 45 to 60 minutes uninterrupted, so
runs moved to on-demand instances only. That ran into the account's
limit on running vCPUs: it was raised from 32 to 96, which allows three
32 vCPU machines at once, and a further raise to 160 has been
requested.

## Stage 4: a queue between agents and the cloud

Agents should not hold the keys to the cloud account. So agents no
longer launch instances themselves: an agent writes a small request
file, and a runner owned by the lead session launches the job and
reports back.

## What broke on the way

Each of these became a written gotcha in the repository, with the
symptom, the cause, and the fix:

- **An empty SSH key.** An agent ran the launch script inside a sandbox
  that could not reach the cloud API. The script read that network
  failure as "the key does not exist" and created a new one, and the
  failed creation truncated the real private key to zero bytes. The
  script now creates a key only when the API says it does not exist,
  never overwrites a key file, and stops early on an empty one.
- **The wrong commit.** Asked to test a branch commit, the scripts
  silently fell back to sending the main checkout's current commit, so
  an agent's job tested the wrong code and failed in a minute. They now
  bundle the exact commit and stop if they cannot.
- **A silent terminate.** A log said "terminating", but the call had
  failed and the instance kept running for over an hour. The cleanup
  now retries and confirms the instance is actually shutting down.
- **A tier that silently skipped.** The cloud machines had no Node, so
  the WebAssembly tests skipped, and a change that broke half of them
  passed a full run. The setup now installs Node and prints its version
  at the top of every log, so a missing tier is visible.
- **A runner that hung, and jobs that failed instead of waiting.** The
  queue runner hung on a script's watchdog holding its output open, and
  a job that hit the vCPU limit failed instead of going back in the
  queue. Both were fixed in the runner.

## Stage 5: warm machines

The queue made agents safe, but not fast. On 2026-10-13, about 19 queued
jobs ran for about 295 minutes end to end, and about 100 to 115 of
those minutes were setting up fresh machines (5 to 6 minutes each:
launch, toolchain, Go, clone) for tests that then ran for 1 to 4
minutes.

So each architecture now has one reusable warm machine. It is stopped,
not deleted, after 30 idle minutes, so its toolchain and checkout
survive. A job on a running warm machine takes about 15 s end to end,
and 32 to 67 s if it has to start a stopped one, against 6 to 10
minutes for a fresh launch. Full suites still use fresh 32 vCPU
machines.

What the waiting cost is clearest in one agent's day. Of its roughly 7.5 hours
on Linux system calls, about 4 hours were blocked on permissions before
the queue existed, and about 1.5 hours waiting in the queue, half of
that for jobs lost to the runner and quota bugs above. Under an hour
was actual cloud run time.

## Stage 6: where it landed

The last change was a policy, not a script (owner, 2026-10-13):

- **Agents verify on the Mac.** Targeted heavy runs and the short tests
  on the development machine, no cloud round trip per change.
- **Platforms at milestones.** Linux and Windows runs happen after a
  stage of compiler or runtime work, run once by the lead, and a
  failure is bisected over that milestone's merges, one targeted test
  per step. Code that cannot run on a Mac at all gets one batched
  platform run before its agent reports.
- **A fixed point on every compiler or runtime merge.** Each merge that
  touches the compiler or the runtime must also rebuild the compiler
  with itself to identical bytes on the Mac (the check described in
  [the bootstrap post](/blog/bootstrap/)). The reason is specific to a
  self-hosted compiler: a miscompile that slips through would build the
  next compiler, and every compiler after it.

The compiler's own speed helped every one of these loops. The Xo
compiler compiling itself went from 588.86 s to 163.83 s, and its peak
memory from 26.1 GB to 9.66 GB, in the same days
([Building Xo in Xo](/blog/building-xo-in-xo/) has the details), so
both the Mac checks and the fixed point got cheaper.

## What we would tell another project

- Put the slow tier somewhere else early, and make a skipped test loud.
- Let agents ask for cloud runs; do not hand them the keys.
- Keep machines warm when the tests are short; setup was most of the
  time.
- Every failure above was a silent one. The fix each time was to make
  the script check its own result and say so in the log.
