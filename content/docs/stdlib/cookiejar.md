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
- fn [`has_dot_suffix`](#has_dot_suffix)
- fn [`is_ascii`](#is_ascii)
- fn [`ipv4_chars`](#ipv4_chars)
- fn [`is_ip`](#is_ip)
- fn [`canonical_host`](#canonical_host)
- fn [`jar_key`](#jar_key)
- fn [`default_path`](#default_path)
- fn [`entry_id`](#entry_id)
- fn [`domain_match`](#domain_match)
- fn [`path_match`](#path_match)
- fn [`is_localhost`](#is_localhost)
- fn [`secure_match`](#secure_match)
- fn [`should_send`](#should_send)
- fn [`url_host`](#url_host)
- fn [`sends_before`](#sends_before)
- fn [`domain_and_type`](#domain_and_type)
- fn [`new_entry`](#new_entry)

## Types

### Entry {#Entry}

```xo
pub struct Entry {
  pub name: Str
  pub value: Str
  pub quoted: Bool
  pub domain: Str
  pub path: Str
  pub secure: Bool
  pub persistent: Bool
  pub host_only: Bool
  pub expires: Time
  pub creation: Time
  pub last_access: Time
  pub seq: Int
}
```

One stored cookie (net/http/cookiejar's entry). Internal: use the jar.

[Source: `std/cookiejar.xo:19`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L19)

### JarState {#JarState}

```xo
pub struct JarState {
  pub entries: Map[Str, Map[Str, Entry]]
  pub next_seq: Int
}
```

A jar's state. Internal: use the methods.

[Source: `std/cookiejar.xo:36`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L36)

### Jar {#Jar}

```xo
pub struct Jar {
  pub st: Mutex[JarState]
}
```

A cookie jar. A handle: copies share the cookies, and tasks may use it
at once.

[Source: `std/cookiejar.xo:44`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L44)

#### Jar.set_cookies {#Jar.set_cookies}

```xo
pub fn (j: Jar) set_cookies(url: http.Url, cookies: List[http.Cookie], now: Time)
```

Stores the cookies a server set for url (Jar.SetCookies): none for a
scheme other than http and https, one that has a bad Domain attribute
(not the host or a parent of it, or an IP host with a Domain) is
ignored, a Max-Age below 0 or an Expires not after now deletes. A host
that is not ASCII is ignored (no IDNA yet).

[Source: `std/cookiejar.xo:58`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L58)

#### Jar.cookies {#Jar.cookies}

```xo
pub fn (j: Jar) cookies(url: http.Url, now: Time) -> List[http.Cookie]
```

The cookies to send with a request for url (Jar.Cookies): name, value
and quoted only, the longest path first, then the earliest created.
Expired cookies are dropped.

[Source: `std/cookiejar.xo:108`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L108)

#### Jar.clear {#Jar.clear}

```xo
pub fn (j: Jar) clear()
```

Forgets every cookie.

[Source: `std/cookiejar.xo:170`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L170)

## Functions

### new {#new}

```xo
pub fn new() -> Jar
```

An empty jar (cookiejar.New(nil)).

[Source: `std/cookiejar.xo:49`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L49)

### has_dot_suffix {#has_dot_suffix}

```xo
fn has_dot_suffix(s: Str, suffix: Str) -> Bool
```

hasDotSuffix: s ends in ".suffix".

[Source: `std/cookiejar.xo:177`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L177)

### is_ascii {#is_ascii}

```xo
fn is_ascii(s: Str) -> Bool
```

[Source: `std/cookiejar.xo:181`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L181)

### ipv4_chars {#ipv4_chars}

```xo
fn ipv4_chars(s: Str) -> Bool
```

Whether s has only digits and dots, as an IPv4 address does: a host
name fails here without a parse and its error (Go's ParseIP fails
without one).

[Source: `std/cookiejar.xo:193`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L193)

### is_ip {#is_ip}

```xo
fn is_ip(host: Str) -> Bool
```

isIP: a host with a colon or a percent is an IPv6 address, else an
address that parses.

[Source: `std/cookiejar.xo:204`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L204)

### canonical_host {#canonical_host}

```xo
fn canonical_host(host0: Str, has_port: Bool) -> Str?
```

canonicalHost: the host without a trailing dot, lower case; None for a
host that is not ASCII. Go strips the brackets of an IPv6 host only with
a port (SplitHostPort), so does this when the Url has one.

[Source: `std/cookiejar.xo:220`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L220)

### jar_key {#jar_key}

```xo
fn jar_key(host: Str) -> Str
```

jarKey with no public suffix list: the last two labels, or the host.

[Source: `std/cookiejar.xo:233`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L233)

### default_path {#default_path}

```xo
fn default_path(path: Str) -> Str
```

[Source: `std/cookiejar.xo:245`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L245)

### entry_id {#entry_id}

```xo
fn entry_id(domain: Str, path: Str, name: Str) -> Str
```

[Source: `std/cookiejar.xo:256`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L256)

### domain_match {#domain_match}

```xo
fn domain_match(e: Entry, host: Str) -> Bool
```

[Source: `std/cookiejar.xo:258`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L258)

### path_match {#path_match}

```xo
fn path_match(e: Entry, request_path: Str) -> Bool
```

[Source: `std/cookiejar.xo:265`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L265)

### is_localhost {#is_localhost}

```xo
fn is_localhost(host0: Str) -> Bool
```

isLocalhost: the last label of host is "localhost" (any case).

[Source: `std/cookiejar.xo:281`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L281)

### secure_match {#secure_match}

```xo
fn secure_match(e: Entry, https: Bool) -> Bool
```

secureMatch: a Secure cookie goes to https, and to localhost and loopback
addresses over any scheme (as browsers do).

[Source: `std/cookiejar.xo:292`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L292)

### should_send {#should_send}

```xo
fn should_send(e: Entry, https: Bool, host: Str, path: Str) -> Bool
```

[Source: `std/cookiejar.xo:305`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L305)

### url_host {#url_host}

```xo
fn url_host(u: http.Url) -> Str?
```

The URL's host, port dropped (the Url holds it apart), if the scheme is
http or https.

[Source: `std/cookiejar.xo:311`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L311)

### sends_before {#sends_before}

```xo
fn sends_before(a: Entry, b: Entry) -> Bool
```

Whether a goes before b: the greater path first, then the earlier
creation, then the lower sequence number.

[Source: `std/cookiejar.xo:320`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L320)

### domain_and_type {#domain_and_type}

```xo
fn domain_and_type(host: Str, domain0: Str) -> (Str, Bool)?
```

domainAndType: the cookie's domain and whether it is host only, or None
when the Domain attribute is not allowed.

[Source: `std/cookiejar.xo:332`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L332)

### new_entry {#new_entry}

```xo
fn new_entry(c: http.Cookie, now: Time, def_path: Str, host: Str) -> (Entry, Bool)?
```

newEntry: the entry of a cookie, or (when remove is true) a request to
delete it; None for an illegal Domain.

[Source: `std/cookiejar.xo:364`](https://github.com/xo-lang/xo/blob/main/std/cookiejar.xo#L364)
