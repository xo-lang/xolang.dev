---
title: "std/crypto"
linkTitle: "crypto"
description: "Hashing and comparison are pure; anything random takes the `Rand` capability (std.md 3.4), so tes..."
toc: true
module: "std/crypto"
source: "https://github.com/xo-lang/xo/blob/main/std/crypto.xo"
generated: "scripts/sync-content.py from `xo doc std/crypto`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Hash`](#hash)
  - method [`Hash.size`](#hashsize)
- type [`Hasher`](#hasher)
  - method [`Hasher.write`](#hasherwrite)
  - method [`Hasher.sum`](#hashersum)
  - method [`Hasher.written`](#hasherwritten)
- type [`Aead`](#aead)
  - method [`Aead.nonce_size`](#aeadnonce_size)
  - method [`Aead.overhead`](#aeadoverhead)
- type [`AeadKey`](#aeadkey)
  - method [`AeadKey.alg`](#aeadkeyalg)
  - method [`AeadKey.seal_random`](#aeadkeyseal_random)
  - method [`AeadKey.open_random`](#aeadkeyopen_random)
  - method [`AeadKey.seal`](#aeadkeyseal)
  - method [`AeadKey.open`](#aeadkeyopen)
- type [`AeadErr`](#aeaderr)
  - method [`AeadErr.display`](#aeaderrdisplay)
- type [`PemBlock`](#pemblock)
- type [`KeyErr`](#keyerr)
  - method [`KeyErr.display`](#keyerrdisplay)
- type [`KeyAlg`](#keyalg)
- type [`PublicKey`](#publickey)
  - method [`PublicKey.alg`](#publickeyalg)
- type [`PrivateKey`](#privatekey)
  - method [`PrivateKey.alg`](#privatekeyalg)
  - method [`PrivateKey.public_key`](#privatekeypublic_key)
- fn [`sha256`](#sha256)
- fn [`hmac_sha256`](#hmac_sha256)
- fn [`equal`](#equal)
- fn [`random_bytes`](#random_bytes)
- fn [`token`](#token)
- fn [`hash_password_argon2id`](#hash_password_argon2id)
- fn [`hash_password`](#hash_password)
- fn [`verify_password`](#verify_password)
- fn [`ed25519_public_key`](#ed25519_public_key)
- fn [`ed25519_sign`](#ed25519_sign)
- fn [`ed25519_verify`](#ed25519_verify)
- fn [`digest`](#digest)
- fn [`hmac`](#hmac)
- fn [`hasher`](#hasher)
- fn [`hmac_hasher`](#hmac_hasher)
- fn [`aead_key`](#aead_key)
- fn [`hkdf_extract`](#hkdf_extract)
- fn [`hkdf_expand`](#hkdf_expand)
- fn [`hkdf`](#hkdf)
- fn [`parse_public_key`](#parse_public_key)
- fn [`marshal_public_key`](#marshal_public_key)
- fn [`jwk_public_key`](#jwk_public_key)
- fn [`parse_private_key`](#parse_private_key)
- fn [`marshal_private_key`](#marshal_private_key)
- fn [`ecdsa_private_key`](#ecdsa_private_key)
- fn [`pem_decode`](#pem_decode)
- fn [`pem_encode`](#pem_encode)
- fn [`verify`](#verify)
- fn [`verify_pss`](#verify_pss)
- fn [`verify_raw_ecdsa`](#verify_raw_ecdsa)
- fn [`sign`](#sign)
- fn [`sign_pss`](#sign_pss)
- fn [`sign_raw_ecdsa`](#sign_raw_ecdsa)
- fn [`generate_key`](#generate_key)

## Types

### Hash

```xo
enum Hash {
  Md5
  Sha1
  Sha224
  Sha256
  Sha384
  Sha512
  Sha3_256
  Sha3_512
}
```

The hashes of `digest`, `hmac`, and `Hasher` (decision 0279). Md5 and
Sha1 are broken for collision resistance; they are here for protocols
that require them (HMAC-SHA1 signatures, TOTP, Postgres MD5
authentication, Content-MD5).

[Source: `std/crypto.xo:41`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L41)

#### Hash.size

```xo
fn (h: Hash) size() -> Int
```

The digest's size in bytes: 16, 20, 28, 32, 48, 64, 32, 64.

[Source: `std/crypto.xo:53`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L53)

### Hasher

```xo
struct Hasher {}
```

A hash being computed a piece at a time: a value, so copies are
independent (`var x = crypto.hasher(Sha256)`, then `x.write(chunk)`).

[Source: `std/crypto.xo:61`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L61)

#### Hasher.write

```xo
fn (var x: Hasher) write(data: Bytes)
```

[Source: `std/crypto.xo:66`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L66)

#### Hasher.sum

```xo
fn (x: Hasher) sum() -> Bytes
```

The digest (or MAC) of what was written so far; writing may continue.

[Source: `std/crypto.xo:68`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L68)

#### Hasher.written

```xo
fn (x: Hasher) written() -> Int
```

The bytes written so far.

[Source: `std/crypto.xo:70`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L70)

### Aead

```xo
enum Aead {
  AesGcm
  ChaCha20Poly1305
}
```

An authenticated cipher with associated data (Go's cipher.AEAD): it
encrypts and authenticates a message, and authenticates `aad` alongside
it without encrypting it.

[Source: `std/crypto.xo:77`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L77)

#### Aead.nonce_size

```xo
fn (a: Aead) nonce_size() -> Int
```

The nonce's size in bytes: 12 for both.

[Source: `std/crypto.xo:85`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L85)

#### Aead.overhead

```xo
fn (a: Aead) overhead() -> Int
```

The bytes a sealed message is longer than its plaintext: 16 (the tag).

[Source: `std/crypto.xo:87`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L87)

### AeadKey

```xo
struct AeadKey {}
```

A key ready to seal and open messages: its key schedule is made once,
so keep one for many messages. It never displays, prints, or encodes its
key (no Display, no derive Json), as a `Secret[T]`.

[Source: `std/crypto.xo:92`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L92)

#### AeadKey.alg

```xo
fn (k: AeadKey) alg() -> Aead
```

[Source: `std/crypto.xo:105`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L105)

#### AeadKey.seal_random

```xo
fn (k: AeadKey) seal_random(r: Rand, plaintext: Bytes, aad: Bytes = b"") -> Bytes uses rand
```

plaintext sealed under a random nonce from `r`, the nonce first: the
way to seal unless a protocol counts nonces (Go's
cipher.NewGCMWithRandomNonce). Open it with open_random.

[Source: `std/crypto.xo:109`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L109)

#### AeadKey.open_random

```xo
fn (k: AeadKey) open_random(sealed: Bytes, aad: Bytes = b"") -> Bytes ! AeadErr
```

A message from seal_random, checked and decrypted.

[Source: `std/crypto.xo:111`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L111)

#### AeadKey.seal

```xo
fn (k: AeadKey) seal(nonce: Bytes, plaintext: Bytes, aad: Bytes = b"") -> Bytes
```

plaintext encrypted and authenticated with aad under `nonce` (exactly
nonce_size() bytes, else a fault): the ciphertext, then the 16 byte tag.
A nonce must never be used twice with one key: a repeat breaks both the
confidentiality and the authenticity of every message under the key.

[Source: `std/crypto.xo:116`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L116)

#### AeadKey.open

```xo
fn (k: AeadKey) open(nonce: Bytes, sealed: Bytes, aad: Bytes = b"") -> Bytes ! AeadErr
```

sealed checked and decrypted; Err (and no plaintext) when it was
changed, the nonce or aad differ, or it is shorter than the tag.

[Source: `std/crypto.xo:119`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L119)

### AeadErr

```xo
struct AeadErr {
  msg: Str
}
```

An AEAD error: `cipher: message authentication failed` for every
sealed message that does not open (whatever check failed), or a key
size error from aead_key.

[Source: `std/crypto.xo:97`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L97)

#### AeadErr.display

```xo
fn (e: AeadErr) display() -> Str
```

[Source: `std/crypto.xo:101`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L101)

### PemBlock

```xo
struct PemBlock {
  kind: Str
  headers: Map[Str, Str]
  bytes: Bytes
}
```

A PEM block (encoding/pem): its type (`PUBLIC KEY`), headers, and
decoded bytes.

[Source: `std/crypto.xo:135`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L135)

### KeyErr

```xo
struct KeyErr {
  msg: Str
}
```

Go's error texts (`x509: failed to parse public key`, ...).

[Source: `std/crypto.xo:142`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L142)

#### KeyErr.display

```xo
fn (e: KeyErr) display() -> Str
```

[Source: `std/crypto.xo:146`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L146)

### KeyAlg

```xo
enum KeyAlg {
  Rsa
  EcdsaP224
  EcdsaP256
  EcdsaP384
  EcdsaP521
  Ed25519
}
```

[Source: `std/crypto.xo:148`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L148)

### PublicKey

```xo
struct PublicKey {}
```

A public key: ==; Debug text `<publickey>`.

[Source: `std/crypto.xo:158`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L158)

#### PublicKey.alg

```xo
fn (k: PublicKey) alg() -> KeyAlg
```

[Source: `std/crypto.xo:165`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L165)

### PrivateKey

```xo
struct PrivateKey {}
```

A private key: Debug text `<privatekey>`, never key material.

[Source: `std/crypto.xo:171`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L171)

#### PrivateKey.alg

```xo
fn (k: PrivateKey) alg() -> KeyAlg
```

[Source: `std/crypto.xo:178`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L178)

#### PrivateKey.public_key

```xo
fn (k: PrivateKey) public_key() -> PublicKey
```

[Source: `std/crypto.xo:179`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L179)

## Functions

### sha256

```xo
fn sha256(data: Bytes) -> Bytes
```

[Source: `std/crypto.xo:6`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L6)

### hmac_sha256

```xo
fn hmac_sha256(key: Bytes, msg: Bytes) -> Bytes
```

[Source: `std/crypto.xo:7`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L7)

### equal

```xo
fn equal(a: Bytes, b: Bytes) -> Bool
```

Constant time in the contents (not the lengths) of `a` and `b`.

[Source: `std/crypto.xo:9`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L9)

### random_bytes

```xo
fn random_bytes(r: Rand, n: Int) -> Bytes uses rand
```

[Source: `std/crypto.xo:10`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L10)

### token

```xo
fn token(r: Rand, n: Int = 32) -> Str uses rand
```

`n` random bytes as unpadded URL safe base64.

[Source: `std/crypto.xo:12`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L12)

### hash_password_argon2id

```xo
fn hash_password_argon2id(r: Rand, password: Str, memory_kib: Int = 19456, iterations: Int = 2, parallelism: Int = 1) -> Str uses rand
```

Argon2id (RFC 9106) with a 16 byte random salt and a 32 byte key, in the
PHC format `$argon2id$v=19$m=<memory_kib>,t=<iterations>,p=<parallelism>$<salt>$<key>`.
The defaults are the OWASP minimum (19 MiB, 2 passes, 1 lane). The
recommended password hash (std.md 11).

[Source: `std/crypto.xo:17`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L17)

### hash_password

```xo
fn hash_password(r: Rand, password: Str, iterations: Int = 600000) -> Str uses rand
```

PBKDF2-HMAC-SHA256 with a 16 byte random salt; the result is
`pbkdf2-sha256$<iterations>$<salt>$<key>` (std.md 11).

[Source: `std/crypto.xo:20`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L20)

### verify_password

```xo
fn verify_password(password: Str, hash: Str) -> Bool
```

Checks a result of `hash_password_argon2id` or `hash_password`, told apart
by the prefix.

[Source: `std/crypto.xo:23`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L23)

### ed25519_public_key

```xo
fn ed25519_public_key(seed: Bytes) -> Bytes
```

Ed25519 (RFC 8032, decision 0189): the 32 byte public key of the
private key `seed` (32 bytes; faults otherwise).

[Source: `std/crypto.xo:26`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L26)

### ed25519_sign

```xo
fn ed25519_sign(seed: Bytes, msg: Bytes) -> Bytes
```

The 64 byte Ed25519 signature of msg by the private key `seed`: the
32 byte seed, or Go's 64 byte private key (the seed, then its public
key, which signing then uses as stored and need not compute); faults
on any other length. Deterministic: the same seed and message give the
same signature.

[Source: `std/crypto.xo:32`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L32)

### ed25519_verify

```xo
fn ed25519_verify(public_key: Bytes, msg: Bytes, sig: Bytes) -> Bool
```

Whether sig is a valid Ed25519 signature of msg by public_key; false
for a key that is not 32 bytes or a signature that is not 64.

[Source: `std/crypto.xo:35`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L35)

### digest

```xo
fn digest(h: Hash, data: Bytes) -> Bytes
```

The digest of data with h (Go's md5.Sum, sha1.Sum, sha256.Sum224, ...).

[Source: `std/crypto.xo:55`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L55)

### hmac

```xo
fn hmac(h: Hash, key: Bytes, msg: Bytes) -> Bytes
```

HMAC (RFC 2104) of msg keyed with key, over h (Go's crypto/hmac).

[Source: `std/crypto.xo:57`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L57)

### hasher

```xo
fn hasher(h: Hash) -> Hasher
```

[Source: `std/crypto.xo:63`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L63)

### hmac_hasher

```xo
fn hmac_hasher(h: Hash, key: Bytes) -> Hasher
```

A Hasher computing HMAC over h keyed with key.

[Source: `std/crypto.xo:65`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L65)

### aead_key

```xo
fn aead_key(alg: Aead, key: Bytes) -> AeadKey ! AeadErr
```

alg's key; Err when `key` is not a length alg takes.

[Source: `std/crypto.xo:104`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L104)

### hkdf_extract

```xo
fn hkdf_extract(h: Hash, secret: Bytes, salt: Bytes = b"") -> Bytes
```

HKDF-Extract (RFC 5869, Go's hkdf.Extract): the pseudorandom key,
h.size() bytes, from `secret` and `salt` (empty: h.size() zero bytes).

[Source: `std/crypto.xo:123`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L123)

### hkdf_expand

```xo
fn hkdf_expand(h: Hash, prk: Bytes, info: Bytes, n: Int) -> Bytes
```

HKDF-Expand (Go's hkdf.Expand): n bytes of keying material from a
pseudorandom key and `info`. Faults when n is negative or over 255
times h.size().

[Source: `std/crypto.xo:127`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L127)

### hkdf

```xo
fn hkdf(h: Hash, secret: Bytes, salt: Bytes, info: Bytes, n: Int) -> Bytes
```

HKDF, extract then expand (Go's hkdf.Key).

[Source: `std/crypto.xo:129`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L129)

### parse_public_key

```xo
fn parse_public_key(der: Bytes) -> PublicKey ! KeyErr
```

PKIX SubjectPublicKeyInfo (x509.ParsePKIXPublicKey) or PKCS #1
RSAPublicKey DER.

[Source: `std/crypto.xo:162`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L162)

### marshal_public_key

```xo
fn marshal_public_key(k: PublicKey) -> Bytes
```

PKIX DER (x509.MarshalPKIXPublicKey).

[Source: `std/crypto.xo:164`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L164)

### jwk_public_key

```xo
fn jwk_public_key(jwk: Str) -> PublicKey ! KeyErr
```

A JWK's public key (RFC 7517; kty RSA, EC with crv P-256, P-384, or
P-521, OKP with crv Ed25519; private members ignored).

[Source: `std/crypto.xo:168`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L168)

### parse_private_key

```xo
fn parse_private_key(der: Bytes) -> PrivateKey ! KeyErr
```

PKCS #8, PKCS #1, or SEC 1 EC DER, as Go's parsers tell them apart.

[Source: `std/crypto.xo:174`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L174)

### marshal_private_key

```xo
fn marshal_private_key(k: PrivateKey) -> Bytes
```

k as PKCS #8 DER (Go's MarshalPKCS8PrivateKey), which parse_private_key
reads back; pem_encode it as a "PRIVATE KEY" block to save it.

[Source: `std/crypto.xo:177`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L177)

### ecdsa_private_key

```xo
fn ecdsa_private_key(alg: KeyAlg, d: Bytes) -> PrivateKey ! KeyErr
```

An ECDSA key from its private scalar d, big endian and as long as the
curve's order (32 bytes for EcdsaP256; 66 for EcdsaP521), as Go's
ecdsa.ParseRawPrivateKey: 0 and d at or above the order are KeyErr
(`ecdsa: invalid public key encoding`, Go's text), a wrong length is
`invalid scalar length`, and any other alg is KeyErr. `public_key()` of
the result is the public point (AWS SigV4a derives its key this way).

[Source: `std/crypto.xo:186`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L186)

### pem_decode

```xo
fn pem_decode(text: Str) -> List[PemBlock]
```

Every PEM block in text, in order (pem.Decode repeated on the rest);
text outside blocks and malformed blocks are skipped.

[Source: `std/crypto.xo:190`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L190)

### pem_encode

```xo
fn pem_encode(b: PemBlock) -> Str ! KeyErr
```

pem.EncodeToMemory: KeyErr for a header key holding a colon.

[Source: `std/crypto.xo:192`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L192)

### verify

```xo
fn verify(k: PublicKey, h: Hash, msg: Bytes, sig: Bytes) -> Bool
```

RSA PKCS #1 v1.5 or ECDSA (ASN.1 DER) over msg hashed with h, or
Ed25519 over msg itself; false for a key, hash, or signature that does
not fit.

[Source: `std/crypto.xo:197`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L197)

### verify_pss

```xo
fn verify_pss(k: PublicKey, h: Hash, msg: Bytes, sig: Bytes) -> Bool
```

RSA PSS, any salt length (PSSSaltLengthAuto).

[Source: `std/crypto.xo:199`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L199)

### verify_raw_ecdsa

```xo
fn verify_raw_ecdsa(k: PublicKey, h: Hash, msg: Bytes, sig: Bytes) -> Bool
```

ECDSA with the fixed size r || s of JWS (RFC 7518 3.4).

[Source: `std/crypto.xo:201`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L201)

### sign

```xo
fn sign(r: Rand, k: PrivateKey, h: Hash, msg: Bytes) -> Bytes ! KeyErr uses rand
```

RSA PKCS #1 v1.5, ECDSA (ASN.1 DER, a hedged nonce from r), or Ed25519.

[Source: `std/crypto.xo:203`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L203)

### sign_pss

```xo
fn sign_pss(r: Rand, k: PrivateKey, h: Hash, msg: Bytes) -> Bytes ! KeyErr uses rand
```

RSA PSS with a salt as long as the hash, from r.

[Source: `std/crypto.xo:205`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L205)

### sign_raw_ecdsa

```xo
fn sign_raw_ecdsa(r: Rand, k: PrivateKey, h: Hash, msg: Bytes) -> Bytes ! KeyErr uses rand
```

ECDSA as the fixed size r || s of JWS.

[Source: `std/crypto.xo:207`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L207)

### generate_key

```xo
fn generate_key(r: Rand, alg: KeyAlg, bits: Int = 2048) -> PrivateKey ! KeyErr uses rand
```

A new key from r (Go's GenerateKey): an ECDSA or Ed25519 key, or an RSA
key of `bits` (1024 to 8192, exponent 65537; other algorithms ignore
it). The same r gives the same key on every backend.

[Source: `std/crypto.xo:211`](https://github.com/xo-lang/xo/blob/main/std/crypto.xo#L211)
