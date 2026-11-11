---
title: "std/timego"
linkTitle: "timego"
description: "Go's time layouts (\"2006-01-02T15:04:05Z07:00\") for code ported from Go: Go's own layout scanner,..."
toc: true
module: "std/timego"
source: "https://github.com/xo-lang/xo/blob/main/std/timego.xo"
generated: "scripts/sync-content.py from `xo doc std/timego`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`ANSIC`](#ANSIC)
- const [`UNIX_DATE`](#UNIX_DATE)
- const [`RUBY_DATE`](#RUBY_DATE)
- const [`RFC822`](#RFC822)
- const [`RFC822Z`](#RFC822Z)
- const [`RFC850`](#RFC850)
- const [`RFC1123`](#RFC1123)
- const [`RFC1123Z`](#RFC1123Z)
- const [`RFC3339`](#RFC3339)
- const [`RFC3339_NANO`](#RFC3339_NANO)
- const [`KITCHEN`](#KITCHEN)
- const [`STAMP`](#STAMP)
- const [`STAMP_MILLI`](#STAMP_MILLI)
- const [`STAMP_MICRO`](#STAMP_MICRO)
- const [`STAMP_NANO`](#STAMP_NANO)
- const [`DATE_TIME`](#DATE_TIME)
- const [`DATE_ONLY`](#DATE_ONLY)
- const [`TIME_ONLY`](#TIME_ONLY)
- const [`LIT`](#LIT)
- const [`YEAR2`](#YEAR2)
- const [`YEAR4`](#YEAR4)
- const [`MONTH_LONG`](#MONTH_LONG)
- const [`MONTH_SHORT`](#MONTH_SHORT)
- const [`MONTH_NUM`](#MONTH_NUM)
- const [`MONTH_ZERO`](#MONTH_ZERO)
- const [`WD_LONG`](#WD_LONG)
- const [`WD_SHORT`](#WD_SHORT)
- const [`DAY`](#DAY)
- const [`DAY_UNDER`](#DAY_UNDER)
- const [`DAY_ZERO`](#DAY_ZERO)
- const [`YDAY_UNDER`](#YDAY_UNDER)
- const [`YDAY_ZERO`](#YDAY_ZERO)
- const [`HOUR24`](#HOUR24)
- const [`HOUR12`](#HOUR12)
- const [`HOUR12_ZERO`](#HOUR12_ZERO)
- const [`MIN`](#MIN)
- const [`MIN_ZERO`](#MIN_ZERO)
- const [`SEC`](#SEC)
- const [`SEC_ZERO`](#SEC_ZERO)
- const [`PM_UP`](#PM_UP)
- const [`PM_LO`](#PM_LO)
- const [`TZ_NAME`](#TZ_NAME)
- const [`ISO_BASIC`](#ISO_BASIC)
- const [`ISO_SECS`](#ISO_SECS)
- const [`ISO_SHORT`](#ISO_SHORT)
- const [`ISO_COLON`](#ISO_COLON)
- const [`ISO_COLON_SECS`](#ISO_COLON_SECS)
- const [`NUM_BASIC`](#NUM_BASIC)
- const [`NUM_SECS`](#NUM_SECS)
- const [`NUM_SHORT`](#NUM_SHORT)
- const [`NUM_COLON`](#NUM_COLON)
- const [`NUM_COLON_SECS`](#NUM_COLON_SECS)
- const [`FRAC0`](#FRAC0)
- const [`FRAC9`](#FRAC9)
- type [`Layout`](#Layout)
  - method [`Layout.format`](#Layout.format)
  - method [`Layout.parse`](#Layout.parse)
- fn [`layout`](#layout)
- fn [`format`](#format)
- fn [`parse`](#parse)
- fn [`go_text`](#go_text)
- fn [`month_name`](#month_name)
- fn [`day_name`](#day_name)
- fn [`days_before`](#days_before)
- fn [`at_is`](#at_is)
- fn [`lower_at`](#lower_at)
- fn [`digit_at`](#digit_at)
- fn [`std_at`](#std_at)
- fn [`put_int`](#put_int)
- fn [`is_leap`](#is_leap)
- fn [`days_in`](#days_in)
- fn [`yday_of`](#yday_of)
- fn [`put_zone`](#put_zone)
- fn [`perr`](#perr)
- fn [`perr_go`](#perr_go)
- fn [`elem_text`](#elem_text)
- fn [`go_quote`](#go_quote)
- fn [`lit_fail_pos`](#lit_fail_pos)
- fn [`lower_byte`](#lower_byte)
- fn [`lookup_name`](#lookup_name)
- fn [`getnum`](#getnum)
- fn [`getnum3`](#getnum3)
- fn [`digits_at`](#digits_at)
- fn [`comma_or_period`](#comma_or_period)
- fn [`parse_nanos`](#parse_nanos)
- fn [`parse_signed_offset`](#parse_signed_offset)
- fn [`parse_zone_name`](#parse_zone_name)
- fn [`skip_lit`](#skip_lit)
- fn [`parse_rfc3339`](#parse_rfc3339)
- fn [`unix_time`](#unix_time)

## Constants

### ANSIC {#ANSIC}

```xo
pub const ANSIC: Str = "Mon Jan _2 15:04:05 2006"
```

Go's layout constants (time/format.go).

[Source: `std/timego.xo:12`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L12)

### UNIX_DATE {#UNIX_DATE}

```xo
pub const UNIX_DATE: Str = "Mon Jan _2 15:04:05 MST 2006"
```

[Source: `std/timego.xo:14`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L14)

### RUBY_DATE {#RUBY_DATE}

```xo
pub const RUBY_DATE: Str = "Mon Jan 02 15:04:05 -0700 2006"
```

[Source: `std/timego.xo:16`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L16)

### RFC822 {#RFC822}

```xo
pub const RFC822: Str = "02 Jan 06 15:04 MST"
```

[Source: `std/timego.xo:18`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L18)

### RFC822Z {#RFC822Z}

```xo
pub const RFC822Z: Str = "02 Jan 06 15:04 -0700"
```

[Source: `std/timego.xo:20`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L20)

### RFC850 {#RFC850}

```xo
pub const RFC850: Str = "Monday, 02-Jan-06 15:04:05 MST"
```

[Source: `std/timego.xo:22`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L22)

### RFC1123 {#RFC1123}

```xo
pub const RFC1123: Str = "Mon, 02 Jan 2006 15:04:05 MST"
```

[Source: `std/timego.xo:24`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L24)

### RFC1123Z {#RFC1123Z}

```xo
pub const RFC1123Z: Str = "Mon, 02 Jan 2006 15:04:05 -0700"
```

[Source: `std/timego.xo:26`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L26)

### RFC3339 {#RFC3339}

```xo
pub const RFC3339: Str = "2006-01-02T15:04:05Z07:00"
```

[Source: `std/timego.xo:28`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L28)

### RFC3339_NANO {#RFC3339_NANO}

```xo
pub const RFC3339_NANO: Str = "2006-01-02T15:04:05.999999999Z07:00"
```

[Source: `std/timego.xo:30`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L30)

### KITCHEN {#KITCHEN}

```xo
pub const KITCHEN: Str = "3:04PM"
```

[Source: `std/timego.xo:32`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L32)

### STAMP {#STAMP}

```xo
pub const STAMP: Str = "Jan _2 15:04:05"
```

[Source: `std/timego.xo:34`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L34)

### STAMP_MILLI {#STAMP_MILLI}

```xo
pub const STAMP_MILLI: Str = "Jan _2 15:04:05.000"
```

[Source: `std/timego.xo:36`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L36)

### STAMP_MICRO {#STAMP_MICRO}

```xo
pub const STAMP_MICRO: Str = "Jan _2 15:04:05.000000"
```

[Source: `std/timego.xo:38`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L38)

### STAMP_NANO {#STAMP_NANO}

```xo
pub const STAMP_NANO: Str = "Jan _2 15:04:05.000000000"
```

[Source: `std/timego.xo:40`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L40)

### DATE_TIME {#DATE_TIME}

```xo
pub const DATE_TIME: Str = "2006-01-02 15:04:05"
```

[Source: `std/timego.xo:42`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L42)

### DATE_ONLY {#DATE_ONLY}

```xo
pub const DATE_ONLY: Str = "2006-01-02"
```

[Source: `std/timego.xo:44`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L44)

### TIME_ONLY {#TIME_ONLY}

```xo
pub const TIME_ONLY: Str = "15:04:05"
```

[Source: `std/timego.xo:46`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L46)

### LIT {#LIT}

```xo
const LIT: Int = 0
```

[Source: `std/timego.xo:600`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L600)

### YEAR2 {#YEAR2}

```xo
const YEAR2: Int = 1
```

[Source: `std/timego.xo:602`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L602)

### YEAR4 {#YEAR4}

```xo
const YEAR4: Int = 2
```

[Source: `std/timego.xo:604`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L604)

### MONTH_LONG {#MONTH_LONG}

```xo
const MONTH_LONG: Int = 3
```

[Source: `std/timego.xo:606`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L606)

### MONTH_SHORT {#MONTH_SHORT}

```xo
const MONTH_SHORT: Int = 4
```

[Source: `std/timego.xo:608`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L608)

### MONTH_NUM {#MONTH_NUM}

```xo
const MONTH_NUM: Int = 5
```

[Source: `std/timego.xo:610`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L610)

### MONTH_ZERO {#MONTH_ZERO}

```xo
const MONTH_ZERO: Int = 6
```

[Source: `std/timego.xo:612`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L612)

### WD_LONG {#WD_LONG}

```xo
const WD_LONG: Int = 7
```

[Source: `std/timego.xo:614`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L614)

### WD_SHORT {#WD_SHORT}

```xo
const WD_SHORT: Int = 8
```

[Source: `std/timego.xo:616`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L616)

### DAY {#DAY}

```xo
const DAY: Int = 9
```

[Source: `std/timego.xo:618`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L618)

### DAY_UNDER {#DAY_UNDER}

```xo
const DAY_UNDER: Int = 10
```

[Source: `std/timego.xo:620`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L620)

### DAY_ZERO {#DAY_ZERO}

```xo
const DAY_ZERO: Int = 11
```

[Source: `std/timego.xo:622`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L622)

### YDAY_UNDER {#YDAY_UNDER}

```xo
const YDAY_UNDER: Int = 12
```

[Source: `std/timego.xo:624`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L624)

### YDAY_ZERO {#YDAY_ZERO}

```xo
const YDAY_ZERO: Int = 13
```

[Source: `std/timego.xo:626`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L626)

### HOUR24 {#HOUR24}

```xo
const HOUR24: Int = 14
```

[Source: `std/timego.xo:628`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L628)

### HOUR12 {#HOUR12}

```xo
const HOUR12: Int = 15
```

[Source: `std/timego.xo:630`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L630)

### HOUR12_ZERO {#HOUR12_ZERO}

```xo
const HOUR12_ZERO: Int = 16
```

[Source: `std/timego.xo:632`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L632)

### MIN {#MIN}

```xo
const MIN: Int = 17
```

[Source: `std/timego.xo:634`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L634)

### MIN_ZERO {#MIN_ZERO}

```xo
const MIN_ZERO: Int = 18
```

[Source: `std/timego.xo:636`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L636)

### SEC {#SEC}

```xo
const SEC: Int = 19
```

[Source: `std/timego.xo:638`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L638)

### SEC_ZERO {#SEC_ZERO}

```xo
const SEC_ZERO: Int = 20
```

[Source: `std/timego.xo:640`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L640)

### PM_UP {#PM_UP}

```xo
const PM_UP: Int = 21
```

[Source: `std/timego.xo:642`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L642)

### PM_LO {#PM_LO}

```xo
const PM_LO: Int = 22
```

[Source: `std/timego.xo:644`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L644)

### TZ_NAME {#TZ_NAME}

```xo
const TZ_NAME: Int = 23
```

[Source: `std/timego.xo:646`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L646)

### ISO_BASIC {#ISO_BASIC}

```xo
const ISO_BASIC: Int = 24
```

[Source: `std/timego.xo:648`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L648)

### ISO_SECS {#ISO_SECS}

```xo
const ISO_SECS: Int = 25
```

[Source: `std/timego.xo:650`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L650)

### ISO_SHORT {#ISO_SHORT}

```xo
const ISO_SHORT: Int = 26
```

[Source: `std/timego.xo:652`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L652)

### ISO_COLON {#ISO_COLON}

```xo
const ISO_COLON: Int = 27
```

[Source: `std/timego.xo:654`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L654)

### ISO_COLON_SECS {#ISO_COLON_SECS}

```xo
const ISO_COLON_SECS: Int = 28
```

[Source: `std/timego.xo:656`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L656)

### NUM_BASIC {#NUM_BASIC}

```xo
const NUM_BASIC: Int = 29
```

[Source: `std/timego.xo:658`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L658)

### NUM_SECS {#NUM_SECS}

```xo
const NUM_SECS: Int = 30
```

[Source: `std/timego.xo:660`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L660)

### NUM_SHORT {#NUM_SHORT}

```xo
const NUM_SHORT: Int = 31
```

[Source: `std/timego.xo:662`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L662)

### NUM_COLON {#NUM_COLON}

```xo
const NUM_COLON: Int = 32
```

[Source: `std/timego.xo:664`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L664)

### NUM_COLON_SECS {#NUM_COLON_SECS}

```xo
const NUM_COLON_SECS: Int = 33
```

[Source: `std/timego.xo:666`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L666)

### FRAC0 {#FRAC0}

```xo
const FRAC0: Int = 34
```

[Source: `std/timego.xo:668`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L668)

### FRAC9 {#FRAC9}

```xo
const FRAC9: Int = 35
```

[Source: `std/timego.xo:670`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L670)

## Types

### Layout {#Layout}

```xo
pub struct Layout {
  pub text: Str
  pub kinds: List[Int]
  pub lits: List[Str]
  pub ns: List[Int]
}
```

A Go layout scanned once: its literal text and reference elements. Hot code makes one and calls `format` and
`parse` on it.

[Source: `std/timego.xo:50`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L50)

#### Layout.format {#Layout.format}

```xo
pub fn (l: Layout) format(t: Time, z: time.Zone) -> Str
```

Go's Time.Format for the layout.

[Source: `std/timego.xo:92`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L92)

#### Layout.parse {#Layout.parse}

```xo
pub fn (l: Layout) parse(s: Str, z: time.Zone) -> Time ! time.ParseErr
```

Go's time.ParseInLocation for the layout: `z` is the zone of a text without an offset. A time outside what a
`Time` holds (1677 to 2262) is a `ParseErr`; a civil time in a daylight saving gap or overlap is the earlier one.

[Source: `std/timego.xo:201`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L201)

## Functions

### layout {#layout}

```xo
pub fn layout(go_layout: Str) -> Layout
```

Scans a Go layout (every string is a layout: text that is not a reference element is literal).

[Source: `std/timego.xo:58`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L58)

### format {#format}

```xo
pub fn format(t: Time, z: time.Zone, go_layout: Str) -> Str
```

`layout(go_layout).format(t, z)`.

[Source: `std/timego.xo:579`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L579)

### parse {#parse}

```xo
pub fn parse(s: Str, go_layout: Str, z: time.Zone) -> Time ! time.ParseErr
```

`layout(go_layout).parse(s, z)`.

[Source: `std/timego.xo:584`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L584)

### go_text {#go_text}

```xo
pub fn go_text(e: time.ParseErr) -> Str
```

The text Go's time.Parse gives for the same failure (`parsing time "X" as "LAYOUT": cannot parse "REST" as "ELEM"`,
`parsing time "X": extra text: "REST"`, `parsing time "X": month out of range`) when `e` came from a timego parse; the
display text of `e` for any other failure (a time outside what a Time holds, an error of core time's parser).

[Source: `std/timego.xo:591`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L591)

### month_name {#month_name}

```xo
fn month_name(m: Int, long: Bool) -> Bytes
```

The name tables are functions over Bytes literals: a package level List allocates at each use (gotchas/std-port-costly-go-idioms.md).

[Source: `std/timego.xo:673`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L673)

### day_name {#day_name}

```xo
fn day_name(d: Int, long: Bool) -> Bytes
```

Weekday d, Sunday 0.

[Source: `std/timego.xo:691`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L691)

### days_before {#days_before}

```xo
fn days_before(m: Int) -> Int
```

Days before month m (1 to 13) of a common year.

[Source: `std/timego.xo:704`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L704)

### at_is {#at_is}

```xo
fn at_is(b: Bytes, i: Int, p: Bytes) -> Bool
```

[Source: `std/timego.xo:722`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L722)

### lower_at {#lower_at}

```xo
fn lower_at(b: Bytes, j: Int) -> Bool
```

[Source: `std/timego.xo:736`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L736)

### digit_at {#digit_at}

```xo
fn digit_at(b: Bytes, j: Int) -> Bool
```

[Source: `std/timego.xo:738`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L738)

### std_at {#std_at}

```xo
fn std_at(b: Bytes, i: Int) -> (Int, Int, Int)
```

The reference element at byte i of a layout: (kind, length, digits), kind -1 for none.

[Source: `std/timego.xo:741`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L741)

### put_int {#put_int}

```xo
fn put_int(out: BytesBuilder, n: Int, width: Int, pad: Int) -> BytesBuilder
```

[Source: `std/timego.xo:854`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L854)

### is_leap {#is_leap}

```xo
fn is_leap(y: Int) -> Bool
```

[Source: `std/timego.xo:874`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L874)

### days_in {#days_in}

```xo
fn days_in(m: Int, y: Int) -> Int
```

[Source: `std/timego.xo:876`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L876)

### yday_of {#yday_of}

```xo
fn yday_of(y: Int, m: Int, d: Int) -> Int
```

[Source: `std/timego.xo:880`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L880)

### put_zone {#put_zone}

```xo
fn put_zone(out: BytesBuilder, kind: Int, offset: Int) -> BytesBuilder
```

[Source: `std/timego.xo:884`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L884)

### perr {#perr}

```xo
fn perr(s: Str, go_layout: Str, at: Int, msg: Str) -> time.ParseErr
```

[Source: `std/timego.xo:917`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L917)

### perr_go {#perr_go}

```xo
fn perr_go(s: Str, go_layout: Str, at: Int, msg: Str, kind: Int, elem: Str, rest: Str, go_msg: Str) -> time.ParseErr
```

A parse error that also carries what Go's text needs: kind 1 `cannot parse REST as ELEM`, 2 `extra text: REST`, 3 a message.

[Source: `std/timego.xo:922`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L922)

### elem_text {#elem_text}

```xo
fn elem_text(k: Int, lit: Str, n: Int) -> Str
```

The reference text of a layout element (what Go quotes in `cannot parse "REST" as "ELEM"`).

[Source: `std/timego.xo:927`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L927)

### go_quote {#go_quote}

```xo
fn go_quote(s: Str) -> Str
```

Go's time.quote: `"`, `\` escaped, bytes below a space and non ASCII bytes as \xNN.

[Source: `std/timego.xo:969`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L969)

### lit_fail_pos {#lit_fail_pos}

```xo
fn lit_fail_pos(v: Bytes, p0: Int, lit: Bytes) -> Int
```

The position in v where the literal lit stops matching from p0 (skip_lit's walk).

[Source: `std/timego.xo:993`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L993)

### lower_byte {#lower_byte}

```xo
fn lower_byte(c: Int) -> Int
```

[Source: `std/timego.xo:1018`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1018)

### lookup_name {#lookup_name}

```xo
fn lookup_name(month: Bool, long: Bool, v: Bytes, p: Int) -> Int
```

Go's lookup: the number of the month (1 to 12) or weekday (0 to 6) whose name v begins with at p (case insensitive), -1 for none.

[Source: `std/timego.xo:1021`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1021)

### getnum {#getnum}

```xo
fn getnum(v: Bytes, p: Int, fixed: Bool) -> (Int, Int)
```

Go's getnum: one or two digits (two when fixed): (value, next position), value -1 when bad.

[Source: `std/timego.xo:1046`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1046)

### getnum3 {#getnum3}

```xo
fn getnum3(v: Bytes, p: Int, fixed: Bool) -> (Int, Int)
```

[Source: `std/timego.xo:1059`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1059)

### digits_at {#digits_at}

```xo
fn digits_at(v: Bytes, p: Int, n: Int) -> Int
```

[Source: `std/timego.xo:1072`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1072)

### comma_or_period {#comma_or_period}

```xo
fn comma_or_period(v: Bytes, p: Int) -> Bool
```

[Source: `std/timego.xo:1085`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1085)

### parse_nanos {#parse_nanos}

```xo
fn parse_nanos(v: Bytes, p: Int, nbytes: Int) -> Int
```

Go's parseNanoseconds over nbytes at p (the separator included): nanoseconds, or -1.

[Source: `std/timego.xo:1088`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1088)

### parse_signed_offset {#parse_signed_offset}

```xo
fn parse_signed_offset(v: Bytes, p: Int) -> Int
```

Go's parseSignedOffset (a sign and a hour of at most 23): the length, 0 when none.

[Source: `std/timego.xo:1111`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1111)

### parse_zone_name {#parse_zone_name}

```xo
fn parse_zone_name(v: Bytes, p: Int) -> Int
```

Go's parseTimeZone: the length of a zone name at p, 0 when it is not one.

[Source: `std/timego.xo:1131`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1131)

### skip_lit {#skip_lit}

```xo
fn skip_lit(v: Bytes, p0: Int, lit: Bytes) -> Int
```

Whether the literal prefix of a layout matches at p (Go's skip: a space in the layout matches a run of spaces).
The next position, or -1.

[Source: `std/timego.xo:1165`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1165)

### parse_rfc3339 {#parse_rfc3339}

```xo
fn parse_rfc3339(v: Bytes, z: time.Zone) -> Time?
```

Go's RFC 3339 fast path: the text of the two reference layouts when it is plain, otherwise a failure the general
parser then explains (as in Go, the result is the general parser's).

[Source: `std/timego.xo:1192`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1192)

### unix_time {#unix_time}

```xo
fn unix_time(year: Int, month: Int, day: Int, hour: Int, minute: Int, sec: Int, nsec: Int, off: Int) -> Time
```

The instant of a civil time in UTC (year 1678 to 2261) less the offset, by Hinnant's days from civil.

[Source: `std/timego.xo:1245`](https://github.com/xo-lang/xo/blob/main/std/timego.xo#L1245)
