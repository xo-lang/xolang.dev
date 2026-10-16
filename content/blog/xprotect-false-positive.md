---
title: "Malware Blocked: how twelve bytes of Xo's output matched an XProtect rule"
date: 2026-10-16T09:30:00-04:00
description: "macOS refused to open some programs Xo had compiled, calling them malware. The cause was not a signature, a linker bug, or Gatekeeper's mood: one data symbol sat at page offset 0x880, and three arm64 instructions that loaded it matched a byte pattern in Apple's rules. The dead ends, the find, the fix, and a second stall that only looked the same."
---

On the morning of 2026-10-16 the project owner's Mac showed a dialog
none of us expected: "Malware Blocked: 'http_stream' was not opened
because it contains malware." http_stream is one of Xo's golden test
programs, a small HTTP client compiled by Xo's own arm64 back end and
linked by its own Mach-O linker, selfhost/macho. This post is the story
of finding out why, including the parts where we were wrong. As usual,
AI agents did the work and the project owner set the direction.

## The symptom

Before anyone saw the dialog, the symptom was a hang. A freshly built
program never started: the process slept with its only thread at
`_dyld_start + 0`, before the dynamic loader had run a single
instruction of it. `sample` reported "Binary images description not
available", `codesign -v` said the signature was valid, and the test
harnesses reported "did not finish" or "run: timed out". Whole test
packages timed out on it, because every test behind the stuck program
waited too.

## The wrong theories

The first theory was the code signature. Xo signs its binaries ad hoc,
and `log stream` during a stalled exec showed the kernel rejecting it:

```
AMFI: '<path>': Unrecoverable CT signature issue, bailing out.
AMFI: code signature validation failed.
```

After that, syspolicyd assessed the binary with UI allowed, looked for
a notarization ticket, found none, and waited on the outcome, which is
a dialog for the person at the Mac. Later assessments logged "waiting
on another evaluation": one pending dialog held up every exec behind
it.

The stalls also seemed to depend on layout. A test program with a
7,300 word constant ran and the same program with a 7,600 word constant
did not; its `__TEXT` segment had grown from 0x230000 to 0x234000. That
looked like a property of the Mach-O file that macOS disliked, and it
pointed at selfhost/macho. So we shipped a mitigation (643b8261): link
darwin/arm64 programs with the system's cc by default again, and keep
selfhost/macho behind `--ld=macho`.

It did not hold up. A binary that Apple's own linker produced through
cc stalled the same way, and re-signing with `codesign -f -s -` or
changing the minimum OS version did not change the kernel's verdict.
The owner enabled the terminal under Developer Tools, which exempts the
programs it starts from these assessments, and the hangs stopped on
that Mac. That fixed the symptom for us, not the cause, and the cause
was what users would hit.

## Reading the rules

Then the owner saw the dialog itself. It did not say the program was
unsigned or unverified; it said malware. That is XProtect, Apple's
signature based scanner, and its signatures are YARA rules on disk.

There are two copies. The one most guides point at,
`/Library/Apple/System/Library/CoreServices/XProtect.bundle/.../XProtect.yara`,
was the older one on this Mac. The rules XProtect actually used were in
`/private/var/protected/xprotect/XProtect.bundle/Contents/Resources/XProtect.yara`,
version 5318. We copied both, installed yara in a Linux container, and
scanned every golden program. With the live rules, 3 of the 179 goldens linked by selfhost/macho
matched one rule, MACOS.SOMA.AUENB, and none of the same programs
linked by cc or built by the LLVM back end did:

```
XProtect_MACOS_SOMA_AUENB http_stream
0x24c0c8:$b0: 6B 01 22 91 CC 09 00 90 8C 01 22 91
```

The rule has several conditions. The one that fired needs no Mach-O
structure at all, only this byte pattern in a file under 5 MB:

```
6b 01 22 91  cc 09 00 ?0  8c ?1 ?? 91
```

## Why Xo's output matched

