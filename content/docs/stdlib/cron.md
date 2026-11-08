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

- type [`CronErr`](#cronerr)
  - method [`CronErr.display`](#cronerrdisplay)
- type [`Schedule`](#schedule)
  - method [`Schedule.next`](#schedulenext)
  - method [`Schedule.zone`](#schedulezone)
- fn [`parse`](#parse)

## Types

### CronErr

```xo
struct CronErr {
  msg: Str
}
```

Why a spec did not parse; `msg` is robfig/cron's text, for example
`expected exactly 5 fields, found 3: [* * *]`.

[Source: `std/cron.xo:9`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L9)

#### CronErr.display

```xo
fn (e: CronErr) display() -> Str
```

[Source: `std/cron.xo:13`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L13)

### Schedule

```xo
struct Schedule {
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

[Source: `std/cron.xo:16`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L16)

#### Schedule.next

```xo
fn (s: Schedule) next(after: Time) -> Time?
```

The first fire time strictly after `after` (robfig's Next, whole
seconds); None when none is found within 5 years. `@every` is
`after` plus the delay, rounded down to the second.

[Source: `std/cron.xo:42`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L42)

#### Schedule.zone

```xo
fn (s: Schedule) zone() -> time.Zone
```

The zone the fields are read in.

[Source: `std/cron.xo:44`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L44)

## Functions

### parse

```xo
fn parse(spec: Str, zone: time.Zone = time.utc()) -> Schedule ! CronErr
```

robfig's ParseStandard: five fields (minute 0-59, hour 0-23, day of month
1-31, month 1-12 or jan-dec, day of week 0-6 or sun-sat), each a comma
list of `*`, `?`, a number or name, a range `a-b` and a step `a-b/n`,
`*/n` or `a/n`; or `@yearly`, `@annually`, `@monthly`, `@weekly`,
`@daily`, `@midnight`, `@hourly`, `@every DURATION`; optionally led by
`TZ=Name ` or `CRON_TZ=Name ` (the zone of the schedule; `zone` is the
default). Day of month and day of week both restricted: either matches;
either starred: both must.

[Source: `std/cron.xo:38`](https://github.com/xo-lang/xo/blob/main/std/cron.xo#L38)
