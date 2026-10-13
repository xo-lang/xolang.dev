---
title: "Building Xo in Xo: what worked, and what we would fix"
date: 2026-10-13T06:00:00-04:00
description: "Xo's compiler is written in Xo, and its runtime is moving from C to Xo, mostly written by AI agents. An honest look at what that has been like: the wins, the bugs it found, and the rough edges it exposed in the language and our tooling."
---

Xo's compiler is now written in Xo, and `xo` itself is that compiler.
Its native runtime, which started as C, is moving to Xo one measured
piece at a time. Most of that code was written by AI agents, with a
person deciding what to build, what counts as done, and what ships on
this site. This post is about what the experience has actually been
like: what went well, and what it showed us we need to fix.

## What worked

### The compiler got fast enough to live in

A self-hosted compiler is used all day by the people (and agents)
building it, so its speed sets the pace of everything else. Profiling
the Xo compiler while it compiled itself, and fixing the hot spots in
its Xo source, took that build from 588.86 s to 163.83 s on the shared
development Mac, and its peak memory from 26.1 GB to 9.66 GB, with the
output unchanged. Wall time on that machine is noisy (one run each,
other work running), but the instruction count says the same thing:
5,520.6 billion before, 2,035.4 billion after.

### It reproduces itself, on more than one machine

The compiler rebuilds itself to identical binaries: on arm64, and on
x86-64, on both Linux and an Intel Mac, where the build that the Xo
compiler produces is byte for byte the build the previous stage
produced. On Windows the two builds are identical except for the time
stamp and checksum the Windows linker writes into the file's header.
"Identical" is a strong test: it is how we know the compiler written in
Xo means the same thing as the one it replaced (the
[byte-identical post](/blog/byte-identical/) tells that story).

### Porting C to Xo kept finding bugs in the C

Every runtime piece is compared, output for output, with the Go
backend, which uses Go's own standard library. That comparison was
meant to check the new Xo code. It kept catching the old C:

- The C HTTP parser compared a chunk size as signed, so a chunk size
  line of `ffffffffffffffff` became a negative length and a read out of
  bounds. The Xo parser handled it; the C was fixed.
- The C `Float.parse` rejected text Go accepts: underscores (`1_000`),
  hex floats, and texts over 4096 bytes. The Xo port of Go's parser
  accepts them, so native builds now agree with the Go backend.
- The C test runtime had two bugs that made the `test_shutdown` test
  fail under load: a request sent to an in-memory server after it was
  told to stop waited instead of failing, and the virtual clock could
  move twice for one idle instant. Both were in C; both are fixed.

The Xo replacements passed large differential tests: 336,386 lines for
number text, 27,900 for std/json, and 30,130 HTTP/1.1 requests, each
compared with the Go backend.

### The measurement decides, not our hopes

Each runtime piece moves to Xo only if it is within 5 percent of the C
it replaces, in instructions, on both native backends; otherwise it
stays C. That rule has said no more than once. Splitting strings,
splitting lines, counting runes, and hex encoding all lost at first and
stayed C. Once the compiler gained word-at-a-time scanning primitives,
they came back and won: counting runes now takes about a third of the
C's instructions, and the other three are within the bar. Where the C
is no longer needed, it is deleted: 3,373 lines of the C runtime so far.

## What we would fix

### Diagnostics that do not name the real problem

A runtime port named a variable `when`. `when` is a keyword in Xo, so
the first use parsed as the start of a `when` expression and produced a
cascade of unrelated errors (a non-assignable expression, an operator
undefined for a list, a non-exhaustive match), none of which said
"`when` is a keyword". For a language built around diagnostics that an
agent can act on, that is a real miss, and the parser should say so
directly.

### Performance cliffs you only find by measuring

A struct holding several lists, passed by value, is copied word by word
at every call. A time zone's rules stored that way made loading a zone
1.744x the C's instructions until the data was packed into a single
list. Nothing in the source looks expensive; only the measurement
showed it.

Argon2id is the clearest case of a cliff that is not closed. The Xo
version started at 2.21x the C's instructions on arm64. Code generation
fixes for the arm64 backend's list accesses brought it to 1.125x on
arm64, but it is still 1.254x on LLVM, so Argon2id stays C.

### Tooling that broke in ways that looked like compiler bugs

- Rewording a comment in a runtime file, from four lines to three,
  failed the compiler's golden tests: the expected outputs record
  source line numbers, and every one below the comment moved.
- A Python test script read an expected output in text mode, which
  turned a raw carriage return into a newline. It looked exactly like a
  compiler bug in printing runes; the compiler was right.
- Our remote full test runs silently skipped the WebAssembly tests,
  because the machines had no Node installed and the test skips without
  it. A change that broke half of those tests went through as a pass.
- And there were real compiler bugs in backends we wrote ourselves: the
  arm64 code generator once read a register before writing it after a
  loop with a `break`, and the WebAssembly assembler lacked one
  instruction the runtime started using, which broke every program.

### Caveats we want to be upfront about

- The lowest layers of the runtime use unchecked internal operations by
  design, such as loads with no bounds check whose callers check the
  range (see [the runtime power post](/blog/runtime-power/)). They are
  invisible to user code, but they are not checked by the compiler.
- Running on Linux with no C library (an opt-in build mode for now)
  added a transitional C file of 1,859 lines, which stands in for the
  C library until later ports remove its callers. Moving off C
  sometimes means more C first.
- We do not yet know how many bugs Xo's checker caught before the code
  ran. That number would be the best evidence for the language's design,
  and we plan to measure it rather than guess.

## What is next

The test harnesses that are Python scripts today will become an
`xo dev` command written in Xo (decision 0209, accepted), so the
tooling runs on every machine the compiler does and stops having its
own platform quirks. On the list beyond that, not yet decided: golden
outputs that do not shift when a comment changes, a checked build mode
for the runtime's unchecked operations, and performance gates that fail
a change when a measured workload gets slower.

Most of what this post describes was found by agents and fixed by
agents, under rules that a person set: compare against a reference,
measure before moving anything, and write down what went wrong. The
failures above are in the repository's notes next to the successes,
and that has been worth as much as any single fix.
