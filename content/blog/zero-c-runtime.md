---
title: "No C left in the runtime: replacing 26,743 lines of C and Mbed TLS with Xo"
date: 2026-10-16T09:39:00-04:00
description: "Three days ago Xo's native runtime was 26,743 lines of C, and TLS came from 206,879 lines of vendored C. Now both are Xo. Why we did it, the intrinsics and seeds it took, the bugs it found, and what is faster and what is still slower."
---

On 2026-10-13, a native Xo program still carried a runtime written in
C: 26,743 lines in std/llrt, plus 206,879 lines of vendored third party
C (Mbed TLS and fiat-crypto) for TLS. As of the 0.16.0 release, the
runtime has no C at all, and TLS, X.509 and every algorithm under them
are written in Xo. This post covers why we did it, how it went, the
bugs it surfaced, and an honest look at performance. As usual, AI
agents did the work and the project owner set the direction (decisions
0195 and 0202).

## Why remove the C

Every C file in the runtime meant a C toolchain for every target (or a
prebuilt runtime pack per target), a second language to debug when the
runtime faulted, and code that Xo's own checks never see. Removing it
buys four things:

- **One toolchain.** Building a native Xo program needs `xo` and
  nothing else: no C compiler, no system headers.
- **Cross compiling is just a flag.** There is no per-target C runtime
  to build or ship.
- **One language for agents.** An agent reading a scheduler bug, a
  socket bug and a TLS bug reads Xo in all three, under the same
  checker, tests and diagnostics.
- **Everything is changeable in one place.** The compiler, the runtime
  and the standard library are now one Xo code base.

Go is the model here: it has had no C in its runtime since Go 1.5. Like
Go, Xo still calls the platform's libraries where the kernel interface
is not stable (macOS's libSystem, Windows' DLLs), but it calls them
from Xo.

## How it went

The work ran as a checklist of agent-sized items, ordered by an audit
of every C file: the scheduler and event loop, sockets, processes, the
test world, the HTTP/1.1 and HTTP/2 client and server, standard input,
the file system, program entry, fault unwinding, and finally TLS.
Several agents worked in parallel in separate worktrees, and the C left
the tree in batches of about 2,000 lines, each followed by an explicit
seed build.

### The intrinsics that made it possible

Some runtime C existed only because Xo had no way to say what it said.
Each gap became a small, internal intrinsic, approved by the owner as a
decision:

- **Crypto intrinsics (decision 0231):** add and subtract with carry,
  AES rounds and carry-less multiply, later add with carry in
  (`cpu.adc`) and SHA-256's compression. Each is an ordinary Xo
  function with a portable, constant time body; the native backends
  replace a call with the CPU's instruction. Without them, Xo's
  crypto would have been far slower than the C it replaced.
- **External C symbols (decision 0232):** calling C library functions
  from Xo, including weak references for optional ones such as the
  sanitizer hooks.
- **Function and frame addresses (decision 0233):** `rt.fn_addr` gives
  the address of an Xo export, so C-style callbacks, signal handlers
  and the runtime's service records can be filled in from Xo;
  `rt.frame_addr` gives the boundary frame that fault unwinding stops
  at.
- **Exact C names and entry stubs (decision 0234):** Xo exports under
  exact C symbol names, the C data symbols the platform expects, and a
  process entry emitted by the backends. This is what let `main` itself
  become Xo.
- **Static words (decision 0237):** a table of process-wide words
  (now 256), where the runtime keeps its globals without C statics.

### Seeds along the way

Xo's compiler is written in Xo, and each release is built by the one
before it (decision 0216). A seed that predates an intrinsic cannot
build compiler code that uses it, so every time the runtime needed a
new intrinsic in code the compiler itself compiles, a new seed had to be
cut first. That is why the work produced six releases in two days
(2026-10-15 and 2026-10-16):

| Release | What it unlocked |
|---|---|
| 0.12.0 | The zero-C branch merged: runtime C from 26,743 lines to about 5,900; TLS in Xo; the first crypto intrinsics and external C symbols. |
| 0.13.0 | Mbed TLS and fiat-crypto deleted (third_party from 206,879 lines to none); runtime C to about 2,660; `rt.fn_addr` and `rt.frame_addr` added for the next step. |
| 0.14.0 | Runtime C to 476 lines: services records, callbacks, signal handlers and the entry frames moved to Xo through the new intrinsics. |
| 0.15.0 | Exports under exact C names and the XO_NOLIBC process entry from the backends; runtime C to 343 lines. |
| 0.16.0 | Runtime C at 0 lines: `main` is Xo. |
| 0.17.0 | Add-with-carry chains for crypto, and 256 static words usable by the compiler's own code. |

