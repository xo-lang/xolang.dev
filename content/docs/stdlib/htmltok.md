---
title: "std/htmltok"
linkTitle: "htmltok"
description: "golang.org/x/net/html's Tokenizer (token.go, BSD license, Copyright 2010 The Go Authors): the HTM..."
toc: true
module: "std/htmltok"
source: "https://github.com/xo-lang/xo/blob/main/std/htmltok.xo"
generated: "scripts/sync-content.py from `xo doc std/htmltok`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`TokenType`](#TokenType)
- type [`Attribute`](#Attribute)
- type [`Token`](#Token)
- type [`Pend`](#Pend)
- type [`Tokenizer`](#Tokenizer)
  - method [`Tokenizer.next`](#Tokenizer.next)
  - method [`Tokenizer.token`](#Tokenizer.token)
  - method [`Tokenizer.raw`](#Tokenizer.raw)
  - method [`Tokenizer.err`](#Tokenizer.err)
  - method [`Tokenizer.allow_cdata`](#Tokenizer.allow_cdata)
  - method [`Tokenizer.next_is_not_raw_text`](#Tokenizer.next_is_not_raw_text)
  - method [`Tokenizer.set_max_buf`](#Tokenizer.set_max_buf)
  - method [`Tokenizer.buffered`](#Tokenizer.buffered)
- fn [`tokenizer`](#tokenizer)
- fn [`tokenizer_fragment`](#tokenizer_fragment)

## Types

### TokenType {#TokenType}

```xo
enum TokenType {
  Error
  Text
  StartTag
  EndTag
  SelfClosingTag
  Comment
  Doctype
} derive Eq
```

Go's TokenType.

[Source: `std/htmltok.xo:10`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L10)

### Attribute {#Attribute}

```xo
struct Attribute {
  key: Str
  val: Str
} derive Eq
```

Go's Attribute without its namespace (the tokenizer never sets one): the
key lower cased, the value unescaped.

[Source: `std/htmltok.xo:22`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L22)

### Token {#Token}

```xo
struct Token {
  typ: TokenType
  data: Str
  attrs: List[Attribute]
} derive Eq
```

Go's Token: `data` is the lower cased tag name of a tag, the unescaped text
of a text, comment or doctype; `attrs` are a tag's attributes in order,
duplicates (by lower cased key) and empty keys dropped.

[Source: `std/htmltok.xo:30`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L30)

### Pend {#Pend}

```xo
struct Pend {
  k0: Int
  k1: Int
  v0: Int
  v1: Int
}
```

Go's Tokenizer over a text held in memory.
The key and value spans of the attribute being read (internal).

[Source: `std/htmltok.xo:38`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L38)

### Tokenizer {#Tokenizer}

```xo
struct Tokenizer {
  src: Bytes
  tt: TokenType
  errc: Int
  rs: Int
  re: Int
  max_buf: Int
  ds: Int
  de: Int
  pend: Pend
  attr: List[Int]
  raw_tag: Str
  text_raw: Bool
  convert_nul: Bool
  cdata: Bool
}
```

[Source: `std/htmltok.xo:45`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L45)

#### Tokenizer.next {#Tokenizer.next}

```xo
fn (var z: Tokenizer) next() -> TokenType
```

Go's Next: scans the next token and returns its type; Error at the end of
the input (see `err`) or when the buffer limit is exceeded.

[Source: `std/htmltok.xo:73`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L73)

#### Tokenizer.token {#Tokenizer.token}

```xo
fn (var z: Tokenizer) token() -> Token
```

Go's Token: the current token (it consumes the token's data, as Go's does:
call it once per `next`).

[Source: `std/htmltok.xo:76`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L76)

#### Tokenizer.raw {#Tokenizer.raw}

```xo
fn (z: Tokenizer) raw() -> Str
```

Go's Raw: the unmodified text of the current token; the raw texts of the
tokens partition the input up to the Error token.

[Source: `std/htmltok.xo:79`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L79)

#### Tokenizer.err {#Tokenizer.err}

```xo
fn (z: Tokenizer) err() -> Str?
```

Go's Err after an Error token: `EOF` at the end of the input, `max buffer
exceeded` past the limit; None before one.

[Source: `std/htmltok.xo:82`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L82)

#### Tokenizer.allow_cdata {#Tokenizer.allow_cdata}

```xo
fn (var z: Tokenizer) allow_cdata(allow: Bool)
```

Go's AllowCDATA: `<![CDATA[x]]>` is the text `x` instead of a bogus
comment (default false).

[Source: `std/htmltok.xo:85`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L85)

#### Tokenizer.next_is_not_raw_text {#Tokenizer.next_is_not_raw_text}

```xo
fn (var z: Tokenizer) next_is_not_raw_text()
```

Go's NextIsNotRawText: the next token after a raw text start tag is
scanned as ordinary markup.

[Source: `std/htmltok.xo:88`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L88)

#### Tokenizer.set_max_buf {#Tokenizer.set_max_buf}

```xo
fn (var z: Tokenizer) set_max_buf(n: Int)
```

Go's SetMaxBuf: a token longer than n bytes is an Error (0 is no limit).

[Source: `std/htmltok.xo:90`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L90)

#### Tokenizer.buffered {#Tokenizer.buffered}

```xo
fn (z: Tokenizer) buffered() -> Str
```

Go's Buffered: the input not yet tokenized.

[Source: `std/htmltok.xo:92`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L92)

## Functions

### tokenizer {#tokenizer}

```xo
fn tokenizer(text: Str) -> Tokenizer
```

Go's NewTokenizer.

[Source: `std/htmltok.xo:64`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L64)

### tokenizer_fragment {#tokenizer_fragment}

```xo
fn tokenizer_fragment(text: Str, context_tag: Str) -> Tokenizer
```

Go's NewTokenizerFragment: tokenizing the inner HTML of an element with
the tag `context_tag` (`title` and `textarea` start in RCDATA; `style`,
`xmp`, `iframe`, `noembed`, `noframes`, `script`, `noscript`, `plaintext`
in plain text).

[Source: `std/htmltok.xo:69`](https://github.com/xo-lang/xo/blob/main/std/htmltok.xo#L69)
