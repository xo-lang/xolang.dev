---
title: "Standard library reference"
linkTitle: "Std reference"
description: "Every std module with its types, functions, methods, signatures and doc comments, generated from `xo doc`."
weight: 25
generated: "scripts/sync-content.py from `xo doc std`; edit the Xo repo, not this file"
---
One page per `std` module, generated from the doc comments and signatures with `xo doc std/NAME`
(run it in a terminal for the same text). Import a module with `use std/NAME`. The prelude's methods on
`Str`, `List`, `Map` and the other builtin types are in the [standard library specification](../spec/std/);
what each module follows in Go's standard library is in the [coverage table](../std-coverage/).
The same reference, searchable and with each module's source, is at [pkg.xolang.org](https://pkg.xolang.org/).

| Module | What it is |
|---|---|
| [`std/adler32`](adler32/) | Go's hash/adler32: the checksum of zlib (RFC 1950). |
| [`std/amqp`](amqp/) | std/amqp: AMQP 1.0 (ISO/IEC 19464, OASIS), a port of github.com/Azure/go-amqp v1.7.0 (MIT, Copyri... |
| [`std/amqptest`](amqptest/) | Serve it on a listener (the test world's in memory listeners work) and dial it with std/amqp. |
| [`std/archive`](archive/) | gzip compression and tar and zip archives, in memory and pure: read and write the bytes with Fs. |
| [`std/backoff`](backoff/) | Exponential backoff with jitter and a retry loop, cenkalti/backoff v4's ExponentialBackOff and Re... |
| [`std/base32`](base32/) | Go's encoding/base32: the alphabets of RFC 4648. |
| [`std/base64`](base64/) | Go's encoding/base64: the four alphabets of RFC 4648. |
| [`std/bcrypt`](bcrypt/) | golang.org/x/crypto/bcrypt: password hashes in the bcrypt format ($2a$ with a cost, a 22 characte... |
| [`std/big`](big/) | Go's math/big Int as an immutable value: every operation returns a new BigInt, with Go's results ... |
| [`std/binary`](binary/) | Go's encoding/binary byte orders and varints as pure functions on Bytes. |
| [`std/bufio`](bufio/) | A buffered reader over any `Stream` (a Conn, a ServerConn, a TLS connection), after Go's bufio.Re... |
| [`std/cbor`](cbor/) | RFC 8949 CBOR over a Value tree that holds the whole data model: encode with the preferred serial... |
| [`std/charset`](charset/) | Text encodings other than UTF-8: UTF-16 (Excel's "Unicode Text" is UTF-16LE with a byte order mar... |
| [`std/cli`](cli/) | Command line parsing for tools: a command is a value built by functions (flags, positional argume... |
| [`std/compress`](compress/) | Go's compress/gzip, compress/flate, and compress/zlib over whole buffers: the bytes Go's writers ... |
| [`std/cookiejar`](cookiejar/) | A cookie jar with net/http/cookiejar's rules (RFC 6265 section 5): the cookies a server sets for ... |
| [`std/crc32`](crc32/) | Go's hash/crc32: the 32 bit cyclic redundancy check of gzip, zip and PNG (IEEE) and of iSCSI, ext... |
| [`std/crc64`](crc64/) | Go's hash/crc64: the 64 bit cyclic redundancy check (ISO 3309, used by Redis and HDLC; ECMA 182, ... |
| [`std/cron`](cron/) | A crontab schedule and its next fire time, a port of robfig/cron v3's standard parser (parser.go)... |
| [`std/crypto`](crypto/) | Hashing and comparison are pure; anything random takes the `Rand` capability (std.md 3.4), so tes... |
| [`std/csv`](csv/) | Comma separated values as RFC 4180 writes them: quoted fields with `""` for a quote, line breaks ... |
| [`std/debug`](debug/) | A router a server mounts to profile and inspect itself while it runs: CPU and heap profiles, the ... |
| [`std/deque`](deque/) | A double ended queue on a ring buffer: O(1) at both ends (amortized: it doubles when full), as a ... |
| [`std/dns`](dns/) | Go's DNS record lookups (net.LookupMX, LookupTXT, LookupSRV, LookupAddr) over a Net: `uses net.di... |
| [`std/embed`](embed/) | A Dir is the files a constant embeds at build time: `const SITE: embed.Dir = embed("static")`. |
| [`std/fnv`](fnv/) | Go's hash/fnv: the Fowler-Noll-Vo hashes FNV-1 and FNV-1a, 32, 64 and 128 bits. |
| [`std/gif`](gif/) | Go's image/gif over whole buffers: Decode, DecodeAll, DecodeConfig, Encode and EncodeAll, with Go... |
| [`std/go`](go/) | Bindings written by `xo bind` (internal/gobind) import this module for `go.Error`; user code need... |
| [`std/grpc`](grpc/) | std/grpc (decision 0535): gRPC over std/http's HTTP/2. |
| [`std/heap`](heap/) | A binary heap ordered by a comparison the caller gives, after Go's container/heap (heap.go: Init,... |
| [`std/html`](html/) | Go's html package: the five HTML special characters escaped, and entities (named, including the l... |
| [`std/htmlent`](htmlent/) | A declaration file so the Go backend compiles the lookups from std/native/htmlent.xo. |
| [`std/htmlparse`](htmlparse/) | golang.org/x/net/html's tree builder (parse.go, node.go, const.go, foreign.go, doctype.go, render... |
| [`std/htmltok`](htmltok/) | golang.org/x/net/html's Tokenizer (token.go, BSD license, Copyright 2010 The Go Authors): the HTM... |
| [`std/http`](http/) | see spec/std.md 4 |
| [`std/idna`](idna/) | Internationalised domain names as in golang.org/x/net/idna: UTS 46 mapping and validation, RFC 34... |
| [`std/image`](image/) | Go's image and image/color over one Image: the pixel models of std/png and std/jpeg in one enum, ... |
| [`std/jpeg`](jpeg/) | Go's image/jpeg Decode and DecodeConfig over whole buffers: baseline and progressive JPEG, every ... |
| [`std/json`](json/) | Which types implement `Json` is builtin to the checker (std.md 5 table): scalars, Str, Bytes, Dur... |
| [`std/jwt`](jwt/) | JSON Web Tokens in the JWS compact form (RFC 7515, RFC 7519) on std/crypto, with golang-jwt/jwt v... |
| [`std/log`](log/) | Logging performs the `log` effect (core 6.1, decision 0156); `configure` performs `stdio`. |
| [`std/mail`](mail/) | Go's net/mail addresses (RFC 5322 with RFC 2047 encoded words). |
| [`std/metrics`](metrics/) | Counters, gauges and histograms with label values, and their Prometheus text exposition (format v... |
| [`std/mime`](mime/) | Go's mime: media types (RFC 2045, 2231), the extension table (Go's builtin one only, the same on ... |
| [`std/multipart`](multipart/) | Go's mime/multipart in memory: the body is a request's, already capped by the server. |
| [`std/netip`](netip/) | Go's net/netip: IP addresses and prefixes as values. |
| [`std/norm`](norm/) | Unicode normalization of golang.org/x/text/unicode/norm: the four forms of UAX #15 (NFC, NFD, NFK... |
| [`std/otlp`](otlp/) | see decision 0539): OTLP export of std/trace spans and std/metrics registries, as the opentelemetry-proto 1.x messages (ExportTraceServiceRequest, ExportMetricsServiceRequest) written straight onto std/protobuf's builder, the body of OTLP/HTTP's POST /v1/traces and /v1/metrics (Content-Type application/x-protobuf |
| [`std/otp`](otp/) | One time passwords: HOTP (RFC 4226), TOTP (RFC 6238) and the otpauth:// URI an authenticator app ... |
| [`std/path`](path/) | Pure helpers for `/` separated paths, the form every Fs capability uses on every OS (std.md 3.1). |
| [`std/png`](png/) | Go's image/png, Decode, DecodeConfig and Encode, over whole buffers: the image Go decodes to for ... |
| [`std/protobuf`](protobuf/) | std/protobuf (decision 0530): the Protocol Buffers wire format, as Go's google.golang.org/protobu... |
| [`std/protodesc`](protodesc/) | The descriptors of google/protobuf/ descriptor.proto that reflection, ProtoJSON and Any resolve n... |
| [`std/protojson`](protojson/) | Protocol Buffers' canonical JSON mapping as protobuf-go's encoding/protojson: a message is conver... |
| [`std/protoparse`](protoparse/) | std/protoparse (decision 0530): a parser for `.proto` files (proto3), for `xo proto gen`. |
| [`std/protowkt`](protowkt/) | The well known types of protobuf's google/protobuf/*.proto as Xo values with their wire codecs wr... |
| [`std/rate`](rate/) | A token bucket rate limiter, golang.org/x/time/rate's Limiter: limit tokens a second fill a bucke... |
| [`std/regexp`](regexp/) | Regular expressions with RE2 syntax and guarantees (Go's regexp): matching takes time linear in t... |
| [`std/smtp`](smtp/) | Go's net/smtp SendMail as one call: STARTTLS through std/tls, PLAIN and CRAM-MD5, Go's checks and... |
| [`std/sql`](sql/) | see spec/std.md 10 |
| [`std/sqlite`](sqlite/) | A SQLite driver for std/sql's open_driver, over the SQLite library (public domain) linked into th... |
| [`std/tabwriter`](tabwriter/) | Go's text/tabwriter: elastic tabstops, columns of text terminated by tabs aligned over runs of co... |
| [`std/task`](task/) | Semaphore, Once, and Group are opaque handles: copies share the same permits, result, or group. |
| [`std/template`](template/) | Go's text/template over a json.Value: the same actions, pipelines, built in functions, output, an... |
| [`std/term`](term/) | Colors for terminal output that follow the user's settings: NO_COLOR, FORCE_COLOR, TERM=dumb, and... |
| [`std/testing`](testing/) | see spec/std.md 8, core 9.2 |
| [`std/time`](time/) | Instants, durations, and RFC 3339 in UTC are in the prelude (std.md 2.6); this module adds zones,... |
| [`std/timego`](timego/) | Pure. |
| [`std/tls`](tls/) | A TLS client on a connection the program dialed itself (the STARTTLS shape: Postgres's SSLRequest... |
| [`std/toml`](toml/) | TOML 1.0 configuration files decoded into the same types as JSON (`derive Json`, std.md 5): a tab... |
| [`std/trace`](trace/) | Request ids and a bounded ring of spans (what took how long inside a request), with no exporter: ... |
| [`std/udp`](udp/) | Go's net.ListenPacket and net.DialUDP: UDP datagrams over a Net. |
| [`std/url`](url/) | Go's net/url query and path escaping and url.Values. |
| [`std/uuid`](uuid/) | RFC 9562 UUIDs, following github.com/google/uuid: random (v4) and time ordered (v7) ones from the... |
| [`std/websocket`](websocket/) | WebSockets (RFC 6455) with gorilla/websocket's behavior: a handler upgrades its request, a client... |
| [`std/x509`](x509/) | Go's crypto/x509: parsing X.509 certificates (RFC 5280) and verifying chains, as std/tls does for... |
| [`std/xml`](xml/) | Go's encoding/xml: the Decoder's tokens (namespaces resolved, entities and CDATA decoded, Go's er... |
| [`std/xmlcodec`](xmlcodec/) | The helpers the code `derive Xml` generates calls: it builds a struct's element tree from pieces ... |
| [`std/yaml`](yaml/) | YAML decoded into and encoded from structs that derive Yaml, by the types of their fields, with g... |
