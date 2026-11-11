---
title: "std/jwt"
linkTitle: "jwt"
description: "JSON Web Tokens in the JWS compact form (RFC 7515, RFC 7519) on std/crypto, with golang-jwt/jwt v..."
toc: true
module: "std/jwt"
source: "https://github.com/xo-lang/xo/blob/main/std/jwt.xo"
generated: "scripts/sync-content.py from `xo doc std/jwt`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`NS`](#NS)
- type [`Alg`](#Alg)
- type [`Key`](#Key)
- type [`Header`](#Header)
- type [`Options`](#Options)
- type [`JwtErr`](#JwtErr)
  - method [`JwtErr.display`](#JwtErr.display)
- fn [`sign`](#sign)
- fn [`verify_with`](#verify_with)
- fn [`verify`](#verify)
- fn [`peek_header`](#peek_header)
- fn [`jwks`](#jwks)
- fn [`alg_name`](#alg_name)
- fn [`alg_of`](#alg_of)
- fn [`hash_of`](#hash_of)
- fn [`key_misfit`](#key_misfit)
- fn [`b64`](#b64)
- fn [`public_of`](#public_of)
- fn [`b64url_ok`](#b64url_ok)
- fn [`malformed`](#malformed)
- fn [`segment_object`](#segment_object)
- fn [`header_of`](#header_of)
- fn [`numeric_date`](#numeric_date)
- fn [`date_time`](#date_time)
- fn [`before`](#before)
- fn [`string_claim`](#string_claim)
- fn [`check_claims`](#check_claims)
- fn [`signature_ok`](#signature_ok)

## Constants

### NS {#NS}

```xo
const NS: Int = 1000000000
```

[Source: `std/jwt.xo:426`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L426)

## Types

### Alg {#Alg}

```xo
pub enum Alg {
  HS256
  HS384
  HS512
  RS256
  RS384
  RS512
  PS256
  PS384
  PS512
  ES256
  ES384
  ES512
  EdDSA
}
```

The signature algorithms (RFC 7518 3.1). There is no `none`.

[Source: `std/jwt.xo:17`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L17)

### Key {#Key}

```xo
pub enum Key {
  Hmac(secret: Secret[Bytes])
  Public(key: crypto.PublicKey)
  Private(key: crypto.PrivateKey)
}
```

A key. `Hmac` for HS*, a public key (or a private key, whose public
half verifies) for RS*, PS*, ES* and EdDSA, a private key to sign them.

[Source: `std/jwt.xo:35`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L35)

### Header {#Header}

```xo
pub struct Header {
  pub alg: Alg
  pub kid: Str?
  pub typ: Str?
  pub extra: Map[Str, Str] = {}
  pub x5c: List[Str] = []
}
```

The protected header: `alg`, and the optional `kid` and `typ`. `extra`
holds the other string fields (`x5t#S256`, `jku`, ...) and `x5c` the
certificate chain of RFC 7515 4.1.6 (standard base64 DER, leaf first);
fields of other types are not kept.

[Source: `std/jwt.xo:45`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L45)

### Options {#Options}

```xo
pub struct Options {
  pub algs: List[Alg]
  pub now: Time
  pub leeway: Duration = 0s
  pub issuer: Str? = None
  pub audience: Str? = None
  pub subject: Str? = None
  pub require_exp: Bool = true
  pub check_iat: Bool = false
  pub max_age: Duration? = None
  pub max_size: Int = 16384
}
```

What a verification requires. `algs` has no default: the token's own
`alg` is only matched against it.

[Source: `std/jwt.xo:55`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L55)

### JwtErr {#JwtErr}

```xo
pub enum JwtErr {
  Malformed(msg: Str)
  Alg(msg: Str)
  Signature
  Expired(at: Time)
  NotYetValid(at: Time)
  Issuer
  Audience
  Subject
  Claim(msg: Str)
  Key(msg: Str)
}
```

[Source: `std/jwt.xo:72`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L72)

#### JwtErr.display {#JwtErr.display}

```xo
pub fn (e: JwtErr) display() -> Str
```

[Source: `std/jwt.xo:91`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L91)

## Functions

### sign {#sign}

```xo
pub fn sign[T: Json](r: Rand, alg: Alg, key: Key, claims: T, kid: Str? = None, header: Map[Str, Str] = {}, x5c: List[Str] = []) -> Str ! JwtErr uses rand
```

The compact token of claims (any `derive Json` value that encodes as an
object), signed with key; `r` is the randomness of RSA-PSS and ECDSA.
`header` adds string fields to the protected header (`x5t#S256` for an
Azure client assertion) and `x5c` its certificate chain; they follow
`alg`, `kid` and `typ` in order of name, and a name of those, `x5c` in
`header`, or `crit` is JwtErr.Malformed.

[Source: `std/jwt.xo:112`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L112)

### verify_with {#verify_with}

```xo
pub fn verify_with[T: Json](token: Str, key: Key, opts: Options) -> T ! JwtErr
```

Verifies token with one key and returns its claims decoded as T, after
checking the registered claims against opts.

[Source: `std/jwt.xo:178`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L178)

### verify {#verify}

```xo
pub fn verify[T: Json](token: Str, keys: fn(Header) -> Key ! JwtErr, opts: Options) -> T ! JwtErr
```

The same with the key chosen from the verified-so-far header (its
`kid`), for key rotation; the function returns JwtErr.Key for an
unknown kid.

[Source: `std/jwt.xo:185`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L185)

### peek_header {#peek_header}

```xo
pub fn peek_header(token: Str) -> Header ! JwtErr
```

The header of token, unverified: for routing by `kid`, never to decide anything.

[Source: `std/jwt.xo:224`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L224)

### jwks {#jwks}

```xo
pub fn jwks(set: Str) -> Map[Str, Key] ! JwtErr
```

The keys of an RFC 7517 key set by `kid` (public keys only).

[Source: `std/jwt.xo:233`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L233)

### alg_name {#alg_name}

```xo
fn alg_name(a: Alg) -> Str
```

[Source: `std/jwt.xo:259`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L259)

### alg_of {#alg_of}

```xo
fn alg_of(s: Str) -> Alg?
```

[Source: `std/jwt.xo:277`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L277)

### hash_of {#hash_of}

```xo
fn hash_of(a: Alg) -> crypto.Hash
```

[Source: `std/jwt.xo:296`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L296)

### key_misfit {#key_misfit}

```xo
fn key_misfit(alg: Alg, key: Key) -> Str
```

Why key cannot be used with alg (golang-jwt's ErrInvalidKeyType), or "".

[Source: `std/jwt.xo:305`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L305)

### b64 {#b64}

```xo
fn b64(b: Bytes) -> Str
```

[Source: `std/jwt.xo:328`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L328)

### public_of {#public_of}

```xo
fn public_of(key: Key) -> crypto.PublicKey?
```

[Source: `std/jwt.xo:330`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L330)

### b64url_ok {#b64url_ok}

```xo
fn b64url_ok(s: Str) -> Bool
```

[Source: `std/jwt.xo:338`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L338)

### malformed {#malformed}

```xo
fn malformed(msg: Str) -> JwtErr
```

[Source: `std/jwt.xo:351`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L351)

### segment_object {#segment_object}

```xo
fn segment_object(seg: Str, what: Str) -> json.Value ! JwtErr
```

The JSON object a segment decodes to.

[Source: `std/jwt.xo:354`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L354)

### header_of {#header_of}

```xo
fn header_of(h: json.Value) -> Header ! JwtErr
```

[Source: `std/jwt.xo:376`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L376)

### numeric_date {#numeric_date}

```xo
fn numeric_date(v: json.Value, name: Str) -> Int ! JwtErr
```

A NumericDate in whole seconds (rounded down, golang-jwt's
TimePrecision). Kept as seconds: a date past 2262 does not fit a Time's
nanoseconds, and every comparison below is done in seconds (b25).

[Source: `std/jwt.xo:431`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L431)

### date_time {#date_time}

```xo
fn date_time(secs: Int) -> Time
```

secs as a Time for an error's `at`: dates past what a Time holds (about
2262) report the latest or earliest Time.

[Source: `std/jwt.xo:451`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L451)

### before {#before}

```xo
fn before(now: Time, secs: Int, a: Duration, b: Duration) -> Bool
```

now \< the date secs plus a and b, with no overflow: the difference is
taken in whole seconds, the nanosecond remainders only when it is within
a few seconds.

[Source: `std/jwt.xo:460`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L460)

### string_claim {#string_claim}

```xo
fn string_claim(v: json.Value, name: Str) -> Str? ! JwtErr
```

[Source: `std/jwt.xo:481`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L481)

### check_claims {#check_claims}

```xo
fn check_claims(v: json.Value, opts: Options) -> () ! JwtErr
```

[Source: `std/jwt.xo:489`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L489)

### signature_ok {#signature_ok}

```xo
fn signature_ok(alg: Alg, key: Key, msg: Bytes, sig: Bytes) -> Bool
```

[Source: `std/jwt.xo:562`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L562)
