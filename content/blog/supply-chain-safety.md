---
title: "A dependency can only do what you let it"
date: 2026-10-11T13:00:00-04:00
description: "We rebuilt 15 supply-chain attack scenarios as malicious Xo dependencies. Xo blocks 10 of them; here is the table, and why the other 5 get through."
---

Most supply-chain attacks need a dependency to do something it was never
supposed to do: read your environment, call home, write files, start a
process. In most languages, nothing in the build knows what a dependency
is supposed to do, so nothing can notice when it starts doing more.

**Update, later on 2026-10-11:** two follow-ups landed (decision 0173).
`task.with_budget` caps the running time, allocation, and steps of a
call, which brings the endless-loop denial of service into scope when
the app uses it: the measurement is now **12 of 17 scenarios blocked**
(two new rows, both a looping dependency under a budget; the unbudgeted
loop stays not blocked). Log records from a dependency now name the
module that wrote them, on every backend. Budgets work on the Go
backend today; the native backends are planned. The table
below is the first measurement, 10 of 15.

In Xo, what a function may do is part of its type, and authority is a
value you hand over. Xo 0.x now builds on that with per-dependency
ceilings, an effect lock, vouches for Go and C code, narrowed
capabilities, and `xo audit` (decision 0156). This post measures how far
that gets against real attack patterns, including where it falls short.

## The defenses, briefly

- **Capabilities.** The network, files, clock, environment, and
  processes reach a program as values passed to `main(os: Os)`. A library
  can use one only if it is handed it.
- **Effects in signatures.** Every `pub` function declares what it does
  (`uses net.dial`), and the compiler checks the body against it. Logging
  is the `log` effect; a call into Go is the `go` effect.
- **Ceilings.** `require github.com/acme/billing v1.4.0 uses none` in
  xo.mod makes any call into that dependency that declares more a compile
  error (`XO1309`).
- **The effect lock.** `xo.lock` records the effects each dependency's API
  can reach. An update that reaches further fails until you accept it
  (`XO1317`). It is on by default.
- **Vouches.** Go and C code can act without a capability, so in a
  dependency each `use go` (of an impure package) or `use c` needs a
  `vouch` line in your own xo.mod, for the exact version you reviewed
  (`XO1316`). A dependency cannot vouch for itself.
- **Narrowed capabilities.** `os.net.only(["api.example.com"])` is a
  network that can reach only that host; `Env.only`, `Proc.only`, and
  `Fs.sub` do the same for variables, commands, and directories.
- **`xo audit`** lists all of it in one report.
- **Nothing runs at install.** No install hooks, no build scripts, and no
  code that runs on import.

The [dependencies page](/docs/dependencies/) walks through each one with
the toolchain's real output.

## How we measured

The Backstabber's Knife Collection (Ohm, Plate, Sykosch, and Meier,
DIMVA 2020) is a review of real open source supply-chain attacks and a
taxonomy of how they work. We took its attack classes and wrote each as a
small malicious Xo dependency plus a consumer, then built and ran them
with the real toolchain (`TestSupplyChainAttacks` in the Xo repository).
Every "malicious" action is harmless and stays inside the test: it dials
a fake host, reads a fake variable, or writes an in-memory file system.

Each scenario runs in one of two postures. **Default**: the app requires
the dependency with no ceiling and hands it capabilities as they are.
**Hardened**: the app sets a ceiling or narrows the capability. For each
scenario we recorded the first point at which Xo stops it, or that it
does not.

## The result: 10 of 15 blocked

| attack | posture | stopped |
|---|---|---|
| install-time hook | default | at fetch: there is no install or build hook |
| code that runs on import (typosquat trigger) | default | at check: a top-level statement is a compile error |
| C binding lies about its effects, unvouched | default | at check: the dependency's own `uses` does not count (`XO1316`) |
| malicious update adds a network effect | default | at `xo get`: the effect lock (`XO1317`) |
| exfiltrate env over the network | hardened (`uses none`) | at check (`XO1309`) |
| write or wipe files | hardened (`uses none`) | at check (`XO1309`) |
| spawn a process (dropper) | hardened (`uses none`) | at check (`XO1309`) |
| exfiltrate through logs | hardened (ceiling without `log`) | at check (`XO1309`) |
| malicious update adds an effect | hardened (ceiling) | at check (`XO1309`) |
| exfiltrate over the network | hardened (`Net.only`) | at run time: the dial is `Denied` |
| exfiltrate env over the network | default | **not blocked** |
| exfiltrate through logs | default (`log` allowed) | **not blocked** |
| C binding lies, and the app vouched for it | default | **not blocked** |
| wrong result (a swapped payee) | default | **not blocked** |
| denial of service: an endless loop | default | **not blocked** |

Four are blocked with no setup at all: the install hook, code on import,
the unvouched C binding, and the malicious update. The other six are
blocked once the app writes a ceiling or narrows a capability.

## Why the other five get through

**Two are outside any effect system.** Returning the wrong answer and
burning CPU perform no effect: nothing touches the network, a file, or the
clock, so there is nothing for a ceiling or a capability to stop. The
defenses there are contracts, tests, and timeouts, which are a different
mechanism.

**Two are the default posture.** If you hand a new dependency `os.net` and
set no ceiling, it can use the network; if you let it log, it can log a
secret it was given. Both are visible: in its signatures, in `xo.lock`,
and in `xo audit`. Both are blocked by one line (a ceiling) or one call
(`.only`). They count as "not blocked" because the consumer did not
harden, not because the restriction cannot be written.

**One is a wrong human review.** A vouch says "I read this C code and it
does X". If it says `uses none` and the C code does I/O, Xo cannot tell:
it cannot see inside C. What it does guarantee is that the vouch is
yours, for one version, recorded in your xo.mod, and that the dependency
cannot write it for you.

## A note on comparisons

The closest prior work is Flix's effect-aware package manager, which
reports blocking 48 of 51 attacks. Those 51 are real npm and PyPI
packages; our 15 are behaviour classes from the same taxonomy, since the
original payloads are JavaScript and Python and cannot run as Xo
dependencies. The two numbers measure different things, so we do not put
them side by side.

Among mainstream languages, none checks limits per dependency in the
compiler: Go and Rust rely on audits and analysis tools (Capslock,
cargo-vet), Deno and Node grant permissions per process, and Java's
SecurityManager is disabled as of JDK 24.

## What is next

- **Attribute each log record** to the dependency that wrote it, so the
  "logs allowed" row is at least traceable.
- **A resource budget capability** (CPU time, allocation) to bring the
  denial of service row into scope.
- **Port more scenarios** toward the 51 packages, by behaviour, and record
  which have no Xo equivalent.

Narrowed `Net`, `Env`, and `Proc` capabilities work on the Go backend
today; the native backends are planned.
