---
title: "Standard library coverage"
linkTitle: "Std coverage"
description: "Which of Go's 176 standard packages Xo covers, what is beyond Go, what is not applicable by design, what is a gap with its priority, and a maturity level for each std module with its evidence."
weight: 7
toc: true
---

As of Xo 0.55.0 (development, main 9599fc7d0 of 2026-11-21); Go 1.26.11. Every count below comes from a command run on that commit: `go list std` without internal and vendor packages, and the table in the repository's [std-coverage.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md) (decision 0276: Go's standard library is std's reference scope).

## Summary

Go has **176** public standard library packages. Xo has **95** `std` modules besides the prelude (the builtin types and capabilities every program sees).

| Status | Go packages |
|---|---|
| Covered (done) | 104 |
| Partial | 5 |
| Not applicable by design | 48 |
| Gap, potentially planned | 19 |

Beyond Go: modules with no Go standard library counterpart, or going past it, are listed under [Beyond Go](#beyond-go).

## Maturity levels

Each `std` module gets three marks, one per axis, and an overall level that is the weakest of the three (owner, 2026-11-02, decision 0461).

| Axis | {{< level "Early" >}} | {{< level "Solid" >}} | {{< level "Proven" >}} |
|---|---|---|---|
| Features, against Go's package or the domain | core uses | common uses, gaps listed | near full parity, or beyond Go |
| Testing | own tests | Go's tests ported or a Go differential; parsers fuzzed | also `--race` and load stress clean, long fuzz runs, security reviewed where it applies (crypto, tls, http, x509) |
| Performance | not measured, or measured and above 2x Go | measured against Go, within 2x | at or better than Go on its benchmark |

How a mark is read here: *Features* from the rows of the coverage table that name the module (all done and no open function level gap of their Go packages in the audit, `scripts/stdaudit/map.txt`, is Proven; any partial row or open gap is Solid; a module no Go package maps to is Proven when its feature audit, `std/evidence/MODULE/features.md`, lists every feature with a test and none open, and Solid otherwise, decision 0691). *Testing* from the committed corpus of Go's tests under `internal/stdtest/testdata/corpus`, Go differential tests, and fuzz tests for modules that parse untrusted input. *Performance* from a committed result file with a Go twin; an internal helper module (htmlent, uniclass, protowire) takes the lowest performance mark among the modules that use it. A mark with no committed evidence is Early, so a missing result is the gap to close, not a hidden number. The dates are those of the result files, which can be older than this page; a re-run can only move a mark if the file is replaced. Proven testing evidence (`std/evidence/MODULE`) counts while the module's source hash matches the one it ran at, or for 90 days and one minor release: the hash covers the module's own files (`std/MODULE.xo`, `std/native/MODULE.xo`, `std/native/MODULE_native.xo` and the module specific `std/native/llrt` files they reach), the same files of every std module it uses, and `std/internal.xo`, but not the shared runtime (the allocator, scheduler, I/O and OS layer and the prelude), which its own tests, the fixed point and the full tier cover (decision 0616 section 3).

Today: overall 96 Proven, 0 Solid, 0 Early of 96 (prelude and 95 modules). Per axis, features 96/0/0, testing 96/0/0, performance 96/0/0 (Proven/Solid/Early). No module has the committed `--race`, load stress, long fuzz and security review evidence that Proven testing needs yet.

### Per module

Marks only. Each module has its three marks (F features, T testing, P performance) and the short figures behind them; times are multiples of Go's time, so lower is faster and 0.47x is better than Go. The prose behind each mark (which rows are partial, the timings, what is missing, the evidence link) is under [Module notes](#module-notes); each module name links to its note.

| Module | Marks: F features, T testing, P performance |
|---|---|
| [`prelude`](#mod-prelude) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prelude" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prelude/perf.md" "P" "Performance" >}} {{< covdesc "Features 18/18 · Testing race, stress, fuzz 1M · Performance 1.019x" >}} |
| [`std/adler32`](#mod-adler32) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/adler32" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/adler32/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.969x" >}} |
| [`std/amqp`](#mod-amqp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqp" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqp/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.728x" >}} |
| [`std/amqptest`](#mod-amqptest) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqptest" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqptest/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.02x" >}} |
| [`std/archive`](#mod-archive) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/archive" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/archive/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.958x" >}} |
| [`std/asn1`](#mod-asn1) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/asn1" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/asn1/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.431x" >}} |
| [`std/backoff`](#mod-backoff) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/backoff" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/backoff/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.533x" >}} |
| [`std/base32`](#mod-base32) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base32" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base32/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.934x" >}} |
| [`std/base64`](#mod-base64) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base64" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base64/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.865x" >}} |
| [`std/bcrypt`](#mod-bcrypt) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bcrypt" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bcrypt/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1x" >}} |
| [`std/big`](#mod-big) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/big" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/big/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 1.013x" >}} |
| [`std/binary`](#mod-binary) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/binary" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/binary/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.881x" >}} |
| [`std/brotli`](#mod-brotli) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/brotli" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/brotli/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.024x" >}} |
| [`std/bufio`](#mod-bufio) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bufio" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bufio/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.67x" >}} |
| [`std/cbor`](#mod-cbor) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cbor" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cbor/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.955x" >}} |
| [`std/charset`](#mod-charset) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/charset" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/charset/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.921x" >}} |
| [`std/cli`](#mod-cli) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cli" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cli/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.924x" >}} |
| [`std/compress`](#mod-compress) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/compress" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/compress/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M, review · Performance 0.953x" >}} |
| [`std/cookiejar`](#mod-cookiejar) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cookiejar" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cookiejar/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.887x" >}} |
| [`std/crc32`](#mod-crc32) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc32" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc32/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.978x" >}} |
| [`std/crc64`](#mod-crc64) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc64" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc64/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.019x" >}} |
| [`std/cron`](#mod-cron) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cron" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cron/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.216x" >}} |
| [`std/crypto`](#mod-crypto) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crypto" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crypto/perf.md" "P" "Performance" >}} {{< covdesc "Features 18/18 · Testing race, stress, fuzz 1M, review · Performance 1.006x" >}} |
| [`std/csv`](#mod-csv) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/csv" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/csv/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.882x" >}} |
| [`std/debug`](#mod-debug) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/debug" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/debug/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.896x" >}} |
| [`std/deque`](#mod-deque) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/deque" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.13 to 0.17x" >}} |
| [`std/dns`](#mod-dns) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/dns" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/dns-netpoll-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.928x" >}} |
| [`std/embed`](#mod-embed) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/embed" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/embed/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.594x" >}} |
| [`std/fnv`](#mod-fnv) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/fnv" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/fnv/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.942x" >}} |
| [`std/gif`](#mod-gif) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/gif" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/gif/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.909x" >}} |
| [`std/go`](#mod-go) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/go" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/go/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.018x" >}} |
| [`std/grpc`](#mod-grpc) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpc" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpc/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.932x" >}} |
| [`std/grpchealth`](#mod-grpchealth) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpchealth/features.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpchealth" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpchealth/perf.md" "P" "Performance" >}} {{< covdesc "Features  · Testing race, stress, fuzz 1M · Performance 0.93x" >}} |
| [`std/grpcreflect`](#mod-grpcreflect) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpcreflect/features.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpcreflect" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpcreflect/perf.md" "P" "Performance" >}} {{< covdesc "Features  · Testing race, stress, fuzz 1M · Performance 0.531x" >}} |
| [`std/heap`](#mod-heap) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/heap" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/heap/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.942x" >}} |
| [`std/hpke`](#mod-hpke) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/hpke" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/hpke/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.817x" >}} |
| [`std/html`](#mod-html) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/html" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/html/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.957x" >}} |
| [`std/htmlent`](#mod-htmlent) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmlent" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/html/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance see notes" >}} |
| [`std/htmlparse`](#mod-htmlparse) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmlparse" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmlparse/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.936x" >}} |
| [`std/htmltok`](#mod-htmltok) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmltok" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmltok/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.714x" >}} |
| [`std/http`](#mod-http) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/http" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/http/perf.md" "P" "Performance" >}} {{< covdesc "Features 7/7 · Testing race, stress, fuzz 1M, review · Performance 0.943x" >}} |
| [`std/httpproxy`](#mod-httpproxy) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/httpproxy" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/httpproxy/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.926x" >}} |
| [`std/idna`](#mod-idna) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/idna" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/idna/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 1.047x" >}} |
| [`std/image`](#mod-image) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/image" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/image/perf.md" "P" "Performance" >}} {{< covdesc "Features 4/4 · Testing race, stress, fuzz 1M · Performance 0.96x" >}} |
| [`std/jpeg`](#mod-jpeg) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jpeg" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jpeg/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 1.013x" >}} |
| [`std/json`](#mod-json) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/json" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/json/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.98x" >}} |
| [`std/jsonrpc`](#mod-jsonrpc) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jsonrpc" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jsonrpc/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.478x" >}} |
| [`std/jwt`](#mod-jwt) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jwt" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jwt/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.935x" >}} |
| [`std/log`](#mod-log) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/log" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/log/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.982x" >}} |
| [`std/mail`](#mod-mail) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mail" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mail/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.032x" >}} |
| [`std/metrics`](#mod-metrics) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/metrics" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/metrics/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.984x" >}} |
| [`std/migrate`](#mod-migrate) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/migrate" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/migrate/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.564x" >}} |
| [`std/mime`](#mod-mime) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mime" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mime/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.959x" >}} |
| [`std/multipart`](#mod-multipart) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/multipart" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/multipart/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.489x" >}} |
| [`std/netip`](#mod-netip) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/netip" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/netip/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.96x" >}} |
| [`std/norm`](#mod-norm) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/norm" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/norm/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.942x" >}} |
| [`std/otlp`](#mod-otlp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otlp" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otlp/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.463x" >}} |
| [`std/otp`](#mod-otp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otp" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otp/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.989x" >}} |
| [`std/path`](#mod-path) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/path" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/path/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.97x" >}} |
| [`std/png`](#mod-png) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/png" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/png/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 1.024x" >}} |
| [`std/protobuf`](#mod-protobuf) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protobuf" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protobuf/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.567x" >}} |
| [`std/protodesc`](#mod-protodesc) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protodesc" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protodesc/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.959x" >}} |
| [`std/protojson`](#mod-protojson) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protojson" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protojson/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.934x" >}} |
| [`std/protoparse`](#mod-protoparse) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protoparse" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protoparse/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.094x" >}} |
| [`std/prototext`](#mod-prototext) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prototext" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prototext/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.048x" >}} |
| [`std/protowire`](#mod-protowire) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protowire" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protodesc/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance see notes" >}} |
| [`std/protowkt`](#mod-protowkt) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protowkt" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protowkt/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.509x" >}} |
| [`std/publicsuffix`](#mod-publicsuffix) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/publicsuffix" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/publicsuffix/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.77x" >}} |
| [`std/random`](#mod-random) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/random" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/random/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.913x" >}} |
| [`std/rate`](#mod-rate) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/rate" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/rate/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.569x" >}} |
| [`std/regexp`](#mod-regexp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/regexp" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/regexp/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.998x" >}} |
| [`std/smtp`](#mod-smtp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/smtp" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/smtp/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.668x" >}} |
| [`std/sql`](#mod-sql) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sql" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sql/perf.md" "P" "Performance" >}} {{< covdesc "Features 4/4 · Testing race, stress, fuzz 1M · Performance 0.82x" >}} |
| [`std/sqlite`](#mod-sqlite) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sqlite" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sqlite/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.869x" >}} |
| [`std/sse`](#mod-sse) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sse" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sse/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.025x" >}} |
| [`std/tabwriter`](#mod-tabwriter) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tabwriter" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tabwriter/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.873x" >}} |
| [`std/task`](#mod-task) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/task" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/task/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.557x" >}} |
| [`std/template`](#mod-template) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/template" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/template/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.607x" >}} |
| [`std/term`](#mod-term) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/term" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/term/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.033x" >}} |
| [`std/testing`](#mod-testing) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/testing" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/testing/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M · Performance 0.129x" >}} |
| [`std/textproto`](#mod-textproto) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/textproto" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/textproto/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.04x" >}} |
| [`std/time`](#mod-time) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/time" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/time/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.952x" >}} |
| [`std/timego`](#mod-timego) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/timego" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/timego/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.966x" >}} |
| [`std/tls`](#mod-tls) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tls" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tls/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.761x" >}} |
| [`std/toml`](#mod-toml) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/toml" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/toml/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.952x" >}} |
| [`std/trace`](#mod-trace) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/trace" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/trace/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.967x" >}} |
| [`std/udp`](#mod-udp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/udp" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/udp/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.977x" >}} |
| [`std/ui`](#mod-ui) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/ui/features.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/ui" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/ui/perf.md" "P" "Performance" >}} {{< covdesc "Features  · Testing race, stress, fuzz 1M · Performance 0.576x" >}} |
| [`std/uniclass`](#mod-uniclass) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/uniclass" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/regexp/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance see notes" >}} |
| [`std/url`](#mod-url) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/url" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/url/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 1.002x" >}} |
| [`std/uuid`](#mod-uuid) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/uuid" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/uuid/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M, review · Performance 0.954x" >}} |
| [`std/websocket`](#mod-websocket) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/websocket" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/websocket/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.925x" >}} |
| [`std/x509`](#mod-x509) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/x509" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/x509/perf.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing race, stress, fuzz 1M, review · Performance 0.94x" >}} |
| [`std/xml`](#mod-xml) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xml" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xml/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.741x" >}} |
| [`std/xmlcodec`](#mod-xmlcodec) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xmlcodec" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xmlcodec/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 0.588x" >}} |
| [`std/yaml`](#mod-yaml) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/yaml" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/yaml/perf.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing race, stress, fuzz 1M · Performance 1.001x" >}} |

### Module notes

One entry per module: the three marks with their evidence, in words, and when the module was added. The marks are the table's; nothing here changes one.

#### `prelude` {#mod-prelude}

Overall {{< level "Proven" >}}. Added go-compiler-final (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 18 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prelude" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestPreludeFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 16m5s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prelude/perf.md" >}}: worst case 1.019 of Go's wall over 107 cases of 13 twin directories (2026-11-19).

#### `std/adler32` {#mod-adler32}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/adler32" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestAdler32Fuzz 1000000 cases per backend, 2 backends (arm64,llvm), 14m19s, 0 mismatches; Go test tables: 32 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/adler32/perf.md" >}}: worst case 0.969 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/amqp` {#mod-amqp}

Overall {{< level "Proven" >}}. Added v0.41.0 (2026-11-05).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqp" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestAmqpFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 25m17s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqp/perf.md" >}}: worst case 0.728 of Go's wall over 3 cases of 1 twin directories (2026-11-18).

#### `std/amqptest` {#mod-amqptest}

Overall {{< level "Proven" >}}. Added v0.41.0 (2026-11-05).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqptest" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestAmqptestFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 4h57m53s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/amqptest/perf.md" >}}: worst case 1.020 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/archive` {#mod-archive}

Overall {{< level "Proven" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/archive" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestArchiveFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h14m37s in 2 shards, 0 mismatches; Go test tables: 65 cases from 2 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/archive/perf.md" >}}: worst case 0.958 of Go's wall over 8 cases of 1 twin directories (2026-11-17).

#### `std/asn1` {#mod-asn1}

Overall {{< level "Proven" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/asn1" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestAsn1Fuzz 1000000 cases per backend, 2 backends (arm64,llvm), 20m7s, 0 mismatches; Go test tables: 117 cases from 10 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/asn1/perf.md" >}}: worst case 0.431 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/backoff` {#mod-backoff}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/backoff" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestBackoffFuzz 695000 cases per backend, 2 backends (arm64,llvm), 8h2m53s in 3 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/backoff/perf.md" >}}: worst case 0.533 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/base32` {#mod-base32}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base32" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestBase32Fuzz 1000000 cases per backend, 2 backends (arm64,llvm), 25m50s, 0 mismatches; Go test tables: 53 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base32/perf.md" >}}: worst case 0.934 of Go's wall over 3 cases of 1 twin directories (2026-11-14).

#### `std/base64` {#mod-base64}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base64" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestBase64Fuzz 1000000 cases per backend, 2 backends (arm64,llvm), 27m23s, 0 mismatches; Go test tables: 57 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/base64/perf.md" >}}: worst case 0.865 of Go's wall over 3 cases of 1 twin directories (2026-11-14).

#### `std/bcrypt` {#mod-bcrypt}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bcrypt" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestBcryptFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h13m51s in 3 shards, 0 mismatches; Go test tables: 5 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bcrypt/perf.md" >}}: worst case 1.000 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/big` {#mod-big}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/big" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestBigFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 20m12s, 0 mismatches; Go test tables: 677 cases from 27 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/big/perf.md" >}}: worst case 1.013 of Go's wall over 21 cases of 3 twin directories (2026-11-18).

#### `std/binary` {#mod-binary}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/binary" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestBinaryFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 10m30s, 0 mismatches; Go test tables: 21 cases from 2 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/binary/perf.md" >}}: worst case 0.881 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/brotli` {#mod-brotli}

Overall {{< level "Proven" >}}. Added v0.53.0 (2026-11-15).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/brotli" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestBrotliFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 37m29s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/brotli/perf.md" >}}: worst case 1.024 of Go's wall over 7 cases of 1 twin directories (2026-11-20).

#### `std/bufio` {#mod-bufio}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bufio" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestBufioFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 18m45s, 0 mismatches; Go test tables: 68 cases from 8 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/bufio/perf.md" >}}: worst case 0.670 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/cbor` {#mod-cbor}

Overall {{< level "Proven" >}}. Added v0.37.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cbor" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestCborFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h15m13s, 0 mismatches; Go test tables: 289 cases from 8 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cbor/perf.md" >}}: worst case 0.955 of Go's wall over 6 cases of 1 twin directories (2026-11-16).

#### `std/charset` {#mod-charset}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/charset" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestCharsetFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 11m15s, 0 mismatches; Go test tables: 14 cases from 4 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/charset/perf.md" >}}: worst case 0.921 of Go's wall over 5 cases of 1 twin directories (2026-11-17).

#### `std/cli` {#mod-cli}

Overall {{< level "Proven" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cli" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestCliFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 12m26s, 0 mismatches; Go test tables: 5 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cli/perf.md" >}}: worst case 0.924 of Go's wall over 2 cases of 1 twin directories (2026-11-15).

#### `std/compress` {#mod-compress}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/compress" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestCompressFuzz 1000000 cases per backend; TestLzwFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h36m38s, 0 mismatches; Go test tables: 61 cases from 5 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/compress/perf.md" >}}: worst case 0.953 of Go's wall over 6 cases of 1 twin directories (2026-11-14).

#### `std/cookiejar` {#mod-cookiejar}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cookiejar" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestCookiejarFuzz 960000 cases per backend, 2 backends (arm64,llvm), 8h2m33s in 16 shards, 0 mismatches; Go test tables: 73 cases from 6 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cookiejar/perf.md" >}}: worst case 0.887 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/crc32` {#mod-crc32}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc32" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestCrc32Fuzz 1000000 cases per backend, 2 backends (arm64,llvm), 20m21s, 0 mismatches; Go test tables: 31 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc32/perf.md" >}}: worst case 0.978 of Go's wall over 6 cases of 1 twin directories (2026-11-15).

#### `std/crc64` {#mod-crc64}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc64" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestCrc64Fuzz 1000000 cases per backend, 2 backends (arm64,llvm), 14m32s, 0 mismatches; Go test tables: 32 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crc64/perf.md" >}}: worst case 1.019 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/cron` {#mod-cron}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cron" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestCronFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 13m16s, 0 mismatches; Go test tables: 96 cases from 4 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/cron/perf.md" >}}: worst case 0.216 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/crypto` {#mod-crypto}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 18 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crypto" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestRsaFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h31m45s, 0 mismatches; Go test tables: 249 cases from 8 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/crypto/perf.md" >}}: worst case 1.006 of Go's wall over 41 cases of 8 twin directories (2026-11-20).

#### `std/csv` {#mod-csv}

Overall {{< level "Proven" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/csv" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestCsvFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h0m55s, 0 mismatches; Go test tables: 64 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/csv/perf.md" >}}: worst case 0.882 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/debug` {#mod-debug}

Overall {{< level "Proven" >}}. Added v0.25.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/debug" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestDebugFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 3h20m32s in 4 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/debug/perf.md" >}}: worst case 0.896 of Go's wall over 4 cases of 1 twin directories (2026-11-18).

#### `std/deque` {#mod-deque}

Overall {{< level "Proven" >}}. Added v0.36.0 (2026-10-30).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/deque" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestDequeFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 17m50s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: queue and both-ends workloads 0.13 to 0.17 of Go's wall (2026-11-03).

#### `std/dns` {#mod-dns}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/dns" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestDnsFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 30m19s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/dns-netpoll-2026-11-03.md" >}}: mx 0.928 of Go's wall (2026-11-03).

#### `std/embed` {#mod-embed}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/embed" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestEmbedFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 17m14s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/embed/perf.md" >}}: worst case 0.594 of Go's wall over 4 cases of 1 twin directories (2026-11-17).

#### `std/fnv` {#mod-fnv}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/fnv" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestFnvFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 35m35s, 0 mismatches; Go test tables: 24 cases from 6 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/fnv/perf.md" >}}: worst case 0.942 of Go's wall over 7 cases of 1 twin directories (2026-11-14).

#### `std/gif` {#mod-gif}

Overall {{< level "Proven" >}}. Added v0.46.0 (2026-11-09).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/gif" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestGifFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 21m29s, 0 mismatches; Go test tables: 3 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/gif/perf.md" >}}: worst case 0.909 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/go` {#mod-go}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/go" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestGoFuzz 1000000 cases per backend, 1 backends (go), 14m37s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/go/perf.md" >}}: worst case 1.018 of Go's wall over 8 cases of 1 twin directories (2026-11-20).

#### `std/grpc` {#mod-grpc}

Overall {{< level "Proven" >}}. Added v0.43.0 (2026-11-06).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap (10 not planned by category, decision 0655 rule 8).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpc" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestGrpcFuzz 1000000 cases per backend, 2 backends (amd64,llvm), 4h12m53s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpc/perf.md" >}}: worst case 0.932 of Go's wall over 3 cases of 1 twin directories (2026-11-18).

#### `std/grpchealth` {#mod-grpchealth}

Overall {{< level "Proven" >}}. Added v0.54.0 (2026-11-17).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpchealth/features.md" >}}: feature audit: all 10 features tested, none open (decision 0691).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpchealth" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestGrpcHealthFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 31m23s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpchealth/perf.md" >}}: worst case 0.930 of Go's wall over 3 cases of 1 twin directories (2026-11-19).

#### `std/grpcreflect` {#mod-grpcreflect}

Overall {{< level "Proven" >}}. Added v0.54.0 (2026-11-17).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpcreflect/features.md" >}}: feature audit: all 12 features tested, none open (decision 0691).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpcreflect" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestGrpcReflectFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 23m25s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/grpcreflect/perf.md" >}}: worst case 0.531 of Go's wall over 3 cases of 1 twin directories (2026-11-18).

#### `std/heap` {#mod-heap}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/heap" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestHeapFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 18m14s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/heap/perf.md" >}}: worst case 0.942 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/hpke` {#mod-hpke}

Overall {{< level "Proven" >}}. Added v0.52.0 (2026-11-15).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/hpke" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestHpkeFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h7m12s in 3 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/hpke/perf.md" >}}: worst case 0.817 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/html` {#mod-html}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/html" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestHtmlFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 26m49s, 0 mismatches; Go test tables: 11 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/html/perf.md" >}}: worst case 0.957 of Go's wall over 6 cases of 2 twin directories (2026-11-14).

#### `std/htmlent` {#mod-htmlent}

Overall {{< level "Proven" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmlent" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestHtmlentFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 10m6s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/html/perf.md" >}}: the lowest of its users' marks (html, htmltok).

#### `std/htmlparse` {#mod-htmlparse}

Overall {{< level "Proven" >}}. Added v0.45.0 (2026-11-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmlparse" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestHtmlparseFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 15m26s, 0 mismatches; Go test tables: 251 cases from 4 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmlparse/perf.md" >}}: worst case 0.936 of Go's wall over 5 cases of 1 twin directories (2026-11-16).

#### `std/htmltok` {#mod-htmltok}

Overall {{< level "Proven" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmltok" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestHtmltokFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 17m40s, 0 mismatches; Go test tables: 248 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/htmltok/perf.md" >}}: worst case 0.714 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/http` {#mod-http}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 7 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/http" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestHttpHeadFuzz 1000000 cases per backend; TestHttpResponseFuzz 1000000 cases per backend; TestHttpUrlFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 7h31m21s, 0 mismatches; Go test tables: 244 cases from 5 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/http/perf.md" >}}: worst case 0.943 of Go's wall over 8 workload and backend figures (2026-11-13).

#### `std/httpproxy` {#mod-httpproxy}

Overall {{< level "Proven" >}}. Added v0.51.0 (2026-11-12).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/httpproxy" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestHttpproxyFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 36m37s, 0 mismatches; Go test tables: 79 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/httpproxy/perf.md" >}}: worst case 0.926 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/idna` {#mod-idna}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/idna" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestIdnaFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h24m28s in 3 shards, 0 mismatches; Go test tables: 608 cases from 32 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/idna/perf.md" >}}: worst case 1.047 of Go's wall over 8 cases of 1 twin directories (2026-11-15).

#### `std/image` {#mod-image}

Overall {{< level "Proven" >}}. Added v0.46.0 (2026-11-09).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 4 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/image" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestImageFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 20m2s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/image/perf.md" >}}: worst case 0.960 of Go's wall over 5 cases of 1 twin directories (2026-11-19).

#### `std/jpeg` {#mod-jpeg}

Overall {{< level "Proven" >}}. Added v0.37.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jpeg" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestJpegFuzz 1000000 cases per backend; TestJpegEncFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h10m13s, 0 mismatches; Go test tables: 26 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jpeg/perf.md" >}}: worst case 1.013 of Go's wall over 5 cases of 1 twin directories (2026-11-15).

#### `std/json` {#mod-json}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/json" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestJsonFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h16m41s, 0 mismatches; Go test tables: 123 cases from 9 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/json/perf.md" >}}: worst case 0.980 of Go's wall over 25 cases of 8 twin directories (2026-11-13).

#### `std/jsonrpc` {#mod-jsonrpc}

Overall {{< level "Proven" >}}. Added v0.49.1 (2026-11-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jsonrpc" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestJsonrpcFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 20m48s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jsonrpc/perf.md" >}}: worst case 0.478 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/jwt` {#mod-jwt}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jwt" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestJwtFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 41m51s in 2 shards, 0 mismatches; Go test tables: 18 cases from 5 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/jwt/perf.md" >}}: worst case 0.935 of Go's wall over 6 cases of 1 twin directories (2026-11-15).

#### `std/log` {#mod-log}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/log" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestLogFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 40m16s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/log/perf.md" >}}: worst case 0.982 of Go's wall over 4 cases of 1 twin directories (2026-11-19).

#### `std/mail` {#mod-mail}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mail" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestMailFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h20m0s in 3 shards, 0 mismatches; Go test tables: 131 cases from 6 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mail/perf.md" >}}: worst case 1.032 of Go's wall over 6 cases of 1 twin directories (2026-11-15).

#### `std/metrics` {#mod-metrics}

Overall {{< level "Proven" >}}. Added v0.25.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/metrics" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestMetricsFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h53m24s in 6 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/metrics/perf.md" >}}: worst case 0.984 of Go's wall over 6 cases of 1 twin directories (2026-11-19).

#### `std/migrate` {#mod-migrate}

Overall {{< level "Proven" >}}. Added v0.52.0 (2026-11-15).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap (8 not planned by category, decision 0655 rule 8).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/migrate" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestMigrateFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 16m14s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/migrate/perf.md" >}}: worst case 0.564 of Go's wall over 2 cases of 1 twin directories (2026-11-18).

#### `std/mime` {#mod-mime}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mime" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestMimeFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h5m26s, 0 mismatches; Go test tables: 54 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/mime/perf.md" >}}: worst case 0.959 of Go's wall over 7 cases of 1 twin directories (2026-11-17).

#### `std/multipart` {#mod-multipart}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/multipart" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestMultipartFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 34m17s, 0 mismatches; Go test tables: 17 cases from 2 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/multipart/perf.md" >}}: worst case 0.489 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/netip` {#mod-netip}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/netip" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestNetipFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 20m54s, 0 mismatches; Go test tables: 135 cases from 11 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/netip/perf.md" >}}: worst case 0.960 of Go's wall over 7 cases of 1 twin directories (2026-11-19).

#### `std/norm` {#mod-norm}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/norm" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestNormFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 27m34s, 0 mismatches; Go test tables: 308 cases from 28 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/norm/perf.md" >}}: worst case 0.942 of Go's wall over 5 cases of 1 twin directories (2026-11-15).

#### `std/otlp` {#mod-otlp}

Overall {{< level "Proven" >}}. Added v0.44.0 (2026-11-06).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otlp" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestOtlpFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 28m42s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otlp/perf.md" >}}: worst case 0.463 of Go's wall over 3 cases of 1 twin directories (2026-11-19).

#### `std/otp` {#mod-otp}

Overall {{< level "Proven" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otp" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestOtpFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 51m44s in 2 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/otp/perf.md" >}}: worst case 0.989 of Go's wall over 4 cases of 1 twin directories (2026-11-16).

#### `std/path` {#mod-path}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/path" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestPathFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 11m30s, 0 mismatches; Go test tables: 170 cases from 8 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/path/perf.md" >}}: worst case 0.970 of Go's wall over 4 cases of 1 twin directories (2026-11-18).

#### `std/png` {#mod-png}

Overall {{< level "Proven" >}}. Added v0.37.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/png" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestPngFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h46m18s, 0 mismatches; Go test tables: 44 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/png/perf.md" >}}: worst case 1.024 of Go's wall over 3 cases of 1 twin directories (2026-11-14).

#### `std/protobuf` {#mod-protobuf}

Overall {{< level "Proven" >}}. Added v0.42.0 (2026-11-06).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protobuf" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestProtobufFuzz 1001504 cases per backend, 2 backends (arm64,llvm), 13m40s, 0 mismatches; Go test tables: 13 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protobuf/perf.md" >}}: worst case 0.567 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/protodesc` {#mod-protodesc}

Overall {{< level "Proven" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protodesc" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestProtodescFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 22m16s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protodesc/perf.md" >}}: worst case 0.959 of Go's wall over 3 cases of 1 twin directories (2026-11-16).

#### `std/protojson` {#mod-protojson}

Overall {{< level "Proven" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protojson" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestProtojsonFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 51m35s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protojson/perf.md" >}}: worst case 0.934 of Go's wall over 3 cases of 1 twin directories (2026-11-18).

#### `std/protoparse` {#mod-protoparse}

Overall {{< level "Proven" >}}. Added v0.42.0 (2026-11-06).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap (2 not planned by category, decision 0655 rule 8).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protoparse" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestProtoparseFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 11m42s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protoparse/perf.md" >}}: worst case 0.094 of Go's wall over 2 cases of 1 twin directories (2026-11-16).

#### `std/prototext` {#mod-prototext}

Overall {{< level "Proven" >}}. Added v0.53.0 (2026-11-16).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prototext" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestPrototextFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 25m12s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/prototext/perf.md" >}}: worst case 1.048 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/protowire` {#mod-protowire}

Overall {{< level "Proven" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protowire" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestProtowireFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 12m41s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protodesc/perf.md" >}}: the lowest of its users' marks (protodesc, protojson, protowkt).

#### `std/protowkt` {#mod-protowkt}

Overall {{< level "Proven" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protowkt" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestProtowktFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 13m13s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/protowkt/perf.md" >}}: worst case 0.509 of Go's wall over 3 cases of 1 twin directories (2026-11-16).

#### `std/publicsuffix` {#mod-publicsuffix}

Overall {{< level "Proven" >}}. Added v0.51.0 (2026-11-12).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/publicsuffix" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestPublicsuffixFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 9m35s, 0 mismatches; Go test tables: 139 cases from 2 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/publicsuffix/perf.md" >}}: worst case 0.770 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/random` {#mod-random}

Overall {{< level "Proven" >}}. Added v0.49.1 (2026-11-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/random" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestRandomFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 22m15s, 0 mismatches; Go test tables: 372 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/random/perf.md" >}}: worst case 0.913 of Go's wall over 6 cases of 1 twin directories (2026-11-20).

#### `std/rate` {#mod-rate}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/rate" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestRateFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 13m20s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/rate/perf.md" >}}: worst case 0.569 of Go's wall over 2 cases of 1 twin directories (2026-11-15).

#### `std/regexp` {#mod-regexp}

Overall {{< level "Proven" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/regexp" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestRegexpFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 35m16s, 0 mismatches; Go test tables: 203 cases from 6 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/regexp/perf.md" >}}: worst case 0.998 of Go's wall over 6 cases of 1 twin directories (2026-11-17).

#### `std/smtp` {#mod-smtp}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/smtp" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestSmtpFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h13m29s in 3 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/smtp/perf.md" >}}: worst case 0.668 of Go's wall over 2 cases of 1 twin directories (2026-11-15).

#### `std/sql` {#mod-sql}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 4 mapped Go rows done, no open stdaudit gap (207 not planned by category, decision 0655 rule 8).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sql" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestMysqlFuzz 1000000 cases per backend; TestPgFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 5h56m12s in 7 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sql/perf.md" >}}: worst case 0.820 of Go's wall over 2 cases of 1 twin directories (2026-11-15).

#### `std/sqlite` {#mod-sqlite}

Overall {{< level "Proven" >}}. Added v0.42.0 (2026-11-06).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap (31 not planned by category, decision 0655 rule 8).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sqlite" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestSqliteFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h30m45s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sqlite/perf.md" >}}: worst case 0.869 of Go's wall over 4 cases of 1 twin directories (2026-11-16).

#### `std/sse` {#mod-sse}

Overall {{< level "Proven" >}}. Added v0.49.1 (2026-11-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sse" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestSseFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 21m16s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/sse/perf.md" >}}: worst case 1.025 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/tabwriter` {#mod-tabwriter}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tabwriter" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestTabwriterFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 27m26s, 0 mismatches; Go test tables: 45 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tabwriter/perf.md" >}}: worst case 0.873 of Go's wall over 3 cases of 1 twin directories (2026-11-17).

#### `std/task` {#mod-task}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/task" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestTaskFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 3h52m58s in 5 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/task/perf.md" >}}: worst case 0.557 of Go's wall over 4 cases of 1 twin directories (2026-11-20).

#### `std/template` {#mod-template}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/template" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestTemplateFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 15m19s, 0 mismatches; Go test tables: 600 cases from 4 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/template/perf.md" >}}: worst case 0.607 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/term` {#mod-term}

Overall {{< level "Proven" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/term" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestTermFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 11m7s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/term/perf.md" >}}: worst case 1.033 of Go's wall over 7 cases of 2 twin directories (2026-11-17).

#### `std/testing` {#mod-testing}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/testing" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestFakenetFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h7m29s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/testing/perf.md" >}}: worst case 0.129 of Go's wall over 1 cases of 1 twin directories (2026-11-19).

#### `std/textproto` {#mod-textproto}

Overall {{< level "Proven" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/textproto" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestTextprotoFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 23m47s, 0 mismatches; Go test tables: 18 cases from 2 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/textproto/perf.md" >}}: worst case 1.040 of Go's wall over 4 cases of 1 twin directories (2026-11-17).

#### `std/time` {#mod-time}

Overall {{< level "Proven" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/time" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestTimeFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 16m1s, 0 mismatches; Go test tables: 19 cases from 1 table.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/time/perf.md" >}}: worst case 0.952 of Go's wall over 10 cases of 2 twin directories (2026-11-14).

#### `std/timego` {#mod-timego}

Overall {{< level "Proven" >}}. Added v0.43.0 (2026-11-06).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/timego" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestTimegoFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 9m8s, 0 mismatches; Go test tables: 192 cases from 8 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/timego/perf.md" >}}: worst case 0.966 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/tls` {#mod-tls}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tls" >}}: Proven evidence (race, stress, fuzz, review; decision 0616): TestTlsFuzz 1000000 cases per backend; TestPemFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 3h59m42s in 5 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/tls/perf.md" >}}: worst case 0.761 of Go's wall over 2 cases of 1 twin directories (2026-11-19).

#### `std/toml` {#mod-toml}

Overall {{< level "Proven" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/toml" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestTomlFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 58m36s in 2 shards, 0 mismatches; Go test tables: 316 cases from 15 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/toml/perf.md" >}}: worst case 0.952 of Go's wall over 3 cases of 1 twin directories (2026-11-18).

#### `std/trace` {#mod-trace}

Overall {{< level "Proven" >}}. Added v0.25.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/trace" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestTraceFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 24m55s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/trace/perf.md" >}}: worst case 0.967 of Go's wall over 4 cases of 1 twin directories (2026-11-18).

#### `std/udp` {#mod-udp}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/udp" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestUdpFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 30m39s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/udp/perf.md" >}}: worst case 0.977 of Go's wall over 2 cases of 1 twin directories (2026-11-15).

#### `std/ui` {#mod-ui}

Overall {{< level "Proven" >}}. Added v0.52.0 (2026-11-15).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/ui/features.md" >}}: feature audit: all 85 features tested, none open (decision 0691).
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/ui" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestUiFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 3h0m37s in 4 shards, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/ui/perf.md" >}}: worst case 0.576 of Go's wall over 3 cases of 1 twin directories (2026-11-19).

#### `std/uniclass` {#mod-uniclass}

Overall {{< level "Proven" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/uniclass" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestUniclassFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 11m32s, 0 mismatches; Go test tables: 74 cases from 2 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/regexp/perf.md" >}}: the lowest of its users' marks (regexp).

#### `std/url` {#mod-url}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/url" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestUrlFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 46m12s, 0 mismatches; Go test tables: 307 cases from 10 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/url/perf.md" >}}: worst case 1.002 of Go's wall over 5 cases of 1 twin directories (2026-11-14).

#### `std/uuid` {#mod-uuid}

Overall {{< level "Proven" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/uuid" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestUuidFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 22m52s, 0 mismatches; Go test tables: 105 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/uuid/perf.md" >}}: worst case 0.954 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

#### `std/websocket` {#mod-websocket}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/websocket" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestWsFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 2h56m45s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/websocket/perf.md" >}}: worst case 0.925 of Go's wall over 4 cases of 1 twin directories (2026-11-18).

#### `std/x509` {#mod-x509}

Overall {{< level "Proven" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/x509" >}}: Proven evidence (race, stress, fuzz, review, gotests; decision 0616): TestX509Fuzz 1000000 cases per backend, 2 backends (arm64,llvm), 13m54s, 0 mismatches; Go test tables: 37 cases from 3 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/x509/perf.md" >}}: worst case 0.940 of Go's wall over 7 cases of 1 twin directories (2026-11-13).

#### `std/xml` {#mod-xml}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xml" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestXmlFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 1h33m21s in 2 shards, 0 mismatches; Go test tables: 150 cases from 16 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xml/perf.md" >}}: worst case 0.741 of Go's wall over 5 cases of 1 twin directories (2026-11-16).

#### `std/xmlcodec` {#mod-xmlcodec}

Overall {{< level "Proven" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xmlcodec" >}}: Proven evidence (race, stress, fuzz; decision 0616): TestXmlcodecFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 44m31s, 0 mismatches.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/xmlcodec/perf.md" >}}: worst case 0.588 of Go's wall over 3 cases of 1 twin directories (2026-11-15).

#### `std/yaml` {#mod-yaml}

Overall {{< level "Proven" >}}. Added v0.40.0 (2026-11-05).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done, no open stdaudit gap.
- Testing {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/yaml" >}}: Proven evidence (race, stress, fuzz, gotests; decision 0616): TestYamlFuzz 1000000 cases per backend, 2 backends (arm64,llvm), 20m8s, 0 mismatches; Go test tables: 532 cases from 7 tables.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/std/evidence/yaml/perf.md" >}}: worst case 1.001 of Go's wall over 4 cases of 1 twin directories (2026-11-15).

## Go packages

All 176 packages of `go list std`, by status. A package that maps to a module names it; the repository's coverage table has the notes per row.

### Covered (104)

The module covers what a backend uses of the package, on the native backends and the Go backend.

| Go package | Xo |
|---|---|
| `archive/tar` | std/archive |
| `archive/zip` | std/archive |
| `bufio` | std/bufio |
| `bytes` | prelude Bytes, BytesBuilder |
| `cmp` | prelude List, Map, Set, Ord |
| `compress/flate` | std/compress (and std/archive gzip, gunzip) |
| `compress/gzip` | std/compress (and std/archive gzip, gunzip) |
| `compress/zlib` | std/compress zlib, unzlib |
| `container/heap` | std/heap |
| `context` | scopes, cancellation, task.with_timeout |
| `crypto/aes` | std/crypto |
| `crypto/cipher` | std/crypto |
| `crypto/ecdh` | std/crypto |
| `crypto/ecdsa` | std/crypto |
| `crypto/ed25519` | std/crypto |
| `crypto/elliptic` | std/crypto |
| `crypto/hkdf` | std/crypto |
| `crypto/hmac` | std/crypto hmac, hmac_hasher |
| `crypto/hpke` | std/hpke |
| `crypto/md5` | std/crypto Hash.Md5 |
| `crypto/mlkem` | std/crypto |
| `crypto/pbkdf2` | std/crypto pbkdf2, hash_password |
| `crypto/rand` | prelude Rand, crypto.random_bytes, token, random_text; std/big |
| `crypto/rsa` | std/crypto |
| `crypto/sha1` | std/crypto Hash.Sha1 |
| `crypto/sha256` | std/crypto |
| `crypto/sha3` | std/crypto Hash, Shake |
| `crypto/sha512` | std/crypto Hash, Shake |
| `crypto/subtle` | std/crypto equal, xor, ct_*, with_data_independent_timing |
| `crypto/tls` | std/tls (client and server), std/http (with_tls, with_roots, with_cert, tls_cert) |
| `crypto/x509` | std/x509, std/crypto (keys) |
| `crypto/x509/pkix` | std/x509, std/crypto (keys) |
| `database/sql` | std/sql |
| `database/sql/driver` | std/sql Driver, DriverConn, DriverRows, open_driver |
| `embed` | std/embed (with core 3.1's `embed`) |
| `encoding/asn1` | std/asn1 (std/native/llrt/asn1.xo for X.509) |
| `encoding/base32` | std/base32 |
| `encoding/base64` | std/base64, prelude Bytes |
| `encoding/binary` | std/binary |
| `encoding/csv` | std/csv |
| `encoding/hex` | prelude Bytes |
| `encoding/json` | std/json |
| `encoding/pem` | std/crypto |
| `encoding/xml` | std/xml, std/xmlcodec (derive Xml) |
| `errors` | !` results, Error interface |
| `expvar` | std/metrics |
| `flag` | std/cli |
| `hash` | std/crypto Hasher |
| `hash/crc32` | std/crc32 |
| `hash/fnv` | std/fnv |
| `html` | std/html, std/htmlent (the entity tables, internal) |
| `html/template` | std/template |
| `image` | std/image |
| `image/color` | std/image |
| `image/color/palette` | std/image |
| `image/draw` | std/image |
| `image/gif` | std/gif |
| `image/jpeg` | std/jpeg |
| `image/png` | std/png |
| `log` | std/log |
| `log/slog` | std/log fields, Format.Json, std/trace |
| `maps` | prelude List, Map, Set, Ord |
| `math` | prelude Float |
| `math/big` | std/big |
| `math/bits` | prelude Int word methods |
| `math/rand` | prelude Rand capability, std/random (NormFloat64, ExpFloat64, Perm, Shuffle; decision 0606; Zipf 2026-11-15) |
| `math/rand/v2` | prelude Rand capability, std/random (NormFloat64, ExpFloat64, Perm, Shuffle; decision 0606; Zipf 2026-11-15) |
| `mime` | std/mime |
| `mime/multipart` | std/multipart |
| `mime/quotedprintable` | std/mime |
| `net` | prelude Net (TCP, Unix sockets, lookup_host, dial_timeout, interfaces, Conn deadlines), std/udp, std/dns (MX, TXT, SRV, PTR, CNAME, NS), std/netip (join_host_port, split_host_port), DNS client in std/native/llrt/dns.xo (Windows resolver config too) |
| `net/http` | std/http Client |
| `net/http/cookiejar` | std/cookiejar |
| `net/http/httptest` | std/testing FakeNet, Router.call |
| `net/http/httptrace` | std/http Request.with_trace, TraceEvent |
| `net/http/httputil` | std/http reverse_proxy |
| `net/http/pprof` | std/debug router (decision 0325) |
| `net/mail` | std/mail |
| `net/netip` | std/netip |
| `net/smtp` | std/smtp |
| `net/textproto` | std/textproto |
| `net/url` | std/url, std/http parse_url and Url |
| `os` | prelude Fs, Env, Proc, Stdio |
| `os/exec` | prelude Proc, Cmd, Child |
| `path` | std/path |
| `path/filepath` | prelude Fs paths, std/path |
| `regexp` | std/regexp |
| `regexp/syntax` | std/regexp |
| `slices` | prelude List, Map, Set, Ord |
| `sort` | prelude List, Map, Set, Ord |
| `strconv` | prelude Int.parse, parse_base, to_str_base, Float.parse, Bool.parse, quote, unquote |
| `strings` | prelude Str |
| `sync` | prelude Mutex, Atomic, Chan, std/task (once, semaphore, groups, concurrent maps) |
| `sync/atomic` | prelude Mutex, Atomic, Chan, std/task (once, semaphore, groups, concurrent maps) |
| `testing` | test blocks, std/testing |
| `testing/fstest` | MemFs |
| `testing/quick` | property tests |
| `testing/synctest` | FakeClock, deterministic scheduling under xo test |
| `text/tabwriter` | std/tabwriter (decision 0410) |
| `text/template` | std/template |
| `time` | prelude Time, Duration, std/time |
| `time/tzdata` | std/tzdata, embedded per use |
| `unicode` | prelude Rune, std/uniclass (std/regexp's \p classes, internal) |
| `unicode/utf8` | prelude Str, Bytes |

### Partial (5)

Some of it; the notes in the coverage table name what is missing.

| Go package | Xo |
|---|---|
| `fmt` | string interpolation, Display, Debug |
| `io` | File, Conn, Child read and write, Fs.walk |
| `io/fs` | File, Conn, Child read and write, Fs.walk |
| `io/ioutil` | File, Conn, Child read and write, Fs.walk |
| `os/signal` | core 7.5 shutdown, task.stop_requested, Proc.kill |

### Not applicable by design (48)

Reflection, Go source tooling, cgo and the runtime's internals are replaced by language features or the toolchain, or the algorithm is broken or legacy.

`container/list`, `crypto`, `crypto/fips140`, `crypto/mlkem/mlkemtest`, `debug/buildinfo`, `debug/dwarf`, `debug/elf`, `debug/gosym`, `debug/macho`, `debug/pe`, `debug/plan9obj`, `encoding`, `encoding/ascii85`, `go/ast`, `go/build`, `go/build/constraint`, `go/constant`, `go/doc`, `go/doc/comment`, `go/format`, `go/importer`, `go/parser`, `go/printer`, `go/scanner`, `go/token`, `go/types`, `go/version`, `iter`, `math/cmplx`, `net/http/cgi`, `net/http/fcgi`, `plugin`, `reflect`, `runtime`, `runtime/cgo`, `runtime/coverage`, `runtime/debug`, `runtime/metrics`, `runtime/pprof`, `runtime/race`, `runtime/trace`, `structs`, `syscall`, `testing/cryptotest`, `testing/iotest`, `testing/slogtest`, `text/template/parse`, `unsafe`

### Gaps, potentially planned (19)

Nothing yet, wanted. See [Roadmap of gaps](#roadmap-of-gaps).

| Go package | Xo |
|---|---|
| `compress/bzip2` | none |
| `compress/lzw` | none |
| `container/ring` | none |
| `crypto/des` | none |
| `crypto/dsa` | none |
| `crypto/rc4` | none |
| `encoding/gob` | none |
| `hash/adler32` | std/adler32 |
| `hash/crc64` | std/crc64 |
| `hash/maphash` | none |
| `index/suffixarray` | none |
| `log/syslog` | none |
| `net/rpc` | none |
| `net/rpc/jsonrpc` | none |
| `os/user` | Env.home |
| `text/scanner` | none |
| `unicode/utf16` | std/charset |
| `unique` | none |
| `weak` | none |

### Beyond Go

Modules with no Go standard library counterpart, or that go past it: `std/backoff` (no Go std package), `std/dns` (net.Resolver covers part), `std/metrics` (expvar plus a Prometheus registry), `std/rate` (x/time/rate is outside std), `std/sql` (database/sql plus a PostgreSQL driver), `std/toml` (Go has no TOML in std), `std/trace` (no Go std tracing API of this kind), `std/udp` (net.UDPConn), `std/uuid` (Go has no UUID in std), `std/websocket` (Go has no websocket in std). Also in `std/crypto`: Argon2id password hashing, AES-GCM and ChaCha20-Poly1305 as public AEAD, HKDF.

## Function level checks

The coverage table is checked against the code, not only the package names. Examples from this commit (`xo symbols --module=... --pub`):

- `crypto/md5`, `crypto/sha1`: `Hash.Md5` and `Hash.Sha1` in `std/crypto`, one-shot and streaming (`Hasher`), also through `hmac`. Covered.
- `encoding/hex`: `Bytes.to_hex` and `Bytes.from_hex` in the prelude. Covered; Go's `Dump` is not offered.
- `hash/crc32`: `std/crc32` with `Poly.Ieee` and `Poly.Castagnoli`, `checksum` and `update`. Covered. `hash/crc64` and `hash/adler32` have no module: gaps.
- `net/http/cookiejar`: `std/http` reads and writes cookies on a `Request` (`cookie`, `cookies`, `with_cookie`) but the client has no jar. Gap, planned with client cookies.

## Roadmap of gaps

The gaps are *potentially planned*: a priority and a realistic timeframe, not a commitment. The ordering is the std owner's estimate (2026-11-02) from port effort and demand, and the owner decides.

| Priority | Gap | Timeframe |
|---|---|---|
| 1 | `encoding/gob`, `net/rpc`; `compress/bzip2`, `compress/lzw`; small hashes (`hash/crc64`, `hash/adler32`); `os/user`; `log/syslog`; `expvar`; `text/scanner`; `container/ring`; `unicode/utf16`; `index/suffixarray` | Q1 2027 |
| 2 | legacy crypto (`crypto/des`, `crypto/dsa`, `crypto/rc4`); `weak`, `unique` | last, or possibly never |

The repository's coverage table still lists some of these as not planned (for example `encoding/gob`, `net/rpc`, `text/scanner`, `log/syslog`, `container/ring`, `index/suffixarray`); this page follows the owner's list, and the table moves with the decision. CBOR is not a Go package; it is listed because it is first on the list.

Sources: [std-coverage.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md), [std/changes](https://github.com/xo-lang/xo/blob/main/std/changes/README.md) (every module's change log), [decision 0276](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0276-std-follows-go-std.md) and [decision 0461](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0461-std-module-maturity.md).
