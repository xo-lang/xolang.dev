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

- type [`Address`](#Address)
  - method [`Address.display`](#Address.display)
- type [`MailErr`](#MailErr)
  - method [`MailErr.display`](#MailErr.display)
- type [`Message`](#Message)
  - method [`Message.header`](#Message.header)
- fn [`parse_address`](#parse_address)
- fn [`parse_address_list`](#parse_address_list)
- fn [`read_message`](#read_message)
- fn [`parse_date`](#parse_date)
- fn [`compose`](#compose)

## Types

### Address {#Address}

```xo
struct Address {
  name: Str
  address: Str
}
```

A mail address: the display name (decoded) and `local@domain`.

[Source: `std/mail.xo:6`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L6)

#### Address.display {#Address.display}

```xo
fn (a: Address) display() -> Str
```

`"Ann Lee" <ann@example.com>`, the name quoted or RFC 2047 encoded as
needed (Address.String).

[Source: `std/mail.xo:26`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L26)

### MailErr {#MailErr}

```xo
struct MailErr {
  msg: Str
}
```

Go's error texts: `mail: no address`, `mail: missing @ in addr-spec`, ...

[Source: `std/mail.xo:12`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L12)

#### MailErr.display {#MailErr.display}

```xo
fn (e: MailErr) display() -> Str
```

[Source: `std/mail.xo:16`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L16)

### Message {#Message}

```xo
struct Message {
  headers: List[(Str, Str)]
  body: Bytes
}
```

A message (net/mail.Message): its header fields in order, each name
in canonical form (`Content-Type`), continuation lines unfolded, and
the body after the blank line.

[Source: `std/mail.xo:31`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L31)

#### Message.header {#Message.header}

```xo
fn (m: Message) header(name: Str) -> Str?
```

The first value of the header field name, any case (Header.Get).

[Source: `std/mail.xo:40`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L40)

## Functions

### parse_address {#parse_address}

```xo
fn parse_address(s: Str) -> Address ! MailErr
```

`Ann Lee <ann@example.com>`, `ann@example.com (Ann)`, a quoted or
RFC 2047 encoded name (mail.ParseAddress).

[Source: `std/mail.xo:20`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L20)

### parse_address_list {#parse_address_list}

```xo
fn parse_address_list(s: Str) -> List[Address] ! MailErr
```

A comma separated list, groups (`team: a@x, b@y;`) flattened
(mail.ParseAddressList).

[Source: `std/mail.xo:23`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L23)

### read_message {#read_message}

```xo
fn read_message(msg: Bytes) -> Message ! MailErr
```

The header and body of msg (mail.ReadMessage), with Go's errors
(`malformed MIME header line: ...`).

[Source: `std/mail.xo:38`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L38)

### parse_date {#parse_date}

```xo
fn parse_date(s: Str) -> Time ! MailErr
```

An RFC 5322 date (mail.ParseDate): `Mon, 02 Jan 2006 15:04:05 -0700`,
with the forms Go accepts (no weekday, one digit days, two digit
years, no seconds, zone names, comments).

[Source: `std/mail.xo:44`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L44)

### compose {#compose}

```xo
fn compose(from: Address, to: List[Address], subject: Str, text: Str, html: Str? = None, date: Time, id: Str) -> Bytes
```

A message ready for smtp.send (decision 0290): From, To, Subject (RFC
2047 encoded when not ASCII), Date, Message-ID `<id>`, MIME-Version,
and a text/plain body, or multipart/alternative with an HTML part when
html is given; bodies in quoted-printable, CRLF line endings.

[Source: `std/mail.xo:49`](https://github.com/xo-lang/xo/blob/main/std/mail.xo#L49)