### Replacing Mbed TLS

TLS was the largest single item. The Xo TLS stack does TLS 1.2 and
1.3, X.509 parsing and verification, and the algorithms under them:
SHA-2, SHA-3, HMAC, HKDF, AES-GCM, ChaCha20-Poly1305, X25519, the NIST
curves from P-224 to P-521, RSA, Ed25519, and the ML-KEM-768 and
ML-KEM-1024 hybrids. It matches Go 1.26's behavior and group list, and
it is checked against Go's `crypto/tls` and `crypto/...` packages by
differential tests that run every operation on both sides.

## The bugs it surfaced

Moving the runtime into Xo, and then running it on more platforms,
shook out bugs that the C had been hiding or that were waiting in
untested paths:

- **Fault unwinding on x86-64.** For a call with more than six integer
  arguments, LLVM may push stack arguments and record their size with
  `DW_CFA_GNU_args_size`, and a landing pad expects them popped. Xo's
  unwinder read the opcode and dropped its value, so a cleanup ran with
  the stack pointer off by the pushed bytes. Faults through such frames
  crashed on linux/amd64 instead of being reported.
- **Thread-local addresses folded by LLVM.** The LLVM backend read the
  thread-local table through a plain `getelementptr`. For LLVM 15 and
  later that is a constant address, and the optimizer folded it into
  callers, so a task that moved to another worker thread kept using the
  first thread's table. Programs that park tasks crashed at random on
  linux/arm64; reading through `llvm.threadlocal.address` fixed it.
- **Windows faults that ran no cleanups.** The Windows unwinder compared
  the caller's stack pointer with the boundary frame instead of the
  frame's own, so the walk stopped one frame early: every fault ended
  the program at once, without running `defer` blocks.
- **Copy on write and raw memory.** A list in Xo is a value with copy on
  write. When SHA-256 moved to the CPU's instructions, the compression
  wrote the state through its raw address, which skips the copy: a
  hasher's `sum` or `clone` changed the original too, and every TLS 1.2
  handshake failed in testing. The rule is now written down: make an
  ordinary index store before raw writes into a list that may be
  shared.

Each one is recorded with its symptom, cause and fix in the project's
knowledge base, and each fix came with a test.

## Performance

We measure instructions retired, so results are repeatable on a busy
machine.

**The runtime itself.** A sweep of every `bench/perf` program, before
and after the switch, found 39 workloads faster beyond the noise bar,
including program startup (0.87 to 0.90 of the C runtime's instructions
on arm64) and the reader-writer mutex on LLVM (0.83). What is still
slower is the scheduler's hot paths: after follow-up fixes, channel
send and receive are 1.090 times the C's instructions on arm64 and
1.028 on LLVM, and spawning is 1.07 to 1.12 times.

**TLS, bulk.** Encrypting and decrypting data now costs fewer
instructions than Mbed TLS did. For AES-128-GCM over TLS 1.2, Mbed took
14.0 million instructions a MiB; the Xo stack takes 13.6 on the arm64
backend and 11.8 with LLVM. The first working version of the Xo stack
took 205.0 and 138.6, so this took the CPU's AES and carry-less multiply
instructions and a good deal of work on GHASH.

**TLS, handshakes.** This is where Xo is still behind. A full TLS 1.3
handshake with X25519 and a P-256 certificate chain took Mbed 5.2 to
5.3 million instructions. The first Xo version took 82.3 million on
arm64 and 47.3 million with LLVM. Field arithmetic rewritten around the
carry intrinsics, fixed-base tables, and SHA-256 in hardware brought
that to 10.65 and 7.34 million: about 1.4 times Mbed with LLVM, and
about 2 times on arm64. On the server side, an RSA-2048 handshake costs
36.0 million instructions on arm64 and 19.7 million with LLVM, down
from 53.7 and 28.1 before the RSA arithmetic moved to carry chains.

The remaining handshake gap has two parts. Mbed's P-256 arithmetic came
from fiat-crypto, which generates verified field code, and the same Xo
source still costs about 1.45 times as many instructions through Xo's
own arm64 backend as through LLVM (10.65 against 7.34 million for that
handshake). Closing the arm64 gap is compiler work, and it is the next
item.

## What C is left

None in the runtime or anything a program links. The `.c` files left
in the repository are test inputs: the C stress tests of the task
runtime and event loop (which drive the Xo runtime through its C ABI
exports), the C binding tests, and an example of calling Xo from C.
