---
title: "Byte-identical or it didn't happen: how Xo learned to compile itself"
date: 2026-10-12T06:00:00-04:00
description: "Every part of the Xo compiler was ported to Xo by comparing it with the Go implementation, function by function, until the output was the same to the byte. Why we held it to that bar, how the stages went, and the one bug only the self-hosted compiler could expose."
---

Every part of the Xo compiler now exists in Xo: the lexer, parser,
checker, SSA builder, and all three code generators. Xo built with
itself reproduces its own assembly byte for byte. This post is about
how we got there, and about the one rule that made it work: a port
is done when its output is byte identical to the Go implementation's,
not when the tests pass.

## Why byte identical, not "tests pass"

The usual way to check a rewritten compiler is to build the test
programs with it and check that they print the right thing. That is a
weak test for a compiler. A program can print the right thing from
code that is different, slower, or wrong in a way the test never
reaches: a frame one slot too small, a release in the wrong place, a
branch that only matters on input the test does not have.

Xo had something better available: a working compiler written in Go.
So every piece of the port was checked against it directly. Each stage
of the compiler gained a dump command (`xo ssadump`, `xo asmdump`,
`xo gendump`), and the test runs the Go version and the Xo version on
the same input and compares what they produce, function by function:

- **every program in the repository**, a few hundred of them, each a
  run of its own;
- **mutated programs**: operators swapped, literals changed, lines
  dropped or doubled, `?` removed, so the comparison also covers code
  nobody wrote on purpose (400 mutations for the SSA builder, with 0
  differences in its first stage);
- **with the Xo version built by every backend**: Go, arm64, and LLVM.
  The same Xo source compiled three ways has to give the same answer
  three times.

A difference is never "close enough". Either the port is wrong, or the
Go code it copied is, and both have happened.

## Stage by stage

Each component was ported in stages, and each stage ended in a table
with a zero in the "different" column. Functions a stage did not cover
yet were counted as skipped, never as passing.

| component | first stage | final stage |
|---|---|---|
| SSA builder | 5,844 of 10,990 functions identical, the rest skipped, 0 different | every pass identical on 306 runs (11,064 functions), plus 32,411 verifier verdicts on mutants |
| arm64 emitter | 5,237 of 7,910 functions identical, 0 different | 10,975 of 10,975 functions, 306 of 306 runs byte identical as whole files |
| LLVM emitter | 10,232 of 13,683 functions identical, 0 different | 13,683 of 13,683 functions, 318 of 318 modules byte identical |
| Go code generator | | 467 of 467 compared runs byte identical, all 27,864 declarations |

The checker is held to the same rule: the Xo checker's output matches
the Go checker's on all 685 runs of the repository, including programs
that call Go or C.

The end of a stage was often anticlimactic in a good way. The SSA
builder's passes were each identical on their first comparison,
because the port followed the Go code line by line, iteration orders
included. Every stage 2 construct of the arm64 emitter was identical on
its first full comparison. The method front-loads the work: matching
the Go code's order of iteration, and of everything else, is what makes
the comparison possible at all.

Where it was not first time, the differences were real findings. Some
were in the compiler: the arm64 backend failed to assemble an
instruction whose offset went past 4,095 bytes. Some were in the
comparison: the two SSA builders made a few generated functions in a
different order, which moved function numbers in 72 runs without
changing any function. That last one was fixed by making the Xo builder
match the Go one's order, so the comparison could stay strict instead
of learning to ignore things. (More on the SSA builder in
[The SSA builder, written in Xo](/blog/ssa-in-xo/).)

Strict cuts both ways. Late on, the comparisons flagged six modules
the Xo checker "rejected" and the Go one accepted. Both checkers printed
the same single diagnostic, a note. But the self-hosted tools treat any
diagnostic not marked as a warning as an error, and the Xo checker
marked a note with a separate flag. The diagnostics were right; what
the tools did with them was not. A note now counts as "not an error",
as it does in Go.

## The fixed point

Comparing pieces proves each piece. The whole compiler has one more
test, the classic one for a self-hosting compiler:

- **A**: the Go compiler builds the Xo compiler (written in Xo) for
  arm64.
- **B**: A compiles the Xo compiler.
- **C**: B compiles it again.

If B and C are the same, the compiler reproduces itself. Xo's bar is
higher: the assembly B wrote, the assembly C wrote, and the Go
compiler's assembly of the same program must all be byte identical.
On 2026-10-11 they were, 8,938,072 lines with one hash for all three.
The binaries differ in 49 bytes, all of them in the Mach-O UUID and
the code signature, which names the output file. B passed 132 of 138
test programs; the 6 others used TLS, which the self-hosted driver did
not build yet.

The next day, with TLS, time zone data, prebuilt runtimes, `use c`,
Linux assembly, and test binaries added to the self-hosted driver, the
fixed point held again (9,011,385 lines) and B passed 147 of 147. The
Go code generator has its own: the Xo compiler built with
`--backend=go` compiles itself to a byte identical build tree and
binary.

## The bug only the compiler could find

The comparisons above run on every program in the repository, and they
all passed. Then the full test tier, which also compares the Xo arm64
emitter when it is itself built by the LLVM backend, found 33 runs
where that build wrote stack frames 256 bytes smaller than the Go
emitter's. The Go and arm64 builds of the same Xo code agreed with the
Go emitter on 308 of 308 runs. Same source, three backends, one wrong.

That pattern points away from the port and at a backend. The cause was
a wrong-code bug in the SSA builder both native backends share: in a
compound assignment like `t.f += e`, where `e` calls a `var` method
that changes `t`, the old copy of `t` was written back and the change
was lost. [The test-tiers post](/blog/test-tiers/#update-2026-10-12-the-full-tier-caught-a-wrong-code-bug)
has the details and the fix (decision 0159).

No test program had that shape. The self-hosted emitter did, in one
line of its frame computation, `g.mem_bytes += 8 * g.nwords(t)`. It
took a compiler large enough, written in the language itself, and a
comparison strict enough to notice frame sizes, to expose it.

## The scare afterwards

The same bug came back once more, as a scare. A day later, while
profiling the self-hosted compiler, an LLVM build of it produced
assembly that differed from the Go emitter's in 457 of 2,826 functions,
every difference a frame size. It looked like a new LLVM miscompile.

It was the same bug: that branch had been cut before the fix merged.
Rebuilt from main, the LLVM-built compiler's assembly of itself is
byte identical to the Go emitter's, 13,930,156 lines, no function
different.

Two lessons from that one. A strict comparison makes old bugs easy to
recognize: the symptom matched the known one exactly. And the same
check caught a trap of its own: comparing the two compilers on a
package outside a module showed differences that came only from fault
positions being printed relative to different directories. The project
notes now say to compare those builds with each other, or only inside
a module.

## What it bought

The arm64, LLVM, and Go code generators are each done by the same
definition, so "done" means the same thing for all of them. If the
Xo compiler replaces the Go one, every function it emits has already
been compared with the one the Go compiler emits today, on every
program in the repository and on hundreds of mutants.

The rule costs time. The full comparison across every backend is the
slow tier of the test suite, and the [roadmap](/roadmap/) still has
retiring the Go implementation ahead, with the project owner deciding
each switch. But the alternative, a self-hosted compiler that passes
its tests and differs in ways nobody looked for, would cost more. The
one bug the comparison found that no test had found is the argument.
