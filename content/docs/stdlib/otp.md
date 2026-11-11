---
title: "std/otp"
linkTitle: "otp"
description: "One time passwords: HOTP (RFC 4226), TOTP (RFC 6238) and the otpauth:// URI an authenticator app ..."
toc: true
module: "std/otp"
source: "https://github.com/xo-lang/xo/blob/main/std/otp.xo"
generated: "scripts/sync-content.py from `xo doc std/otp`; edit the doc comments in the Xo repo, not this file"
---
## Index

- fn [`hotp`](#hotp)
- fn [`totp`](#totp)
- fn [`verify`](#verify)
- fn [`generate_secret`](#generate_secret)
- fn [`uri`](#uri)
- fn [`check_params`](#check_params)
- fn [`pow10`](#pow10)

## Functions

### hotp {#hotp}

```xo
pub fn hotp(secret: Bytes, counter: Int, digits: Int = 6, algo: crypto.Hash = crypto.Hash.Sha1) -> Str
```

The HOTP code (RFC 4226) of counter: `digits` decimal digits (6 to 8,
zero padded), HMAC over algo (Sha1, Sha256 or Sha512), the 8 byte
big endian counter and the dynamic truncation of section 5.3. A fault
for other digits or algo, or a negative counter.

[Source: `std/otp.xo:18`](https://github.com/xo-lang/xo/blob/main/std/otp.xo#L18)

### totp {#totp}

```xo
pub fn totp(secret: Bytes, unix: Int, period: Int = 30, digits: Int = 6, algo: crypto.Hash = crypto.Hash.Sha1) -> Str
```

The TOTP code (RFC 6238) at unix seconds: hotp of `unix / period`.
A fault for a period under 1 or a negative unix, and hotp's.

[Source: `std/otp.xo:41`](https://github.com/xo-lang/xo/blob/main/std/otp.xo#L41)

### verify {#verify}

```xo
pub fn verify(secret: Bytes, code: Str, unix: Int, period: Int = 30, digits: Int = 6, algo: crypto.Hash = crypto.Hash.Sha1, skew: Int = 1) -> Int?
```

The time step (`unix / period` plus an offset, the counter that was
hashed) whose TOTP code is `code`, among the step of `unix` and `skew`
steps either side (clock drift); None when none matches. The caller
stores the last step it accepted and rejects a step that is not later
(RFC 6238 section 5.2, replay). Each candidate is compared in constant
time and every one is compared, so the time taken does not say which
matched. A code that is not `digits` ASCII digits is None, never a
fault: it is untrusted input. Does not remember a used code.

[Source: `std/otp.xo:59`](https://github.com/xo-lang/xo/blob/main/std/otp.xo#L59)

### generate_secret {#generate_secret}

```xo
pub fn generate_secret(r: Rand, len: Int = 20) -> Bytes uses rand
```

A random secret of len bytes (20, the length of an HMAC-SHA1 key, is
what authenticator apps expect).

[Source: `std/otp.xo:94`](https://github.com/xo-lang/xo/blob/main/std/otp.xo#L94)

### uri {#uri}

```xo
pub fn uri(issuer: Str, account: Str, secret: Bytes, period: Int = 30, digits: Int = 6, algo: crypto.Hash = crypto.Hash.Sha1) -> Str
```

The Key URI Format of an authenticator app (Google Authenticator wiki,
pquerna/otp's Key.URL): `otpauth://totp/ISSUER:ACCOUNT?algorithm=SHA1&digits=6&issuer=ISSUER&period=30&secret=BASE32`,
the parameters sorted, the label and values percent encoded, the secret
unpadded base32.

[Source: `std/otp.xo:102`](https://github.com/xo-lang/xo/blob/main/std/otp.xo#L102)

### check_params {#check_params}

```xo
fn check_params(digits: Int, algo: crypto.Hash)
```

[Source: `std/otp.xo:119`](https://github.com/xo-lang/xo/blob/main/std/otp.xo#L119)

### pow10 {#pow10}

```xo
fn pow10(n: Int) -> Int
```

[Source: `std/otp.xo:129`](https://github.com/xo-lang/xo/blob/main/std/otp.xo#L129)
