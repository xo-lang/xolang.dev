---
title: "Low-level power for the runtime, not for your code: how Xo and Go draw the line"
date: 2026-10-13T00:00:00-04:00
description: "Xo's runtime is moving from C to Xo, and runtime code needs things ordinary code should not have: wrapping arithmetic, 128 bit multiplies, unchecked loads. Here is how Xo gives those to its standard library and nobody else, and how that compares with Go."
---

A language runtime needs operations that ordinary code should not
touch. Turning a Float into its shortest text needs a 64 by 64 to 128
bit multiply and arithmetic that wraps instead of faulting. Scanning
bytes fast needs loads that skip the bounds check because the caller
already did it. A scheduler needs atomics and a way to switch stacks.

Xo is moving its native runtime from C to Xo (the
[number text post](/blog/number-text-in-xo/) covers the latest step),
so it has had to decide where these operations live. The answer is:
inside the standard library, and only there. This post shows how that
works and compares it with Go, which solved the same problem first and
made a different choice about what users get.

## How Xo does it: a module only std can see

The runtime code written in Xo lives in `std/native/llrt/`, for example
`num.xo`, which formats and parses numbers. It starts like this:

```
use native/llrt/num_tables
use native/rt
```

`native/rt` is a module of intrinsics: functions that look like calls
but that the compiler's code generators replace with instructions. Step
3 of the runtime port (decision 0193) added these:

- `rt.int_wrap`: add, subtract, multiply, and shifts that wrap around
  instead of faulting on overflow;
- `rt.u64_mul_hi`: the high 64 bits of a 64 by 64 bit multiply (one
  `umulh` instruction on arm64, a 128 bit multiply on LLVM);
- `rt.float_bits` and `rt.float_from_bits`: a Float's bits as an
  integer, and back;
- `rt.bytes_word`: an 8 byte load with no bounds check, whose callers
  check the range themselves.

With those, Dragonbox (Float to text) and Eisel-Lemire (text to Float)
could be written in Xo without a C call per operation. `num.xo` calls
`rt.u64_mul_hi` in the middle of its inner loops.

Now try the same import from your own code:

```
use native/rt

fn main(os: Os) {
  os.stdio.println("${rt.u64_mul_hi(3, 4)}")
}
```

```
$ xo check .
main.xo:1:1: error XO0601: module `native/rt` not found
1 module(s), 1 error(s), 0 warning(s)
```

That is the whole mechanism. The checker resolves `native/` imports
only for std's own implementation modules (decision 0074), and the
runtime modules under `native/llrt/` are visible only to those and to
each other. To user code, the module does not exist. Nothing has to be
marked unsafe, because nothing outside std can reach it, and nothing in
the language specification changes when an intrinsic is added.

## How Go does it

Go has the same need and several layers that answer it. We checked each
against Go 1.26's sources.

- **The `internal/` import rule.** A package under `internal/` can be
  imported only from within the tree rooted at its parent, so packages
  under `src/internal/` are for the standard library alone:
  `internal/runtime/atomic`, `internal/runtime/sys`, `internal/abi`, and
  `internal/bytealg`, which holds the vectorized search behind
  `strings.Index` (through `internal/stringslite`).
- **An intrinsic table.** `cmd/compile/internal/ssagen/intrinsics.go`
  lists functions whose calls the compiler replaces with instructions,
  such as `internal/runtime/atomic.Load64` and
  `internal/runtime/sys.Bswap64`.
- **Assembly.** The runtime has 182 `.s` files, including the goroutine
  switch (`runtime·gogo`), and `internal/bytealg` has its search loops in
  assembly per architecture.
- **Compiler directives.** `//go:nosplit`, `//go:noescape`, and
  `//go:linkname`. Linkname lets one package reach another's unexported
  symbol; since Go 1.23 the linker refuses a linkname into the standard
  library unless the definition is marked as allowing it.

Xo's `native/rt` is, roughly, Go's `internal/` rule and intrinsic table
in one: a hidden module whose functions are lowered inline.

## Where the two differ

Go also gives raw power to everyone. `unsafe` exposes raw pointers and
pointer arithmetic. `sync/atomic` and `math/bits` are public, and the
same intrinsic table maps them onto the internal versions:
`sync/atomic.LoadInt64` becomes `internal/runtime/atomic.Load64`, and
`math/bits.ReverseBytes64` becomes `internal/runtime/sys.Bswap64`. That
is a reasonable choice for Go, whose users write runtimes, databases,
and network stacks in it.

Xo keeps that power inside std. Users get the safe operations built on
it (`Float.parse`, `Str` methods, `Bytes.to_base64`), not the
primitives. The reason is the audience: Xo is designed to be written by AI
agents, and every construct in the language is one more thing an agent
can misuse and a reviewer has to check. A smaller language with no
unsafe corner is easier to write correctly and easier to review.

There is one deliberate way out, and it is visible. On native builds,
`use c` calls C through bindings generated from a header, and every
call performs the `ffi` effect, which shows up in function signatures
and in a dependency's effect ceiling unless someone vouches for
narrower effects. Raw power exists, but it is foreign code, labeled as
such, not an unsafe dialect of Xo.

## What is planned (not done)

The direction (decision 0195, accepted by the project owner as a
direction; the plan's steps are still proposed) is a runtime with no C
that Xo has to compile. Calling the platform's own libraries, such as
libSystem on macOS and kernel32 on Windows, stays allowed, as Go also
does where the kernel interface is not stable. Today the scheduler,
atomics, system calls, TLS, and the bulk byte scans are still C.

Getting rid of that C needs more primitives: atomics with memory
ordering, raw system calls on Linux and direct libSystem calls on
macOS, word-at-a-time or SIMD scans that can match `memchr`, and a way
to keep constant time code constant time through the optimizer. The
plan is to add each the same way as step 3's intrinsics: internal, for
std only, with no change to the language users write. The few
instructions that switch one task's stack for another's are assembly
today and are expected to stay assembly per CPU, as Go's `gogo` is.

One question is open on purpose. Constant time code matters to anyone
writing cryptography, not only to std. Whether users ever get a way to
mark their own code constant time is undecided, and the project owner
wants to be careful about what goes into the language. For now, the
answer is the same as for everything else in this post: the power stays
in std.
