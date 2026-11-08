---
title: "std/bcrypt"
linkTitle: "bcrypt"
description: "golang.org/x/crypto/bcrypt: password hashes in the bcrypt format ($2a$ with a cost, a 22 characte..."
toc: true
module: "std/bcrypt"
source: "https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo"
generated: "scripts/sync-content.py from `xo doc std/bcrypt`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`MIN_COST`](#min_cost)
- const [`MAX_COST`](#max_cost)
- const [`DEFAULT_COST`](#default_cost)
- type [`BcryptErr`](#bcrypterr)
  - method [`BcryptErr.display`](#bcrypterrdisplay)
- fn [`hash`](#hash)
- fn [`compare`](#compare)
- fn [`cost`](#cost)

## Constants

### MIN_COST

```xo
const MIN_COST: Int = 4
```

The lowest cost `hash` accepts; a lower one is replaced by DEFAULT_COST
(Go's MinCost).

[Source: `std/bcrypt.xo:11`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L11)

### MAX_COST

```xo
const MAX_COST: Int = 31
```

The highest cost (Go's MaxCost).

[Source: `std/bcrypt.xo:13`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L13)

### DEFAULT_COST

```xo
const DEFAULT_COST: Int = 10
```

The cost `hash` uses by default and for a cost below MIN_COST (Go's
DefaultCost).

[Source: `std/bcrypt.xo:16`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L16)

## Types

### BcryptErr

```xo
enum BcryptErr {
  Mismatch
  HashTooShort
  VersionTooNew(version: Int)
  InvalidPrefix(byte: Int)
  InvalidCost(cost: Int)
  PasswordTooLong
  Corrupt(msg: Str)
}
```

Go's errors, with Go's texts as `display()`: `crypto/bcrypt:
hashedPassword is not the hash of the given password`, `crypto/bcrypt:
hashedSecret too short to be a bcrypted password`, `crypto/bcrypt: bcrypt
algorithm version '3' requested is newer than current version '2'`,
`crypto/bcrypt: bcrypt hashes must start with '$', but hashedSecret
started with 'x'`, `crypto/bcrypt: cost 3 is outside allowed inclusive
range 4..31`, `bcrypt: password length exceeds 72 bytes`; Corrupt is a
cost or salt that is not valid text (Go's strconv and base64 errors).

[Source: `std/bcrypt.xo:26`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L26)

#### BcryptErr.display

```xo
fn (e: BcryptErr) display() -> Str
```

[Source: `std/bcrypt.xo:36`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L36)

## Functions

### hash

```xo
fn hash(password: Bytes, rand: Rand, cost: Int = 10) -> Str ! BcryptErr uses rand
```

A new hash of password (Go's GenerateFromPassword): 60 characters,
with a random salt drawn from rand. A cost below MIN_COST is
DEFAULT_COST; above MAX_COST is `InvalidCost`; a password over 72 bytes
is `PasswordTooLong`.

[Source: `std/bcrypt.xo:42`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L42)

### compare

```xo
fn compare(hashed: Str, password: Bytes) -> () ! BcryptErr
```

Ok when hashed is the bcrypt hash of password (Go's
CompareHashAndPassword), `Mismatch` when it is not, and the other
errors when hashed is not a bcrypt hash. The comparison of the hashes
takes the same time wherever they differ.

[Source: `std/bcrypt.xo:47`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L47)

### cost

```xo
fn cost(hashed: Str) -> Int ! BcryptErr
```

The cost hashed was made with (Go's Cost).

[Source: `std/bcrypt.xo:49`](https://github.com/xo-lang/xo/blob/main/std/bcrypt.xo#L49)
