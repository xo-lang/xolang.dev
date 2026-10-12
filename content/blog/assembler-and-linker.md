---
title: "Writing our own assembler and linker"
date: 2026-10-12T06:20:00-04:00
description: "On arm64 Macs, the Xo compiler written in Xo now turns its assembly into executables by itself: an assembler whose objects match the system assembler's byte for byte, and a linker that links the compiler to a fixed point with no C toolchain installed."
---

Until this week, every native Xo build on a Mac ended the same way: the
compiler wrote arm64 assembly and handed it to the C compiler driver,
`cc`, which assembled it and linked it with Xo's prebuilt runtime. That
meant a native build needed Apple's Command Line Tools, even though Xo
compiles no C of its own.

The self-hosted compiler now does both steps itself (decision 0182). The
assembler and the linker are written in Xo, in `selfhost/macho`, and the
self-hosted driver calls them. This post is about how they were checked,
and about the one bug that kept "equivalent" objects from being
identical ones.

## Why write them at all

The Go implementation of Xo is being retired (see the
[roadmap](/roadmap/)), so new compiler parts are written in Xo only. A
compiler that needs no outside tools is also simpler to install: on
macOS a self-hosted toolchain now needs only Xo's prebuilt runtime pack,
not the Command Line Tools.

Two alternatives were turned down. Shipping LLVM's `llvm-mc` and
`ld64.lld` would mean two large binaries per host, and still an outside
tool. Writing object files straight from the emitter, skipping the
assembly text, would lose the emitter's tested interface: its `.s`
output is compared byte for byte with the Go emitter's, and assembling
that same text lets the new assembler be compared with the system's on
the same input.

## The assembler: identical, not just equivalent

The target was set high on purpose: objects **byte identical** to what
`cc -c` writes, not merely objects that link and run. With that target,
any difference from the system assembler is a bug the comparison points
at, instead of a judgment call.

The comparison script assembles each input both ways and compares whole
files, every section, every function's machine code, and the relocation
tables. The inputs were the assembly of every arm64 test program (158
files, 1,212,359 lines) and of the self-hosted compiler itself
(13,759,561 lines, 258 MB):

| input | objects identical | functions identical | relocation tables identical | assembly time (Xo / cc) |
|---|---|---|---|---|
| 158 arm64 test programs | 158 of 158 | 3,792 of 3,792 | 904 of 904 | 1.45 s / 9.93 s |
| the self-hosted compiler | 1 of 1 | 2,825 of 2,825 | 6 of 6 | 4.92 s / 35.40 s |

The compiler's own object is 57,025,520 bytes from both, and the Xo
assembler builds it in about a seventh of the time. Peak memory is about
the same (1.01 GB against 0.98 GB).

## The lesson: right bytes, wrong order

The first version was already correct in the sense that matters for
running programs: every section and every relocation matched. Yet only
38 of the 158 test objects were byte identical. The other 120 differed
only in the order of their local symbols, and through that in the
symbol numbers inside relocations and the offsets into the string
table.

The cause was a rule nobody documents. LLVM orders local symbols by when
the assembler first *registers* them: a label when it is defined, or
earlier, when an instruction or data directive first names it. A call
from `main` to a function defined further down registers that function
at the call. Section start symbols register when their section is first
entered, and the code section always comes first, even when it is empty.
The string table has its own order too: names sorted by their reversed
bytes, with a name that ends another sharing its bytes.

With those rules reproduced (and one odd field in the exception
handling data that the system linker ignores but `cc` writes anyway),
all 158 objects, and the compiler's, came out byte identical. The
lesson we keep relearning: "it runs" and "it is the same" are different
claims, and only the second one makes the next difference cheap to
find.

## The linker

The linker takes the program's object and the runtime pack's objects
and writes a Mac executable: segments and sections, imports from the
system library bound through chained fixups, unwind tables built from
the assembler's compact unwind entries, and a code signature.

**Signing.** arm64 macOS will not run an unsigned executable, so the
linker writes an ad hoc signature itself, in the same format Go's
linker uses: SHA-256 hashes of each 4 KiB page. No `codesign` step, no
certificate.

**No SDK either.** Every import binds to libSystem, which re-exports
the rest of the system's C library, so the linker reads none of the
SDK's library descriptions. The trade: a misspelled import fails when
the program launches, not when it links.

It is deliberately simpler than Apple's `ld`. It concatenates input
sections by name, with no dead stripping and no literal merging, and it
skips a few load commands that profilers and debuggers use. The results
against `ld` on the same inputs:

| measure | Xo linker | ld |
|---|---|---|
| the 158 test binaries, total bytes | 68,059,326 | 68,127,680 |
| linking a small program (median of 10) | 0.010 s | 0.054 s |
| linking the self-hosted compiler | 0.44 s | 0.11 s |

Small links are about five times faster; the compiler's own link, with a
57 MB object, is about four times slower. Both are well under a second.

## The proof: a fixed point with no toolchain

The final check runs with `PATH=/nonexistent`, so there is no C
compiler, assembler, or linker to fall back on:

| step | result |
|---|---|
| the test programs, built by the self-hosted driver with `--ld=macho` | 158 of 158 pass |
| that driver (A) builds the compiler again (B) | 660.3 s |
| B builds the compiler again (C) | B and C byte identical, and their assembly too |
| the test programs, built by B | 158 of 158 pass |

B was assembled and linked by Xo's own tools, and when B rebuilt itself
the result did not change by a single byte. That is the same fixed point
argument the compiler itself already passed, now extended to the last
two steps of the build.

## What it does not do yet

- **It is opt-in.** The self-hosted driver uses the new linker with
  `--ld=macho`; without it, `cc` still assembles and links. The
  released `xo`, built from the Go implementation, is unchanged and
  still uses `cc`.
- **Linux arm64 came later the same day** (below); other targets still
  use the system tools.
- **Programs that name time zones** still read the zone data from Go's
  `zoneinfo.zip` at build time. With no Go installed, set `XO_ZONEINFO`
  or build with `--tzdata=system`
  ([getting started](/docs/getting-started/) has the details).
- **`use c` sources** still need a C compiler, of course.

For everything else, a native Xo build on an arm64 Mac now goes from
source to a signed executable without leaving Xo.

## Update, later on 2026-10-12: Linux

The same approach now covers linux/arm64: an ELF assembler and linker,
also in Xo, in the same package. The self-hosted driver builds a Linux
executable from a Mac with `--target=linux/arm64 --ld=macho`.

The assembler was again held to byte identical objects, this time
against clang's ELF output. All 159 arm64 test programs' objects match,
4,159 of 4,159 functions, and so does the compiler's own object (3,306
functions), assembled in 5.81 s against clang's 33.49 s. The symbol
order lesson paid off: LLVM's ELF writer orders local symbols the same
way its Mach-O writer does, so the first version that compiled already
matched on every input.

The linker writes dynamically linked executables for glibc. All 159
test programs, linked by it, pass in two Debian containers with no C
compiler, assembler, or linker installed: bullseye (glibc 2.31) and
trixie (glibc 2.41). A small program's binary is 327,312 bytes, against
367,008 from gcc and GNU ld, which build a position independent
executable; the Xo linker does not do that yet.

One check is incomplete: building the test programs for Linux with the
self-hosted driver itself gave 133 binaries byte identical to the ones
that passed in the containers, and 26 that differ because the driver
names the package differently from the test harness (in strings and
symbol names, and in two programs the frame layout), not because of the
linker. Those 26 were built
but not run, because Docker had stopped. Like the Mac linker, this one
is opt-in.

