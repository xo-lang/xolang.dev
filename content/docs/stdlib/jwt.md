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

## Types

### Alg {#Alg}

```xo
enum Alg {
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

[Source: `std/jwt.xo:8`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L8)

### Key {#Key}

```xo
enum Key {
  Hmac(secret: Secret[Bytes])
  Public(key: crypto.PublicKey)
  Private(key: crypto.PrivateKey)
}
```

A key. `Hmac` for HS*, a public key (or a private key, whose public
half verifies) for RS*, PS*, ES* and EdDSA, a private key to sign them.

[Source: `std/jwt.xo:26`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L26)

### Header {#Header}

```xo
struct Header {
  alg: Alg
  kid: Str?
  typ: Str?
  extra: Map[Str, Str] = {}
  x5c: List[Str] = []
}
```

The protected header: `alg`, and the optional `kid` and `typ`. `extra`
holds the other string fields (`x5t#S256`, `jku`, ...) and `x5c` the
certificate chain of RFC 7515 4.1.6 (standard base64 DER, leaf first);
fields of other types are not kept.

[Source: `std/jwt.xo:36`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L36)

### Options {#Options}

```xo
struct Options {
  algs: List[Alg]
  now: Time
  leeway: Duration = 0s
  issuer: Str? = None
  audience: Str? = None
  subject: Str? = None
  require_exp: Bool = true
  check_iat: Bool = false
  max_age: Duration? = None
  max_size: Int = 16384
}
```

What a verification requires. `algs` has no default: the token's own
`alg` is only matched against it.

[Source: `std/jwt.xo:46`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L46)

### JwtErr {#JwtErr}

```xo
enum JwtErr {
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

[Source: `std/jwt.xo:63`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L63)

#### JwtErr.display {#JwtErr.display}

```xo
fn (e: JwtErr) display() -> Str
```

[Source: `std/jwt.xo:82`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L82)

## Functions

### sign {#sign}

```xo
fn sign[T: Json](r: Rand, alg: Alg, key: Key, claims: T, kid: Str? = None, header: Map[Str, Str] = {}, x5c: List[Str] = []) -> Str ! JwtErr uses rand
```

The compact token of claims (any `derive Json` value that encodes as an
object), signed with key; `r` is the randomness of RSA-PSS and ECDSA.
`header` adds string fields to the protected header (`x5t#S256` for an
Azure client assertion) and `x5c` its certificate chain; they follow
`alg`, `kid` and `typ` in order of name, and a name of those, `x5c` in
`header`, or `crit` is JwtErr.Malformed.

[Source: `std/jwt.xo:90`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L90)

### verify_with {#verify_with}

```xo
fn verify_with[T: Json](token: Str, key: Key, opts: Options) -> T ! JwtErr
```

Verifies token with one key and returns its claims decoded as T, after
checking the registered claims against opts.

[Source: `std/jwt.xo:93`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L93)

### verify {#verify}

```xo
fn verify[T: Json](token: Str, keys: fn(Header) -> Key ! JwtErr, opts: Options) -> T ! JwtErr
```

The same with the key chosen from the verified-so-far header (its
`kid`), for key rotation; the function returns JwtErr.Key for an
unknown kid.

[Source: `std/jwt.xo:97`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L97)

### peek_header {#peek_header}

```xo
fn peek_header(token: Str) -> Header ! JwtErr
```

The header of token, unverified: for routing by `kid`, never to decide anything.

[Source: `std/jwt.xo:99`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L99)

### jwks {#jwks}

```xo
fn jwks(set: Str) -> Map[Str, Key] ! JwtErr
```

The keys of an RFC 7517 key set by `kid` (public keys only).

[Source: `std/jwt.xo:101`](https://github.com/xo-lang/xo/blob/main/std/jwt.xo#L101)
