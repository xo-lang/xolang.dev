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

- type [`SmtpErr`](#SmtpErr)
  - method [`SmtpErr.display`](#SmtpErr.display)
- type [`Auth`](#Auth)
- type [`Security`](#Security)
- type [`Link`](#Link)
  - method [`Link.read`](#Link.read)
  - method [`Link.write`](#Link.write)
  - method [`Link.close`](#Link.close)
- type [`Client`](#Client)
  - method [`Client.line`](#Client.line)
  - method [`Client.reply`](#Client.reply)
  - method [`Client.cmd`](#Client.cmd)
  - method [`Client.ehlo`](#Client.ehlo)
  - method [`Client.hello`](#Client.hello)
  - method [`Client.abort_auth`](#Client.abort_auth)
  - method [`Client.auth`](#Client.auth)
- fn [`send`](#send)
- fn [`fail`](#fail)
- fn [`net_fail`](#net_fail)
- fn [`parse_code_line`](#parse_code_line)
- fn [`code_ok`](#code_ok)
- fn [`validate_line`](#validate_line)
- fn [`is_loopback_host`](#is_loopback_host)
- fn [`host_of`](#host_of)
- fn [`dot_stuff`](#dot_stuff)
- fn [`run`](#run)

## Types

### SmtpErr {#SmtpErr}

```xo
pub struct SmtpErr {
  pub code: Int
  pub msg: Str
}
```

A failed send: the server's reply code and text (`550 5.1.1 no such
user`), or code 0 for an error found before or outside a reply (a
connection error, a CR or LF in an address, `smtp: server doesn't
support STARTTLS`).

[Source: `std/smtp.xo:22`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L22)

#### SmtpErr.display {#SmtpErr.display}

```xo
pub fn (e: SmtpErr) display() -> Str
```

`CODE MSG` (net/textproto's Error), or MSG alone for code 0 (decision 0358).

[Source: `std/smtp.xo:28`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L28)

### Auth {#Auth}

```xo
pub enum Auth {
  None
  Plain(user: Str, password: Secret[Str])
  CramMd5(user: Str, secret: Secret[Str])
}
```

How the client authenticates (net/smtp PlainAuth, CRAMMD5Auth).

[Source: `std/smtp.xo:36`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L36)

### Security {#Security}

```xo
pub enum Security {
  StartTls
  Tls
  None
} derive Display
```

The connection's protection (decision 0290): `StartTls` requires the
server's STARTTLS (the default); `Tls` is implicit TLS from the first
byte (port 465); `None` sends in plain text, allowed only to a
loopback host.

[Source: `std/smtp.xo:46`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L46)

### Link {#Link}

```xo
enum Link {
  Plain(c: Conn)
  Tls(t: tls.TlsConn)
}
```

The connection, plain or after STARTTLS (std/sql's Postgres Link).

[Source: `std/smtp.xo:84`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L84)

#### Link.read {#Link.read}

```xo
fn (l: Link) read(max: Int) -> Bytes? ! NetErr uses net.dial
```

[Source: `std/smtp.xo:89`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L89)

#### Link.write {#Link.write}

```xo
fn (l: Link) write(data: Bytes) -> () ! NetErr uses net.dial
```

[Source: `std/smtp.xo:96`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L96)

#### Link.close {#Link.close}

```xo
fn (l: Link) close()
```

[Source: `std/smtp.xo:103`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L103)

### Client {#Client}

```xo
struct Client {
  link: Link
  buf: Bytes = b""
  ext: Map[Str, Str] = {}
  has_ext: Bool = false
  is_tls: Bool = false
  host: Str
}
```

A client (go Client): the connection, the bytes read and not yet
taken, the server's EHLO extensions (upper case keyword to its
parameters), whether the connection is TLS, and the server's name.

[Source: `std/smtp.xo:113`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L113)

#### Client.line {#Client.line}

```xo
fn (var c: Client) line() -> Str ! SmtpErr uses net.dial
```

One line of the server, without its CRLF (textproto.Reader.ReadLine).

[Source: `std/smtp.xo:125`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L125)

#### Client.reply {#Client.reply}

```xo
fn (var c: Client) reply(expect: Int) -> (Int, Str) ! SmtpErr uses net.dial
```

A reply (textproto.Reader.ReadResponse): its code and its text, the
lines of a multi-line reply joined by "\n" (a continuation line with
another code, or not a code line, is kept whole and reading goes on);
an error unless the code meets expect (code_ok).

[Source: `std/smtp.xo:179`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L179)

#### Client.cmd {#Client.cmd}

```xo
fn (var c: Client) cmd(expect: Int, line: Str) -> (Int, Str) ! SmtpErr uses net.dial
```

Sends a command line and reads its reply (Client.cmd).

[Source: `std/smtp.xo:205`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L205)

#### Client.ehlo {#Client.ehlo}

```xo
fn (var c: Client) ehlo(name: Str) -> () ! SmtpErr uses net.dial
```

EHLO, the extensions from its reply (Client.ehlo).

[Source: `std/smtp.xo:211`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L211)

#### Client.hello {#Client.hello}

```xo
fn (var c: Client) hello(name: Str) -> () ! SmtpErr uses net.dial
```

EHLO, then HELO when the server refuses it (Client.hello).

[Source: `std/smtp.xo:229`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L229)

#### Client.abort_auth {#Client.abort_auth}

```xo
fn (var c: Client) abort_auth() uses net.dial
```

Client.Auth's abort: "*", then QUIT, their replies ignored.

[Source: `std/smtp.xo:274`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L274)

#### Client.auth {#Client.auth}

```xo
fn (var c: Client) auth(a: Auth) -> () ! SmtpErr uses net.dial
```

AUTH (Client.Auth with auth.go's PlainAuth and CRAMMD5Auth): the
mechanism and its first response, then while the server answers 334,
the answer to its challenge; 235 ends it; another reply, a challenge
that is not base64, or a challenge PLAIN does not expect cancels the
exchange ("*", then QUIT) and is the error.

[Source: `std/smtp.xo:284`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L284)

## Functions

### send {#send}

```xo
pub fn send(net: Net, addr: Str, from: Str, to: List[Str], msg: Bytes, auth: Auth = Auth.None, security: Security = Security.StartTls, roots: Bytes = b"", hello: Str = "localhost") -> () ! SmtpErr uses net.dial
```

Sends msg (the message's bytes: headers, a blank line, the body; CRLF
or LF line endings) from `from` to every address of `to` through the
server at addr (`host:port`), as net/smtp.SendMail: the greeting,
EHLO (HELO when refused), STARTTLS with the server's name verified
(against roots, a PEM bundle, when given; else the system roots), AUTH,
MAIL FROM, RCPT TO for each, DATA (dot stuffed, CRLF), QUIT.

[Source: `std/smtp.xo:58`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L58)

### fail {#fail}

```xo
fn fail(code: Int, msg: Str) -> SmtpErr
```

[Source: `std/smtp.xo:79`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L79)

### net_fail {#net_fail}

```xo
fn net_fail(e: NetErr) -> SmtpErr
```

[Source: `std/smtp.xo:81`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L81)

### parse_code_line {#parse_code_line}

```xo
fn parse_code_line(l: Str) -> (Int, Bool, Str, Str)
```

parseCodeLine: the code, whether it goes on, the text, and whether
the line is a protocol error ("short response", "invalid response
code").

[Source: `std/smtp.xo:148`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L148)

### code_ok {#code_ok}

```xo
fn code_ok(code: Int, expect: Int) -> Bool
```

Whether code meets expect (parseCodeLine: 1 to 9 the first digit, 10
to 99 the first two, 100 to 999 all; 0 any).

[Source: `std/smtp.xo:162`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L162)

### validate_line {#validate_line}

```xo
fn validate_line(s: Str) -> () ! SmtpErr
```

go validateLine: no CR or LF in a line the client sends.

[Source: `std/smtp.xo:242`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L242)

### is_loopback_host {#is_loopback_host}

```xo
fn is_loopback_host(host: Str) -> Bool
```

auth.go isLocalhost, and a loopback IP address (decision 0290's plain
text rule).

[Source: `std/smtp.xo:251`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L251)

### host_of {#host_of}

```xo
fn host_of(addr: Str) -> Str
```

The host of `host:port` (net.SplitHostPort's host, brackets removed).

[Source: `std/smtp.xo:263`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L263)

### dot_stuff {#dot_stuff}

```xo
fn dot_stuff(msg: Bytes) -> Bytes
```

The message as DATA sends it (textproto.DotWriter): CRLF line
endings, a line starting with "." doubled, and "\r\n.\r\n" at the end.

[Source: `std/smtp.xo:334`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L334)

### run {#run}

```xo
fn run(var c: Client, from: Str, to: List[Str], msg: Bytes, auth: Auth, security: Security, rs: tls.Roots?, hello: Str) -> () ! SmtpErr uses net.dial
```

[Source: `std/smtp.xo:358`](https://github.com/xo-lang/xo/blob/main/std/smtp.xo#L358)
