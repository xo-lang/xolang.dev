---
title: "std/html"
linkTitle: "html"
description: "Go's html package: the five HTML special characters escaped, and entities (named, including the l..."
toc: true
module: "std/html"
source: "https://github.com/xo-lang/xo/blob/main/std/html.xo"
generated: "scripts/sync-content.py from `xo doc std/html`; edit the doc comments in the Xo repo, not this file"
---
## Index

- fn [`escape_string`](#escape_string)
- fn [`unescape_string`](#unescape_string)

## Functions

### escape_string

```xo
fn escape_string(s: Str) -> Str
```

html.EscapeString: `<`, `>`, `&`, `'` and `"` as `&lt;`, `&gt;`,
`&amp;`, `&#39;` and `&#34;`.

[Source: `std/html.xo:9`](https://github.com/xo-lang/xo/blob/main/std/html.xo#L9)

### unescape_string

```xo
fn unescape_string(s: Str) -> Str
```

html.UnescapeString: every entity reference unescaped (named, the
legacy names without a semicolon such as `&amp` and `&copy`, decimal
`&#916;` and hexadecimal `&#x3bb;` numeric references, the C1 control
code points replaced as browsers do, invalid ones as U+FFFD);
`unescape_string(escape_string(s)) == s` always, the converse not.

[Source: `std/html.xo:15`](https://github.com/xo-lang/xo/blob/main/std/html.xo#L15)
