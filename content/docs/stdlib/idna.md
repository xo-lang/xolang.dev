---
title: "std/idna"
linkTitle: "idna"
description: "Internationalised domain names as in golang.org/x/net/idna: UTS 46 mapping and validation, RFC 34..."
toc: true
module: "std/idna"
source: "https://github.com/xo-lang/xo/blob/main/std/idna.xo"
generated: "scripts/sync-content.py from `xo doc std/idna`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`IdnaErr`](#idnaerr)
  - method [`IdnaErr.display`](#idnaerrdisplay)
- type [`Profile`](#profile)
- fn [`unicode_version`](#unicode_version)
- fn [`to_ascii`](#to_ascii)
- fn [`to_unicode`](#to_unicode)

## Types

### IdnaErr

```xo
struct IdnaErr {
  code: Str
  msg: Str
}
```

Why a name was rejected. `code` is the UTS 46 status code x/net/idna
reports (`P1` a disallowed rune, `V2` and `V3` hyphens, `C` a joiner, `B`
the Bidi rule, `A3` and `P4` punycode, `A4` length, ...) and `msg` its text,
for example `idna: invalid label "-a"`.

[Source: `std/idna.xo:9`](https://github.com/xo-lang/xo/blob/main/std/idna.xo#L9)

#### IdnaErr.display

```xo
fn (e: IdnaErr) display() -> Str
```

[Source: `std/idna.xo:14`](https://github.com/xo-lang/xo/blob/main/std/idna.xo#L14)

### Profile

```xo
enum Profile {
  Lookup
  Registration
  Display
  Punycode
}
```

x/net/idna's profiles.

[Source: `std/idna.xo:17`](https://github.com/xo-lang/xo/blob/main/std/idna.xo#L17)

## Functions

### unicode_version

```xo
fn unicode_version() -> Str
```

The Unicode version of the tables (`15.0.0`).

[Source: `std/idna.xo:32`](https://github.com/xo-lang/xo/blob/main/std/idna.xo#L32)

### to_ascii

```xo
fn to_ascii(domain: Str, p: Profile = Profile.Lookup) -> Str ! IdnaErr
```

The ASCII form of a domain name: each label that is not ASCII becomes
`xn--` and its punycode.

[Source: `std/idna.xo:36`](https://github.com/xo-lang/xo/blob/main/std/idna.xo#L36)

### to_unicode

```xo
fn to_unicode(domain: Str, p: Profile = Profile.Lookup) -> Str ! IdnaErr
```

The Unicode form of a domain name: each `xn--` label decoded.

[Source: `std/idna.xo:38`](https://github.com/xo-lang/xo/blob/main/std/idna.xo#L38)
