---
title: "Porting Brotli to Xo, and the compiler weaknesses it found"
date: 2026-11-19T15:00:00-05:00
draft: false
description: "A 20,000 line port of Brotli found two compiler weaknesses that, as far as we know, the standard library's other timing twins had not shown: a register allocator that spilled too early in loops with many live values, and Float32 arithmetic that took a detour through double precision. What we saw, what we tried, the fixes, and the checks we are building so the next one is caught earlier."
---

Xo is a small, statically typed language for backends and web services,
with its own compiler that produces native code for arm64 and x86-64.
Its standard library follows Go's: where Go has a package, Xo ports it
and checks the port against Go's on the same inputs, for the same
output and for speed.

Brotli is the compression format browsers accept beside gzip. For a web
language it matters because every byte of a page or a client bundle
crosses the network: Xo's own browser client for std/ui is 203 KB raw,
68.6 KB under gzip and 54.9 KB under Brotli at its highest quality,
which on a slow 4G connection is about 70 ms less before the client's
prediction is ready. Go's standard library has no Brotli, so we ported the package
Go's ecosystem uses, andybalholm/brotli v1.2.2, itself a close
translation of Google's C reference: about 20,000 lines of logic plus
the format's 122,784 byte static dictionary.

This is a story about what building a language is like. A compiler has
optimizations you do not know you need until real code reaches them.
By the time we ported Brotli, the other modules of Xo's standard library
had been timed against Go one by one, and as far as we know none of
those timings had shown the two weaknesses this one port exposed: a register allocator that
gave up too easily on loops with many live values, and Float32
arithmetic that took a detour through double precision.

Here is where it ends up. The port is correct, and most of its cases run
at or under Go's time. Its slowest case, the highest compression
quality, went from 1.49 times Go's time to 1.41 on x86-64 after the
compiler fixes, and we can name what is left. Along the way the port led to
five compiler changes and a fix in the standard library's prelude, and we are building four
checks so the next program of this shape is caught before a port
finds it.

## First we made sure it was right

A fast wrong compressor is worse than a slow one, so correctness came
before any timing:

- Fuzzing against Go's package: 1,000,000 random cases on each of two
  Xo backends (arm64 and LLVM), with 0 mismatches.
- Stress: 64 concurrent tasks for 30 minutes on arm64, with 0 mismatches
  and 0 faults. Memory stayed under our bound of 10% growth after the
  first 5 minutes (it actually fell 45% from that mark to the end).
- Races: 3 runs under Xo's race detector on the LLVM backend, 0 data
  races.

## Most cases matched Go; the highest quality did not

92 of the standard library's 96 modules are timed with a "twin": the same program written in Go against
the original package, run alternately with the Xo program so both see
the same machine state. Both print a checksum of their output, so a
fast result that computes something different fails at once. Brotli's
twin has six cases:

- text, html and mixed decode three of the Go package's own test
  streams 200 times each: 80 KB of English words, 100 KB of HTML, and
  30 KB of text mixed with noise.
- enc1, enc6 and enc11 compress the HTML input at quality 1, 6 and 11.
  Quality 1 is a fast greedy matcher. Quality 11 is the "optimal parse"
  in the style of Zopfli: it scores many ways to cover each position
  with literals and back references, using a cost model of how many
  bits each choice would take. That is what a server uses for static
  assets compressed once and served many times, and it is the setting
  std/ui needs.

On our linux/amd64 machine, medians of 9 runs each:

| case | Go ms | Xo ms | Xo / Go |
|---|---|---|---|
| text (decode) | 72.4 | 72.7 | 1.004 |
| html (decode) | 42.6 | 32.8 | 0.771 |
| mixed (decode) | 32.3 | 35.2 | 1.089 |
| enc1 | 58.4 | 47.7 | 0.816 |
| enc6 | 49.5 | 51.8 | 1.046 |
| enc11 | 241.4 | 359.6 | 1.490 |

Five cases were within 10% of Go or faster. enc11 took half again as
long.

## We were doing the same work as Go, just slower

A ratio of 1.49 has two explanations. Either the port does more work
(a translation slip that tries more candidates or loops more often), or
it does the same work and each step costs more. Our first guess was the
port: 20,000 lines translated by hand leave room for a loop bound off by
a little.

