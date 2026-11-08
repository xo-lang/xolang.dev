---
title: "std/metrics"
linkTitle: "metrics"
description: "Counters, gauges and histograms with label values, and their Prometheus text exposition (format v..."
toc: true
module: "std/metrics"
source: "https://github.com/xo-lang/xo/blob/main/std/metrics.xo"
generated: "scripts/sync-content.py from `xo doc std/metrics`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Series`](#series)
- type [`QSample`](#qsample)
- type [`QStream`](#qstream)
- type [`QState`](#qstate)
- type [`Sample`](#sample)
- type [`Kind`](#kind)
- type [`Family`](#family)
- type [`Registry`](#registry)
  - method [`Registry.counter`](#registrycounter)
  - method [`Registry.gauge`](#registrygauge)
  - method [`Registry.histogram`](#registryhistogram)
  - method [`Registry.summary`](#registrysummary)
  - method [`Registry.gauge_func`](#registrygauge_func)
  - method [`Registry.counter_func`](#registrycounter_func)
  - method [`Registry.collector`](#registrycollector)
  - method [`Registry.text`](#registrytext)
  - method [`Registry.handler`](#registryhandler)
  - method [`Registry.handler_at`](#registryhandler_at)
  - method [`Registry.middleware`](#registrymiddleware)
- type [`Counter`](#counter)
  - method [`Counter.inc`](#counterinc)
  - method [`Counter.add`](#counteradd)
  - method [`Counter.child`](#counterchild)
  - method [`Counter.remove`](#counterremove)
  - method [`Counter.reset`](#counterreset)
- type [`Gauge`](#gauge)
  - method [`Gauge.set`](#gaugeset)
  - method [`Gauge.add`](#gaugeadd)
  - method [`Gauge.child`](#gaugechild)
  - method [`Gauge.remove`](#gaugeremove)
  - method [`Gauge.reset`](#gaugereset)
- type [`Histogram`](#histogram)
  - method [`Histogram.observe`](#histogramobserve)
  - method [`Histogram.child`](#histogramchild)
  - method [`Histogram.remove`](#histogramremove)
  - method [`Histogram.reset`](#histogramreset)
- type [`Summary`](#summary)
  - method [`Summary.child`](#summarychild)
  - method [`Summary.observe`](#summaryobserve)
  - method [`Summary.remove`](#summaryremove)
  - method [`Summary.reset`](#summaryreset)
- type [`CounterChild`](#counterchild)
  - method [`CounterChild.inc`](#counterchildinc)
  - method [`CounterChild.add`](#counterchildadd)
- type [`GaugeChild`](#gaugechild)
  - method [`GaugeChild.set`](#gaugechildset)
  - method [`GaugeChild.add`](#gaugechildadd)
- type [`HistogramChild`](#histogramchild)
  - method [`HistogramChild.observe`](#histogramchildobserve)
- type [`SummaryChild`](#summarychild)
  - method [`SummaryChild.observe`](#summarychildobserve)
- fn [`registry`](#registry)
- fn [`latency_buckets`](#latency_buckets)

## Types

### Series

```xo
struct Series {
  values: List[Str]
  cells: List[Atomic[Int]]
  q: List[Mutex[QState]]
}
```

One series of an instrument: its label values and its cells (atomic
integers in one list, so reading a series out of the registry shares
one object, not one per field): cell 0 a counter's or gauge's float (its
bits), 1 the observation count, 2 the sum (bits), 3 and on a
histogram's bucket counts, one bucket each. Internal: use the
instruments.

[Source: `std/metrics.xo:14`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L14)

### QSample

```xo
struct QSample {
  v: Float
  w: Float
  d: Float
}
```

A CKMS targeted quantile stream (beorn7/perks, which Prometheus'
client uses): samples (value, width, delta), the unsorted buffer, and
the count. Internal.

[Source: `std/metrics.xo:24`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L24)

### QStream

```xo
struct QStream {
  l: List[QSample]
  b: List[Float]
  n: Float
}
```

[Source: `std/metrics.xo:29`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L29)

### QState

```xo
struct QState {
  streams: List[QStream]
  head: Int
  exp_ms: Int
  hot: List[Atomic[Int]]
  hot_n: Atomic[Int]
}
```

A summary series' age buckets (client_golang's streams): every
observation goes into each; the head one answers; at a scrape with a
time, the head is reset and the next becomes head once its time ran
out. Internal.

[Source: `std/metrics.xo:38`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L38)

### Sample

```xo
struct Sample {
  values: List[Str]
  value: Float
}
```

A value read at scrape time from a collector: its label values and
value (decision 0411).

[Source: `std/metrics.xo:51`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L51)

### Kind

```xo
enum Kind { Counter, Gauge }
```

The kind of a collector's series.

[Source: `std/metrics.xo:57`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L57)

### Family

```xo
struct Family {
  name: Str
  help: Str
  kind: Int
  labels: List[Str]
  bounds: List[Float]
  series: Mutex[Map[Str, Series]]
  dropped: Atomic[Int]
  reads: List[fn() -> List[Sample]]
  objectives: List[(Float, Float)]
  max_age_ms: Int
  age_buckets: Int
}
```

One instrument: kind 0 counter, 1 gauge, 2 histogram, 3 summary;
reads: a scrape time reader (gauge_func, counter_func, collector);
objectives, max_age_ms and age_buckets: a summary's. Internal.

[Source: `std/metrics.xo:62`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L62)

### Registry

```xo
struct Registry {
  families: Mutex[List[Family]]
  dropped: Atomic[Int]
}
```

A set of instruments. Cloning shares it. Its fields are internal.

[Source: `std/metrics.xo:77`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L77)

#### Registry.counter

```xo
fn (r: Registry) counter(name: Str, help: Str, labels: List[Str] = []) -> Counter
```

Makes a counter named `name` (a Prometheus name: letters, digits, `_`
and `:`, not starting with a digit) with the label names `labels`. A
second instrument with the same name, an invalid name or label, or
buckets that do not increase is a fault: they are programmer errors,
found at start.

[Source: `std/metrics.xo:133`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L133)

#### Registry.gauge

```xo
fn (r: Registry) gauge(name: Str, help: Str, labels: List[Str] = []) -> Gauge
```

[Source: `std/metrics.xo:134`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L134)

#### Registry.histogram

```xo
fn (r: Registry) histogram(name: Str, help: Str, labels: List[Str] = [], buckets: List[Float] = latency_buckets()) -> Histogram
```

[Source: `std/metrics.xo:135`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L135)

#### Registry.summary

```xo
fn (r: Registry) summary(name: Str, help: Str, labels: List[Str] = [], objectives: List[(Float, Float)] = [], max_age: Duration = 10m, age_buckets: Int = 5) -> Summary
```

A summary (Prometheus client_golang's Summary, decision 0411): each
objective (quantile, allowed error) is reported as a `quantile` series
(CKMS targeted quantiles, beorn7/perks), with `_sum` and `_count`. The
quantiles cover the last `max_age` in `age_buckets` steps, aged when a
scrape passes the time (`text(now)`, `handler_at(clock)`): a summary
never scraped with a time keeps every observation.

[Source: `std/metrics.xo:170`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L170)

#### Registry.gauge_func

```xo
fn (r: Registry) gauge_func(name: Str, help: Str, f: fn() -> Float)
```

A gauge (counter) whose value f returns at each scrape (GaugeFunc,
CounterFunc).

[Source: `std/metrics.xo:175`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L175)

#### Registry.counter_func

```xo
fn (r: Registry) counter_func(name: Str, help: Str, f: fn() -> Float)
```

[Source: `std/metrics.xo:176`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L176)

#### Registry.collector

```xo
fn (r: Registry) collector(name: Str, help: Str, kind: Kind, labels: List[Str], f: fn() -> List[Sample])
```

An instrument whose series f returns at each scrape (a Collector):
one Sample per series, its values one per label.

[Source: `std/metrics.xo:179`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L179)

#### Registry.text

```xo
fn (r: Registry) text(now: Time? = None) -> Str
```

The text exposition: `# HELP` and `# TYPE` lines and the series,
instruments in the order they were made, series sorted by label
values, histograms as cumulative `_bucket{le=...}`, `_sum` and
`_count`, and `xo_metrics_dropped_total`.

[Source: `std/metrics.xo:197`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L197)

#### Registry.handler

```xo
fn (r: Registry) handler() -> fn(http.Request) -> http.Response
```

A handler answering `text()` as `text/plain; version=0.0.4`:
`router.handle("GET /metrics", reg.handler())`.

[Source: `std/metrics.xo:200`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L200)

#### Registry.handler_at

```xo
fn (r: Registry) handler_at(clock: Clock) -> fn(http.Request) -> http.Response uses clock
```

handler, each scrape passing the clock's time to text (summaries age).

[Source: `std/metrics.xo:202`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L202)

#### Registry.middleware

```xo
fn (r: Registry) middleware(clock: Clock, label: fn(http.Request) -> Str) -> fn(http.Request, http.Next) -> http.Response uses clock
```

A middleware (`router.wrap(reg.middleware(clock, label))`) that counts
every request in `http_requests_total{method,route,status}`, times it
in `http_request_seconds{route}` (the default buckets) and tracks
`http_in_flight`. `label` names the route of a request for the `route`
label: pass a function that returns a bounded set (the matched pattern,
or the path with ids cut), never the raw path of an API with ids.

[Source: `std/metrics.xo:210`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L210)

### Counter

```xo
struct Counter {
  f: Family
}
```

A value that only goes up.

[Source: `std/metrics.xo:87`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L87)

#### Counter.inc

```xo
fn (c: Counter) inc(values: List[Str] = [])
```

Adds 1 to (or n >= 0 to) the series of the label `values` (one per
label name, in order; a wrong count is a fault). Safe from any task.
A registry holds at most `max_series` (10,000) series per instrument:
a new series past it is dropped and counted in
`xo_metrics_dropped_total`.

[Source: `std/metrics.xo:142`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L142)

#### Counter.add

```xo
fn (c: Counter) add(n: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:143`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L143)

#### Counter.child

```xo
fn (c: Counter) child(values: List[Str] = []) -> CounterChild
```

The child of the series of the label `values` (one per label name; a
wrong count is a fault): the series is made if it is new. Past
`max_series` the child counts into a series nothing exposes, and the drop
is counted in `xo_metrics_dropped_total` as `inc` counts it.

[Source: `std/metrics.xo:152`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L152)

#### Counter.remove

```xo
fn (c: Counter) remove(values: List[Str]) -> Bool
```

Removes the series of the label values (DeleteLabelValues): whether
there was one.

[Source: `std/metrics.xo:183`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L183)

#### Counter.reset

```xo
fn (c: Counter) reset()
```

Removes every series (Reset).

[Source: `std/metrics.xo:188`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L188)

### Gauge

```xo
struct Gauge {
  f: Family
}
```

A value that goes up and down.

[Source: `std/metrics.xo:91`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L91)

#### Gauge.set

```xo
fn (g: Gauge) set(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:144`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L144)

#### Gauge.add

```xo
fn (g: Gauge) add(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:145`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L145)

#### Gauge.child

```xo
fn (g: Gauge) child(values: List[Str] = []) -> GaugeChild
```

[Source: `std/metrics.xo:153`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L153)

#### Gauge.remove

```xo
fn (g: Gauge) remove(values: List[Str]) -> Bool
```

[Source: `std/metrics.xo:184`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L184)

#### Gauge.reset

```xo
fn (g: Gauge) reset()
```

[Source: `std/metrics.xo:189`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L189)

### Histogram

```xo
struct Histogram {
  f: Family
}
```

Observations counted in buckets, with their count and sum.

[Source: `std/metrics.xo:95`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L95)

#### Histogram.observe

```xo
fn (h: Histogram) observe(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:146`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L146)

#### Histogram.child

```xo
fn (h: Histogram) child(values: List[Str] = []) -> HistogramChild
```

[Source: `std/metrics.xo:154`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L154)

#### Histogram.remove

```xo
fn (h: Histogram) remove(values: List[Str]) -> Bool
```

[Source: `std/metrics.xo:185`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L185)

#### Histogram.reset

```xo
fn (h: Histogram) reset()
```

[Source: `std/metrics.xo:190`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L190)

### Summary

```xo
struct Summary {
  f: Family
}
```

Observations summarized as quantiles (within each objective's error),
with their count and sum.

[Source: `std/metrics.xo:100`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L100)

#### Summary.child

```xo
fn (s: Summary) child(values: List[Str] = []) -> SummaryChild
```

[Source: `std/metrics.xo:155`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L155)

#### Summary.observe

```xo
fn (s: Summary) observe(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:171`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L171)

#### Summary.remove

```xo
fn (s: Summary) remove(values: List[Str]) -> Bool
```

[Source: `std/metrics.xo:186`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L186)

#### Summary.reset

```xo
fn (s: Summary) reset()
```

[Source: `std/metrics.xo:191`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L191)

### CounterChild

```xo
struct CounterChild {
  s: Series
}
```

A held series (decision 0501, client_golang's WithLabelValues): made
once with `child(values)` and used in a hot loop with no label list,
key or lookup. A child shares the series' cells; cloning one shares them
again; it is safe from any task. `remove` and `reset` detach the series
from the exposition: a child made before keeps counting into the
detached series (take a new one after a remove), as in client_golang.

[Source: `std/metrics.xo:110`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L110)

#### CounterChild.inc

```xo
fn (c: CounterChild) inc()
```

Adds 1 to (or n >= 0 to) the child's series.

[Source: `std/metrics.xo:157`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L157)

#### CounterChild.add

```xo
fn (c: CounterChild) add(n: Float)
```

[Source: `std/metrics.xo:158`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L158)

### GaugeChild

```xo
struct GaugeChild {
  s: Series
}
```

[Source: `std/metrics.xo:113`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L113)

#### GaugeChild.set

```xo
fn (g: GaugeChild) set(v: Float)
```

[Source: `std/metrics.xo:159`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L159)

#### GaugeChild.add

```xo
fn (g: GaugeChild) add(v: Float)
```

[Source: `std/metrics.xo:160`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L160)

### HistogramChild

```xo
struct HistogramChild {
  s: Series
  bounds: List[Float]
}
```

[Source: `std/metrics.xo:116`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L116)

#### HistogramChild.observe

```xo
fn (h: HistogramChild) observe(v: Float)
```

[Source: `std/metrics.xo:161`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L161)

### SummaryChild

```xo
struct SummaryChild {
  s: Series
  objectives: List[(Float, Float)]
}
```

[Source: `std/metrics.xo:120`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L120)

#### SummaryChild.observe

```xo
fn (s: SummaryChild) observe(v: Float)
```

[Source: `std/metrics.xo:162`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L162)

## Functions

### registry

```xo
fn registry() -> Registry
```

A new empty registry. Xo has no program wide state: main makes one and
passes it to what registers or reads instruments.

[Source: `std/metrics.xo:84`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L84)

### latency_buckets

```xo
fn latency_buckets() -> List[Float]
```

The buckets of request latencies in seconds: 0.005 to 10.

[Source: `std/metrics.xo:126`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L126)