Decoded as arm64, those twelve bytes are three instructions:

```
add  x11, x11, #0x880      ; 6b 01 22 91
adrp x12, <page>           ; cc 09 00 90
add  x12, x12, #imm        ; 8c 01 22 91
```

That is the standard two instruction address load: `adrp` puts a 4 KB
page's address in a register and `add` adds the symbol's offset within
the page. The pattern is the second half of a load into x11 of a symbol
at page offset 0x880, followed by the start of a load into x12.

In selfhost/macho's layout, `__DATA` began with two runtime tables:
`xo_sys_words` (0x80 bytes) and `xo_static` (0x800 bytes since the
static word table grew to 256 words). The next symbol was
`_xo_empty_list`, the shared, immortal empty list every Xo program
uses, at 0x80 + 0x800 = 0x880, in every program, always. Code that sets
several list fields to empty loads that address into consecutive
registers. Two functions in the TLS client, `tls13.retry` and
`tls13.dummy_ccs`, did exactly that into x11 and then x12, and any
program that linked the TLS client and stayed under 5 MB carried the
pattern. Apple's linker orders the data differently, which is why cc's
output never matched.

## The fix

The fix is a layout change in the arm64 emitter (13345d68): the empty
list and the zero handle now come first in a program's data, at page
offset 0, ahead of the runtime tables. After it, none of the 179
goldens matches the live or the older rules, on either linker or either
back end.

Two tests keep it that way. TestEmptyListAtPageStart checks the empty
list's page offset in a macho linked program on any Mac. It fails with
a compiler from before the fix. TestXProtectRules builds the three
programs that matched, with both linkers, and scans them with the Mac's
own rules. Most Macs have no yara, so since d3e14abd the test runs yara
in the Linux container our Docker scripts already use when yara is not
installed. With a compiler from before the fix it reports all three
matches; with the fix it passes.

The fix is not a guarantee. Any address at page offset 0x880 loaded
into x11 and then x12 can still match, and other rules may match other
layouts. That is why the scan is a test and not a one time check.

## A second stall that looked the same

With the false positive gone, one program still hung at `_dyld_start`
in the dev goldens harness: http_tls_keys, linked by cc, and no rule
matched it. This one turned out to be about a path, not a file. The
cached binary waited on every exec, seven in a row and six of them at
once. A copy at another path, a copy with the same name in another
directory, and a hard link to the same inode at another path all
started in under 0.4 s. Some minutes later the original path started
again too.

The harness rebuilt every program at one fixed path in a directory that
several agent sessions share. One session could remove and relink a
binary while another session was starting it, and that path's
assessment wedged for a while. Now each run builds into a fresh
`run-<random>` directory and removes it at the end (c22f3266).

With both causes fixed, we ran every golden linked by selfhost/macho in
three rounds, one serial and two with 8 jobs: 179 of 179 each time, none
past 20 s. selfhost/macho is the darwin/arm64 default again (decision
0182's addendum), so arm64 builds on macOS need no C toolchain. On the
same programs, built one at a time without caches, the goldens built in
234 s against cc's 282 s, at 1.0055 times cc's bytes.

## Lessons for compiler authors

- **Read the dialog's exact words.** "Unverified developer" and
  "contains malware" are different systems. We chased the first while
  the owner's screen said the second.
- **Scan with the live rules.** On this Mac the well known path held an
  older copy of the rules. The live one is under
  `/private/var/protected/xprotect`.
- **A deterministic layout makes a fixed fingerprint.** Every program
  had the same symbol at the same page offset, so one unlucky
  instruction sequence repeated across every program that used it.
  Byte rules can match ordinary code; ours matched an address load.
- **Put the scan in the test suite.** A false positive like this comes
  back with any layout change, and it is cheap to catch before users
  do.
- **Separate the stalls.** Two different causes produced the same
  `_dyld_start` hang. Copying the binary to a new path, and hard
  linking it, told them apart in seconds.
