---
title: "std/smtp"
linkTitle: "smtp"
description: "Go's net/smtp SendMail as one call: STARTTLS through std/tls, PLAIN and CRAM-MD5, Go's checks and..."
toc: true
module: "std/smtp"
source: "https://github.com/xo-lang/xo/blob/main/std/smtp.xo"
generated: "scripts/sync-content.py from `xo doc std/smtp`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`SmtpErr`](#smtperr)
  - method [`SmtpErr.display`](#smtperrdisplay)
- type [`Auth`](#auth)
- type [`Security`](#security)
- fn [`send`](#send)

## Types

### SmtpErr

```xo
struct SmtpErr {
  code: Int
  msg: Str
}
```

A failed send: the server's reply code and text (`550 5.1.1 no such
user`), or code 0 for an error found before or outside a reply (a
connection error, a CR or LF in an address, `smtp: server doesn't
support STARTTLS`).

[Source: `std/smtp.xo:10`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L10)

#### SmtpErr.display

```xo
fn (e: SmtpErr) display() -> Str
```

`CODE MSG` (net/textproto's Error), or MSG alone for code 0 (decision 0358).

[Source: `std/smtp.xo:16`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L16)

### Auth

```xo
enum Auth {
  None
  Plain(user: Str, password: Secret[Str])
  CramMd5(user: Str, secret: Secret[Str])
}
```

How the client authenticates (net/smtp PlainAuth, CRAMMD5Auth).

[Source: `std/smtp.xo:19`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L19)

### Security

```xo
enum Security {
  StartTls
  Tls
  None
} derive Display
```

The connection's protection (decision 0290): `StartTls` requires the
server's STARTTLS (the default); `Tls` is implicit TLS from the first
byte (port 465); `None` sends in plain text, allowed only to a
loopback host.

[Source: `std/smtp.xo:29`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L29)

## Functions

### send

```xo
fn send(net: Net, addr: Str, from: Str, to: List[Str], msg: Bytes, auth: Auth = Auth.None, security: Security = Security.StartTls, roots: Bytes = b"", hello: Str = "localhost") -> () ! SmtpErr uses net.dial
```

Sends msg (the message's bytes: headers, a blank line, the body; CRLF
or LF line endings) from `from` to every address of `to` through the
server at addr (`host:port`), as net/smtp.SendMail: the greeting,
EHLO (HELO when refused), STARTTLS with the server's name verified
(against roots, a PEM bundle, when given; else the system roots), AUTH,
MAIL FROM, RCPT TO for each, DATA (dot stuffed, CRLF), QUIT.

[Source: `std/smtp.xo:41`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L41)
