---
title: "std/cron"
linkTitle: "cron"
description: "A crontab schedule and its next fire time, a port of robfig/cron v3's standard parser (parser.go)..."
toc: true
module: "std/cron"
source: "https://github.com/xo-lang/xo/blob/main/std/cron.xo"
generated: "scripts/sync-content.py from `xo doc std/cron`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`MONTHS`](#MONTHS)
- const [`DOWS`](#DOWS)
- const [`NONAMES`](#NONAMES)
- type [`CronErr`](#CronErr)
  - method [`CronErr.display`](#CronErr.display)
- type [`Schedule`](#Schedule)
  - method [`Schedule.next`](#Schedule.next)
  - method [`Schedule.zone`](#Schedule.zone)
  - method [`Schedule.day_matches`](#Schedule.day_matches)
- fn [`parse`](#parse)
- fn [`err_of`](#err_of)
- fn [`bits`](#bits)
- fn [`atoi`](#atoi)
- fn [`lower_names`](#lower_names)
- fn [`int_or_name`](#int_or_name)
- fn [`get_range`](#get_range)
- fn [`get_field`](#get_field)
- fn [`sched`](#sched)
- fn [`descriptor`](#descriptor)
- fn [`civ`](#civ)
- fn [`date_go`](#date_go)

## Constants

### MONTHS {#MONTHS}

```xo
const MONTHS: List[(Str, Int)] = [("jan", 1), ("feb", 2), ("mar", 3), ("apr", 4), ("may", 5), ("jun", 6), ("jul", 7), ("aug", 8), ("sep", 9), ("oct", 10), ("nov", 11), ("dec", 12)]
```

[Source: `std/cron.xo:255`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L255)

### DOWS {#DOWS}

```xo
const DOWS: List[(Str, Int)] = [("sun", 0), ("mon", 1), ("tue", 2), ("wed", 3), ("thu", 4), ("fri", 5), ("sat", 6)]
```

[Source: `std/cron.xo:257`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L257)

### NONAMES {#NONAMES}

```xo
const NONAMES: List[(Str, Int)] = []
```

[Source: `std/cron.xo:259`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L259)

## Types

### CronErr {#CronErr}

```xo
pub struct CronErr {
  pub msg: Str
}
```

Why a spec did not parse; `msg` is robfig/cron's text, for example
`expected exactly 5 fields, found 3: [* * *]`.

[Source: `std/cron.xo:16`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L16)

#### CronErr.display {#CronErr.display}

```xo
pub fn (e: CronErr) display() -> Str
```

[Source: `std/cron.xo:20`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L20)

### Schedule {#Schedule}

```xo
pub struct Schedule {
  _every: Int
  _minute: Int
  _hour: Int
  _dom: Int
  _month: Int
  _dow: Int
  _dom_star: Bool
  _dow_star: Bool
  _loc: time.Zone
}
```

A parsed schedule: a value, never changes.

[Source: `std/cron.xo:23`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L23)

#### Schedule.next {#Schedule.next}

```xo
pub fn (s: Schedule) next(after: Time) -> Time?
```

The first fire time strictly after `after` (robfig's Next, whole
seconds); None when none is found within 5 years. `@every` is
`after` plus the delay, rounded down to the second.

[Source: `std/cron.xo:81`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L81)

#### Schedule.zone {#Schedule.zone}

```xo
pub fn (s: Schedule) zone() -> time.Zone
```

The zone the fields are read in.

[Source: `std/cron.xo:191`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L191)

#### Schedule.day_matches {#Schedule.day_matches}

```xo
fn (s: Schedule) day_matches(c: time.Civil) -> Bool
```

[Source: `std/cron.xo:388`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L388)

## Functions

### parse {#parse}

```xo
pub fn parse(spec: Str, zone: time.Zone = time.utc()) -> Schedule ! CronErr
```

robfig's ParseStandard: five fields (minute 0-59, hour 0-23, day of month
1-31, month 1-12 or jan-dec, day of week 0-6 or sun-sat), each a comma
list of `*`, `?`, a number or name, a range `a-b` and a step `a-b/n`,
`*/n` or `a/n`; or `@yearly`, `@annually`, `@monthly`, `@weekly`,
`@daily`, `@midnight`, `@hourly`, `@every DURATION`; optionally led by
`TZ=Name ` or `CRON_TZ=Name ` (the zone of the schedule; `zone` is the
default). Day of month and day of week both restricted: either matches;
either starred: both must.

[Source: `std/cron.xo:44`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L44)

### err_of {#err_of}

```xo
fn err_of(msg: Str) -> CronErr
```

[Source: `std/cron.xo:193`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L193)

### bits {#bits}

```xo
fn bits(lo: Int, hi: Int, step: Int) -> Int
```

The bits min..max stepping by step (getBits).

[Source: `std/cron.xo:196`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L196)

### atoi {#atoi}

```xo
fn atoi(s: Str) -> Int ! CronErr
```

strconv.Atoi's value or its error text, for mustParseInt.

[Source: `std/cron.xo:207`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L207)

### lower_names {#lower_names}

```xo
fn lower_names(expr: Str, names: List[(Str, Int)]) -> Int?
```

[Source: `std/cron.xo:238`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L238)

### int_or_name {#int_or_name}

```xo
fn int_or_name(expr: Str, names: List[(Str, Int)]) -> Int ! CronErr
```

[Source: `std/cron.xo:248`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L248)

### get_range {#get_range}

```xo
fn get_range(expr: Str, lo: Int, hi: Int, names: List[(Str, Int)]) -> (Int, Bool) ! CronErr
```

getRange: the bits of one expression and whether it started with * or ?
(robfig's starBit).

[Source: `std/cron.xo:263`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L263)

### get_field {#get_field}

```xo
fn get_field(field: Str, lo: Int, hi: Int, names: List[(Str, Int)]) -> (Int, Bool) ! CronErr
```

getField: the comma separated ranges, empty ones dropped (FieldsFunc).

[Source: `std/cron.xo:312`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L312)

### sched {#sched}

```xo
fn sched(minute: Int, hour: Int, dom: Int, month: Int, dow: Int, dom_star: Bool, dow_star: Bool, z: time.Zone) -> Schedule
```

[Source: `std/cron.xo:328`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L328)

### descriptor {#descriptor}

```xo
fn descriptor(d: Str, z: time.Zone) -> Schedule ! CronErr
```

[Source: `std/cron.xo:332`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L332)

### civ {#civ}

```xo
fn civ(t: Int, z: time.Zone) -> time.Civil
```

[Source: `std/cron.xo:362`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L362)

### date_go {#date_go}

```xo
fn date_go(z: time.Zone, y: Int, mo: Int, d: Int, h: Int, mi: Int, sec: Int) -> Int
```

Go's time.Date (time.go): the civil time read as if UTC, then the offset
of the zone at that instant, checked once at the result (a time in a gap
or an overlap thus takes whichever offset Go's lookup meets first).

[Source: `std/cron.xo:367`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L367)
