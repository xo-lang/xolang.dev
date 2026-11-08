---
title: "std/template"
linkTitle: "template"
description: "Go's text/template over a json.Value: the same actions, pipelines, built in functions, output, an..."
toc: true
module: "std/template"
source: "https://github.com/xo-lang/xo/blob/main/std/template.xo"
generated: "scripts/sync-content.py from `xo doc std/template`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`TemplateErr`](#templateerr)
  - method [`TemplateErr.display`](#templateerrdisplay)
- type [`TemplateFn`](#templatefn)
- type [`Template`](#template)
  - method [`Template.add`](#templateadd)
  - method [`Template.missing_key`](#templatemissing_key)
  - method [`Template.render`](#templaterender)
  - method [`Template.render_named`](#templaterender_named)
- type [`Parsed`](#parsed)
- fn [`parse`](#parse)
- fn [`parse_html`](#parse_html)
- fn [`html`](#html)
- fn [`css`](#css)
- fn [`js`](#js)
- fn [`jsstr`](#jsstr)
- fn [`url`](#url)
- fn [`attr`](#attr)
- fn [`srcset`](#srcset)

## Types

### TemplateErr

```xo
struct TemplateErr {
  msg: Str
}
```

A parse or execution error, with Go's text
(`template: t:1: function "nope" not defined`).

[Source: `std/template.xo:9`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L9)

#### TemplateErr.display

```xo
fn (e: TemplateErr) display() -> Str
```

The message, Go's text (decision 0358).

[Source: `std/template.xo:14`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L14)

### TemplateFn

```xo
type TemplateFn = fn(List[json.Value]) -> json.Value ! Str
```

A template function (FuncMap, decision 0408): its arguments as the
executor's values, its result a value the template prints or passes
on (escaped by the html mode's context); Err text is the call's
error, `error calling NAME: text`. Pure: a function with effects
cannot be called from a render.

[Source: `std/template.xo:21`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L21)

### Template

```xo
struct Template {
  name: Str
  sources: List[(Str, Str)]
  left: Str = "{{"
  right: Str = "}}"
  missing_key_error: Bool = false
  funcs: Map[Str, TemplateFn] = {}
  html: Bool = false
  parsed: Parsed
}
```

A set of named templates (template.Template and its associated
templates): each name's source, in the order added, the action
delimiters, and whether a missing object key is an error
(`missingkey=error`) rather than `<no value>`.

[Source: `std/template.xo:27`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L27)

#### Template.add

```xo
fn (t: Template) add(name: Str, src: Str) -> Template ! TemplateErr
```

Another named template in the set (t.New(name).Parse(src)).

[Source: `std/template.xo:59`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L59)

#### Template.missing_key

```xo
fn (t: Template) missing_key(error: Bool) -> Template
```

The set with Option("missingkey=error") (true) or the default.

[Source: `std/template.xo:61`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L61)

#### Template.render

```xo
fn (t: Template) render(data: json.Value) -> Str ! TemplateErr
```

Execute: the output of the template named t.name with data.

[Source: `std/template.xo:63`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L63)

#### Template.render_named

```xo
fn (t: Template) render_named(name: Str, data: json.Value) -> Str ! TemplateErr
```

ExecuteTemplate: the output of the template name of the set.

[Source: `std/template.xo:65`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L65)

### Parsed

```xo
struct Parsed {}
```

The parsed trees of a Template (opaque).

[Source: `std/template.xo:47`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L47)

## Functions

### parse

```xo
fn parse(name: Str, src: Str, left: Str = "{{", right: Str = "}}", funcs: Map[Str, TemplateFn] = {}) -> Template ! TemplateErr
```

template.New(name).Delims(left, right).Parse(src): the template, or
Go's parse error. `{{define}}` blocks become templates of the set.

[Source: `std/template.xo:51`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L51)

### parse_html

```xo
fn parse_html(name: Str, src: Str, left: Str = "{{", right: Str = "}}", funcs: Map[Str, TemplateFn] = {}) -> Template ! TemplateErr
```

html/template's New(name).Parse(src): `parse` with contextual
autoescaping (decision 0408). The escaping errors (a template that
ends inside a tag, branches ending in different contexts, an action
in an ambiguous URL part, a predefined escaper in a pipeline) are
render's, as Go reports them on Execute.

[Source: `std/template.xo:57`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L57)

### html

```xo
fn html(s: Str) -> json.Value
```

Trusted content for the html mode (decision 0408; Go's template.HTML,
CSS, JS, JSStr, URL, HTMLAttr, Srcset): a json.Value only these make,
passed through unescaped in its own context, escaped as text in any
other, and the plain string to every other reader.

[Source: `std/template.xo:71`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L71)

### css

```xo
fn css(s: Str) -> json.Value
```

[Source: `std/template.xo:72`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L72)

### js

```xo
fn js(s: Str) -> json.Value
```

[Source: `std/template.xo:73`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L73)

### jsstr

```xo
fn jsstr(s: Str) -> json.Value
```

[Source: `std/template.xo:74`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L74)

### url

```xo
fn url(s: Str) -> json.Value
```

[Source: `std/template.xo:75`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L75)

### attr

```xo
fn attr(s: Str) -> json.Value
```

[Source: `std/template.xo:76`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L76)

### srcset

```xo
fn srcset(s: Str) -> json.Value
```

[Source: `std/template.xo:77`](https://github.com/xo-lang/xo/blob/main/std/template.xo#L77)
