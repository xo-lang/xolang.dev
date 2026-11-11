---
title: "std/multipart"
linkTitle: "multipart"
description: "Go's mime/multipart: a body in memory (parse, parse_form), or streamed (Reader, decision 0597)."
toc: true
module: "std/multipart"
source: "https://github.com/xo-lang/xo/blob/main/std/multipart.xo"
generated: "scripts/sync-content.py from `xo doc std/multipart`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`BUF`](#BUF)
- const [`MAX_HEADER_SIZE`](#MAX_HEADER_SIZE)
- const [`MAX_HEADERS`](#MAX_HEADERS)
- const [`MAX_MEMORY`](#MAX_MEMORY)
- const [`TOO_LARGE`](#TOO_LARGE)
- const [`UNEXPECTED_EOF`](#UNEXPECTED_EOF)
- type [`Part`](#Part)
- type [`Form`](#Form)
- type [`MultipartErr`](#MultipartErr)
  - method [`MultipartErr.display`](#MultipartErr.display)
- type [`R`](#R)
  - method [`R.more`](#R.more)
  - method [`R.at_lwsp`](#R.at_lwsp)
  - method [`R.read_slice`](#R.read_slice)
  - method [`R.is_final_boundary`](#R.is_final_boundary)
  - method [`R.is_boundary_delimiter_line`](#R.is_boundary_delimiter_line)
  - method [`R.scan`](#R.scan)
  - method [`R.read_part`](#R.read_part)
  - method [`R.read_line`](#R.read_line)
  - method [`R.read_continued`](#R.read_continued)
  - method [`R.read_header`](#R.read_header)
  - method [`R.next_part`](#R.next_part)
  - method [`R.part_data`](#R.part_data)
  - method [`R.skip_part`](#R.skip_part)
- type [`Header`](#Header)
  - method [`Header.add`](#Header.add)
  - method [`Header.get`](#Header.get)
  - method [`Header.count`](#Header.count)
- type [`Next`](#Next)
- type [`PartHead`](#PartHead)
  - method [`PartHead.header_values`](#PartHead.header_values)
- type [`Reader`](#Reader)
  - method [`Reader.next_part`](#Reader.next_part)
  - method [`Reader.read`](#Reader.read)
  - method [`Reader.head_next`](#Reader.head_next)
  - method [`Reader.chunk`](#Reader.chunk)
  - method [`Reader.data_next`](#Reader.data_next)
- fn [`parse`](#parse)
- fn [`parse_form`](#parse_form)
- fn [`write`](#write)
- fn [`form_data_content_type`](#form_data_content_type)
- fn [`random_boundary`](#random_boundary)
- fn [`fail`](#fail)
- fn [`text_of`](#text_of)
- fn [`has_prefix`](#has_prefix)
- fn [`index_of`](#index_of)
- fn [`go_q`](#go_q)
- fn [`new_reader`](#new_reader)
- fn [`reader_over`](#reader_over)
- fn [`skip_lwsp`](#skip_lwsp)
- fn [`match_after_prefix`](#match_after_prefix)
- fn [`trim_lwsp`](#trim_lwsp)
- fn [`valid_field_byte`](#valid_field_byte)
- fn [`valid_value_byte`](#valid_value_byte)
- fn [`canonical_key`](#canonical_key)
- fn [`qp_hex`](#qp_hex)
- fn [`hex2`](#hex2)
- fn [`is_qp_ws`](#is_qp_ws)
- fn [`qp_decode`](#qp_decode)
- fn [`qp_decode_at`](#qp_decode_at)
- fn [`base`](#base)
- fn [`names`](#names)
- fn [`first_values`](#first_values)
- fn [`to_part`](#to_part)
- fn [`reader`](#reader)
- fn [`escape_quotes`](#escape_quotes)

## Constants

### BUF {#BUF}

```xo
const BUF: Int = 4096
```

[Source: `std/multipart.xo:176`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L176)

### MAX_HEADER_SIZE {#MAX_HEADER_SIZE}

```xo
const MAX_HEADER_SIZE: Int = 10485760
```

[Source: `std/multipart.xo:178`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L178)

### MAX_HEADERS {#MAX_HEADERS}

```xo
const MAX_HEADERS: Int = 10000
```

[Source: `std/multipart.xo:180`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L180)

### MAX_MEMORY {#MAX_MEMORY}

```xo
const MAX_MEMORY: Int = 33554432
```

http's defaultMaxMemory, the ReadForm limit of ParseMultipartForm.

[Source: `std/multipart.xo:183`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L183)

### TOO_LARGE {#TOO_LARGE}

```xo
const TOO_LARGE: Str = "multipart: message too large"
```

[Source: `std/multipart.xo:185`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L185)

### UNEXPECTED_EOF {#UNEXPECTED_EOF}

```xo
const UNEXPECTED_EOF: Str = "unexpected EOF"
```

[Source: `std/multipart.xo:187`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L187)

## Types

### Part {#Part}

```xo
pub struct Part {
  pub name: Str
  pub filename: Str?
  pub headers: Map[Str, Str]
  pub data: Bytes
}
```

One part. `name` is the form field (Content-Disposition `form-data`'s
`name`, else ""); `filename` its file name, the last path element as
Go's FileName; `headers` the first value of each header, keys in
canonical form (Content-Type).

[Source: `std/multipart.xo:22`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L22)

### Form {#Form}

```xo
pub struct Form {
  pub values: url.Values
  pub files: Map[Str, List[Part]]
}
```

A form: the fields without a file name, and the file parts by field.

[Source: `std/multipart.xo:30`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L30)

### MultipartErr {#MultipartErr}

```xo
pub struct MultipartErr {
  pub msg: Str
}
```

Go's error texts: `multipart: NextPart: EOF`, `multipart: message too
large`, `unexpected EOF`, `malformed MIME header line: ...`.

[Source: `std/multipart.xo:37`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L37)

#### MultipartErr.display {#MultipartErr.display}

```xo
pub fn (e: MultipartErr) display() -> Str
```

[Source: `std/multipart.xo:41`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L41)

### R {#R}

```xo
struct R[fx: Effects] {
  buf: Bytes
  pos: Int
  nl: Bytes
  nl_dash_boundary: Bytes
  dash_boundary_dash: Bytes
  dash_boundary: Bytes
  parts_read: Int
  src: List[fn() -> Bytes? ! Str uses fx] = []
  done: Bool = false
  src_err: Str = ""
}
```

[Source: `std/multipart.xo:248`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L248)

#### R.more {#R.more}

```xo
fn (var r: R) more() -> Bool
```

More input from the source, the unread rest kept at the start of the
buffer: false at its end (or for a body in memory).

[Source: `std/multipart.xo:266`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L266)

#### R.at_lwsp {#R.at_lwsp}

```xo
fn (var r: R) at_lwsp() -> Bool
```

Whether the byte at the read position is a space or a tab (the
buffer filled first when it is used up).

[Source: `std/multipart.xo:294`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L294)

#### R.read_slice {#R.read_slice}

```xo
fn (var r: R) read_slice() -> (Bytes, Str)
```

bufio.Reader.ReadSlice('\n') with a 4096 byte buffer: the line and
"" , "EOF" (no newline before the end), or "bufio: buffer full".

[Source: `std/multipart.xo:311`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L311)

#### R.is_final_boundary {#R.is_final_boundary}

```xo
fn (r: R) is_final_boundary(line: Bytes) -> Bool
```

[Source: `std/multipart.xo:347`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L347)

#### R.is_boundary_delimiter_line {#R.is_boundary_delimiter_line}

```xo
fn (var r: R) is_boundary_delimiter_line(line: Bytes) -> Bool
```

[Source: `std/multipart.xo:355`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L355)

#### R.scan {#R.scan}

```xo
fn (r: R) scan(total: Int, eof: Bool) -> (Int, Str)
```

scanUntilBoundary over the rest of the body: the bytes of data before
the boundary and how the part goes on: "" (more data), "EOF" (the part
ends), or the read error; `eof` once the body is known to end there.

[Source: `std/multipart.xo:390`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L390)

#### R.read_part {#R.read_part}

```xo
fn (var r: R) read_part() -> (Bytes, Str)
```

A part's raw data (partReader read to its end): the bytes and ""
(ended at its boundary) or the read error.

[Source: `std/multipart.xo:428`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L428)

#### R.read_line {#R.read_line}

```xo
fn (var r: R) read_line() -> Bytes?
```

bufio ReadLine for textproto: the line without its `\n` or `\r\n`;
None at the end of the body.

[Source: `std/multipart.xo:456`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L456)

#### R.read_continued {#R.read_continued}

```xo
fn (var r: R) read_continued(lim0: Int) -> Bytes ! Str
```

readContinuedLineSlice: the logical line (continuations joined by one
space), or the error ("EOF" at the end of the body).

[Source: `std/multipart.xo:575`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L575)

#### R.read_header {#R.read_header}

```xo
fn (var r: R) read_header(max_memory0: Int, max_headers0: Int) -> Header ! Str
```

[Source: `std/multipart.xo:617`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L617)

#### R.next_part {#R.next_part}

```xo
fn (var r: R) next_part(max_header_size: Int, max_headers: Int) -> Next? ! Str
```

nextPart: Some(part) at a part's headers, None at the end of the parts,
or the error.

[Source: `std/multipart.xo:785`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L785)

#### R.part_data {#R.part_data}

```xo
fn (var r: R) part_data(n: Next) -> (Bytes, Str)
```

The part's data and its read error ("" when none), decoded when
quoted-printable.

[Source: `std/multipart.xo:845`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L845)

#### R.skip_part {#R.skip_part}

```xo
fn (var r: R) skip_part(n: Next)
```

Part.Close for a part ReadForm skips: Go drains it through its
decoder and drops the errors. A quoted-printable decoder reads the part
through a bufio.Reader, one partReader read (one scan) at a time, and
stops at a bad line: the reader goes on from the end of the read that
held it, inside the part (so its next line is NextPart's).

[Source: `std/multipart.xo:858`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L858)

### Header {#Header}

```xo
struct Header {
  keys: List[Str]
  values: List[List[Str]]
}
```

A header block's result: the headers (every value, in order), or the
end of the body ("EOF") or an error text.

[Source: `std/multipart.xo:539`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L539)

#### Header.add {#Header.add}

```xo
fn (var h: Header) add(k: Str, v: Str)
```

[Source: `std/multipart.xo:544`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L544)

#### Header.get {#Header.get}

```xo
fn (h: Header) get(k: Str) -> Str
```

[Source: `std/multipart.xo:558`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L558)

#### Header.count {#Header.count}

```xo
fn (h: Header) count() -> Int
```

[Source: `std/multipart.xo:565`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L565)

### Next {#Next}

```xo
struct Next {
  header: Header
  qp: Bool
}
```

A part as NextPart returns it: its headers, and whether its body is
quoted-printable (the Content-Transfer-Encoding header removed).

[Source: `std/multipart.xo:778`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L778)

### PartHead {#PartHead}

```xo
pub struct PartHead {
  pub name: Str
  pub filename: Str?
  pub headers: Map[Str, Str]
  fields: List[Str]
}
```

A part's head as Reader.next_part reads it (Go's Part without its
data): `name` is the form field (FormName), `filename` its file name
(FileName), `headers` the first value of each header, keys in
canonical form; a quoted-printable part's Content-Transfer-Encoding
is removed, as Go's NextPart does.

[Source: `std/multipart.xo:957`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L957)

#### PartHead.header_values {#PartHead.header_values}

```xo
pub fn (h: PartHead) header_values(name: Str) -> List[Str]
```

Every value of the part's header name, in order (MIMEHeader's
values); [] when it has none.

[Source: `std/multipart.xo:967`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L967)

### Reader {#Reader}

```xo
pub struct Reader[fx: Effects] {
  r: R[fx]
  cur: Next
  open: Bool
  total: Int
  eof: Bool
  end: Bool
  err: Str
  pend: Bytes
  ppos: Int
  qp_read: Bool
  last: Bool
  failed: Str
}
```

Parts read one at a time from a streamed body (Go's multipart.Reader
and its open Part): a body larger than memory, or one read as it
arrives. Holds, past the API, the open part's head (for a
quoted-printable part's skip), whether one is open, how much of its
data was read and whether the body ends there (scan's total and eof),
its end and error; a quoted-printable part's decoded data, read at
pos (decoded whole at its first read); the end of the parts; an error
that sticks.

[Source: `std/multipart.xo:988`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L988)

#### Reader.next_part {#Reader.next_part}

```xo
pub fn (var r: Reader[fx]) next_part() -> PartHead? ! MultipartErr uses fx
```

The next part's head, None after the last part (NextPart's io.EOF),
or the error, which sticks: the open part's rest is read and dropped
first (Part.Close).

[Source: `std/multipart.xo:1014`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L1014)

#### Reader.read {#Reader.read}

```xo
pub fn (var r: Reader[fx]) read(max: Int = 32768) -> Bytes? ! MultipartErr uses fx
```

At most max bytes of the open part's data (decoded when
quoted-printable), None at its end or with no part open, or the read
error (Part.Read).

[Source: `std/multipart.xo:1024`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L1024)

#### Reader.head_next {#Reader.head_next}

```xo
fn (var s: Reader) head_next() -> PartHead? ! Str
```

[Source: `std/multipart.xo:1034`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L1034)

#### Reader.chunk {#Reader.chunk}

```xo
fn (var s: Reader) chunk(max: Int) -> (Bytes, Str)
```

At most max bytes of the open part's raw data and "", or no bytes and
"" at its end (s.end) or the read error.

[Source: `std/multipart.xo:1087`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L1087)

#### Reader.data_next {#Reader.data_next}

```xo
fn (var s: Reader) data_next(max: Int) -> Bytes? ! Str
```

[Source: `std/multipart.xo:1119`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L1119)

## Functions

### parse {#parse}

```xo
pub fn parse(body: Bytes, boundary: Str) -> List[Part] ! MultipartErr
```

Every part (Reader.NextPart, each part read whole; a
quoted-printable part decoded).

[Source: `std/multipart.xo:45`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L45)

### parse_form {#parse_form}

```xo
pub fn parse_form(body: Bytes, boundary: Str, max_parts: Int = 1000) -> Form ! MultipartErr
```

Reader.ReadForm with Go's limits (the 32 MB of http's
ParseMultipartForm, `max_parts`, 10,000 headers).

[Source: `std/multipart.xo:65`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L65)

### write {#write}

```xo
pub fn write(parts: List[Part], boundary: Str) -> Bytes
```

A body of the parts (Writer): each part's headers sorted, a
Content-Disposition from `name` and `filename` when the part has none.

[Source: `std/multipart.xo:132`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L132)

### form_data_content_type {#form_data_content_type}

```xo
pub fn form_data_content_type(boundary: Str) -> Str
```

`multipart/form-data; boundary=...` (Writer.FormDataContentType).

[Source: `std/multipart.xo:160`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L160)

### random_boundary {#random_boundary}

```xo
pub fn random_boundary(r: Rand) -> Str uses rand
```

60 hex digits from 30 random bytes (Writer's boundary).

[Source: `std/multipart.xo:172`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L172)

### fail {#fail}

```xo
fn fail(msg: Str) -> MultipartErr
```

[Source: `std/multipart.xo:174`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L174)

### text_of {#text_of}

```xo
fn text_of(b: Bytes) -> Str
```

Outside bytes as Str: U+FFFD for each byte of an invalid sequence
(decision 0259).

[Source: `std/multipart.xo:191`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L191)

### has_prefix {#has_prefix}

```xo
fn has_prefix(b: Bytes, at: Int, p: Bytes) -> Bool
```

[Source: `std/multipart.xo:205`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L205)

### index_of {#index_of}

```xo
fn index_of(b: Bytes, from: Int, p: Bytes) -> Int
```

[Source: `std/multipart.xo:217`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L217)

### go_q {#go_q}

```xo
fn go_q(b: Bytes) -> Str
```

Go's %q of bytes (strconv.Quote of a string holding them).

[Source: `std/multipart.xo:225`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L225)

### new_reader {#new_reader}

```xo
fn new_reader(body: Bytes, boundary: Str) -> R[()]
```

[Source: `std/multipart.xo:301`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L301)

### reader_over {#reader_over}

```xo
fn reader_over[fx: Effects](body: Bytes, boundary: Str, src: List[fn() -> Bytes? ! Str uses fx]) -> R[fx]
```

A reader of body and then of what src gives (none when it is empty).

[Source: `std/multipart.xo:304`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L304)

### skip_lwsp {#skip_lwsp}

```xo
fn skip_lwsp(b: Bytes) -> Bytes
```

[Source: `std/multipart.xo:339`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L339)

### match_after_prefix {#match_after_prefix}

```xo
fn match_after_prefix(b: Bytes, at: Int, prefix: Bytes, eof: Bool) -> Int
```

matchAfterPrefix: -1 not a boundary, 0 need more, +1 a boundary.

[Source: `std/multipart.xo:368`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L368)

### trim_lwsp {#trim_lwsp}

```xo
fn trim_lwsp(b: Bytes) -> Bytes
```

[Source: `std/multipart.xo:488`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L488)

### valid_field_byte {#valid_field_byte}

```xo
fn valid_field_byte(c: UInt8) -> Bool
```

[Source: `std/multipart.xo:500`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L500)

### valid_value_byte {#valid_value_byte}

```xo
fn valid_value_byte(c: UInt8) -> Bool
```

[Source: `std/multipart.xo:504`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L504)

### canonical_key {#canonical_key}

```xo
fn canonical_key(k: Bytes) -> Str?
```

canonicalMIMEHeaderKey: None when a byte is not allowed.

[Source: `std/multipart.xo:507`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L507)

### qp_hex {#qp_hex}

```xo
fn qp_hex(c: UInt8) -> Int
```

[Source: `std/multipart.xo:664`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L664)

### hex2 {#hex2}

```xo
fn hex2(c: UInt8) -> Str
```

[Source: `std/multipart.xo:671`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L671)

### is_qp_ws {#is_qp_ws}

```xo
fn is_qp_ws(c: UInt8) -> Bool
```

[Source: `std/multipart.xo:677`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L677)

### qp_decode {#qp_decode}

```xo
fn qp_decode(raw: Bytes, end: Str) -> (Bytes, Str)
```

The decoded data and its error ("" when none): `end` is how the raw data
ended ("" at its boundary, else the part's read error), which the
decoder reports after the data, as Go's bufio passes it on.

[Source: `std/multipart.xo:682`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L682)

### qp_decode_at {#qp_decode_at}

```xo
fn qp_decode_at(raw: Bytes, end: Str) -> (Bytes, Str, Int)
```

qp_decode, and how much of raw the decoder read: the end of the line
it stopped on (all of raw when it did not stop early).

[Source: `std/multipart.xo:689`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L689)

### base {#base}

```xo
fn base(p: Str) -> Str
```

filepath.Base on a Unix path.

[Source: `std/multipart.xo:908`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L908)

### names {#names}

```xo
fn names(h: Header) -> (Str, Str)
```

FormName and FileName from Content-Disposition.

[Source: `std/multipart.xo:928`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L928)

### first_values {#first_values}

```xo
fn first_values(h: Header) -> Map[Str, Str]
```

[Source: `std/multipart.xo:939`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L939)

### to_part {#to_part}

```xo
fn to_part(h: Header, data: Bytes) -> Part
```

[Source: `std/multipart.xo:947`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L947)

### reader {#reader}

```xo
pub fn reader[fx: Effects](src: fn() -> Bytes? ! Str uses fx, boundary: Str) -> Reader[fx]
```

A reader of the body `src` gives, whose parts are separated by
`boundary` (Go's NewReader): each call of src gives the body's next
bytes, None at its end, or its read error's text, which next_part
and read return.

[Source: `std/multipart.xo:1007`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L1007)

### escape_quotes {#escape_quotes}

```xo
fn escape_quotes(s: Str) -> Str
```

[Source: `std/multipart.xo:1156`](https://github.com/xo-lang/xo/blob/main/std/multipart.xo#L1156)
