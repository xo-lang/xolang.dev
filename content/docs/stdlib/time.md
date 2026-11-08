---
title: "std/time"
linkTitle: "time"
description: "Instants, durations, and RFC 3339 in UTC are in the prelude (std.md 2.6); this module adds zones,..."
toc: true
module: "std/time"
source: "https://github.com/xo-lang/xo/blob/main/std/time.xo"
generated: "scripts/sync-content.py from `xo doc std/time`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`RFC3339`](#rfc3339)
- const [`RFC1123`](#rfc1123)
- const [`DATE`](#date)
- const [`TIME`](#time)
- const [`RFC3339_LAYOUT`](#rfc3339_layout)
- const [`RFC1123_LAYOUT`](#rfc1123_layout)
- const [`DATE_LAYOUT`](#date_layout)
- const [`TIME_LAYOUT`](#time_layout)
- type [`Zone`](#zone)
  - method [`Zone.display`](#zonedisplay)
  - method [`Zone.name`](#zonename)
  - method [`Zone.offset_at`](#zoneoffset_at)
  - method [`Zone.abbreviation_at`](#zoneabbreviation_at)
- type [`ZoneErr`](#zoneerr)
  - method [`ZoneErr.display`](#zoneerrdisplay)
- type [`Date`](#date)
  - method [`Date.weekday`](#dateweekday)
  - method [`Date.add_days`](#dateadd_days)
  - method [`Date.add_months`](#dateadd_months)
  - method [`Date.days_until`](#datedays_until)
  - method [`Date.display`](#datedisplay)
- type [`ClockTime`](#clocktime)
- type [`Civil`](#civil)
- type [`Weekday`](#weekday)
  - method [`Weekday.number`](#weekdaynumber)
- type [`Ambiguity`](#ambiguity)
- type [`CivilErr`](#civilerr)
  - method [`CivilErr.display`](#civilerrdisplay)
- type [`Ticker`](#ticker)
  - method [`Ticker.wait`](#tickerwait)
  - method [`Ticker.reset`](#tickerreset)
- type [`Layout`](#layout)
  - method [`Layout.display`](#layoutdisplay)
  - method [`Layout.format`](#layoutformat)
  - method [`Layout.parse`](#layoutparse)
- type [`ParseErr`](#parseerr)
  - method [`ParseErr.display`](#parseerrdisplay)
- type [`LayoutErr`](#layouterr)
  - method [`LayoutErr.display`](#layouterrdisplay)
- fn [`utc`](#utc)
- fn [`zone`](#zone)
- fn [`fixed`](#fixed)
- fn [`local`](#local)
- fn [`civil`](#civil)
- fn [`instant`](#instant)
- fn [`date`](#date)
- fn [`weekday_from`](#weekday_from)
- fn [`truncate`](#truncate)
- fn [`round`](#round)
- fn [`ticker`](#ticker)
- fn [`layout`](#layout)
- fn [`format`](#format)
- fn [`parse`](#parse)
- fn [`check_layout`](#check_layout)

## Constants

### RFC3339

```xo
const RFC3339: Str = "{year}-{month}-{day}T{hour}:{minute}:{second}{frac}{offset}"
```

[Source: `std/time.xo:146`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L146)

### RFC1123

```xo
const RFC1123: Str = "{weekday:short}, {day} {month:short} {year} {hour}:{minute}:{second} {zone}"
```

HTTP dates.

[Source: `std/time.xo:148`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L148)

### DATE

```xo
const DATE: Str = "{year}-{month}-{day}"
```

[Source: `std/time.xo:149`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L149)

### TIME

```xo
const TIME: Str = "{hour}:{minute}:{second}"
```

[Source: `std/time.xo:150`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L150)

### RFC3339_LAYOUT

```xo
const RFC3339_LAYOUT: Layout = layout(RFC3339)
```

[Source: `std/time.xo:169`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L169)

### RFC1123_LAYOUT

```xo
const RFC1123_LAYOUT: Layout = layout(RFC1123)
```

[Source: `std/time.xo:170`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L170)

### DATE_LAYOUT

```xo
const DATE_LAYOUT: Layout = layout(DATE)
```

[Source: `std/time.xo:171`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L171)

### TIME_LAYOUT

```xo
const TIME_LAYOUT: Layout = layout(TIME)
```

[Source: `std/time.xo:172`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L172)

## Types

### Zone

```xo
struct Zone {}
```

A time zone: a handle to its rules. Equal when the names (and, for
`fixed`, the offsets) are equal; displays as its name.

[Source: `std/time.xo:13`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L13)

#### Zone.display

```xo
fn (z: Zone) display() -> Str
```

[Source: `std/time.xo:15`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L15)

#### Zone.name

```xo
fn (z: Zone) name() -> Str
```

[Source: `std/time.xo:38`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L38)

#### Zone.offset_at

```xo
fn (z: Zone) offset_at(t: Time) -> Duration
```

The offset from UTC at that instant.

[Source: `std/time.xo:40`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L40)

#### Zone.abbreviation_at

```xo
fn (z: Zone) abbreviation_at(t: Time) -> Str
```

"CET", "CEST".

[Source: `std/time.xo:42`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L42)

### ZoneErr

```xo
enum ZoneErr {
  Unknown(name: Str)
  NoLocal(msg: Str)
}
```

Displays as `unknown time zone "Mars/Olympus"` or
`cannot determine the local time zone: the system zone is not set`.

[Source: `std/time.xo:19`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L19)

#### ZoneErr.display

```xo
fn (e: ZoneErr) display() -> Str
```

[Source: `std/time.xo:26`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L26)

### Date

```xo
struct Date {
  year: Int
  month: Int
  day: Int
} derive Ord, Json
```

A calendar date in the proleptic Gregorian calendar.

[Source: `std/time.xo:45`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L45)

#### Date.weekday

```xo
fn (d: Date) weekday() -> Weekday
```

[Source: `std/time.xo:109`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L109)

#### Date.add_days

```xo
fn (d: Date) add_days(n: Int) -> Date
```

[Source: `std/time.xo:110`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L110)

#### Date.add_months

```xo
fn (d: Date) add_months(n: Int) -> Date
```

Clamps the day: Jan 31 + 1 month is Feb 28 or 29.

[Source: `std/time.xo:112`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L112)

#### Date.days_until

```xo
fn (d: Date) days_until(o: Date) -> Int
```

[Source: `std/time.xo:113`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L113)

#### Date.display

```xo
fn (d: Date) display() -> Str
```

"2026-10-09".

[Source: `std/time.xo:115`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L115)

### ClockTime

```xo
struct ClockTime {
  hour: Int
  minute: Int
  second: Int
  nanos: Int
} derive Ord, Json
```

A wall clock time of day.

[Source: `std/time.xo:52`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L52)

### Civil

```xo
struct Civil {
  date: Date
  time: ClockTime
  offset: Duration
  zone: Str
} derive Json
```

A wall clock reading in a zone: what `civil(t, z)` returns.

[Source: `std/time.xo:60`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L60)

### Weekday

```xo
enum Weekday {
  Monday
  Tuesday
  Wednesday
  Thursday
  Friday
  Saturday
  Sunday
} derive Display, Ord, Json
```

[Source: `std/time.xo:67`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L67)

#### Weekday.number

```xo
fn (w: Weekday) number() -> Int
```

The ISO 8601 number of the day: Monday 1 to Sunday 7 (decision 0414).

[Source: `std/time.xo:118`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L118)

### Ambiguity

```xo
enum Ambiguity {
  Earlier
  Later
  Reject
}
```

What `instant` does with a civil time that falls in a daylight saving
gap (does not exist) or overlap (exists twice). `Earlier` gives the
earlier instant and `Later` the later one, so `Earlier` is never after
`Later`: for a gap, 02:30 on 2026-03-08 in New York is 01:30 EST
(`Earlier`, the clock moved back by the gap) or 03:30 EDT (`Later`);
for an overlap, 01:30 on 2026-11-01 is 01:30 EDT or 01:30 EST.

[Source: `std/time.xo:83`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L83)

### CivilErr

```xo
enum CivilErr {
  Invalid(msg: Str)
  Skipped(at: Str)
  Repeated(at: Str)
}
```

Displays as `invalid civil time: month 13 out of range 1 to 12`,
`2026-03-08T02:30:00 America/New_York does not exist (skipped by a
daylight saving change)`, or `2026-11-01T01:30:00 America/New_York
happens twice (repeated by a daylight saving change)`.

[Source: `std/time.xo:93`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L93)

#### CivilErr.display

```xo
fn (e: CivilErr) display() -> Str
```

[Source: `std/time.xo:103`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L103)

### Ticker

```xo
struct Ticker {
  clock: Clock
  period: Duration
  next_ns: Atomic[Int]
}
```

A clock's ticks every period (Go's time.Ticker without a goroutine):
`wait` sleeps until the next tick and returns its time; ticks that a
slow caller missed are dropped, as Go's channel of one drops them, and
the phase is kept (decision 0414). Copies share the schedule.

[Source: `std/time.xo:134`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L134)

#### Ticker.wait

```xo
fn (t: Ticker) wait() -> Time uses clock
```

[Source: `std/time.xo:142`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L142)

#### Ticker.reset

```xo
fn (t: Ticker) reset(period: Duration) -> Ticker uses clock
```

Restarts the schedule: the next tick one (new) period from now.

[Source: `std/time.xo:144`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L144)

### Layout

```xo
struct Layout {}
```

A layout parsed once. Hot code should use it: `format` and `parse` with a string
layout parse the text on every call (5.4x and 4.7x of Go's wall), while a const Layout
runs at 2.03x and 1.90x (bench/results/std-twin-rows2-2026-11-03.md).
A layout parsed once: `const ISO: Layout = layout("{year}-{month}-{day}")`
parses it on first use (decision 0332), and `format` and `parse` then
skip the layout walk. Displays as the layout text; equal when the texts
are.

[Source: `std/time.xo:159`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L159)

#### Layout.display

```xo
fn (l: Layout) display() -> Str
```

[Source: `std/time.xo:163`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L163)

#### Layout.format

```xo
fn (l: Layout) format(t: Time, z: Zone) -> Str
```

Same text as `time.format(t, z, text)`.

[Source: `std/time.xo:165`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L165)

#### Layout.parse

```xo
fn (l: Layout) parse(s: Str, z: Zone) -> Time ! ParseErr
```

Same result as `time.parse(s, text, z)`.

[Source: `std/time.xo:167`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L167)

### ParseErr

```xo
struct ParseErr {
  input: Str
  layout: Str
  at: Int
  msg: Str
}
```

Displays as `at byte 5 of "2026-1x-09": expected 2 digit month`.

[Source: `std/time.xo:175`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L175)

#### ParseErr.display

```xo
fn (e: ParseErr) display() -> Str
```

[Source: `std/time.xo:182`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L182)

### LayoutErr

```xo
struct LayoutErr {
  layout: Str
  msg: Str
}
```

Displays as `bad layout "{yr}": unknown field {yr}`.

[Source: `std/time.xo:185`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L185)

#### LayoutErr.display

```xo
fn (e: LayoutErr) display() -> Str
```

[Source: `std/time.xo:190`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L190)

## Functions

### utc

```xo
fn utc() -> Zone
```

`utc()` needs no zone data.

[Source: `std/time.xo:29`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L29)

### zone

```xo
fn zone(name: Str) -> Zone ! ZoneErr
```

An IANA name: "Europe/Berlin". Pure: the data is embedded in the program.

[Source: `std/time.xo:31`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L31)

### fixed

```xo
fn fixed(name: Str, offset: Duration) -> Zone
```

A zone with one offset forever ("UTC+2" style names); faults past 24h.

[Source: `std/time.xo:33`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L33)

### local

```xo
fn local(env: Env) -> Zone ! ZoneErr uses env
```

The machine's zone: `TZ`, then the system setting. A fake `Env` without
`TZ` gives `utc()`.

[Source: `std/time.xo:36`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L36)

### civil

```xo
fn civil(t: Time, z: Zone) -> Civil
```

[Source: `std/time.xo:105`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L105)

### instant

```xo
fn instant(date: Date, time: ClockTime, z: Zone, ambiguity: Ambiguity = Ambiguity.Reject) -> Time ! CivilErr
```

[Source: `std/time.xo:106`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L106)

### date

```xo
fn date(year: Int, month: Int, day: Int) -> Date ! CivilErr
```

[Source: `std/time.xo:107`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L107)

### weekday_from

```xo
fn weekday_from(n: Int) -> Weekday?
```

The weekday of an ISO 8601 number (1 Monday to 7 Sunday), None
outside 1 to 7.

[Source: `std/time.xo:121`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L121)

### truncate

```xo
fn truncate(t: Time, d: Duration) -> Time
```

t rounded down to a multiple of d since the zero time (January 1 of
year 1, UTC), Go's Time.Truncate: for a d that divides a day this is
the start of the UTC minute, hour or day. d \<= 0 returns t.

[Source: `std/time.xo:126`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L126)

### round

```xo
fn round(t: Time, d: Duration) -> Time
```

t rounded to the nearest multiple of d (halves up), Go's Time.Round.

[Source: `std/time.xo:128`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L128)

### ticker

```xo
fn ticker(clock: Clock, period: Duration) -> Ticker uses clock
```

A ticker whose first tick is one period from now; faults for a period
of 0 or less (Go's NewTicker panics).

[Source: `std/time.xo:141`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L141)

### layout

```xo
fn layout(text: Str) -> Layout
```

Faults on a bad layout (a constant layout is checked at compile time).

[Source: `std/time.xo:162`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L162)

### format

```xo
fn format(t: Time, z: Zone, layout: Str) -> Str
```

Faults on a bad layout (a constant layout is checked at compile time).
`{frac}` and `{frac:N}` include their leading `.`: write `{second}{frac:7}`, not `{second}.{frac:7}`.

[Source: `std/time.xo:194`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L194)

### parse

```xo
fn parse(s: Str, layout: Str, z: Zone) -> Time ! ParseErr
```

Strict: accepts exactly the layout. `z` applies when the text has no
offset.

[Source: `std/time.xo:197`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L197)

### check_layout

```xo
fn check_layout(layout: Str) -> () ! LayoutErr
```

[Source: `std/time.xo:198`](https://github.com/xo-lang/xo/blob/main/std/time.xo#L198)
