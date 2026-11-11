---
title: "std/csv"
linkTitle: "csv"
description: "Comma separated values as RFC 4180 writes them: quoted fields with `\"\"` for a quote, line breaks ..."
toc: true
module: "std/csv"
source: "https://github.com/xo-lang/xo/blob/main/std/csv.xo"
generated: "scripts/sync-content.py from `xo doc std/csv`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`CsvErr`](#CsvErr)
  - method [`CsvErr.display`](#CsvErr.display)
- type [`Reader`](#Reader)
  - method [`Reader.read`](#Reader.read)
- fn [`parse`](#parse)
- fn [`reader`](#reader)
- fn [`parse_maps`](#parse_maps)
- fn [`format`](#format)
- fn [`valid_sep`](#valid_sep)
- fn [`valid_comment`](#valid_comment)

## Types

### CsvErr {#CsvErr}

```xo
struct CsvErr {
  start_line: Int
  line: Int
  column: Int
  msg: Str
}
```

Where and why the text is not valid CSV (Go's csv.ParseError):
the line the record starts on, the line and 1-based byte column of the
error, and Go's message (`bare " in non-quoted-field`, `extraneous or
missing " in quoted-field`, `wrong number of fields`). Displays as Go's
Error(): `parse error on line 1, column 5: bare " in non-quoted-field`,
`record on line 2; parse error on line 3, column 1: ...`, `record on
line 4: wrong number of fields`.

[Source: `std/csv.xo:14`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L14)

#### CsvErr.display {#CsvErr.display}

```xo
fn (e: CsvErr) display() -> Str
```

[Source: `std/csv.xo:21`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L21)

### Reader {#Reader}

```xo
struct Reader {}
```

Records read one at a time from an open file (Go's csv.NewReader(file),
Read), the options as `parse`'s: the file is read as the records are
asked for, so a file larger than memory can be walked. A quoted field
may hold line breaks.

[Source: `std/csv.xo:33`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L33)

#### Reader.read {#Reader.read}

```xo
fn (var r: Reader) read() -> List[Str]? ! CsvErr uses fs.read
```

The next record, None at the end of the file. A parse error is as
`parse`'s; a failure of the file is a CsvErr with `line` 0 and the
file's error text as `msg`.

[Source: `std/csv.xo:39`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L39)

## Functions

### parse {#parse}

```xo
fn parse(text: Str, sep: Rune = ',', comment: Rune = '\0', fields: Int = -1, lazy_quotes: Bool = false, trim_leading_space: Bool = false) -> List[List[Str]] ! CsvErr
```

The records of text, as Go's csv.Reader reads them (decision 0298):
`sep` separates fields (Comma), lines starting with `comment` are
skipped (Comment; `'\0'`, the default, for none), `fields` is FieldsPerRecord (-1 any number, the
default here; 0 the first record's; N exactly N), `lazy_quotes`
and `trim_leading_space` are LazyQuotes and TrimLeadingSpace.

[Source: `std/csv.xo:28`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L28)

### reader {#reader}

```xo
fn reader(f: File, sep: Rune = ',', comment: Rune = '\0', fields: Int = -1, lazy_quotes: Bool = false, trim_leading_space: Bool = false) -> Reader
```

[Source: `std/csv.xo:35`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L35)

### parse_maps {#parse_maps}

```xo
fn parse_maps(text: Str, sep: Rune = ',', comment: Rune = '\0', lazy_quotes: Bool = false, trim_leading_space: Bool = false) -> List[Map[Str, Str]] ! CsvErr
```

The records after the first, each a map from the first record's
fields (the header) to its own; every record must have the header's
number of fields (`wrong number of fields`).

[Source: `std/csv.xo:43`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L43)

### format {#format}

```xo
fn format(rows: List[List[Str]], sep: Rune = ',', crlf: Bool = false) -> Str
```

The text of rows as Go's csv.Writer writes them (`crlf`: UseCRLF): a
field is quoted when it holds `sep`, a quote, `\r`, or `\n`, starts
with a space, or is `\.`; also when it is the only, empty field of a
record (so it reads back as a record, where Go writes an empty line).

[Source: `std/csv.xo:48`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L48)

### valid_sep {#valid_sep}

```xo
fn valid_sep(r: Rune) -> Bool
```

Go's validDelim (reader.go): whether r can be the `sep` of `parse`,
`parse_maps` and `format`. False for `'\0'`, `"`, `\r`, `\n` and U+FFFD,
and for a code point that is not a Unicode scalar value (which no Rune
holds: `Rune(n)` faults on it); every other code point works, a multi
byte one included.

[Source: `std/csv.xo:54`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L54)

### valid_comment {#valid_comment}

```xo
fn valid_comment(r: Rune) -> Bool
```

Go's validDelim for `comment`, and true for `'\0'`, Go's zero value and
the default (no comment). A `comment` must also differ from `sep`:
`parse`, `parse_maps` and `format` fault
`csv: invalid field or comment delimiter` when it does not.

[Source: `std/csv.xo:59`](https://github.com/xo-lang/xo/blob/main/std/csv.xo#L59)
