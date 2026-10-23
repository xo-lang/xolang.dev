---
title: "Where macOS keeps a program's debug info, and why Xo moved it"
date: 2026-10-22T16:00:00-04:00
description: "What a .dSYM is, why Apple keeps DWARF out of the executable, why Apple's own tools cannot read Go's default debug info, how Linux and Windows do it, and what Xo does since 0.26.0: the DWARF inside the executable, uncompressed."
draft: true
---

A crash report is only as good as its symbols. On macOS that turns on a
question most people never have to ask: where is a program's debug
information? This post covers what a `.dSYM` is, why Apple keeps DWARF
out of the executable, why Apple's own tools read none of Go's default
debug info, how Linux and Windows do it, and what Xo does about it.

Every tool output below comes from one script,
[`bench/results/macos-debug-info-2026-10-22/run.sh`](https://github.com/xo-lang/xo/tree/main/bench/results/macos-debug-info-2026-10-22),
run on 2026-10-22 on an Apple silicon Mac (macOS 27.0.1, Apple LLVM 21,
Go 1.26.1), once with the xo of that morning (`results.txt`) and once
with the xo that embeds its DWARF (`results-0346.txt`). The programs are
three-line hellos with a `greet` function kept out of line, so there is
an address to ask about.

## Apple's model: the debug map and dsymutil

When clang compiles with `-g`, each object file gets `__DWARF` sections.
When Apple's linker builds the executable, it does not copy them. It
leaves the DWARF in the object files and writes a *debug map* into the
executable's symbol table: stab entries that name each object file and
where its functions ended up.

Our C hello shows it. The executable has no debug section at all, and
`nm -ap` shows the map pointing back at the object file:

```
$ otool -l hello | grep sectname | grep debug
0
$ nm -ap hello | grep OSO
000000006ada69ee - 00 0001   OSO $OUT/c/hello.o
```

While the object files stay where they were built, lldb follows the map
and debugging works. To ship, `dsymutil` reads the map, collects the
DWARF from every object file, relocates it to the executable's
addresses, and writes a bundle: `hello.dSYM/Contents/Resources/DWARF/hello`
(9,232 bytes here). The bundle carries the executable's UUID, so a tool
holding an executable or a crash report can find the matching `.dSYM`:

```
$ atos -o hello -arch arm64 0x0000000100000460
greet (in hello) (hello.c:4)
```

A caution if you try this yourself: atos keeps a symbolication cache
keyed by the executable. In our runs it went on answering with file and
line after we deleted the object file, and after we deleted a `.dSYM`.
lldb reads the files each time, so where it matters below, lldb is the
check.

The reasons are speed and size. Linking skips copying debug info,
which matters for large C++ programs rebuilt all day. The shipped
executable stays small, and the `.dSYM` goes to a symbol server or to
the App Store, which symbolicates crash reports for you.

## Go: DWARF inside the executable, compressed

Go does not use Apple's linker for Go code, and it does not write a
debug map. Its linker puts the DWARF in the executable, in a `__DWARF`
segment, and by default it compresses each section (zlib), naming them
`__zdebug_*`:

```
$ otool -l hello-default | grep sectname | grep debug
__zdebug_abbrev __zdebug_line __zdebug_frame __debug_gdb_scri __zdebug_info __zdebug_loc __zdebug_ranges
```

Apple's tools do not decompress these. atos finds the symbol in the
symbol table but no file or line, dwarfdump prints an empty line table,
and lldb's `image lookup -v` finds no compile unit and no line entry:

```
$ atos -o hello-default -arch arm64 0x0000000100070ab0
main.greet (in hello-default) + 0
```

dsymutil does not help either. It builds a `.dSYM` from a debug map,
and a Go binary has none:

```
$ dsymutil hello-default -o hello-default.dSYM
warning: no debug symbols in executable (-arch arm64)
```

The fix is one linker flag, `-ldflags=-compressdwarf=false`. The same
DWARF, uncompressed, in `__debug_*` sections, and every Apple tool reads
it:

```
$ atos -o hello-plain -arch arm64 0x0000000100070ab0
main.greet (in hello-plain) (main.go:4)
```

The cost is size: the hello goes from 1,749,250 to 2,888,578 bytes.

Go's own tools read the compressed sections: the runtime's tracebacks
use Go's own tables, not DWARF, and Delve has its own DWARF reader. We
did not run Delve for this post. The gap is only with Apple's tools,
which matters most for ThreadSanitizer: on macOS its race reports call
atos to name frames.

## Linux and Windows

On Linux the DWARF goes in the ELF executable, in `.debug_*` sections,
for GCC, clang and Go alike. Go compresses there too, but in the ELF way
that readers understand: the section keeps its `.debug_*` name and
starts with a compression header (type 1, zlib). Tools that read ELF
DWARF (gdb, lldb, addr2line, perf) handle it. Shipping usually strips
the sections into a separate file and records a build ID or a
debuglink, much like a `.dSYM`, but the default is one file.

Windows uses a different format altogether: Microsoft's compilers write
CodeView debug info into a PDB file beside the executable, and WinDbg,
Visual Studio and the system's crash tools read PDBs. Go writes DWARF
into the PE instead (`.zdebug_*` sections in our cross build), which
Delve reads and Microsoft's debuggers do not.

So each platform has a default home for debug info, and a tool that
reads one format or layout can miss another:

| | Default home | Readers |
|---|---|---|
| macOS, Apple toolchain | object files, then a `.dSYM` (dsymutil) | lldb, atos, dwarfdump, crash reporters |
| macOS, Go | `__zdebug_*` in the executable | Delve; Apple's tools only with `-compressdwarf=false` |
| Linux | `.debug_*` in the executable (Go: compressed in place) | gdb, lldb, addr2line, perf, Delve |
| Windows, Microsoft | a PDB | WinDbg, Visual Studio |
| Windows, Go | `.zdebug_*` in the PE | Delve |

## What Xo does

Xo has its own linkers for Mach-O, ELF and PE. On macOS until now
([decision 0239](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0239-dwarf-line-tables.md))
its linker did what Apple's toolchain does at the end: it wrote the
`.dSYM` bundle itself, with the executable's UUID, so there was no
dsymutil step. The hello was 706,242 bytes, with a 1,404,699 byte bundle
beside it, and lldb found the line through the bundle:

```
$ lldb -b -o "image lookup -v -n xo_f_greet" hello
        Summary: hello`greet at main.xo:3:3
      LineEntry: [0x00000001000007f0-0x00000001000007f8): $OUT/xo/main.xo:3:3
```

Xo's own readers use the same DWARF. A native program that faults
prints a crash report with its frames named from it (decision 0343),
the sampling profiler names functions and lines from it, and
`xo dev symbolize` turns addresses into file and line.

The bundle has one weakness: it is a second file. A binary that is
copied, renamed, cached or packed into a container image without its
`.dSYM` still runs, but its crash reports and race reports name
nothing, and nothing warns you. Delete the bundle and lldb finds only
the symbol:

```
$ rm -rf hello.dSYM
$ lldb -b -o "image lookup -v -n xo_f_greet" hello
        Summary: hello`xo_f_greet
```

So [decision 0346](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0346-macho-embedded-dwarf.md),
accepted on 2026-10-22, moves the DWARF into the executable, as Go
does, but uncompressed, so that atos, lldb and dwarfdump keep reading
it. It goes in a `__DWARF` segment mapped with no access, placed before
`__LINKEDIT` so a code signature covers it. Xo's readers (the crash
report, the profiler, `xo dev symbolize`) look in the executable first,
then in a matching `.dSYM`. Its first stage landed the same day, for
programs Xo's own linker links. With the bundle deleted, lldb still
finds the line:

```
$ otool -l hello | grep sectname | grep debug
__debug_line __debug_abbrev __debug_info __debug_aranges __debug_loclists __debug_addr __debug_str __debug_line_str
$ rm -rf hello.dSYM
$ lldb -b -o "image lookup -v -n xo_f_greet" hello
        Summary: hello`greet at main.xo:3:3
      LineEntry: [0x0000000100000ab8-0x0000000100000ac0): $OUT/xo/main.xo:3:3
```

The trade-off is size. The debug build of the hello is now one file of
2,126,386 bytes, where it was 706,242 bytes plus a 1,404,699 byte
bundle. Your own release builds (`--release`, or `-s`) leave both
the segment and the bundle out, as before; `--release --debug-info`
keeps the segment. Xo's own release binaries keep it: the darwin
archive grows from 23.2 to 34.4 MB, and in exchange a crash report from
an `xo` you downloaded names the file and line.

A later stage, the same day, stopped writing the bundle by default:
`xo build --dsym` writes it as well, for tools or workflows that want
one. Programs linked by Apple's ld64 (the LLVM backend, `--ld=cc`, and
any program that calls C with `use c`) get the same single file: after
the link, dsymutil collects their DWARF, Xo moves it into the
executable's `__DWARF` segment, and the binary is signed again. On an
HTTP server program the `--ld=cc` link phase went from 210-214 ms to
226-260 ms;
the LLVM link takes as long as before, since clang dominates it. Each
binary grows by about what its `.dSYM` was. atos, lldb,
ThreadSanitizer and dwarfdump all read the embedded copy, and Apple
notarized a Developer ID signed `xo` built this way.

On Linux, Xo's executables already carry uncompressed `.debug_*`
sections. On Windows, a PDB writer is proposed (decision 0344).

All of this ships in Xo 0.26.0
([release notes](/releases/0.26/), behavior change 4).