So we counted. We added counters to both programs at the four loops of
the quality 11 search and compressed the HTML input once on a Mac
(Apple M-series, darwin/arm64). The central function, updateNodes in Go
and update_nodes in Xo, ran 200,086 times on both sides. Its distance
cache loop tried 578,875 candidates on both, its length loop ran
3,367,580 times on both, and its match loop 12,101,411 times on both.
All four counts were identical.

The algorithm was not the gap. Each iteration cost more. A CPU profile
of 20 encodes agreed: Xo's update_nodes took 2.51 s in total against Go's
updateNodes at 1.21 s, for the same number of calls.

## Two rewrites that looked right and did not help

A CPU has a fixed set of registers, the slots it computes in directly;
arm64 has about 30 general purpose ones. When a function needs more
values at once than there are registers (high "register pressure"), the
compiler keeps some of them in memory on the stack, a "spill", and
loads each one back, a "reload", every time it is used. A reload is
cheap on its own, but in a loop it sits in front of the arithmetic that
needs it, every iteration.

update_nodes is one long function with nested loops and many values
live at once: offsets into the input, a dozen lists, loop counters and
costs. Spills were the obvious suspect, and we tried two rewrites in
the port itself, both measured on the Mac:

- Split the inner loops out. If update_nodes had too many live values,
  moving its two inner loops into their own small functions (un_cache
  and un_matches) should give each one fewer values to place, and room
  in the registers for its counters.
- Remove the calls from the loop. A value that lives across a function
  call has to survive that call, and our allocator then put it on the
  stack. Writing rb_match and zn_update directly into the loop, so the
  loop made no call, should have let its values stay in registers.

enc11 stayed between 1.57 and 1.61 times Go through both. The telling
result was the first: the split-out loop function still kept its
counters on the stack. The
spills were not only about calls, and not something the port could
rewrite its way around. We had to read what the compiler produced.

## What the compiler produced

The innermost lookup of the distance cache loop is one line of Xo
(std/brotli.xo line 5109 at the commit before the fix):

    let backward = q.dc[4 * qi + dci[j]] + dco[j]

