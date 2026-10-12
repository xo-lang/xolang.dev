---
title: "Dependencies and capabilities"
linkTitle: "Dependencies and capabilities"
description: "How to limit what a dependency can do: capabilities, effect ceilings, the effect lock, vouches for Go and C code, narrowed capabilities, and xo audit."
weight: 15
toc: true
---

A dependency in Xo can only do what you let it. This page shows the tools,
in the order you are likely to use them, with the output the toolchain
prints. Every command and message below was run with the current
toolchain; only the long file paths are shortened.

The running example is a shop that depends on a billing library,
`github.com/acme/billing`.

## Capabilities: authority starts at main

A program gets its authority as values: `main(os: Os)` receives the
network, files, clock, environment, and processes, and a library can use
one only if it is handed it. There is no global `open` or `dial`.

```xo
pub fn sync(net: Net) -> Bool uses net.dial {
  match net.dial("metrics.example.net:443") {
    Ok(_) => true
    Err(_) => false
  }
}
```

Every `pub` function declares its effects (`uses net.dial`) and the
compiler checks the body against them, so a library's signature tells you
what it can do. A function with no `uses` clause is pure. Writing a log
record is the `log` effect, and every call into Go is the `go` effect.

## Effect ceilings in xo.mod

A `uses` clause on a `require` line bounds what the dependency may do:

```
module example.com/shop
edition preview

require github.com/acme/billing v1.2.0 uses net.dial
```

`uses none` admits nothing, `uses net` admits `net.dial` and
`net.listen`. A call into the dependency whose function declares more is
an error at the call:

```
$ xo check .
main/main.xo:4:20: error XO1309: `region` of github.com/acme/billing v1.2.0 performs `go`, above the effect ceiling `uses net.dial` of that dependency in xo.mod
  note: xo.mod:4:1: the ceiling is declared here
  note: review why github.com/acme/billing needs `go`; then raise the ceiling, or require a version within it (decision 0086)
```

Ceilings are opt-in. A `require` line without `uses` has none, which is
where the effect lock comes in.

## The effect lock in xo.lock

`xo get` and `xo mod tidy` record, next to each module's hashes, the
effects its exported API can reach:

```
github.com/acme/billing v1.0.0 h1:gtG1lIS42/HaOPBMfYVCNbdaHfqlfYaS65G16dWPVAw=
github.com/acme/billing v1.0.0/xo.mod h1:auD5srgbLtmoFQa9b8RUSQb31JWBxoGs3RQZoaW4FqE=
github.com/acme/billing effects none
```

When an update reaches further, the update fails and nothing is written:

```
$ xo get github.com/acme/billing@v1.1.0
xo.lock:6:1: error XO1317: github.com/acme/billing v1.1.0 reaches effects that xo.lock does not record for it: `net.dial` (locked: none, now: net.dial)
  note: the API of the selected version declares effects the version locked before did not; review why it needs them (decision 0156)
  note: to accept them: `xo mod accept-effects github.com/acme/billing` (or `xo get --accept-effects github.com/acme/billing@v1.1.0`); otherwise stay on the previous version
```

This needs no setup: the lock is on for every module `xo get` records.
After reviewing the new version, accept it, and `xo get` prints what
changed in its API:

```
$ xo get --accept-effects github.com/acme/billing@v1.1.0
github.com/acme/billing v1.0.0 => v1.1.0
  github.com/acme/billing v1.0.0 => v1.1.0:
    added fn github.com/acme/billing.sync
```

`xo check` and `xo build` never widen the lock; only `xo mod
accept-effects` and `xo get --accept-effects` do. On the publishing side,
`xo publish` rejects a minor or patch release that adds an effect to an
export (`XO1310`).

## Vouches for Go and C code

Go code (`use go` of a package that is not pure) and C code (`use c`)
can reach files and the network without a capability, so the checker
cannot see what they do. In a dependency, each of these escape hatches
needs a `vouch` line in **your** xo.mod, for the exact version you
reviewed. `xo get` refuses an update that brings an escape hatch you have
not vouched for, before it writes xo.mod or xo.lock:

```
$ xo get --accept-effects github.com/acme/billing@v1.2.0
cache/github.com/acme/billing@v1.2.0/billing.xo:1:1: error XO1316: `use go "os"` of github.com/acme/billing v1.2.0 is not vouched for by the consuming module: Go code reaches files, the network, and processes without a capability
  note: after reviewing the code, add to xo.mod: vouch github.com/acme/billing v1.2.0 go "os"
```

`--accept-effects` accepts new effects only; it never stands in for a
vouch. After reviewing the code, add the line and run `xo get` again:

```
require github.com/acme/billing v1.1.0

vouch github.com/acme/billing v1.2.0 go "os"
```

```
$ xo get --accept-effects github.com/acme/billing@v1.2.0
github.com/acme/billing v1.1.0 => v1.2.0
  github.com/acme/billing v1.1.0 => v1.2.0:
    added fn github.com/acme/billing.region
```

