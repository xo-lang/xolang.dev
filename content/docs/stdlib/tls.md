---
title: "std/tls"
linkTitle: "tls"
description: "A TLS client on a connection the program dialed itself (the STARTTLS shape: Postgres's SSLRequest..."
toc: true
module: "std/tls"
source: "https://github.com/xo-lang/xo/blob/main/std/tls.xo"
generated: "scripts/sync-content.py from `xo doc std/tls`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Verify`](#Verify)
- type [`Roots`](#Roots)
- type [`TlsErr`](#TlsErr)
  - method [`TlsErr.display`](#TlsErr.display)
- type [`TlsCert`](#TlsCert)
- type [`ClientAuth`](#ClientAuth)
- type [`TlsConn`](#TlsConn)
  - method [`TlsConn.read`](#TlsConn.read)
  - method [`TlsConn.write`](#TlsConn.write)
  - method [`TlsConn.close`](#TlsConn.close)
  - method [`TlsConn.set_deadline`](#TlsConn.set_deadline)
  - method [`TlsConn.set_read_deadline`](#TlsConn.set_read_deadline)
  - method [`TlsConn.set_write_deadline`](#TlsConn.set_write_deadline)
  - method [`TlsConn.alpn`](#TlsConn.alpn)
  - method [`TlsConn.version`](#TlsConn.version)
  - method [`TlsConn.peer_certificates`](#TlsConn.peer_certificates)
- fn [`roots`](#roots)
- fn [`roots_of`](#roots_of)
- fn [`cert`](#cert)
- fn [`client`](#client)
- fn [`pin_sha1`](#pin_sha1)
- fn [`pin_sha256`](#pin_sha256)

## Types

### Verify {#Verify}

```xo
enum Verify {
  Full
  ChainOnly
  None
} derive Display
```

How the server's certificate is checked (std.md 27).

[Source: `std/tls.xo:9`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L9)

### Roots {#Roots}

```xo
struct Roots {}
```

Certificates a client trusts (std.md 27); a handle.

[Source: `std/tls.xo:16`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L16)

### TlsErr {#TlsErr}

```xo
struct TlsErr {
  msg: Str
}
```

[Source: `std/tls.xo:18`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L18)

#### TlsErr.display {#TlsErr.display}

```xo
fn (e: TlsErr) display() -> Str
```

The message (decision 0358).

[Source: `std/tls.xo:23`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L23)

### TlsCert {#TlsCert}

```xo
struct TlsCert {}
```

A certificate chain with its private key (std.md 27); a handle.
std/http's TlsCert is this type (decision 0433).

[Source: `std/tls.xo:33`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L33)

### ClientAuth {#ClientAuth}

```xo
enum ClientAuth {
  None
  Request
  RequireAny
  VerifyIfGiven
  RequireAndVerify
} derive Display
```

What a TLS server asks of a client's certificate (Go's
tls.ClientAuthType, in Go's order and meaning; decision 0433).

[Source: `std/tls.xo:41`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L41)

### TlsConn {#TlsConn}

```xo
struct TlsConn {}
```

A TLS connection (std.md 27); a handle.

[Source: `std/tls.xo:55`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L55)

#### TlsConn.read {#TlsConn.read}

```xo
fn (t: TlsConn) read(max: Int) -> Bytes? ! NetErr uses net.dial
```

[Source: `std/tls.xo:67`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L67)

#### TlsConn.write {#TlsConn.write}

```xo
fn (t: TlsConn) write(data: Bytes) -> () ! NetErr uses net.dial
```

[Source: `std/tls.xo:68`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L68)

#### TlsConn.close {#TlsConn.close}

```xo
fn (t: TlsConn) close()
```

[Source: `std/tls.xo:69`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L69)

#### TlsConn.set_deadline {#TlsConn.set_deadline}

```xo
fn (t: TlsConn) set_deadline(clock: Clock, at: Time?) uses clock
```

The connection's deadlines (decision 0430), Go's tls.Conn SetDeadline:
a read or write past t fails with Timeout and the connection stays
usable, mid-record included; they apply to the handshake too when set
on the Conn before `client`.

[Source: `std/tls.xo:74`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L74)

#### TlsConn.set_read_deadline {#TlsConn.set_read_deadline}

```xo
fn (t: TlsConn) set_read_deadline(clock: Clock, at: Time?) uses clock
```

[Source: `std/tls.xo:75`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L75)

#### TlsConn.set_write_deadline {#TlsConn.set_write_deadline}

```xo
fn (t: TlsConn) set_write_deadline(clock: Clock, at: Time?) uses clock
```

[Source: `std/tls.xo:76`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L76)

#### TlsConn.alpn {#TlsConn.alpn}

```xo
fn (t: TlsConn) alpn() -> Str
```

The protocol the server chose by ALPN, "" for none.

[Source: `std/tls.xo:78`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L78)

#### TlsConn.version {#TlsConn.version}

```xo
fn (t: TlsConn) version() -> Str
```

"TLS 1.2" or "TLS 1.3".

[Source: `std/tls.xo:80`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L80)

#### TlsConn.peer_certificates {#TlsConn.peer_certificates}

```xo
fn (t: TlsConn) peer_certificates() -> List[x509.Certificate]
```

The server's certificates as it sent them, leaf first (Go's
ConnectionState.PeerCertificates); empty without TLS (FakeNet).

[Source: `std/tls.xo:83`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L83)

## Functions

### roots {#roots}

```xo
fn roots(pem: Bytes) -> Roots ! TlsErr
```

Parses the CERTIFICATE blocks of a PEM text, as http's with_roots.

[Source: `std/tls.xo:26`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L26)

### roots_of {#roots_of}

```xo
fn roots_of(certs: List[x509.Certificate]) -> Roots ! TlsErr
```

Roots of parsed certificates (std/x509), as roots does of a PEM text.

[Source: `std/tls.xo:29`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L29)

### cert {#cert}

```xo
fn cert(cert_pem: Bytes, key_pem: Bytes) -> TlsCert ! TlsErr
```

Parses a PEM certificate chain and its PEM private key (Go's
tls.X509KeyPair), as http.tls_cert.

[Source: `std/tls.xo:37`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L37)

### client {#client}

```xo
fn client(c: Conn, host: Str, roots: Roots? = None, verify: Verify = Verify.Full, alpn: List[Str] = [], cert: TlsCert? = None, verify_conn: (fn(List[x509.Certificate]) -> () ! Str)? = None) -> TlsConn ! NetErr uses net.dial
```

Runs a TLS client handshake on c, which belongs to the result from
then on (std.md 27). cert is the certificate presented when the
server asks for one (decision 0433).

[Source: `std/tls.xo:60`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L60)

### pin_sha1 {#pin_sha1}

```xo
fn pin_sha1(pin: Str) -> fn(List[x509.Certificate]) -> () ! Str ! Str
```

A verify_conn function (also Client.with_verify_conn's) that accepts a server whose leaf certificate's DER has the
SHA-1 digest pin (hex, colons and spaces ignored; Service Fabric's thumbprint), compared in constant time; the
text of a bad pin is the Err of the call.

[Source: `std/tls.xo:64`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L64)

### pin_sha256 {#pin_sha256}

```xo
fn pin_sha256(pin: Str) -> fn(List[x509.Certificate]) -> () ! Str ! Str
```

Like pin_sha1, over SHA-256.

[Source: `std/tls.xo:66`](https://github.com/xo-lang/xo/blob/main/std/tls.xo#L66)
