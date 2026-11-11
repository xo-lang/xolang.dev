---
title: "std/cookiejar"
linkTitle: "cookiejar"
description: "A cookie jar with net/http/cookiejar's rules (RFC 6265 section 5): the cookies a server sets for ..."
toc: true
module: "std/cookiejar"
source: "https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo"
generated: "scripts/sync-content.py from `xo doc std/cookiejar`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Entry`](#Entry)
- type [`JarState`](#JarState)
- type [`Jar`](#Jar)
  - method [`Jar.set_cookies`](#Jar.set_cookies)
  - method [`Jar.cookies`](#Jar.cookies)
  - method [`Jar.clear`](#Jar.clear)
- fn [`new`](#new)

## Types

### Entry {#Entry}

```xo
struct Entry {
  name: Str
  value: Str
  quoted: Bool
  domain: Str
  path: Str
  secure: Bool
  persistent: Bool
  host_only: Bool
  expires: Time
  creation: Time
  last_access: Time
  seq: Int
}
```

One stored cookie (net/http/cookiejar's entry). Internal: use the jar.

[Source: `std/cookiejar.xo:10`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L10)

### JarState {#JarState}

```xo
struct JarState {
  entries: Map[Str, Map[Str, Entry]]
  next_seq: Int
}
```

A jar's state. Internal: use the methods.

[Source: `std/cookiejar.xo:27`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L27)

### Jar {#Jar}

```xo
struct Jar {
  st: Mutex[JarState]
}
```

A cookie jar. A handle: copies share the cookies, and tasks may use it
at once.

[Source: `std/cookiejar.xo:35`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L35)

#### Jar.set_cookies {#Jar.set_cookies}

```xo
fn (j: Jar) set_cookies(url: http.Url, cookies: List[http.Cookie], now: Time)
```

Stores the cookies a server set for url (Jar.SetCookies): none for a
scheme other than http and https, one that has a bad Domain attribute
(not the host or a parent of it, or an IP host with a Domain) is
ignored, a Max-Age below 0 or an Expires not after now deletes. A host
that is not ASCII is ignored (no IDNA yet).

[Source: `std/cookiejar.xo:47`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L47)

#### Jar.cookies {#Jar.cookies}

```xo
fn (j: Jar) cookies(url: http.Url, now: Time) -> List[http.Cookie]
```

The cookies to send with a request for url (Jar.Cookies): name, value
and quoted only, the longest path first, then the earliest created.
Expired cookies are dropped.

[Source: `std/cookiejar.xo:51`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L51)

#### Jar.clear {#Jar.clear}

```xo
fn (j: Jar) clear()
```

Forgets every cookie.

[Source: `std/cookiejar.xo:53`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L53)

## Functions

### new {#new}

```xo
fn new() -> Jar
```

An empty jar (cookiejar.New(nil)).

[Source: `std/cookiejar.xo:40`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L40)
