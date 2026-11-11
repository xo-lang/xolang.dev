---
title: "std/embed"
linkTitle: "embed"
description: "A Dir is the files a constant embeds at build time: `const SITE: embed.Dir = embed(\"static\")`."
toc: true
module: "std/embed"
source: "https://github.com/xo-lang/xo/blob/main/std/embed.xo"
generated: "scripts/sync-content.py from `xo doc std/embed`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Dir`](#Dir)
  - method [`Dir.read`](#Dir.read)
  - method [`Dir.read_text`](#Dir.read_text)
  - method [`Dir.contains`](#Dir.contains)
  - method [`Dir.paths`](#Dir.paths)
  - method [`Dir.sub`](#Dir.sub)
  - method [`Dir.len`](#Dir.len)
  - method [`Dir.fs`](#Dir.fs)

## Types

### Dir {#Dir}

```xo
struct Dir {
  files: Map[Str, Bytes]
}
```

Files embedded at build time, keyed by their slash path relative to
the directory of the file that declares the constant.

[Source: `std/embed.xo:9`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L9)

#### Dir.read {#Dir.read}

```xo
fn (d: Dir) read(path: Str) -> Bytes?
```

The bytes of the file at path, or None.

[Source: `std/embed.xo:14`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L14)

#### Dir.read_text {#Dir.read_text}

```xo
fn (d: Dir) read_text(path: Str) -> Str?
```

The text of the file at path, or None when there is none or it is not
valid UTF-8.

[Source: `std/embed.xo:17`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L17)

#### Dir.contains {#Dir.contains}

```xo
fn (d: Dir) contains(path: Str) -> Bool
```

Whether there is a file at path.

[Source: `std/embed.xo:19`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L19)

#### Dir.paths {#Dir.paths}

```xo
fn (d: Dir) paths() -> List[Str]
```

Every file's path, sorted.

[Source: `std/embed.xo:21`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L21)

#### Dir.sub {#Dir.sub}

```xo
fn (d: Dir) sub(dir: Str) -> Dir
```

The files under directory dir, keyed relative to it.

[Source: `std/embed.xo:23`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L23)

#### Dir.len {#Dir.len}

```xo
fn (d: Dir) len() -> Int
```

The number of files.

[Source: `std/embed.xo:25`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L25)

#### Dir.fs {#Dir.fs}

```xo
fn (d: Dir) fs() -> Fs
```

A read-only Fs over the files (decision 0304), for code written
against Fs: read, read_text, stat, exists, read_dir, walk, glob, mode,
and sub see the files and the directories their paths imply (a path
is relative, `/`, `.` and a leading `./` name the root); every write,
open, and lock is FsErr.Denied. Nothing needs a capability.

[Source: `std/embed.xo:31`](https://github.com/xo-lang/xo/blob/main/std/embed.xo#L31)
