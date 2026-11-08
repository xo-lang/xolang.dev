---
title: "std/big"
linkTitle: "big"
description: "Go's math/big Int as an immutable value: every operation returns a new BigInt, with Go's results ..."
toc: true
module: "std/big"
source: "https://github.com/xo-lang/xo/blob/main/std/big.xo"
generated: "scripts/sync-content.py from `xo doc std/big`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`BigInt`](#bigint)
  - method [`BigInt.add`](#bigintadd)
  - method [`BigInt.sub`](#bigintsub)
  - method [`BigInt.mul`](#bigintmul)
  - method [`BigInt.quo`](#bigintquo)
  - method [`BigInt.rem`](#bigintrem)
  - method [`BigInt.quo_rem`](#bigintquo_rem)
  - method [`BigInt.div`](#bigintdiv)
  - method [`BigInt.mod`](#bigintmod)
  - method [`BigInt.div_mod`](#bigintdiv_mod)
  - method [`BigInt.exp`](#bigintexp)
  - method [`BigInt.gcd`](#bigintgcd)
  - method [`BigInt.mod_inverse`](#bigintmod_inverse)
  - method [`BigInt.sqrt`](#bigintsqrt)
  - method [`BigInt.neg`](#bigintneg)
  - method [`BigInt.abs`](#bigintabs)
  - method [`BigInt.sign`](#bigintsign)
  - method [`BigInt.cmp`](#bigintcmp)
  - method [`BigInt.cmp_abs`](#bigintcmp_abs)
  - method [`BigInt.lsh`](#bigintlsh)
  - method [`BigInt.rsh`](#bigintrsh)
  - method [`BigInt.and`](#bigintand)
  - method [`BigInt.or`](#bigintor)
  - method [`BigInt.xor`](#bigintxor)
  - method [`BigInt.and_not`](#bigintand_not)
  - method [`BigInt.not`](#bigintnot)
  - method [`BigInt.bit`](#bigintbit)
  - method [`BigInt.bit_len`](#bigintbit_len)
  - method [`BigInt.trailing_zeros`](#biginttrailing_zeros)
  - method [`BigInt.probably_prime`](#bigintprobably_prime)
  - method [`BigInt.text`](#biginttext)
  - method [`BigInt.bytes`](#bigintbytes)
  - method [`BigInt.fill_bytes`](#bigintfill_bytes)
  - method [`BigInt.to_int`](#bigintto_int)
  - method [`BigInt.to_float`](#bigintto_float)
  - method [`BigInt.display`](#bigintdisplay)
  - method [`BigInt.debug`](#bigintdebug)
- type [`BigErr`](#bigerr)
  - method [`BigErr.display`](#bigerrdisplay)
- fn [`from_int`](#from_int)
- fn [`parse`](#parse)
- fn [`from_bytes`](#from_bytes)

## Types

### BigInt

```xo
struct BigInt {
  key: List[Int]
} derive Eq, Ord, Hash
```

An integer of any size. `key` encodes it so that the derived order is
the numeric one: zero is [0]; a number of n 64 bit limbs is n (-n when
negative), then its limbs from the most significant, each xor the sign
bit (xor 2^63 - 1 when negative). Build one with the functions below,
not a literal.

[Source: `std/big.xo:11`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L11)

#### BigInt.add

```xo
fn (x: BigInt) add(y: BigInt) -> BigInt
```

[Source: `std/big.xo:31`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L31)

#### BigInt.sub

```xo
fn (x: BigInt) sub(y: BigInt) -> BigInt
```

[Source: `std/big.xo:32`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L32)

#### BigInt.mul

```xo
fn (x: BigInt) mul(y: BigInt) -> BigInt
```

[Source: `std/big.xo:33`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L33)

#### BigInt.quo

```xo
fn (x: BigInt) quo(y: BigInt) -> BigInt
```

x / y truncated toward zero (Go's Quo); a fault when y is 0.

[Source: `std/big.xo:35`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L35)

#### BigInt.rem

```xo
fn (x: BigInt) rem(y: BigInt) -> BigInt
```

x - y * x.quo(y), with x's sign (Go's Rem).

[Source: `std/big.xo:37`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L37)

#### BigInt.quo_rem

```xo
fn (x: BigInt) quo_rem(y: BigInt) -> (BigInt, BigInt)
```

[Source: `std/big.xo:38`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L38)

#### BigInt.div

```xo
fn (x: BigInt) div(y: BigInt) -> BigInt
```

Euclidean division (Go's Div): the remainder is never negative.

[Source: `std/big.xo:40`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L40)

#### BigInt.mod

```xo
fn (x: BigInt) mod(y: BigInt) -> BigInt
```

x mod y in 0 to |y| - 1 (Go's Mod).

[Source: `std/big.xo:42`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L42)

#### BigInt.div_mod

```xo
fn (x: BigInt) div_mod(y: BigInt) -> (BigInt, BigInt)
```

[Source: `std/big.xo:43`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L43)

#### BigInt.exp

```xo
fn (x: BigInt) exp(y: BigInt, m: BigInt? = None) -> BigInt
```

x to the y, mod |m| when m is given and not 0 (Go's Exp): y \<= 0 gives
1 without m; with m, a negative y uses x's inverse mod m, a fault when
there is none (Go returns nil).

[Source: `std/big.xo:47`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L47)

#### BigInt.gcd

```xo
fn (x: BigInt) gcd(y: BigInt) -> BigInt
```

The greatest common divisor of |x| and |y|; 0 when both are 0.

[Source: `std/big.xo:49`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L49)

#### BigInt.mod_inverse

```xo
fn (x: BigInt) mod_inverse(m: BigInt) -> BigInt?
```

x's inverse mod m, None when gcd(x, m) is not 1 (Go's ModInverse).

[Source: `std/big.xo:51`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L51)

#### BigInt.sqrt

```xo
fn (x: BigInt) sqrt() -> BigInt
```

The floor of the square root; a fault when x \< 0.

[Source: `std/big.xo:53`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L53)

#### BigInt.neg

```xo
fn (x: BigInt) neg() -> BigInt
```

[Source: `std/big.xo:54`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L54)

#### BigInt.abs

```xo
fn (x: BigInt) abs() -> BigInt
```

[Source: `std/big.xo:55`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L55)

#### BigInt.sign

```xo
fn (x: BigInt) sign() -> Int
```

-1, 0, or 1.

[Source: `std/big.xo:57`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L57)

#### BigInt.cmp

```xo
fn (x: BigInt) cmp(y: BigInt) -> Int
```

-1, 0, or 1 as x \<, ==, > y (also the operators).

[Source: `std/big.xo:59`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L59)

#### BigInt.cmp_abs

```xo
fn (x: BigInt) cmp_abs(y: BigInt) -> Int
```

[Source: `std/big.xo:60`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L60)

#### BigInt.lsh

```xo
fn (x: BigInt) lsh(n: Int) -> BigInt
```

x * 2^n; a fault when n \< 0.

[Source: `std/big.xo:62`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L62)

#### BigInt.rsh

```xo
fn (x: BigInt) rsh(n: Int) -> BigInt
```

x / 2^n rounded toward negative infinity (Go's Rsh); a fault when n \< 0.

[Source: `std/big.xo:64`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L64)

#### BigInt.and

```xo
fn (x: BigInt) and(y: BigInt) -> BigInt
```

The bitwise operations on two's complement, as Go's And, Or, Xor,
AndNot, Not.

[Source: `std/big.xo:67`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L67)

#### BigInt.or

```xo
fn (x: BigInt) or(y: BigInt) -> BigInt
```

[Source: `std/big.xo:68`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L68)

#### BigInt.xor

```xo
fn (x: BigInt) xor(y: BigInt) -> BigInt
```

[Source: `std/big.xo:69`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L69)

#### BigInt.and_not

```xo
fn (x: BigInt) and_not(y: BigInt) -> BigInt
```

[Source: `std/big.xo:70`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L70)

#### BigInt.not

```xo
fn (x: BigInt) not() -> BigInt
```

[Source: `std/big.xo:71`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L71)

#### BigInt.bit

```xo
fn (x: BigInt) bit(i: Int) -> Int
```

Bit i of x's two's complement (0 or 1); a fault when i \< 0.

[Source: `std/big.xo:73`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L73)

#### BigInt.bit_len

```xo
fn (x: BigInt) bit_len() -> Int
```

The length of |x| in bits; 0 for 0.

[Source: `std/big.xo:75`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L75)

#### BigInt.trailing_zeros

```xo
fn (x: BigInt) trailing_zeros() -> Int
```

The number of zero bits below the lowest one of |x|; 0 for 0.

[Source: `std/big.xo:77`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L77)

#### BigInt.probably_prime

```xo
fn (x: BigInt) probably_prime(n: Int) -> Bool
```

Whether x is probably prime: n Miller-Rabin rounds with Go's
pseudorandom bases plus a Baillie-PSW test (Go's ProbablyPrime); a
fault when n \< 0.

[Source: `std/big.xo:81`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L81)

#### BigInt.text

```xo
fn (x: BigInt) text(base: Int = 10) -> Str
```

x in base 2 to 62: digits, then a to z, then A to Z (Go's Text); a
fault for another base.

[Source: `std/big.xo:84`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L84)

#### BigInt.bytes

```xo
fn (x: BigInt) bytes() -> Bytes
```

|x| big-endian, no leading zeros (Go's Bytes).

[Source: `std/big.xo:86`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L86)

#### BigInt.fill_bytes

```xo
fn (x: BigInt) fill_bytes(len: Int) -> Bytes
```

|x| big-endian in len bytes, zeros first; a fault when it does not fit
(Go's FillBytes).

[Source: `std/big.xo:89`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L89)

#### BigInt.to_int

```xo
fn (x: BigInt) to_int() -> Int?
```

x as an Int, None when it does not fit (Go's IsInt64 and Int64).

[Source: `std/big.xo:91`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L91)

#### BigInt.to_float

```xo
fn (x: BigInt) to_float() -> Float
```

The Float nearest x (Go's Float64; out of range is +Inf or -Inf).

[Source: `std/big.xo:93`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L93)

#### BigInt.display

```xo
fn (x: BigInt) display() -> Str
```

x in base 10.

[Source: `std/big.xo:95`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L95)

#### BigInt.debug

```xo
fn (x: BigInt) debug() -> Str
```

[Source: `std/big.xo:96`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L96)

### BigErr

```xo
struct BigErr {
  msg: Str
}
```

`invalid number "12x" in base 10`, `invalid base 63` (Go's SetString
reports only false).

[Source: `std/big.xo:17`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L17)

#### BigErr.display

```xo
fn (e: BigErr) display() -> Str
```

[Source: `std/big.xo:21`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L21)

## Functions

### from_int

```xo
fn from_int(n: Int) -> BigInt
```

n (Go's NewInt).

[Source: `std/big.xo:24`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L24)

### parse

```xo
fn parse(s: Str, base: Int = 10) -> BigInt ! BigErr
```

The number s in base 2 to 62 (Go's SetString): an optional sign, then
digits; base 0 reads a 0b, 0o, 0, or 0x prefix and `_` between digits.

[Source: `std/big.xo:27`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L27)

### from_bytes

```xo
fn from_bytes(b: Bytes) -> BigInt
```

The unsigned big-endian number b (Go's SetBytes).

[Source: `std/big.xo:29`](https://github.com/xo-lang/xo/blob/main/std/big.xo#L29)
