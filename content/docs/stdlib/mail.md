---
title: "std/mail"
linkTitle: "mail"
description: "Go's net/mail addresses (RFC 5322 with RFC 2047 encoded words)."
toc: true
module: "std/mail"
source: "https://github.com/xo-lang/xo/blob/main/std/mail.xo"
generated: "scripts/sync-content.py from `xo doc std/mail`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`UPPER_HEX`](#UPPER_HEX)
- const [`ATEXT_LO`](#ATEXT_LO)
- const [`ATEXT_HI`](#ATEXT_HI)
- const [`MAX_CONTENT`](#MAX_CONTENT)
- const [`MONTHS`](#MONTHS)
- const [`DAYS`](#DAYS)
- const [`FALSE_TRUE`](#FALSE_TRUE)
- const [`TRUE_FALSE`](#TRUE_FALSE)
- const [`ZONE_FORMS`](#ZONE_FORMS)
- const [`DATE_LAYOUT`](#DATE_LAYOUT)
- type [`Address`](#Address)
  - method [`Address.display`](#Address.display)
- type [`MailErr`](#MailErr)
  - method [`MailErr.display`](#MailErr.display)
- type [`Message`](#Message)
  - method [`Message.header`](#Message.header)
- type [`Decoded`](#Decoded)
- type [`P`](#P)
  - method [`P.empty`](#P.empty)
  - method [`P.peek`](#P.peek)
  - method [`P.consume`](#P.consume)
  - method [`P.skip_space`](#P.skip_space)
  - method [`P.consume_comment`](#P.consume_comment)
  - method [`P.skip_cfws`](#P.skip_cfws)
  - method [`P.consume_quoted_string`](#P.consume_quoted_string)
  - method [`P.consume_atom`](#P.consume_atom)
  - method [`P.consume_domain_literal`](#P.consume_domain_literal)
  - method [`P.consume_addr_spec`](#P.consume_addr_spec)
  - method [`P.addr_spec`](#P.addr_spec)
  - method [`P.consume_phrase`](#P.consume_phrase)
  - method [`P.consume_display_name_comment`](#P.consume_display_name_comment)
  - method [`P.parse_address`](#P.parse_address)
  - method [`P.consume_group_list`](#P.consume_group_list)
- type [`LineR`](#LineR)
  - method [`LineR.line`](#LineR.line)
  - method [`LineR.skip_space`](#LineR.skip_space)
  - method [`LineR.continued`](#LineR.continued)
- fn [`parse_address`](#parse_address)
- fn [`parse_address_list`](#parse_address_list)
- fn [`read_message`](#read_message)
- fn [`parse_date`](#parse_date)
- fn [`compose`](#compose)
- fn [`fail`](#fail)
- fn [`is_vchar`](#is_vchar)
- fn [`is_wsp`](#is_wsp)
- fn [`is_atext`](#is_atext)
- fn [`atext_ascii`](#atext_ascii)
- fn [`is_qtext`](#is_qtext)
- fn [`is_dtext`](#is_dtext)
- fn [`hex_of`](#hex_of)
- fn [`hex_byte`](#hex_byte)
- fn [`q_decode`](#q_decode)
- fn [`decode_word`](#decode_word)
- fn [`lossy`](#lossy)
- fn [`write_q`](#write_q)
- fn [`encode_word`](#encode_word)
- fn [`ipv4_ok`](#ipv4_ok)
- fn [`ipv6_ok`](#ipv6_ok)
- fn [`ip_ok`](#ip_ok)
- fn [`quote_string`](#quote_string)
- fn [`plain_ascii`](#plain_ascii)
- fn [`mime_field_byte`](#mime_field_byte)
- fn [`canonical_key`](#canonical_key)
- fn [`bytes_text`](#bytes_text)
- fn [`trim_wsp`](#trim_wsp)
- fn [`digits`](#digits)
- fn [`lower3`](#lower3)
- fn [`is_leap`](#is_leap)
- fn [`month_days`](#month_days)
- fn [`days_from_civil`](#days_from_civil)
- fn [`zone_name_len`](#zone_name_len)
- fn [`spaces`](#spaces)
- fn [`try_layout`](#try_layout)
- fn [`qp_encode`](#qp_encode)
- fn [`two`](#two)
- fn [`rfc1123z`](#rfc1123z)

## Constants

### UPPER_HEX {#UPPER_HEX}

```xo
const UPPER_HEX: Str = "0123456789ABCDEF"
```

[Source: `std/mail.xo:286`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L286)

### ATEXT_LO {#ATEXT_LO}

```xo
const ATEXT_LO: Int = -6629389936724279296
```

is_atext of the ASCII byte c other than '.': a bit of ATEXT_LO (0 to
63) or ATEXT_HI (64 to 127).

[Source: `std/mail.xo:304`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L304)

### ATEXT_HI {#ATEXT_HI}

```xo
const ATEXT_HI: Int = 9223372035915251710
```

[Source: `std/mail.xo:306`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L306)

### MAX_CONTENT {#MAX_CONTENT}

```xo
const MAX_CONTENT: Int = 63
```

[Source: `std/mail.xo:441`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L441)

### MONTHS {#MONTHS}

```xo
const MONTHS: List[Str] = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
```

[Source: `std/mail.xo:1150`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1150)

### DAYS {#DAYS}

```xo
const DAYS: List[Str] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
```

[Source: `std/mail.xo:1152`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1152)

### FALSE_TRUE {#FALSE_TRUE}

```xo
const FALSE_TRUE: List[Bool] = [false, true]
```

[Source: `std/mail.xo:1399`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1399)

### TRUE_FALSE {#TRUE_FALSE}

```xo
const TRUE_FALSE: List[Bool] = [true, false]
```

[Source: `std/mail.xo:1401`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1401)

### ZONE_FORMS {#ZONE_FORMS}

```xo
const ZONE_FORMS: List[Int] = [0, 1, 2]
```

[Source: `std/mail.xo:1403`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1403)

### DATE_LAYOUT {#DATE_LAYOUT}

```xo
const DATE_LAYOUT: time.Layout = time.layout("{weekday:short}, {day} {month:short} {year} {hour}:{minute}:{second} +0000")
```

[Source: `std/mail.xo:1488`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1488)

## Types

### Address {#Address}

```xo
pub struct Address {
  pub name: Str
  pub address: Str
}
```

A mail address: the display name (decoded) and `local@domain`.

[Source: `std/mail.xo:16`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L16)

#### Address.display {#Address.display}

```xo
pub fn (a: Address) display() -> Str
```

`"Ann Lee" <ann@example.com>`, the name quoted or RFC 2047 encoded as
needed (Address.String).

[Source: `std/mail.xo:80`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L80)

### MailErr {#MailErr}

```xo
pub struct MailErr {
  pub msg: Str
}
```

Go's error texts: `mail: no address`, `mail: missing @ in addr-spec`, ...

[Source: `std/mail.xo:22`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L22)

#### MailErr.display {#MailErr.display}

```xo
pub fn (e: MailErr) display() -> Str
```

[Source: `std/mail.xo:26`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L26)

### Message {#Message}

```xo
pub struct Message {
  pub headers: List[(Str, Str)]
  pub body: Bytes
}
```

A message (net/mail.Message): its header fields in order, each name
in canonical form (`Content-Type`), continuation lines unfolded, and
the body after the blank line.

[Source: `std/mail.xo:130`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L130)

#### Message.header {#Message.header}

```xo
pub fn (m: Message) header(name: Str) -> Str?
```

The first value of the header field name, any case (Header.Get).

[Source: `std/mail.xo:183`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L183)

### Decoded {#Decoded}

```xo
enum Decoded {
  Text(s: Str)
  NotEncoded
  Charset(msg: Str)
}
```

The result of decoding a word: its text, or an error, and whether the
word was an encoded word whose charset is not supported (message.go's
charsetReaderError).

[Source: `std/mail.xo:374`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L374)

### P {#P}

```xo
struct P {
  s: Str
}
```

[Source: `std/mail.xo:635`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L635)

#### P.empty {#P.empty}

```xo
fn (p: P) empty() -> Bool
```

[Source: `std/mail.xo:639`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L639)

#### P.peek {#P.peek}

```xo
fn (p: P) peek() -> UInt8
```

[Source: `std/mail.xo:641`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L641)

#### P.consume {#P.consume}

```xo
fn (var p: P) consume(c: UInt8) -> Bool
```

[Source: `std/mail.xo:643`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L643)

#### P.skip_space {#P.skip_space}

```xo
fn (var p: P) skip_space()
```

[Source: `std/mail.xo:651`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L651)

#### P.consume_comment {#P.consume_comment}

```xo
fn (var p: P) consume_comment() -> (Str, Bool)
```

[Source: `std/mail.xo:662`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L662)

#### P.skip_cfws {#P.skip_cfws}

```xo
fn (var p: P) skip_cfws() -> Bool
```

[Source: `std/mail.xo:686`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L686)

#### P.consume_quoted_string {#P.consume_quoted_string}

```xo
fn (var p: P) consume_quoted_string() -> Str ! MailErr
```

Go's consumeQuotedString, the runs between escapes (and the
replacement character of a byte that is not UTF-8) copied whole: the
text itself when there is no escape.

[Source: `std/mail.xo:701`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L701)

#### P.consume_atom {#P.consume_atom}

```xo
fn (var p: P) consume_atom(dot: Bool, permissive: Bool) -> Str ! MailErr
```

Go's consumeAtom, an ASCII byte checked against a mask and the dots
counted as they go by.

[Source: `std/mail.xo:756`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L756)

#### P.consume_domain_literal {#P.consume_domain_literal}

```xo
fn (var p: P) consume_domain_literal() -> Str ! MailErr
```

[Source: `std/mail.xo:804`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L804)

#### P.consume_addr_spec {#P.consume_addr_spec}

```xo
fn (var p: P) consume_addr_spec() -> Str ! MailErr
```

consumeAddrSpec; the parser is unchanged when it fails.

[Source: `std/mail.xo:835`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L835)

#### P.addr_spec {#P.addr_spec}

```xo
fn (var p: P) addr_spec() -> Str ! MailErr
```

[Source: `std/mail.xo:846`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L846)

#### P.consume_phrase {#P.consume_phrase}

```xo
fn (var p: P) consume_phrase() -> Str ! MailErr
```

[Source: `std/mail.xo:874`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L874)

#### P.consume_display_name_comment {#P.consume_display_name_comment}

```xo
fn (var p: P) consume_display_name_comment() -> Str ! MailErr
```

[Source: `std/mail.xo:933`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L933)

#### P.parse_address {#P.parse_address}

```xo
fn (var p: P) parse_address(handle_group: Bool) -> List[Address] ! MailErr
```

[Source: `std/mail.xo:955`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L955)

#### P.consume_group_list {#P.consume_group_list}

```xo
fn (var p: P) consume_group_list() -> List[Address] ! MailErr
```

[Source: `std/mail.xo:989`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L989)

### LineR {#LineR}

```xo
struct LineR {
  b: Bytes
  at: Int = 0
}
```

A line reader (bufio.Reader.ReadLine): the line without "\n" or
"\r\n", or None at the end.

[Source: `std/mail.xo:1097`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1097)

#### LineR.line {#LineR.line}

```xo
fn (var r: LineR) line() -> Bytes?
```

[Source: `std/mail.xo:1102`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1102)

#### LineR.skip_space {#LineR.skip_space}

```xo
fn (var r: LineR) skip_space() -> Int
```

textproto.Reader.skipSpace: the spaces and tabs skipped.

[Source: `std/mail.xo:1123`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1123)

#### LineR.continued {#LineR.continued}

```xo
fn (var r: LineR) continued() -> Bytes?
```

textproto.Reader.ReadContinuedLine: a field and its continuation
lines, each trimmed, joined by one space; None at the end.

[Source: `std/mail.xo:1134`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1134)

## Functions

### parse_address {#parse_address}

```xo
pub fn parse_address(s: Str) -> Address ! MailErr
```

`Ann Lee <ann@example.com>`, `ann@example.com (Ann)`, a quoted or
RFC 2047 encoded name (mail.ParseAddress).

[Source: `std/mail.xo:30`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L30)

### parse_address_list {#parse_address_list}

```xo
pub fn parse_address_list(s: Str) -> List[Address] ! MailErr
```

A comma separated list, groups (`team: a@x, b@y;`) flattened
(mail.ParseAddressList).

[Source: `std/mail.xo:50`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L50)

### read_message {#read_message}

```xo
pub fn read_message(msg: Bytes) -> Message ! MailErr
```

The header and body of msg (mail.ReadMessage), with Go's errors
(`malformed MIME header line: ...`).

[Source: `std/mail.xo:137`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L137)

### parse_date {#parse_date}

```xo
pub fn parse_date(s: Str) -> Time ! MailErr
```

An RFC 5322 date (mail.ParseDate): `Mon, 02 Jan 2006 15:04:05 -0700`,
with the forms Go accepts (no weekday, one digit days, two digit
years, no seconds, zone names, comments).

[Source: `std/mail.xo:196`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L196)

### compose {#compose}

```xo
pub fn compose(from: Address, to: List[Address], subject: Str, text: Str, html: Str? = None, date: Time, id: Str) -> Bytes
```

A message ready for smtp.send (decision 0290): From, To, Subject (RFC
2047 encoded when not ASCII), Date, Message-ID `<id>`, MIME-Version,
and a text/plain body, or multipart/alternative with an HTML part when
html is given; bodies in quoted-printable, CRLF line endings.

[Source: `std/mail.xo:258`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L258)

### fail {#fail}

```xo
fn fail(msg: Str) -> MailErr
```

[Source: `std/mail.xo:284`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L284)

### is_vchar {#is_vchar}

```xo
fn is_vchar(r: Rune) -> Bool
```

[Source: `std/mail.xo:288`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L288)

### is_wsp {#is_wsp}

```xo
fn is_wsp(r: Rune) -> Bool
```

[Source: `std/mail.xo:290`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L290)

### is_atext {#is_atext}

```xo
fn is_atext(r: Rune, dot: Bool) -> Bool
```

[Source: `std/mail.xo:292`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L292)

### atext_ascii {#atext_ascii}

```xo
fn atext_ascii(c: Int) -> Bool
```

[Source: `std/mail.xo:308`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L308)

### is_qtext {#is_qtext}

```xo
fn is_qtext(r: Rune) -> Bool
```

[Source: `std/mail.xo:312`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L312)

### is_dtext {#is_dtext}

```xo
fn is_dtext(r: Rune) -> Bool
```

[Source: `std/mail.xo:314`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L314)

### hex_of {#hex_of}

```xo
fn hex_of(c: UInt8) -> Int
```

[Source: `std/mail.xo:316`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L316)

### hex_byte {#hex_byte}

```xo
fn hex_byte(c: UInt8) -> Str
```

Go's %#02x of a byte: 0x and lower case hex, no padding.

[Source: `std/mail.xo:324`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L324)

### q_decode {#q_decode}

```xo
fn q_decode(s: Str) -> Bytes ! Str
```

[Source: `std/mail.xo:333`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L333)

### decode_word {#decode_word}

```xo
fn decode_word(word: Str) -> Decoded
```

WordDecoder.Decode with net/mail's CharsetReader (every other charset
is `charset not supported: "x"`).

[Source: `std/mail.xo:382`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L382)

### lossy {#lossy}

```xo
fn lossy(b: Bytes) -> Str
```

[Source: `std/mail.xo:427`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L427)

### write_q {#write_q}

```xo
fn write_q(var out: StrBuilder, s: Bytes)
```

[Source: `std/mail.xo:443`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L443)

### encode_word {#encode_word}

```xo
fn encode_word(q: Bool, s: Str) -> Str
```

WordEncoder.Encode with charset utf-8: the text when it needs no
encoding, else encoded words of at most 75 bytes, split between runes.

[Source: `std/mail.xo:459`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L459)

### ipv4_ok {#ipv4_ok}

```xo
fn ipv4_ok(s: Str) -> Bool
```

[Source: `std/mail.xo:519`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L519)

### ipv6_ok {#ipv6_ok}

```xo
fn ipv6_ok(s0: Str) -> Bool
```

[Source: `std/mail.xo:549`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L549)

### ip_ok {#ip_ok}

```xo
fn ip_ok(s: Str) -> Bool
```

[Source: `std/mail.xo:620`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L620)

### quote_string {#quote_string}

```xo
fn quote_string(s: Str) -> Str
```

[Source: `std/mail.xo:1017`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1017)

### plain_ascii {#plain_ascii}

```xo
fn plain_ascii(s: Str) -> Bool
```

Every byte of s printable ASCII, a space or a tab.

[Source: `std/mail.xo:1044`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1044)

### mime_field_byte {#mime_field_byte}

```xo
fn mime_field_byte(c: UInt8) -> Bool
```

[Source: `std/mail.xo:1053`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1053)

### canonical_key {#canonical_key}

```xo
fn canonical_key(k: Bytes) -> Str
```

textproto.CanonicalMIMEHeaderKey: k unchanged when a byte of it cannot
be in a field name, else each word capitalized.

[Source: `std/mail.xo:1059`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1059)

### bytes_text {#bytes_text}

```xo
fn bytes_text(b: Bytes) -> Str
```

[Source: `std/mail.xo:1080`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1080)

### trim_wsp {#trim_wsp}

```xo
fn trim_wsp(b: Bytes) -> Bytes
```

textproto's trim: spaces and tabs off both ends.

[Source: `std/mail.xo:1083`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1083)

### digits {#digits}

```xo
fn digits(s: Bytes, at: Int, min: Int, max: Int) -> (Int, Int)
```

The digits at the start of s: at most max, at least one (fixed: exactly
max), as the number and their count; (0, 0) when there are none.

[Source: `std/mail.xo:1156`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1156)

### lower3 {#lower3}

```xo
fn lower3(s: Bytes, at: Int) -> Str
```

[Source: `std/mail.xo:1169`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1169)

### is_leap {#is_leap}

```xo
fn is_leap(y: Int) -> Bool
```

[Source: `std/mail.xo:1181`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1181)

### month_days {#month_days}

```xo
fn month_days(y: Int, m: Int) -> Int
```

[Source: `std/mail.xo:1183`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1183)

### days_from_civil {#days_from_civil}

```xo
fn days_from_civil(year: Int, m: Int, d: Int) -> Int
```

[Source: `std/mail.xo:1190`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1190)

### zone_name_len {#zone_name_len}

```xo
fn zone_name_len(s: Bytes, at: Int) -> Int
```

time.parseTimeZone: the length of a zone name at s[at..], 0 for none.

[Source: `std/mail.xo:1204`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1204)

### spaces {#spaces}

```xo
fn spaces(s: Bytes, at: Int) -> Int
```

time.Parse's skip for a layout space: one or more spaces at s[at..],
the offset after them, or -1.

[Source: `std/mail.xo:1254`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1254)

### try_layout {#try_layout}

```xo
fn try_layout(s: Bytes, dow: Bool, day2: Bool, year4: Bool, secs: Bool, zone: Int) -> (Int, Int)?
```

One layout of dateLayouts: weekday, two digit day, four digit year,
seconds, and the zone kind (0 numeric, 1 name, 2 "UT"); the instant
in seconds and its nanoseconds, or None when the layout does not
match.

[Source: `std/mail.xo:1269`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1269)

### qp_encode {#qp_encode}

```xo
fn qp_encode(data: Bytes) -> Bytes
```

mime/quotedprintable.Writer (Binary false) over data, closed: lines of
at most 76 bytes, CRLF line endings, trailing spaces encoded.

[Source: `std/mail.xo:1407`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1407)

### two {#two}

```xo
fn two(n: Int) -> Str
```

[Source: `std/mail.xo:1486`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1486)

### rfc1123z {#rfc1123z}

```xo
fn rfc1123z(t: Time) -> Str
```

[Source: `std/mail.xo:1490`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L1490)