It reads three lists and adds. On darwin/arm64 it compiled to 28
instructions. In the listing below, every `ldr ... [sp, #...]` is a
value loaded back from the stack, a reload; `b.hs` is a jump to the
index check's error path and `b.vs` a jump to the overflow check's
(Xo checks both on every list index and every Int add). The names in
the comments come from the debug build's record of where each variable
lives:

    ldr  x16, [sp, #0x90]        ; reload qi
    lsl  x10, x16, #2            ; 4 * qi
    ldr  x16, [sp, #0x130]       ; reload the list dci
    ldr  x9,  [x16, #0x8]        ;   and its length
    ldr  x16, [sp, #0x60]        ; reload j
    cmp  x16, x9
    b.hs ...                     ;   index check on dci[j]
    ldr  x16, [sp, #0xb8]        ; reload dci's data address
    ldr  x17, [sp, #0x60]        ; reload j again
    ldr  x9,  [x16, x17, lsl #3] ; dci[j]
    adds x10, x10, x9            ; 4 * qi + dci[j]
    b.vs ...                     ;   overflow check
    ldr  x16, [sp, #0xe8]        ; reload the list q.dc
    ldr  x9,  [x16, #0x8]        ;   and its length
    cmp  x10, x9
    b.hs ...                     ;   index check on q.dc[...]
    add  x9, x16, #0x18
    ldr  x10, [x9, x10, lsl #3]  ; q.dc[...]
    ldr  x16, [sp, #0x128]       ; reload the list dco
    ldr  x9,  [x16, #0x8]        ;   and its length
    ldr  x16, [sp, #0x60]        ; reload j a third time
    cmp  x16, x9
    b.hs ...                     ;   index check on dco[j]
    ldr  x16, [sp, #0xc0]        ; reload dco's data address
    ldr  x9,  [x16, x17, lsl #3] ; dco[j]
    adds x16, x10, x9            ; the sum
    b.vs ...                     ;   overflow check
    str  x16, [sp, #0x70]        ; backward goes straight to the stack

Nine of the 28 are reloads. The loop counter j, the one value every
iteration needs, is loaded from memory three times in one line, and the
result is stored to memory as soon as it is computed.

The second cause was in the cost model, which is Float32. arm64 has
single precision instructions, so a Float32 add can be one `fadd` on
`s` registers. Xo instead widened each value to double precision when
it was loaded and narrowed it back before the operation (line 5098, the
same before and after the register fix):

    ldr  s16, [x9, x10, lsl #2]  ; load a Float32 cost
    fcvt d16, s16                ; widen to double
    fcvt s17, d16                ; narrow back to single
    fcvt s16, d8                 ; narrow the other operand
    fadd s18, s17, s16           ; the add we wanted

Three of these five instructions are conversions that change nothing
(each value starts and ends as a Float32), and two of them form a chain
that the add has to wait for, in the cost model's innermost loop.

## Why the rest of the standard library had not found this

Two counts explain it.

Float32: std/brotli.xo names the type 48 times. Next come the prelude
(17: the type's own methods, parsing and formatting) and std/random (10:
its float32 draws). No other top-level std file names it more than 4
times. We checked the two runners up: the prelude's uses are bit
conversions, parsing and formatting, and random's arithmetic is the
ziggurat's wedge test, reached only when a draw falls outside its box.
Neither is a hot Float32 loop. As far as we know, Brotli's cost model
is the first one std's timing twins measured.

Register pressure: most hot loops in std (hashes, ciphers, checksums)
hold a few pointers and a counter. A faithful port of a C encoder's
optimal parse holds a dozen lists, their offsets and several counters
at once. As far as we know it is the first hot loop of that shape any
of std's timing twins measured.

A compiler's weak spots show up only when a program's shape reaches
them, and std's earlier twins had not reached either of these. It took
a 20,000 line port of a C program, measured against a Go twin, with
work counters to rule out the algorithm.

## Fixing the register allocator

The fix went into the register allocator for arm64 and x86-64. Before
it, a value live across a call went to the stack for its whole life, so
every use in the loop above reloaded it. Now such a value may take a
"caller saved" register (one a called function is free to overwrite):
the value is stored before each call and loaded after it, when those
calls weigh less than the value's uses in the loop. Tail calls, calls
that never return and system calls do not count against it. A call with
a landing pad (where an error unwinds to) counts only for a value the
pad does not read.

Two details came from testing the change. An early version of it gave
best_idx2 and a list's address in histogram_combine the same register,
x14, while both were live, and brotli's output grew (13,800 bytes
instead of 13,312); the change now keeps each register's ranges
disjoint. And one caller saved register stays free for a third spilled
operand of a multiply-add, a case found not in brotli but in MapLog, the
code the compiler generates for Xo's maps.

How we measured it. We use two tools, because they answer different
questions:

- callgrind runs the program on a simulated CPU and counts every
  instruction it executes. The count does not depend on what else the
  machine is doing, so a 1% change is real, but it says nothing about
  how long each instruction took.
- `xo bench --ab` is Xo's timing tool. Given two builds of the program,
  A and B (for us, built at the commit before a change and at the
  change), it runs them alternately in rounds on a quiet machine,
  reporting the median ratio of wall time with a 95% interval, and says
  "within noise" when the interval crosses 1. A speed claim in Xo
  needs one.

For enc11, the commit before the fix against the fix, on our linux/arm64
timing machine (4 rounds, load 1.05 on both sides):

| | before | after | after / before |
|---|---|---|---|
| wall ms, median | 325.0 | 301.9 | 0.929 (95%: 0.927 to 0.951) |
| max RSS KB | 17,464 | 17,424 | 0.998 |

callgrind counted 7.42 billion instructions before and 7.20 billion
after, 2.95% fewer. Wall time fell more than that, 7.1%, and that is
what we expected: the instructions removed were reloads, each sitting
in front of the next index check or add, so each one cost more than an
average instruction.

The line above went from 28 instructions with 9 reloads to 25 with 6: j
now lives in a register. The fix is not a win at every line, though.
update_nodes as a whole has more stack accesses after it than before
(579 against 517), even though this line has fewer. The allocator now
chooses where to pay, and here it pays less inside the loop.

## Fixing Float32

Xo already kept Float32 arithmetic in single precision registers, but
a value loaded from a List[Float32] was still widened to double and
narrowed back around each operation, as shown above. The arm64 fix now
keeps such a load in its single precision register for the fadd, fmul
and the rest that use it: 0.70% fewer instructions on enc11 under
callgrind. The results are equal bit for bit, since each operation
rounds to Float32 either way and Xo never fuses a multiply and an add
behind the programmer's back.

## Where it stands

Brotli's rows on the linux/amd64 machine, from the committed timing
evidence just before and just after the register allocator fix (medians
of 9 runs, Go and Xo alternating):

| workload | before Xo / Go | after Xo / Go |
|---|---|---|
| text (decode) | 1.004 | 1.014 |
| html (decode) | 0.771 | 0.772 |
| mixed (decode) | 1.089 | 1.103 |
| enc1 | 0.816 | 0.807 |
| enc6 | 1.046 | 0.962 |
| enc11 | 1.490 | 1.409 |

The decoders and enc1 moved by 1.3% or less (mixed the most), from one
run on each side with no noise measured. enc6 and enc11, the two
encoders that run the cost model, moved by 8% and 5%.

On the Mac, the same twin after the fix gives enc11 1.321 (Xo 364.9 ms,
Go 276.3 ms) and every other case under 0.91, so enc11 is the only case
there above Go. On the linux/amd64 machine, enc11 is 1.41, mixed 1.10
and text 1.01. On a second linux/arm64 machine every encoder is about
1.4 to 1.6 times Go (enc11 1.555: Xo 279.4 ms, Go 179.6 ms), a broader
gap than the cost model alone, which we are still taking apart.

## The fast quality: three more findings

Quality 1 had its own story, found the same way: profile first, then a
change in the port to test the guess, then the compiler fix.

A profile of enc1 on the second linux/arm64 machine showed two functions
that do not appear in Go's profile at all: the bit writer write_bits at
23% of the time and match_len at 19%. That pointed at two causes.

The first was inlining (copying a small function's body into its caller
instead of calling it). Go's compiler inlines writeBits at 151 of its
196 call sites, and inlines findMatchLengthWithLimit into
createCommands. Xo inlined match_len but never write_bits, because its
callers have landing pads. Two inliner changes followed. The first
sizes a function with landing pads without its error paths and inlines
a small one at up to 8 sites; on our linux/arm64 timing machine it took the text decode case to 0.909 of
its time. The second lets the inliner look past a landing pad; measured
on enc1 against its parent commit on our linux/arm64 timing machine it
was 0.998 (within noise), with 0.85% fewer instructions under
callgrind. It still did not inline write_bits in this program: the
inline report gives a different reason after it, with the same outcome.

The second cause was memory reads. The port reads 8 bytes as a little
endian word, and Xo's arm64 backend compiled that as eight checked
byte loads, where Go emits one load. To test that guess without
touching the compiler, we wrote one 8-byte load in the port, with its
bounds checked once. enc1 dropped to 0.783 of its time on our
linux/arm64 timing machine (12 rounds; the runs took 38 ms, which our
timing tool marks as too short to fully trust). The compiler then
learned to combine adjacent byte loads into one on arm64: enc1 0.985
(95%: 0.977 to 0.991) against its parent commit, 2.55% fewer
instructions under callgrind. So the compiler fix recovers little of the
0.783 the hand-written load showed, and whether that gain came from the
single load or from the bounds checks the port change also removed is
still open. Xo's profiler does not resolve single instructions, so we
make no claim about any one load.

A later profile on the Mac, after both compiler changes, still had
create_commands at 38% of enc1's time and write_bits at 28%: the bit
writer is the next thing to fix in the port itself.

The third finding was not in the compiler at all. enc1's profile showed
13% of its time in the out of line copy-on-write check, on writes to a
buffer that only one variable held. Xo lists are copy on write: a write
to a list that might be shared copies it first. List.filled, which made
that buffer, returned its list through an Any (Xo's dynamic type) used
as a type cast, and passing through an Any marks a list as shared for
good. Fixing the cast took enc1 to 0.835 of its time on the linux/arm64
timing machine (95%: 0.826 to 0.844). Four more prelude functions with
the same cast (sort, concat, map) were fixed the same day.

In all, one port led to five compiler changes (the register allocator,
Float32 loads, load combining and two inliner changes) and a fix in the
prelude, of which the register allocator moved this program most. It closed a
sixth of the x86-64 enc11 gap (1.490 to 1.409) and named the rest.

No other module's committed timings were rerun between the commit
before the register fix and the commit after, so we claim no other
before and after from them.

## Update: Brotli at the 0.55 release

After this article was written, two more std changes landed for Brotli
(tasks #457 and #271), and the timing evidence was rerun on the second
linux/arm64 machine at commit 8211a298b (medians of 9 runs, Go and Xo
alternating):

| workload | Go ms | Xo ms | Xo / Go |
|---|---|---|---|
| text (decode) | 51.4 | 48.4 | 0.942 |
| html (decode) | 24.4 | 23.1 | 0.946 |
| mixed (decode) | 24.5 | 21.5 | 0.876 |
| enc1 | 34.1 | 16.1 | 0.472 |
| enc6 | 21.9 | 20.4 | 0.930 |
| enc11 | 172.0 | 176.1 | 1.024 |

On that machine every case but enc11 is now faster than Go, and enc11,
which was 1.555 there, is 1.024: inside the standard library's Proven
bar of 1.05. These rows are from one machine; the linux/amd64 and Mac
figures above were not rerun.

## Catching the next one before a port does

The lesson is not that Brotli was special. It is that we found these
weaknesses only because a program of the right shape happened to be
ported. So we are building checks that look for the shape directly:

- A spill report: a compiler debug report of spills and reloads per
  innermost loop, and of redundant float conversions (fcvt pairs), run
  over all of std.
- A type by operation matrix: every numeric type (Int8 to Int64, the
  unsigned types, Float32, Float64) against every arithmetic, compare
  and convert operation, asserting the instructions each compiles to.
  This is the check that would have caught the Float32 detour before a
  port did.
- A register pressure curve: generated loops with 4 to 24 live values,
  plotting spills against the number of live values. Spills should
  start near the number of registers, not well before it.
- A kernel suite: a known set of benchmark kernels ported under bench/,
  each timed against Go and C.

None of the four has landed yet; they are scheduled now that the
standard library has reached its Proven bar (2026-11-20). When they do, the next Brotli should
show up as a red line in a report, not as a 1.49 in a port.

## Sources and method

Every number above comes from a file or commit in the Xo repository:

- Why Brotli, the port's size: knowledgebase/decisions/0666-std-brotli.md
  (Context), and bench/results/ui-wasm-client-2026-11-15.md for the
  client sizes and the 4G estimate.
- The update's table: std/evidence/brotli/perf.md at commit ac7dbacc3
  (linux/arm64, measured at 8211a298b; lines 15 to 21).
- Correctness: std/evidence/brotli/fuzz.md (line 9), stress.md (line 9),
  race.md (line 11).
- The first timing table: std/evidence/brotli/perf.md at 0d711b43f~1
  (linux/amd64, before the register allocator fix; lines 9 and 15 to
  21). The twin: bench/perf/brotli (main.xo, twin.go.txt).
- Work counters, the 20x profiles, the two rewrites, the disassembly
  at 1a069ee71 and 3a52b2add, the stack access counts, the Mac twin
  timings at 21b089434, the enc1 profile at ecb526b67, the inlining
  reports and Go's writeBits call sites, and the linux/arm64 --ab runs
  for quality 1: bench/results/brotli-article-sources-2026-11-19.md.
- Float32 counts: bench/results/brotli-float32-count-2026-11-19.md.
- Register allocator fix: commit 3a52b2add (compiler/arm64/regalloc.xo and its
  commit message); its timing and callgrind counts:
  bench/results/brotli-enc11-381-2026-11-19.md.
- Float32 fix: commit 33b709913. Float32 in single precision registers:
  decision 0361. No implicit fused multiply-add: decision 0287.
- Timing method: decision 0340 (`xo bench --ab`).
- After the fix: std/evidence/brotli/perf.md at 0d711b43f (linux/amd64)
  and at 6098cc3df (the second linux/arm64 machine).
- Quality 1: the linux/arm64 profile (write_bits 23%, match_len 19%):
  std/changes/brotli.md; the hand-written 8-byte load's --ab run is in
  the article sources file above; load combining eb93227ed; the
  inliner changes 1b5c3256a (decision 0716) and d23c7e5d6; the copy-on-write cast fix 2ce0d3cfb and
  186ac4c12, with std/changes/prelude.md.