A dependency's own vouch lines are ignored: it cannot vouch for itself.
A C binding can carry effects in the vouch (`vouch <module> <version> c
"zlib.h" uses none`); an unvouched C binding is charged `ffi`, whatever
its own `uses` says. There is no automatic fix for `XO1316`: a vouch is a
human review, and an upgrade needs a new one. `xo check` and the build
report it too, for example after `xo mod tidy`, which records versions
without checking vouches.

## Narrowed capabilities

You can hand a library less than the whole capability. A narrowed
capability has the same type, and anything outside it fails with
`Denied` before any effect:

```xo
fn main(os: Os) {
  let api = os.net.only(["api.example.com"])
  match api.dial("metrics.example.net:443") {
    Ok(_) => os.stdio.println("connected")
    Err(e) => os.stdio.println("refused: ${e}")
  }
}
```

```
$ xo run ./main
refused: Denied(addr: "metrics.example.net:443")
```

The narrowing methods are `Net.only(hosts)`, `Env.only(names)`,
`Proc.only(commands)`, and for files `Fs.sub(dir)`, `read_only()`, and
`write_only()`. `Net`, `Env`, and `Proc` narrowing is checked at run time
on every backend.

## Budgets for compute

A capability limits what a dependency can reach, but not how long it
runs. `task.with_budget` runs a call under ceilings on running time,
allocation, and steps (loop iterations and calls), and stops it with
`Exceeded` when it goes past one. Here `spin` stands in for a dependency
that never returns:

```xo
use std/task

fn spin() -> Int {
  var n = 0
  while true {
    n += 1
  }
  n
}

fn main(os: Os) {
  let b = task.budget(cpu: 2s, steps: 10_000_000)
  match task.with_budget(os.clock, b, fn() { spin() }) {
    Ok(n) => os.stdio.println("done: ${n}")
    Err(Exceeded(resource)) => os.stdio.println("stopped: ${resource}")
    Err(Failed(e)) => os.stdio.println("failed: ${e}")
  }
}
```

```
$ xo run .
stopped: steps
```

The budget covers every task started inside the call. Only a program
that calls `with_budget` pays for the checks. It works on every backend: Go, arm64, and LLVM.

## Log records name their module

A record a dependency logs carries the module that wrote it, and the
dependency cannot forge it:

```
2026-10-11T09:00:00Z WARN [github.com/acme/billing@v1.2.0] retrying
```

In JSON output it is the key `"module"`, and in tests `Record.module`.
This works on every backend: Go, arm64, and LLVM.

## xo audit

`xo audit` prints one report of every dependency: its effects and
lock state, its escape hatches and the vouches that cover them, the
capabilities you narrowed, and which capabilities you pass into
dependencies, with its log call sites. On a terminal it prints text; with `--json`, or when its
output is piped, it prints JSON (abridged):

```
$ xo audit --json .
{
  "module": "example.com/shop",
  "dependencies": [
    {
      "path": "github.com/acme/billing",
      "version": "v1.2.0",
      "effects": ["go", "net.dial"],
      "locked_effects": ["go", "net.dial"],
      "lock": "ok",
      "escape_hatches": [
        { "kind": "go", "target": "os", "line": 1, "vouched": true, "effects": ["go"] }
      ]
    }
  ],
  "attenuations": [
    { "file": "main/main.xo", "line": 4, "capability": "Net", "method": "only",
      "args": ["metrics.example.net"], "constant": true }
  ],
  "capabilities_passed": [
    { "file": "main/main.xo", "line": 5, "callee": "sync",
      "dependency": "github.com/acme/billing@v1.2.0", "capability": "Net",
      "attenuated": true, "via": "Net.only(metrics.example.net)" }
  ],
  "summary": { "dependencies": 1, "unvouched_escape_hatches": 0, "widened": 0,
               "unlocked": 0, "unattenuated_capabilities_passed": 0, "errors": 0 }
}
```

It exits 1 when the check has errors, so it can gate CI.

## Fetching and installing

No code runs when a module is fetched or built: Xo has no install hooks,
no build scripts, and no code that runs on import (a top-level statement
is a compile error). `xo.lock` pins the content hash of every module
version, and with `XO_SUMDB` set, the first fetch of each version is
checked against a signed checksum log.

## What this does not cover

- **Opt-in hardening.** Without a ceiling or a narrowed capability, a new
  dependency you hand `os.net` can use it. It shows in its signatures,
  in `xo.lock`, and in `xo audit`, but it is not blocked.
- **Your vouch is trusted.** Xo cannot see inside C or Go code. A vouch
  that says `uses none` for C that does I/O is not caught.
- **No effect, no check.** A function that returns a wrong answer
  performs no effect; tests and contracts are the defense there. One
  that loops forever is stopped only under a budget.
- **Not a sandbox.** This is checking at compile time plus capabilities
  at run time, inside one process.

Measured against 17 attack scenarios from the Backstabber's Knife
Collection taxonomy, these defenses block 12; the [post on supply-chain
safety](/blog/supply-chain-safety/) has the table. The full rules are in the
specification: [xo.mod](/docs/spec/core/#42-xomod),
[xo.lock](/docs/spec/core/#43-xolock), and the diagnostic pages for
[XO1309](/docs/diagnostics/xo1309/), [XO1316](/docs/diagnostics/xo1316/),
and [XO1317](/docs/diagnostics/xo1317/).
