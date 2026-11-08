---
title: "std/archive"
linkTitle: "archive"
description: "gzip compression and tar and zip archives, in memory and pure: read and write the bytes with Fs."
toc: true
module: "std/archive"
source: "https://github.com/xo-lang/xo/blob/main/std/archive.xo"
generated: "scripts/sync-content.py from `xo doc std/archive`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Entry`](#entry)
- type [`ArchiveErr`](#archiveerr)
  - method [`ArchiveErr.display`](#archiveerrdisplay)
- type [`ZipFile`](#zipfile)
- type [`ZipReader`](#zipreader)
  - method [`ZipReader.files`](#zipreaderfiles)
  - method [`ZipReader.read`](#zipreaderread)
- type [`ZipWriter`](#zipwriter)
  - method [`ZipWriter.add`](#zipwriteradd)
  - method [`ZipWriter.create`](#zipwritercreate)
  - method [`ZipWriter.write`](#zipwriterwrite)
  - method [`ZipWriter.close`](#zipwriterclose)
- fn [`file`](#file)
- fn [`dir`](#dir)
- fn [`gzip`](#gzip)
- fn [`gunzip`](#gunzip)
- fn [`tar`](#tar)
- fn [`untar`](#untar)
- fn [`zip`](#zip)
- fn [`unzip`](#unzip)
- fn [`zip_reader`](#zip_reader)
- fn [`zip_open`](#zip_open)
- fn [`zip_writer`](#zip_writer)

## Types

### Entry

```xo
struct Entry {
  path: Str
  data: Bytes
  mode: Int
  is_dir: Bool
  modified: Time
}
```

A file or directory of an archive. `path` uses `/`; a directory's
`data` is empty (unzip and untar of an entry whose mode says directory
return no data for it, even when the archive stores some, decision 0164).

[Source: `std/archive.xo:9`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L9)

### ArchiveErr

```xo
struct ArchiveErr {
  msg: Str
}
```

Displays as `archive: ...`.

[Source: `std/archive.xo:18`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L18)

#### ArchiveErr.display

```xo
fn (e: ArchiveErr) display() -> Str
```

[Source: `std/archive.xo:22`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L22)

### ZipFile

```xo
struct ZipFile {
  path: Str
  size: Int
  compressed: Int
  mode: Int
  is_dir: Bool
  modified: Time
  offset: Int
  method: Int
  flags: Int
  crc: Int
}
```

One entry of a zip archive's central directory (decision 0479):
`size` is the inflated length and `compressed` the stored one. The
fields after `modified` are the header's own, for `ZipReader.read`.

[Source: `std/archive.xo:45`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L45)

### ZipReader

```xo
struct ZipReader {
  data: Bytes
  list: List[ZipFile]
  file: File?
  total: Int
}
```

A zip archive (in memory, or in a File) whose central directory was
read once and whose entries are inflated one at a time. @internal: use `zip_reader`,
`r.files()` and `r.read(f)`

[Source: `std/archive.xo:61`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L61)

#### ZipReader.files

```xo
fn (r: ZipReader) files() -> List[ZipFile]
```

The entries in directory order.

[Source: `std/archive.xo:72`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L72)

#### ZipReader.read

```xo
fn (r: ZipReader) read(f: ZipFile) -> Bytes ! ArchiveErr uses fs.read
```

One entry's contents, inflated and checked against its CRC; a
directory's is empty.

[Source: `std/archive.xo:75`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L75)

### ZipWriter

```xo
struct ZipWriter {}
```

A zip archive written entry by entry to a File (decision 0479): memory
is the directory records, not the data. The File stays the caller's:
open it for writing, and close it after `close`. Entries are deflated;
an archive past 65,535 entries or 4 GiB is an error (no zip64).
@move_only

[Source: `std/archive.xo:87`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L87)

#### ZipWriter.add

```xo
fn (var w: ZipWriter) add(e: Entry) -> () ! ArchiveErr uses fs.write
```

Writes an entry whose data is in hand, ending the entry before it.

[Source: `std/archive.xo:91`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L91)

#### ZipWriter.create

```xo
fn (var w: ZipWriter) create(path: Str, mode: Int = 0o644) -> () ! ArchiveErr uses fs.write
```

Starts a streamed file entry (its time the Unix epoch, as `file`),
ending the one before it; `write` gives it data.

[Source: `std/archive.xo:94`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L94)

#### ZipWriter.write

```xo
fn (var w: ZipWriter) write(data: Bytes) -> () ! ArchiveErr uses fs.write
```

Data for the entry `create` started (a data descriptor follows it).

[Source: `std/archive.xo:96`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L96)

#### ZipWriter.close

```xo
fn (var w: ZipWriter) close() -> () ! ArchiveErr uses fs.write
```

Ends the last entry and writes the central directory.
@moves

[Source: `std/archive.xo:99`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L99)

## Functions

### file

```xo
fn file(path: Str, data: Bytes) -> Entry
```

A file entry with mode 0o644 and the Unix epoch as its time.

[Source: `std/archive.xo:25`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L25)

### dir

```xo
fn dir(path: Str) -> Entry
```

A directory entry with mode 0o755.

[Source: `std/archive.xo:27`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L27)

### gzip

```xo
fn gzip(data: Bytes) -> Bytes
```

data compressed in the gzip format (RFC 1952), at the default level.

[Source: `std/archive.xo:30`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L30)

### gunzip

```xo
fn gunzip(data: Bytes) -> Bytes ! ArchiveErr
```

[Source: `std/archive.xo:31`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L31)

### tar

```xo
fn tar(entries: List[Entry]) -> Bytes ! ArchiveErr
```

A tar archive (POSIX ustar or PAX) of the entries, in order.

[Source: `std/archive.xo:33`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L33)

### untar

```xo
fn untar(data: Bytes) -> List[Entry] ! ArchiveErr
```

The entries of a tar archive. An entry whose path is absolute or
leaves the archive's root (`..`) is an error, as are links and devices.

[Source: `std/archive.xo:36`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L36)

### zip

```xo
fn zip(entries: List[Entry]) -> Bytes ! ArchiveErr
```

A zip archive of the entries (deflated), in order.

[Source: `std/archive.xo:38`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L38)

### unzip

```xo
fn unzip(data: Bytes) -> List[Entry] ! ArchiveErr
```

The entries of a zip archive, with the same path rules as untar.

[Source: `std/archive.xo:40`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L40)

### zip_reader

```xo
fn zip_reader(data: Bytes) -> ZipReader ! ArchiveErr
```

The archive's directory, checked as `unzip` checks it (paths, kinds,
Go's errors); no entry is inflated.

[Source: `std/archive.xo:70`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L70)

### zip_open

```xo
fn zip_open(f: File, size: Int) -> ZipReader ! ArchiveErr uses fs.read
```

A zip archive of size bytes in a File (`Fs.stat` gives the size), read
in place: the tail and the central directory are read now and an
entry's bytes when `read` asks, so an archive larger than memory can be
walked. The File stays the caller's and must stay open and unchanged.

[Source: `std/archive.xo:80`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L80)

### zip_writer

```xo
fn zip_writer(f: File) -> ZipWriter
```

[Source: `std/archive.xo:89`](https://github.com/xo-lang/xo/blob/main/std/archive.xo#L89)
