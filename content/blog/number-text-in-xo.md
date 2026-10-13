---
title: "Number text in Xo: moving a piece of the runtime out of C, one measurement at a time"
date: 2026-10-12T23:30:00-04:00
description: "Turning numbers into text and back is now written in Xo on the native backends. Each piece had to come within 5 percent of the C it replaced, on both backends, or stay C. Most pieces beat it; one did not, and it stayed."
---

Xo's native backends (arm64 and LLVM) link a runtime written in C. Part
of that runtime has to stay C: the allocator, reference counts, the
scheduler, system calls. But much of it is policy over Xo values, such
as how an Int is written as text or how a Float is parsed, and that
part can be Xo. Code written in Xo is compiled with the program, so it
also runs on the WebAssembly backend, which has no C at all.

The rule for moving any of it was set before the first line was ported
(decision 0180): **every workload of a port must be within 5 percent of
the C it replaces, in instructions retired, on both native backends**.
If a piece misses, it stays C, and the C version stays selectable
until the bar holds. This post is about step 3 of that port (decision
0193): the text of Ints and Floats, Float.parse, and hex and base64.

## How it is measured

`bench/perf/text` runs each workload in its own process, 200,000
operations (100,000 for hex and base64) on 1,000 prepared inputs, and
counts instructions retired: the minimum of 5 runs. Instruction counts
are stable on a busy machine, which wall time is not. They are not wall
time, and a lower count does not always mean a faster program, so every
figure below is instructions.

Each workload is built twice with the same compiler: the default (the
Xo code) and with `XO_LLRT_C=num`, which emits the C runtime's calls
exactly as before the port. The setup that prepares the inputs formats
about 3,000 Floats, which the C path does far more slowly, so comparing
whole processes would flatter Xo. The figures below subtract each
path's setup first. As a check on that subtraction, the twelve
workloads this step did not touch come out between 0.998x and 1.003x.

Every workload prints a checksum, and the checksums are identical on
both backends, on both paths, and equal to the Go backend's.

## The results

Xo over the C it replaced, instructions with the setup subtracted
(lower is better; the bar is 1.05):

| Workload | arm64 | LLVM |
|---|---|---|
| Int to text | 0.800x | 0.734x |
| Float to text | 0.019x | 0.014x |
| Float.parse | 0.282x | 0.273x |
| base64 encode and decode | 0.385x | 0.310x |
| hex (decode in Xo, encode still C) | 1.003x | 0.942x |

On these workloads the ported code matches or beats the C it replaced.
That is a statement about this code against that code, not about Xo
against C in general, and the biggest number in the table shows why.

## Float text: an algorithm, not a language

Float text takes 50 to 70 times fewer instructions, and almost all of
that is the algorithm. To find the shortest text that reads back as the
same Float, the old C called `snprintf` with more and more digits, up
to 17 times per Float. The Xo version uses Dragonbox, ported from Go
1.26's `ftoadbox.go`, which computes the shortest digits directly. Nothing here says C could not
do the same with the same algorithm. What the port bought
is that the better algorithm now lives in code compiled with the
program, on every native backend and the WebAssembly one.

## Float.parse: Go's parser, whole

Float.parse is Go 1.26's `atof.go` ported whole: special values, decimal
and hex text, underscores, the exact fast path, Eisel-Lemire, and the
800 digit big decimal fallback. One change was forced by measurement.
Parsing subnormal numbers (the tiniest Floats) through Go's big decimal
took about 94 times the C's instructions in a scratch program
(54,810,989,247 against 585,989,260 for 200,000 texts), and the whole
workload stood at 2.85x of the C. Rounding subnormals inside
Eisel-Lemire instead brought it to 0.28x.

Porting the whole parser also fixed a difference nobody had filed: the
old C parser on the native backends took neither underscores nor hex
floats nor texts over 4096 bytes, while the Go backend did. Native
builds now parse exactly what the Go backend parses.

## What the compiler needed

Dragonbox and Eisel-Lemire are 64 bit integer code. To write them in
Xo without a C call per operation, the compiler gained intrinsics that
the arm64 and LLVM emitters lower inline (the WebAssembly runtime has
them too): a 64 by 64 to 128 bit multiply (`umulh` on arm64), wrapping
add, subtract, multiply, and shifts, a Float's bits and back, and an
unchecked 8 byte load whose callers check the range.

Two smaller backend changes came from the Int text work. The arm64
backend now takes every logical immediate that repeats a pattern
(`0x3030303030303030` used to take four instructions to build), and
appending to an empty string literal, which is what `"${x}"` lowers to,
now makes the new string directly. That last change moved Int text from
1.139x on arm64 to 0.800x; the C path had always done it in one call.

## The piece that lost

Hex encoding (`Bytes.to_hex`) was ported too. The Xo version went from
1.516x to 1.093x of the C on arm64, and a scratch program of 100,000
encodes measured 61,934,145 instructions against the C's 53,477,421.
That misses the bar, so `to_hex` stays C; the decoder, which was even
with the C, moved. An attempt to batch the decoder's writes was worse
(1.140x) and was taken out.

The same rule kept an earlier piece in C. Duration text, from step 1,
is still 1.171x on arm64 and 1.087x on LLVM after the arm64 backend
learned to divide by a constant with a multiply (more on that in
[Measure, don't guess](/blog/measure-dont-guess/)), so it stays C as
well.

## Correctness

A differential test feeds 336,386 lines to a native program on arm64
and LLVM, through both the Xo and the C paths, and compares every
output line with Go's `strconv`, `encoding/hex`, and `encoding/base64`.
The inputs are Floats from random bits of every class, 19 digit texts
near the bottom of the range, exact halfway points between neighboring
Floats written with 800 digits (and just above and below them), powers
of ten from 1e-350 to 1e330, malformed texts, hex floats, underscores,
random Ints, and damaged base64. Every line matches. The golden tests
pass on arm64 and LLVM, and the self-hosted compiler's SSA, arm64,
LLVM, and WebAssembly comparisons pass.

## What is next

The C path for this step stays selectable with `XO_LLRT_C=num` for
now. Next in the port is std/json's Float text and number parsing on
the same Dragonbox digits (step 4), then a second try at `to_hex` with
a wider write primitive. Each will be measured the same way, and each
stays C if it loses.

The figures in this post come from
`bench/results/runtime-port-step3-2026-10-12.md` and decision 0193 in
the repository.
