---
title: "Xo gets a debugger"
date: 2026-11-05T09:00:00-05:00
description: "xo debug is a live debugger built into the xo command: breakpoints, stepping by source line, locals, and Xo's tasks read from the runtime's own records, in a terminal, as JSON for agents, or in VS Code through the Debug Adapter Protocol. What it does, how it is built (in Xo, with its own DWARF reader and its own process control on each OS), how it compares with Delve, and the two bugs it found on the way."
draft: true
---

Since 0.26.0 an Xo executable has carried its DWARF debug information
inside it (see [where macOS keeps a program's debug info](/blog/macos-debug-info/)),
so lldb and gdb can show its source lines, functions and variables. But
neither knows what an Xo task is, and neither is on every machine. The
next release adds `xo debug`: a debugger that ships in the `xo` binary,
knows the language and its runtime, and speaks to editors and agents as
well as people. This post covers what it does, how it is built, how it
compares with Delve (the Go debugger, which plays the same role for Go),
and two bugs it found before it was done.

## A session

Here is a small program with two tasks and a function to stop in:

```xo
fn total(prices: List[Int], tax: Int) -> Int {
  var sum = 0
  for p in prices {
    sum += p
  }
  sum + sum * tax / 100
}

fn main(os: Os) {
  let lock = Mutex[Int].new(0)
  scope s {
    s.spawn(fn() {
      os.clock.sleep(10s)
    })
    s.spawn(fn() {
      lock.with(fn(var n) { n += 1 })
    })
    os.clock.sleep(100ms)
    let t = total([120, 80, 45], 8)
    os.stdio.println("total ${t}")
  }
}
```

Built with `xo build` (debug information is on by default) and run under
`xo debug` with a breakpoint in the loop, on a Mac:

```
(xo) break main.xo:4
(xo) run
stopped at breakpoint 1: 0x100000b5c total [inlined] at main.xo:4
(xo) bt
* #0 0x100000b5c total [inlined] at main.xo:4
  #1 0x100000b5c main at main.xo:19
  #2 0x1000567b8 xo_entry+20
  ...
(xo) locals
prices = 0x100800540
tax = 8
sum = 0
p = 120
(xo) tasks
main (task 1): in scope
  scope: running
    task 2 (spawned at main.xo:12): blocked in sleep at main.xo:13
(xo) task 2
task 2 (spawned at main.xo:12): blocked in sleep at main.xo:13
* #7 0x100000e9c main.fn1 at main.xo:13
(xo) bt
  #0 0x100028660 sched.fiber_park at sched.xo:310
  #1 0x100022ff4 pool.park_wait_fiber [inlined] at pool.xo:2959
  ...
  #6 0x100002874 cabi.clock_sleep at cabi.xo:581
* #7 0x100000e9c main.fn1 at main.xo:13
  ...
```

`total` was inlined into `main`, and the debugger still stops in it by
its own name and line and shows its parameters and locals. `tasks` shows
the program's task tree: task 3 (the `lock.with`) had finished, and task
2 was parked in its `sleep`. `task 2` selects that task's stack, which
belongs to no running thread: it is read from the task's parked fiber,
and its frames, locals and `print` work as they do for the stopped
thread. Stepping works by source line, through inlined calls:

```
(xo) next
0x100000b64 total [inlined] at main.xo:3
(xo) next
0x100000b5c total [inlined] at main.xo:4
(xo) print sum
sum = 120
```

The commands are `break`, `run`, `continue`, `step`, `next`, `finish`,
`locals`, `print` (with a field path), `backtrace`, `frame`, `threads`,
`tasks`, `task N`, `attach` and `quit`. A list still prints as its
address, as `prices` does above; showing a collection's elements is on
the list of what comes next, with conditional breakpoints and evaluating
expressions.

`xo debug -p PID PROG` attaches to a program that is already running, a
hung server for example: every thread is stopped, `tasks` shows what
each task is blocked in, and `quit` detaches and leaves the program
running.

## For agents: --batch and --json

Xo is built to be used by AI agents as much as by people, so the
debugger runs without a terminal. `--batch` takes its commands from `-c`
flags (without them, from standard input) and echoes each before its
answer; the program is ended after the last one. `--json` turns
every answer into one JSON object a line:

```
$ xo debug --batch --json -c 'break main.xo:4' -c run -c locals shop
{"v":1,"cmd":"break","ok":true,"id":1,"locations":[{"pc":"0x100000b48","file":"main.xo","line":4},{"pc":"0x100000d58","file":"main.xo","line":4}]}
{"v":1,"cmd":"run","ok":true,"stop":"breakpoint","id":1,"thread":3843,"frame":{"index":0,"pc":"0x100000b48","function":"total","inlined":true,"file":"main.xo","path":"./main.xo","line":4,"selected":true}}
{"v":1,"cmd":"locals","ok":true,"frame":0,"vars":[{"name":"prices","type":"List[Int]","param":true,...},{"name":"tax","type":"Int","param":true,"text":"8",...},{"name":"sum","type":"Int","param":false,"text":"0",...},{"name":"p","type":"Int","param":false,"text":"120",...}]}
```

An agent chasing a wrong value can stop at a line, read the locals and
step, with no screen to scrape. The breakpoint above has two locations
because `total` was inlined at its call and also kept as a function;
the debugger plants both.

## In VS Code

`xo debug --dap` serves the Debug Adapter Protocol, the protocol VS Code
and other editors use to talk to a debugger. The
[Xo Language extension](https://marketplace.visualstudio.com/items?itemName=xo-lang.xo)
(also on [Open VSX](https://open-vsx.org/extension/xo-lang/xo)), now in
its own repository, [xo-lang/vscode](https://github.com/xo-lang/vscode),
adds a debug type `xo` with launch and attach. F5 on an open `.xo` file
builds its package and debugs it, with breakpoints in the gutter,
the call stack (each of the program's threads), the variables view and
stepping. Debugging needs an `xo` with `xo debug --dap`, the release after
0.39.0; with an older one the extension says which xo it found instead
of failing quietly.

## How it is built

The debugger is written in Xo, like the rest of the toolchain, and uses
no lldb, gdb or C library of either:

- **Its own DWARF reader.** `compiler/debug` reads the program's line
  table, its variables and their locations (including location lists,
  where a variable moves between registers and the stack), inlined
  calls, and the unwind tables. It was tested first against the values
  lldb and gdb print for the same programs, read without them.
- **Its own process control on each OS.** On macOS it starts the program
  suspended and receives its breakpoint traps through Mach exception
  ports, reading and writing registers and memory with the Mach calls
  (`thread_get_state`, `mach_vm_read`, `mach_vm_write`). On Linux it uses
  ptrace (`PTRACE_SEIZE`, register sets, `process_vm_readv`), with every
  ptrace call made from one tracer thread, since Linux takes a traced
  process's requests only from the thread that seized it, and an Xo
  fiber can move between threads. Windows uses the system's debugging
  functions and is in progress. Each OS's calls are listed in the design
  decision, and the owner approved each list before it was used.
- **The task walk from the runtime's own records.** `tasks` does not
  guess from the stack: it reads the runtime's task tree, scopes and
  parking records out of the program's memory, the same records that
  `xo dump` prints from a crashed program. A copy of the runtime's layout
  in the debugger is checked against the runtime by a test, so a change
  to the runtime that would make the debugger misread it fails the build
  instead.
- **Stepping by line through Xo's code.** `step`, `next` and `finish`
  follow source lines through inlined calls, recursion and tail calls,
  using the line table and the call instructions of each architecture
  (arm64 and x86_64).

It runs today on macOS arm64 and Linux arm64 and x86_64, with attach on
macOS; attaching on Linux and the Windows port are next.

## Compared with Delve

[Delve](https://github.com/go-delve/delve) is the Go debugger, and it
plays the same role for Go that `xo debug` does for Xo: a debugger that
knows the language rather than only C's view of it, understands the
runtime's lightweight threads (Go's goroutines, Xo's tasks), and serves
DAP to editors (`dlv dap`). Delve is the far more mature of the two:
conditional breakpoints, expression evaluation, core files, and years of
use. `xo debug` has none of the first two yet.

The differences that are by design:

- **It ships inside `xo`.** There is nothing to install: the toolchain
  that built the program can debug it, on every machine that has the
  toolchain. Delve is a separate install (`go install` or a package
  manager).
- **It is written in Xo**, as the compiler is, so it is built and tested
  by the same toolchain it serves.
- **Process control on macOS.** Delve's default backend on macOS is
  `lldb`, which drives LLDB's `debugserver` (or `lldb-server`); its
  native macOS backend exists but its install guide says you do not need
  it and that it has known problems. `xo debug` makes the Mach calls
  itself, so it needs no Xcode command line tools. As for any debugger
  on macOS, the Mac needs Developer Mode, and the program being debugged
  needs the `get-task-allow` entitlement, which `xo build` gives darwin
  debug builds by default (not `--release` or `-s` builds); the
  released `xo` is signed with the debugger entitlement.

## Two bugs it found

Writing a debugger exercises the debug information harder than reading
a crash report does, and it found two bugs before it was done:

- **A variable's location ran past the call that overwrote it.** After
  `finish` out of `fact(n)`, the caller's `n` read 6 (the call's result)
  instead of 3. The variable lived in a register the call does not
  preserve, and its DWARF range ended after the instructions that move
  the call's result, so at the return address it still claimed the
  register that by then held the result. lldb showed the same wrong
  value. The compiler's variable ranges now end at the call's return
  address (`gotchas/dwarf-range-past-call-result.md`; test
  `TestDebugVarsAfterCall`, which runs lldb's `finish`).
- **A breakpoint planted again was not seen.** A breakpoint in a loop
  stopped once, and then the program usually ran to its end, although
  reading the address back showed the trap instruction. On arm64 the
  write reaches memory but not the instruction cache, so the CPU kept
  running the old instruction until the cache line was evicted. A
  second symptom on the same path: while the page was writable it could
  not also be executable (macOS refuses both at once), and the program's
  other threads faulted when they ran code on that page. The debugger
  now flushes the instruction cache after each write, as LLDB's
  debugserver does, and stops every thread at a stop
  (`gotchas/debugger-trap-write-needs-flush-and-stop.md`).

The design is decision 0253 in the repository
(`knowledgebase/decisions/0253-xo-debugger.md`), with the commands in
the spec, section 11.5.
