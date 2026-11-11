---
title: "std/otlp"
linkTitle: "otlp"
description: "see decision 0539): OTLP export of std/trace spans and std/metrics registries, as the opentelemetry-proto 1.x messages (ExportTraceServiceRequest, ExportMetricsServiceRequest) written straight onto std/protobuf's builder, the body of OTLP/HTTP's POST /v1/traces and /v1/metrics (Content-Type application/x-protobuf"
toc: true
module: "std/otlp"
source: "https://github.com/xo-lang/xo/blob/main/std/otlp.xo"
generated: "scripts/sync-content.py from `xo doc std/otlp`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Resource`](#Resource)
- type [`ExportErr`](#ExportErr)
  - method [`ExportErr.display`](#ExportErr.display)
- type [`Exporter`](#Exporter)
  - method [`Exporter.with_headers`](#Exporter.with_headers)
  - method [`Exporter.with_backoff`](#Exporter.with_backoff)
  - method [`Exporter.send_traces`](#Exporter.send_traces)
  - method [`Exporter.send_metrics`](#Exporter.send_metrics)
- fn [`encode_traces`](#encode_traces)
- fn [`encode_metrics`](#encode_metrics)
- fn [`exporter`](#exporter)

## Types

### Resource {#Resource}

```xo
struct Resource {
  service: Str
  attributes: List[(Str, Str)] = []
  scope: Str = "std/trace"
  version: Str = ""
}
```

What an export says about the program that made the spans: the `service.name` resource attribute, more
resource attributes, and the instrumentation scope name (and version) the spans are filed under.

[Source: `std/otlp.xo:12`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L12)

### ExportErr {#ExportErr}

```xo
enum ExportErr {
  Transport(msg: Str)
  Rejected(status: Int, body: Str)
  GaveUp(status: Int, tries: Int)
}
```

Why an export failed: the transport (no response), a status the collector will not take (400 and the like: a
retry would send the same bytes), or retries that ran out with the last answer.

[Source: `std/otlp.xo:35`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L35)

#### ExportErr.display {#ExportErr.display}

```xo
fn (e: ExportErr) display() -> Str
```

`export: MSG`, `export rejected: STATUS BODY`, `export gave up after N tries: STATUS`.

[Source: `std/otlp.xo:42`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L42)

### Exporter {#Exporter}

```xo
struct Exporter {
  client: http.Client
  endpoint: Str
  resource: Resource
  headers: Map[Str, Str]
  backoff: backoff.Backoff
  clock: Clock
  rand: Rand
}
```

Sends OTLP/HTTP requests (`POST {endpoint}/v1/traces` and `/v1/metrics`, `Content-Type: application/x-protobuf`)
to a collector. 429, 502, 503 and 504 are retried with the schedule of `backoff`, waiting at least the
`Retry-After` the collector asks for (in seconds); any other non 2xx status is not retried, as the OTLP
specification says.

[Source: `std/otlp.xo:48`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L48)

#### Exporter.with_headers {#Exporter.with_headers}

```xo
fn (e: Exporter) with_headers(h: Map[Str, Str]) -> Exporter
```

The exporter sending these headers on every request (an API key, `Authorization`).

[Source: `std/otlp.xo:61`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L61)

#### Exporter.with_backoff {#Exporter.with_backoff}

```xo
fn (e: Exporter) with_backoff(b: backoff.Backoff) -> Exporter
```

The exporter retrying on schedule b (5 tries by default).

[Source: `std/otlp.xo:63`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L63)

#### Exporter.send_traces {#Exporter.send_traces}

```xo
fn (e: Exporter) send_traces(spans: List[trace.Span]) -> () ! ExportErr uses net.dial, clock, rand
```

Exports `spans` (one request; an empty list sends nothing).

[Source: `std/otlp.xo:65`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L65)

#### Exporter.send_metrics {#Exporter.send_metrics}

```xo
fn (e: Exporter) send_metrics(reg: metrics.Registry, start_ms: Int) -> () ! ExportErr uses net.dial, clock, rand
```

Exports the registry's metrics (one request), every point cumulative since `start_ms`, stamped now.

[Source: `std/otlp.xo:67`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L67)

## Functions

### encode_traces {#encode_traces}

```xo
fn encode_traces(res: Resource, spans: List[trace.Span]) -> Bytes
```

The body of an ExportTraceServiceRequest for `spans` (one ResourceSpans, one ScopeSpans). A span's
trace id is its request id when that is 32 hex digits, else the first 16 bytes of the SHA-256 of the id;
the `request` span of an id is a server span with the id as its trace, its other spans are internal
spans whose parent is that `request` span; span ids are the first 8 bytes of a SHA-256 of the span's
request id, name and start, so an export repeated after a retry names the same spans. A `request` span's
HTTP status becomes the span status (500 and above is an error) and the attribute `http.response.status_code`.

[Source: `std/otlp.xo:25`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L25)

### encode_metrics {#encode_metrics}

```xo
fn encode_metrics(res: Resource, reg: metrics.Registry, start_ms: Int, now_ms: Int) -> Bytes
```

The body of an ExportMetricsServiceRequest for the families of `reg` (one ResourceMetrics, one ScopeMetrics),
every point cumulative since `start_ms` and stamped `now_ms` (Unix milliseconds): a counter is a monotonic Sum,
a gauge a Gauge, a histogram a Histogram (bucket counts per bucket, not cumulative, as OTLP has them), a summary
a Summary with its count and sum (no quantile values); a label becomes a string attribute of the point.

[Source: `std/otlp.xo:31`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L31)

### exporter {#exporter}

```xo
fn exporter(client: http.Client, endpoint: Str, res: Resource, clock: Clock, rand: Rand) -> Exporter
```

An exporter to the collector at `endpoint` (`http://host:4318`, no path), for the spans and metrics of `res`.

[Source: `std/otlp.xo:59`](https://github.com/xo-lang/xo/blob/main/std/otlp.xo#L59)
