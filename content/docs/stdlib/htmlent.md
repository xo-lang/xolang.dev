---
title: "std/htmlent"
linkTitle: "htmlent"
description: "A declaration file so the Go backend compiles the lookups from std/native/htmlent.xo."
toc: true
module: "std/htmlent"
source: "https://github.com/xo-lang/xo/blob/main/std/htmlent.xo"
generated: "scripts/sync-content.py from `xo doc std/htmlent`; edit the doc comments in the Xo repo, not this file"
---
## Index

- fn [`entity_of`](#entity_of)
- fn [`entity2_of`](#entity2_of)

## Functions

### entity_of {#entity_of}

```xo
fn entity_of(name: Str) -> Str
```

The character of an entity name without `&`, "" for none (`amp;` and the semicolon-less forms of Go's table).

[Source: `std/htmlent.xo:6`](https://github.com/xo-lang/xo/blob/main/std/htmlent.xo#L6)

### entity2_of {#entity2_of}

```xo
fn entity2_of(name: Str) -> Str
```

The two character expansion of an entity name, "" for none.

[Source: `std/htmlent.xo:9`](https://github.com/xo-lang/xo/blob/main/std/htmlent.xo#L9)
