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

- type [`Series`](#Series)
- type [`QSample`](#QSample)
- type [`QStream`](#QStream)
- type [`QState`](#QState)
- type [`Sample`](#Sample)
- type [`Kind`](#Kind)
- type [`Family`](#Family)
- type [`Registry`](#Registry)
  - method [`Registry.counter`](#Registry.counter)
  - method [`Registry.gauge`](#Registry.gauge)
  - method [`Registry.histogram`](#Registry.histogram)
  - method [`Registry.summary`](#Registry.summary)
  - method [`Registry.gauge_func`](#Registry.gauge_func)
  - method [`Registry.counter_func`](#Registry.counter_func)
  - method [`Registry.collector`](#Registry.collector)
  - method [`Registry.text`](#Registry.text)
  - method [`Registry.handler`](#Registry.handler)
  - method [`Registry.handler_at`](#Registry.handler_at)
  - method [`Registry.middleware`](#Registry.middleware)
- type [`Counter`](#Counter)
  - method [`Counter.inc`](#Counter.inc)
  - method [`Counter.add`](#Counter.add)
  - method [`Counter.child`](#Counter.child)
  - method [`Counter.remove`](#Counter.remove)
  - method [`Counter.reset`](#Counter.reset)
- type [`Gauge`](#Gauge)
  - method [`Gauge.set`](#Gauge.set)
  - method [`Gauge.add`](#Gauge.add)
  - method [`Gauge.child`](#Gauge.child)
  - method [`Gauge.remove`](#Gauge.remove)
  - method [`Gauge.reset`](#Gauge.reset)
- type [`Histogram`](#Histogram)
  - method [`Histogram.observe`](#Histogram.observe)
  - method [`Histogram.child`](#Histogram.child)
  - method [`Histogram.remove`](#Histogram.remove)
  - method [`Histogram.reset`](#Histogram.reset)
- type [`Summary`](#Summary)
  - method [`Summary.child`](#Summary.child)
  - method [`Summary.observe`](#Summary.observe)
  - method [`Summary.remove`](#Summary.remove)
  - method [`Summary.reset`](#Summary.reset)
- type [`CounterChild`](#CounterChild)
  - method [`CounterChild.inc`](#CounterChild.inc)
  - method [`CounterChild.add`](#CounterChild.add)
- type [`GaugeChild`](#GaugeChild)
  - method [`GaugeChild.set`](#GaugeChild.set)
  - method [`GaugeChild.add`](#GaugeChild.add)
- type [`HistogramChild`](#HistogramChild)
  - method [`HistogramChild.observe`](#HistogramChild.observe)
- type [`SummaryChild`](#SummaryChild)
  - method [`SummaryChild.observe`](#SummaryChild.observe)
- fn [`registry`](#registry)
- fn [`latency_buckets`](#latency_buckets)

## Types

### Series {#Series}

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

### QSample {#QSample}

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

### QStream {#QStream}

```xo
struct QStream {
  l: List[QSample]
  b: List[Float]
  n: Float
}
```

[Source: `std/metrics.xo:29`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L29)

### QState {#QState}

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

### Sample {#Sample}

```xo
struct Sample {
  values: List[Str]
  value: Float
}
```

A value read at scrape time from a collector: its label values and
value (decision 0411).

[Source: `std/metrics.xo:51`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L51)

### Kind {#Kind}

```xo
enum Kind { Counter, Gauge }
```

The kind of a collector's series.

[Source: `std/metrics.xo:57`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L57)

### Family {#Family}

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

### Registry {#Registry}

```xo
struct Registry {
  families: Mutex[List[Family]]
  dropped: Atomic[Int]
}
```

A set of instruments. Cloning shares it. Its fields are internal.

[Source: `std/metrics.xo:77`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L77)

#### Registry.counter {#Registry.counter}

```xo
fn (r: Registry) counter(name: Str, help: Str, labels: List[Str] = []) -> Counter
```

Makes a counter named `name` (a Prometheus name: letters, digits, `_`
and `:`, not starting with a digit) with the label names `labels`. A
second instrument with the same name, an invalid name or label, or
buckets that do not increase is a fault: they are programmer errors,
found at start.

[Source: `std/metrics.xo:133`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L133)

#### Registry.gauge {#Registry.gauge}

```xo
fn (r: Registry) gauge(name: Str, help: Str, labels: List[Str] = []) -> Gauge
```

[Source: `std/metrics.xo:134`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L134)

#### Registry.histogram {#Registry.histogram}

```xo
fn (r: Registry) histogram(name: Str, help: Str, labels: List[Str] = [], buckets: List[Float] = latency_buckets()) -> Histogram
```

[Source: `std/metrics.xo:135`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L135)

#### Registry.summary {#Registry.summary}

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

#### Registry.gauge_func {#Registry.gauge_func}

```xo
fn (r: Registry) gauge_func(name: Str, help: Str, f: fn() -> Float)
```

A gauge (counter) whose value f returns at each scrape (GaugeFunc,
CounterFunc).

[Source: `std/metrics.xo:175`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L175)

#### Registry.counter_func {#Registry.counter_func}

```xo
fn (r: Registry) counter_func(name: Str, help: Str, f: fn() -> Float)
```

[Source: `std/metrics.xo:176`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L176)

#### Registry.collector {#Registry.collector}

```xo
fn (r: Registry) collector(name: Str, help: Str, kind: Kind, labels: List[Str], f: fn() -> List[Sample])
```

An instrument whose series f returns at each scrape (a Collector):
one Sample per series, its values one per label.

[Source: `std/metrics.xo:179`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L179)

#### Registry.text {#Registry.text}

```xo
fn (r: Registry) text(now: Time? = None) -> Str
```

The text exposition: `# HELP` and `# TYPE` lines and the series,
instruments in the order they were made, series sorted by label
values, histograms as cumulative `_bucket{le=...}`, `_sum` and
`_count`, and `xo_metrics_dropped_total`.

[Source: `std/metrics.xo:197`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L197)

#### Registry.handler {#Registry.handler}

```xo
fn (r: Registry) handler() -> fn(http.Request) -> http.Response
```

A handler answering `text()` as `text/plain; version=0.0.4`:
`router.handle("GET /metrics", reg.handler())`.

[Source: `std/metrics.xo:200`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L200)

#### Registry.handler_at {#Registry.handler_at}

```xo
fn (r: Registry) handler_at(clock: Clock) -> fn(http.Request) -> http.Response uses clock
```

handler, each scrape passing the clock's time to text (summaries age).

[Source: `std/metrics.xo:202`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L202)

#### Registry.middleware {#Registry.middleware}

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

### Counter {#Counter}

```xo
struct Counter {
  f: Family
}
```

A value that only goes up.

[Source: `std/metrics.xo:87`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L87)

#### Counter.inc {#Counter.inc}

```xo
fn (c: Counter) inc(values: List[Str] = [])
```

Adds 1 to (or n >= 0 to) the series of the label `values` (one per
label name, in order; a wrong count is a fault). Safe from any task.
A registry holds at most `max_series` (10,000) series per instrument:
a new series past it is dropped and counted in
`xo_metrics_dropped_total`.

[Source: `std/metrics.xo:142`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L142)

#### Counter.add {#Counter.add}

```xo
fn (c: Counter) add(n: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:143`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L143)

#### Counter.child {#Counter.child}

```xo
fn (c: Counter) child(values: List[Str] = []) -> CounterChild
```

The child of the series of the label `values` (one per label name; a
wrong count is a fault): the series is made if it is new. Past
`max_series` the child counts into a series nothing exposes, and the drop
is counted in `xo_metrics_dropped_total` as `inc` counts it.

[Source: `std/metrics.xo:152`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L152)

#### Counter.remove {#Counter.remove}

```xo
fn (c: Counter) remove(values: List[Str]) -> Bool
```

Removes the series of the label values (DeleteLabelValues): whether
there was one.

[Source: `std/metrics.xo:183`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L183)

#### Counter.reset {#Counter.reset}

```xo
fn (c: Counter) reset()
```

Removes every series (Reset).

[Source: `std/metrics.xo:188`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L188)

### Gauge {#Gauge}

```xo
struct Gauge {
  f: Family
}
```

A value that goes up and down.

[Source: `std/metrics.xo:91`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L91)

#### Gauge.set {#Gauge.set}

```xo
fn (g: Gauge) set(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:144`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L144)

#### Gauge.add {#Gauge.add}

```xo
fn (g: Gauge) add(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:145`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L145)

#### Gauge.child {#Gauge.child}

```xo
fn (g: Gauge) child(values: List[Str] = []) -> GaugeChild
```

[Source: `std/metrics.xo:153`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L153)

#### Gauge.remove {#Gauge.remove}

```xo
fn (g: Gauge) remove(values: List[Str]) -> Bool
```

[Source: `std/metrics.xo:184`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L184)

#### Gauge.reset {#Gauge.reset}

```xo
fn (g: Gauge) reset()
```

[Source: `std/metrics.xo:189`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L189)

### Histogram {#Histogram}

```xo
struct Histogram {
  f: Family
}
```

Observations counted in buckets, with their count and sum.

[Source: `std/metrics.xo:95`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L95)

#### Histogram.observe {#Histogram.observe}

```xo
fn (h: Histogram) observe(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:146`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L146)

#### Histogram.child {#Histogram.child}

```xo
fn (h: Histogram) child(values: List[Str] = []) -> HistogramChild
```

[Source: `std/metrics.xo:154`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L154)

#### Histogram.remove {#Histogram.remove}

```xo
fn (h: Histogram) remove(values: List[Str]) -> Bool
```

[Source: `std/metrics.xo:185`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L185)

#### Histogram.reset {#Histogram.reset}

```xo
fn (h: Histogram) reset()
```

[Source: `std/metrics.xo:190`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L190)

### Summary {#Summary}

```xo
struct Summary {
  f: Family
}
```

Observations summarized as quantiles (within each objective's error),
with their count and sum.

[Source: `std/metrics.xo:100`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L100)

#### Summary.child {#Summary.child}

```xo
fn (s: Summary) child(values: List[Str] = []) -> SummaryChild
```

[Source: `std/metrics.xo:155`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L155)

#### Summary.observe {#Summary.observe}

```xo
fn (s: Summary) observe(v: Float, values: List[Str] = [])
```

[Source: `std/metrics.xo:171`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L171)

#### Summary.remove {#Summary.remove}

```xo
fn (s: Summary) remove(values: List[Str]) -> Bool
```

[Source: `std/metrics.xo:186`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L186)

#### Summary.reset {#Summary.reset}

```xo
fn (s: Summary) reset()
```

[Source: `std/metrics.xo:191`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L191)

### CounterChild {#CounterChild}

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

#### CounterChild.inc {#CounterChild.inc}

```xo
fn (c: CounterChild) inc()
```

Adds 1 to (or n >= 0 to) the child's series.

[Source: `std/metrics.xo:157`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L157)

#### CounterChild.add {#CounterChild.add}

```xo
fn (c: CounterChild) add(n: Float)
```

[Source: `std/metrics.xo:158`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L158)

### GaugeChild {#GaugeChild}

```xo
struct GaugeChild {
  s: Series
}
```

[Source: `std/metrics.xo:113`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L113)

#### GaugeChild.set {#GaugeChild.set}

```xo
fn (g: GaugeChild) set(v: Float)
```

[Source: `std/metrics.xo:159`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L159)

#### GaugeChild.add {#GaugeChild.add}

```xo
fn (g: GaugeChild) add(v: Float)
```

[Source: `std/metrics.xo:160`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L160)

### HistogramChild {#HistogramChild}

```xo
struct HistogramChild {
  s: Series
  bounds: List[Float]
}
```

[Source: `std/metrics.xo:116`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L116)

#### HistogramChild.observe {#HistogramChild.observe}

```xo
fn (h: HistogramChild) observe(v: Float)
```

[Source: `std/metrics.xo:161`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L161)

### SummaryChild {#SummaryChild}

```xo
struct SummaryChild {
  s: Series
  objectives: List[(Float, Float)]
}
```

[Source: `std/metrics.xo:120`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L120)

#### SummaryChild.observe {#SummaryChild.observe}

```xo
fn (s: SummaryChild) observe(v: Float)
```

[Source: `std/metrics.xo:162`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L162)

## Functions

### registry {#registry}

```xo
fn registry() -> Registry
```

A new empty registry. Xo has no program wide state: main makes one and
passes it to what registers or reads instruments.

[Source: `std/metrics.xo:84`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L84)

### latency_buckets {#latency_buckets}

```xo
fn latency_buckets() -> List[Float]
```

The buckets of request latencies in seconds: 0.005 to 10.

[Source: `std/metrics.xo:126`](https://github.com/xo-lang/xo/blob/main/std/metrics.xo#L126)
