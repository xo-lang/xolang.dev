---
title: "Standard library coverage"
linkTitle: "Std coverage"
description: "Which of Go's 176 standard packages Xo covers, what is beyond Go, what is not applicable by design, what is a gap with its priority, and a maturity level for each std module with its evidence."
weight: 7
toc: true
---

As of Xo 0.36 (development, main 34e64e0b9 of 2026-11-12); Go 1.26.1. Every count below comes from a command run on that commit: `go list std` without internal and vendor packages, and the table in the repository's [std-coverage.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md) (decision 0276: Go's standard library is std's reference scope).

## Summary

Go has **176** public standard library packages. Xo has **86** `std` modules besides the prelude (the builtin types and capabilities every program sees).

| Status | Go packages |
|---|---|
| Covered (done) | 66 |
| Partial | 34 |
| Not applicable by design | 49 |
| Gap, potentially planned | 24 |
| Not yet mapped | 3 |

Beyond Go: modules with no Go standard library counterpart, or going past it, are listed under [Beyond Go](#beyond-go).

## Maturity levels

Each `std` module gets three marks, one per axis, and an overall level that is the weakest of the three (owner, 2026-11-02, decision 0461).

| Axis | {{< level "Early" >}} | {{< level "Solid" >}} | {{< level "Proven" >}} |
|---|---|---|---|
| Features, against Go's package or the domain | core uses | common uses, gaps listed | near full parity, or beyond Go |
| Testing | own tests | Go's tests ported or a Go differential; parsers fuzzed | also `--race` and load stress clean, long fuzz runs, security reviewed where it applies (crypto, tls, http, x509) |
| Performance | not measured, or measured and above 2x Go | measured against Go, within 2x | at or better than Go on its benchmark |

How a mark is read here: *Features* from the rows of the coverage table that name the module (all done is Proven, any partial is Solid; a module with no Go package is Solid and says so). *Testing* from the committed corpus of Go's tests under `internal/stdtest/testdata/corpus`, Go differential tests, and fuzz tests for modules that parse untrusted input. *Performance* from a committed result file with a Go twin. A mark with no committed evidence is Early, so a missing result is the gap to close, not a hidden number. The dates are those of the result files, which can be older than this page; a re-run can only move a mark if the file is replaced.

Today: overall 0 Proven, 25 Solid, 62 Early of 87 (prelude and 86 modules). Per axis, features 37/50/0, testing 0/61/26, performance 17/18/52 (Proven/Solid/Early). No module has the committed `--race`, load stress, long fuzz and security review evidence that Proven testing needs yet.

### Per module

Marks only. Each module has its three marks (F features, T testing, P performance) and the short figures behind them; times are multiples of Go's time, so lower is faster and 0.47x is better than Go. The prose behind each mark (which rows are partial, the timings, what is missing, the evidence link) is under [Module notes](#module-notes); each module name links to its note.

| Module | Marks: F features, T testing, P performance |
|---|---|
| [`prelude`](#mod-prelude) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/prelude" "T" "Testing" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 15/18 · Testing ported · Performance 0.91 to 1.62x" >}} |
| [`std/adler32`](#mod-adler32) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/adler32" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/amqp`](#mod-amqp) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/amqp" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/amqptest`](#mod-amqptest) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/archive`](#mod-archive) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/archivefuzz_test.go" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-archive-2026-11-04.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing ported + hostile · Performance 0.93 to 1.266x" >}} |
| [`std/asn1`](#mod-asn1) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/asn1" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/backoff`](#mod-backoff) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/backoff" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features beyond Go · Testing ported · Performance no row" >}} |
| [`std/base32`](#mod-base32) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/base32" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.47 to 0.98x" >}} |
| [`std/base64`](#mod-base64) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/base64" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.57 to 0.88x" >}} |
| [`std/bcrypt`](#mod-bcrypt) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/bcrypt" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/big`](#mod-big) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/big" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported · Performance 0.49 to 1.23x" >}} |
| [`std/binary`](#mod-binary) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/binary" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/bufio`](#mod-bufio) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/bufio" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/cbor`](#mod-cbor) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/cborfuzz_test.go" "T" "Testing" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-cbor-2026-11-06.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 1.001 to 2.934x" >}} |
| [`std/charset`](#mod-charset) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/charset" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing ported · Performance no row" >}} |
| [`std/cli`](#mod-cli) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/cli" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/compress`](#mod-compress) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/compressfuzz_test.go" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing ported + hostile · Performance 0.91 to 0.96x" >}} |
| [`std/cookiejar`](#mod-cookiejar) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/cookiejar" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/crc32`](#mod-crc32) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crc32" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.37 to 0.96x" >}} |
| [`std/crc64`](#mod-crc64) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crc64" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/cron`](#mod-cron) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/cron" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/crypto`](#mod-crypto) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crypto" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/aesgcm-2026-10-22.md" "P" "Performance" >}} {{< covdesc "Features 12/16 · Testing ported · Performance 1.12 to 1.2x" >}} |
| [`std/csv`](#mod-csv) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/csvfuzz/csvfuzz_test.xo" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported + fuzz · Performance 0.92 to 1.01x" >}} |
| [`std/debug`](#mod-debug) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing own tests · Performance no row" >}} |
| [`std/deque`](#mod-deque) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/deque" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance 0.13 to 0.17x" >}} |
| [`std/dns`](#mod-dns) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/dns-netpoll-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing own tests · Performance 0.928x" >}} |
| [`std/embed`](#mod-embed) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing own tests · Performance no row" >}} |
| [`std/fnv`](#mod-fnv) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/fnv" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.98x" >}} |
| [`std/gif`](#mod-gif) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/gif" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/go`](#mod-go) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/grpc`](#mod-grpc) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/grpc" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/heap`](#mod-heap) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/heap" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/html`](#mod-html) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-html-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing own tests · Performance 0.54 to 1.37x" >}} |
| [`std/htmlent`](#mod-htmlent) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/htmlparse`](#mod-htmlparse) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/htmlparse" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported · Performance no row" >}} |
| [`std/htmltok`](#mod-htmltok) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/htmltok" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported · Performance no row" >}} |
| [`std/http`](#mod-http) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/httpheadfuzz_test.go" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/tls-h2-vs-go-2026-10-21.md" "P" "Performance" >}} {{< covdesc "Features 1/6 · Testing ported + fuzz · Performance see notes" >}} |
| [`std/idna`](#mod-idna) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/idna" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-idna-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.44 to 0.98x" >}} |
| [`std/image`](#mod-image) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/image" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported · Performance no row" >}} |
| [`std/jpeg`](#mod-jpeg) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/jpegfuzz_test.go" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows6-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 1.01 to 1.04x" >}} |
| [`std/json`](#mod-json) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/jsonfuzz/jsonfuzz_test.xo" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported + fuzz · Performance 0.33 to 0.49x instr." >}} |
| [`std/jsonrpc`](#mod-jsonrpc) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/jsonrpc" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/jwt`](#mod-jwt) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/jwt" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/log`](#mod-log) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/2 · Testing own tests · Performance no row" >}} |
| [`std/mail`](#mod-mail) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/mailfuzz_test.go" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.45 to 1.15x" >}} |
| [`std/metrics`](#mod-metrics) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/metrics" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing ported · Performance no row" >}} |
| [`std/mime`](#mod-mime) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/mimefuzz_test.go" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported + hostile · Performance 0.9 to 1.28x" >}} |
| [`std/multipart`](#mod-multipart) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/multipart" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported, no fuzz · Performance 1.15x instr." >}} |
| [`std/netip`](#mod-netip) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/netip" "T" "Testing" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-netip-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported, no fuzz · Performance 0.669 to 2.023x" >}} |
| [`std/norm`](#mod-norm) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/norm" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-norm-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.7 to 0.75x" >}} |
| [`std/otlp`](#mod-otlp) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/otlp" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/otp`](#mod-otp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/otp" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-otp-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.928 to 1.272x" >}} |
| [`std/path`](#mod-path) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/path" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing ported · Performance 1.08 to 1.4x" >}} |
| [`std/png`](#mod-png) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/pngfuzz_test.go" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows5-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.94 to 1.04x" >}} |
| [`std/protobuf`](#mod-protobuf) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protobuf" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/protodesc`](#mod-protodesc) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protodesc" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported · Performance no row" >}} |
| [`std/protojson`](#mod-protojson) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protojson" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported · Performance no row" >}} |
| [`std/protoparse`](#mod-protoparse) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protoparse" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/protowire`](#mod-protowire) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/protowkt`](#mod-protowkt) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protowkt" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported · Performance no row" >}} |
| [`std/random`](#mod-random) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/random" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/rate`](#mod-rate) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/rate" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features beyond Go · Testing ported · Performance 1.29x" >}} |
| [`std/regexp`](#mod-regexp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/regexp" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported, no fuzz · Performance 0.89 to 1.25x" >}} |
| [`std/smtp`](#mod-smtp) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/smtp" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported, no fuzz · Performance no row" >}} |
| [`std/sql`](#mod-sql) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/sql" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 2/3 · Testing ported · Performance no row" >}} |
| [`std/sqlite`](#mod-sqlite) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/sse`](#mod-sse) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/sse" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/tabwriter`](#mod-tabwriter) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/tabwriter" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance no row" >}} |
| [`std/task`](#mod-task) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/template`](#mod-template) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/template" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-template-2026-11-04.md" "P" "Performance" >}} {{< covdesc "Features 1/2 · Testing ported, no fuzz · Performance 0.892 to 1.209x" >}} |
| [`std/term`](#mod-term) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/testing`](#mod-testing) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 2/2 · Testing own tests · Performance no row" >}} |
| [`std/textproto`](#mod-textproto) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/textproto" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/time`](#mod-time) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/time" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-time-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported, no fuzz · Performance 0.815x" >}} |
| [`std/timego`](#mod-timego) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/timego" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |
| [`std/tls`](#mod-tls) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/llvm/tls13_diff_test.go" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/tls-h2-vs-go-2026-10-21.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing differential, no fuzz · Performance see notes" >}} |
| [`std/toml`](#mod-toml) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-toml-2026-11-04.md" "P" "Performance" >}} {{< covdesc "Features beyond Go · Testing own tests · Performance 0.483 to 1.135x" >}} |
| [`std/trace`](#mod-trace) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing own tests · Performance no row" >}} |
| [`std/udp`](#mod-udp) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing own tests · Performance no row" >}} |
| [`std/uniclass`](#mod-uniclass) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing own tests · Performance no row" >}} |
| [`std/url`](#mod-url) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/httpurlfuzz_test.go" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/url-parse-2026-10-23.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported + fuzz · Performance 0.78x instr." >}} |
| [`std/uuid`](#mod-uuid) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/uuid" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported · Performance 0.72 to 1x" >}} |
| [`std/websocket`](#mod-websocket) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Early" "" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing own tests · Performance 0.4 to 1.12x" >}} |
| [`std/x509`](#mod-x509) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/x509/x509_test.xo" "T" "Testing" >}} {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 1/1 · Testing ported + fuzz · Performance 0.98x" >}} |
| [`std/xml`](#mod-xml) | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/xmlfuzz/xmlfuzz_test.xo" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features 0/1 · Testing ported + fuzz · Performance 0.95 to 1.15x" >}} |
| [`std/xmlcodec`](#mod-xmlcodec) | {{< level "Solid" "" "F" "Features" >}} {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/xmlcodec" "T" "Testing" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported, no fuzz · Performance 0.57 to 1.13x" >}} |
| [`std/yaml`](#mod-yaml) | {{< level "Solid" "" "F" "Features" >}} {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/yaml" "T" "Testing" >}} {{< level "Early" "" "P" "Performance" >}} {{< covdesc "Features own domain · Testing ported · Performance no row" >}} |

### Module notes

One entry per module: the three marks with their evidence, in words, and when the module was added. The marks are the table's; nothing here changes one.

#### `prelude` {#mod-prelude}

Overall {{< level "Early" >}}. Added go-compiler-final (2026-10-08).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 15 of 18 mapped Go rows done, 3 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/prelude" >}}: Go's tests ported.
- Performance {{< level "Early" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: Str.trim_chars 1.62 of Go's wall (was 2.24); fs walk_dir_entries 0.91 of Go's wall (decision 0483; walk_dir with a FileInfo each 1.49, 0.94 with Go reading each entry's info); itoa 1.35 (was 1.52), atoi 1.46, sort of strings 1.42; split, search, case and predicate workloads 0.4 to 1.24 (2026-11-03).

#### `std/adler32` {#mod-adler32}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/adler32" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/amqp` {#mod-amqp}

Overall {{< level "Early" >}}. Added v0.41.0 (2026-11-05).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/amqp" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/amqptest` {#mod-amqptest}

Overall {{< level "Early" >}}. Added v0.41.0 (2026-11-05).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/archive` {#mod-archive}

Overall {{< level "Solid" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/archivefuzz_test.go" >}}: Go's tests ported; 2,010 hostile tar and zip archives (Go-written and hand-built headers, cut and field-mutated) against Go's archive/tar and archive/zip readers on every backend.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-archive-2026-11-04.md" >}}: zip_writer 1.266, zip_open 0.93 of Go's wall (2026-11-04).

#### `std/asn1` {#mod-asn1}

Overall {{< level "Early" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/asn1" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/backoff` {#mod-backoff}

Overall {{< level "Early" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Solid" >}}: beyond Go: no Go std package.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/backoff" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/base32` {#mod-base32}

Overall {{< level "Solid" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/base32" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" >}}: encode 0.98, decode 0.47 of Go's wall (2026-11-03).

#### `std/base64` {#mod-base64}

Overall {{< level "Solid" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/base64" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: encode 0.57, decode 0.88 of Go's wall (2026-11-03).

#### `std/bcrypt` {#mod-bcrypt}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/bcrypt" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/big` {#mod-big}

Overall {{< level "Solid" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/big" >}}: Go's tests ported.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: mul 1.23, parse 0.49 of Go's wall (2026-11-03).

#### `std/binary` {#mod-binary}

Overall {{< level "Early" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/binary" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/bufio` {#mod-bufio}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/bufio" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/cbor` {#mod-cbor}

Overall {{< level "Early" >}}. Added v0.37.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/cborfuzz_test.go" >}}: Go's tests ported; 1,500 seeded inputs from a byte level builder (random head widths, indefinite lengths, floats of every width, tags, simple values, repeated keys, text that is not UTF-8, then bits flipped, cuts, insertions) against fxamacker/cbor v2 (Go has no CBOR in its standard library), plus 12,000 fresh cases on arm64 and LLVM and the RFC 8949 Appendix A examples.
- Performance {{< level "Early" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-cbor-2026-11-06.md" >}}: udecode 1.001, umarshal 2.934 of Go's wall (2026-11-06).

#### `std/charset` {#mod-charset}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/charset" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/cli` {#mod-cli}

Overall {{< level "Early" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/cli" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/compress` {#mod-compress}

Overall {{< level "Solid" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/compressfuzz_test.go" >}}: Go's tests ported; 2,000 hostile DEFLATE, zlib and gzip streams (hand-built blocks and corrupted Go output) against Go's decoders, error texts exact, plus streaming and max_size, on every backend.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" >}}: gzip 0.96, gunzip 0.92, deflate 0.96, inflate 0.91 of Go's wall (2026-11-03).

#### `std/cookiejar` {#mod-cookiejar}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/cookiejar" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/crc32` {#mod-crc32}

Overall {{< level "Solid" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crc32" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: crc32 0.96, crc32c 0.37 of Go's wall (2026-11-03).

#### `std/crc64` {#mod-crc64}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crc64" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/cron` {#mod-cron}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/cron" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/crypto` {#mod-crypto}

Overall {{< level "Solid" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 12 of 16 mapped Go rows done, 4 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crypto" >}}: Go's tests ported.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/aesgcm-2026-10-22.md" >}}: AES-GCM bulk loop 1.12, ChaCha20-Poly1305 1.2 of Go (2026-10-22).

#### `std/csv` {#mod-csv}

Overall {{< level "Solid" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/csvfuzz/csvfuzz_test.xo" >}}: Go's tests ported; fuzz corpus against encoding/csv (2,000 texts under random Reader options, error texts exact, and the Writer's output; internal/stdtest/csvfuzz_test.go runs fresh seeds).
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" >}}: parse 0.92, format 1.01 of Go's wall (2026-11-03).

#### `std/debug` {#mod-debug}

Overall {{< level "Early" >}}. Added v0.25.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/deque` {#mod-deque}

Overall {{< level "Solid" >}}. Added v0.36.0 (2026-10-30).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/deque" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: queue and both-ends workloads 0.13 to 0.17 of Go's wall (2026-11-03).

#### `std/dns` {#mod-dns}

Overall {{< level "Early" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/dns-netpoll-2026-11-03.md" >}}: mx 0.928 of Go's wall (2026-11-03).

#### `std/embed` {#mod-embed}

Overall {{< level "Early" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/fnv` {#mod-fnv}

Overall {{< level "Solid" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/fnv" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: fnv 32a, 64a, 128a at most 0.98 of Go's wall (2026-11-03).

#### `std/gif` {#mod-gif}

Overall {{< level "Early" >}}. Added v0.46.0 (2026-11-09).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/gif" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/go` {#mod-go}

Overall {{< level "Early" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/grpc` {#mod-grpc}

Overall {{< level "Early" >}}. Added v0.43.0 (2026-11-06).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/grpc" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/heap` {#mod-heap}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/heap" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/html` {#mod-html}

Overall {{< level "Early" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-html-2026-11-03.md" >}}: escape 1.37, unescape 0.54 of Go's wall (2026-11-03).

#### `std/htmlent` {#mod-htmlent}

Overall {{< level "Early" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/htmlparse` {#mod-htmlparse}

Overall {{< level "Early" >}}. Added v0.45.0 (2026-11-08).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/htmlparse" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/htmltok` {#mod-htmltok}

Overall {{< level "Early" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/htmltok" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/http` {#mod-http}

Overall {{< level "Solid" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 1 of 6 mapped Go rows done, 5 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/httpheadfuzz_test.go" >}}: Go's tests ported; request head, response and URL fuzz tests.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/tls-h2-vs-go-2026-10-21.md" >}}: HTTP/2 14 us a request against Go's 32; /alloc 0.97 of v0.35.0 (2026-11-02).

#### `std/idna` {#mod-idna}

Overall {{< level "Solid" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/idna" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-idna-2026-11-03.md" >}}: ascii 0.71, mixed 0.94, long 0.94, map 0.91, nfcmap 0.44, enc 0.98, dec 0.96 of Go's wall (2026-11-03).

#### `std/image` {#mod-image}

Overall {{< level "Early" >}}. Added v0.46.0 (2026-11-09).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/image" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/jpeg` {#mod-jpeg}

Overall {{< level "Solid" >}}. Added v0.37.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/jpegfuzz_test.go" >}}: Go's tests ported; 350 seeded files from a segment-aware mutator over Go's test images and Go-encoded images (every chroma ratio, baseline and progressive, restart intervals, CMYK, YCCK, headers, tables, scan parameters, cuts, bit flips) against Go's Decode and DecodeConfig, plus 12,000 fresh cases on arm64 and LLVM.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows6-2026-11-03.md" >}}: decode 1.01, with RGBA conversion 1.04 of Go's wall (2026-11-03).

#### `std/json` {#mod-json}

Overall {{< level "Solid" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/jsonfuzz/jsonfuzz_test.xo" >}}: Go's tests ported; fuzz corpus against encoding/json (2,022 cases; internal/stdtest/jsonfuzz_test.go runs fresh seeds).
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md" >}}: 0.33 to 0.49 of Go's instructions on native (2026-10-21).

#### `std/jsonrpc` {#mod-jsonrpc}

Overall {{< level "Early" >}}. Added v0.49.1 (2026-11-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/jsonrpc" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/jwt` {#mod-jwt}

Overall {{< level "Early" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/jwt" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/log` {#mod-log}

Overall {{< level "Early" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 1 of 2 mapped Go rows done, 1 partial.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/mail` {#mod-mail}

Overall {{< level "Solid" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/mailfuzz_test.go" >}}: Go's tests ported; 2,000 addresses, address lists, header blocks and dates against Go's net/mail (RFC 2047, groups, folds, zones) on every backend.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" >}}: display 1.15, address 0.62, header block 0.45 of Go's wall (2026-11-03).

#### `std/metrics` {#mod-metrics}

Overall {{< level "Early" >}}. Added v0.25.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/metrics" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/mime` {#mod-mime}

Overall {{< level "Solid" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/mimefuzz_test.go" >}}: Go's tests ported; 2,000 cases against Go's mime and net/http: hostile Content-Type headers (RFC 2231, continuations, duplicates), format_media_type, every DetectContentType signature, on every backend.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" >}}: format 1.28, parse 1.06, detect 0.90 of Go's wall (2026-11-03).

#### `std/multipart` {#mod-multipart}

Overall {{< level "Early" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/multipart" >}}: Go's tests ported; parser with no fuzz harness.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md" >}}: parse 1.15 of Go's instructions (2026-10-21).

#### `std/netip` {#mod-netip}

Overall {{< level "Early" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/netip" >}}: Go's tests ported; parser with no fuzz harness.
- Performance {{< level "Early" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-netip-2026-11-03.md" >}}: mixed 1.313, parse4 1.377, parse6 1.702, display4 1.98, display6 0.669, compare 2.023 of Go's wall (2026-11-03).

#### `std/norm` {#mod-norm}

Overall {{< level "Solid" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/norm" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-norm-2026-11-03.md" >}}: ascii 0.75, nfc 0.7 of Go's wall (2026-11-03).

#### `std/otlp` {#mod-otlp}

Overall {{< level "Early" >}}. Added v0.44.0 (2026-11-06).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/otlp" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/otp` {#mod-otp}

Overall {{< level "Solid" >}}. Added v0.38.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/otp" >}}: Go's tests ported.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-otp-2026-11-03.md" >}}: sha1 1.105, sha256 1.272, sha512 0.928 of Go's wall (2026-11-03).

#### `std/path` {#mod-path}

Overall {{< level "Solid" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/path" >}}: Go's tests ported.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: clean 1.08, join 1.13, parts 1.40 of Go's wall (2026-11-03).

#### `std/png` {#mod-png}

Overall {{< level "Solid" >}}. Added v0.37.0 (2026-11-03).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/pngfuzz_test.go" >}}: Go's tests ported; 1,000 seeded files from a chunk-level builder and Go-encoded images (every color type and depth, bad headers, palettes, tRNS, split IDATs, cuts, bit flips) against Go's Decode and DecodeConfig, plus 36,000 fresh cases over six seeds.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows5-2026-11-03.md" >}}: decode 1.04, encode 0.94 of Go's wall (2026-11-03).

#### `std/protobuf` {#mod-protobuf}

Overall {{< level "Early" >}}. Added v0.42.0 (2026-11-06).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protobuf" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/protodesc` {#mod-protodesc}

Overall {{< level "Early" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protodesc" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/protojson` {#mod-protojson}

Overall {{< level "Early" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protojson" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/protoparse` {#mod-protoparse}

Overall {{< level "Early" >}}. Added v0.42.0 (2026-11-06).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protoparse" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/protowire` {#mod-protowire}

Overall {{< level "Early" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/protowkt` {#mod-protowkt}

Overall {{< level "Early" >}}. Added v0.44.0 (2026-11-07).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/protowkt" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/random` {#mod-random}

Overall {{< level "Early" >}}. Added v0.49.1 (2026-11-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/random" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/rate` {#mod-rate}

Overall {{< level "Solid" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Solid" >}}: beyond Go: x/time/rate is outside std.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/rate" >}}: Go's tests ported.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" >}}: allow 1.29 of Go's wall (2026-11-03).

#### `std/regexp` {#mod-regexp}

Overall {{< level "Early" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/regexp" >}}: Go's tests ported; parser with no fuzz harness.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: match 1.25, find_all 0.89 of Go's wall (2026-11-03).

#### `std/smtp` {#mod-smtp}

Overall {{< level "Early" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/smtp" >}}: Go's tests ported; parser with no fuzz harness.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/sql` {#mod-sql}

Overall {{< level "Early" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 2 of 3 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/sql" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/sqlite` {#mod-sqlite}

Overall {{< level "Early" >}}. Added v0.42.0 (2026-11-06).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/sse` {#mod-sse}

Overall {{< level "Early" >}}. Added v0.49.1 (2026-11-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/sse" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/tabwriter` {#mod-tabwriter}

Overall {{< level "Early" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/tabwriter" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/task` {#mod-task}

Overall {{< level "Early" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/template` {#mod-template}

Overall {{< level "Early" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 1 of 2 mapped Go rows done, 1 partial.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/template" >}}: Go's tests ported; parser with no fuzz harness.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-template-2026-11-04.md" >}}: parse 0.892, render 1.209 of Go's wall (2026-11-04).

#### `std/term` {#mod-term}

Overall {{< level "Early" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/testing` {#mod-testing}

Overall {{< level "Early" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 2 mapped Go rows done.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/textproto` {#mod-textproto}

Overall {{< level "Early" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/textproto" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/time` {#mod-time}

Overall {{< level "Early" >}}. Added v0.7.0 (2026-10-08).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/time" >}}: Go's tests ported; parser with no fuzz harness.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-time-2026-11-03.md" >}}: parse (wall) 0.815 of Go's wall (2026-11-03).

#### `std/timego` {#mod-timego}

Overall {{< level "Early" >}}. Added v0.43.0 (2026-11-06).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/timego" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/tls` {#mod-tls}

Overall {{< level "Early" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/llvm/tls13_diff_test.go" >}}: TLS 1.3 client and server differential against Go; parser with no fuzz harness.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/tls-h2-vs-go-2026-10-21.md" >}}: HTTP/2 14 us a request against Go's 32; handshakes mixed (2026-10-21).

#### `std/toml` {#mod-toml}

Overall {{< level "Early" >}}. Added v0.11.0 (2026-10-11).

- Features {{< level "Solid" >}}: beyond Go: Go has no TOML in std.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-toml-2026-11-04.md" >}}: decode 1.135, encode 0.483 of Go's wall (2026-11-04).

#### `std/trace` {#mod-trace}

Overall {{< level "Early" >}}. Added v0.25.0 (2026-10-21).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/udp` {#mod-udp}

Overall {{< level "Early" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/uniclass` {#mod-uniclass}

Overall {{< level "Early" >}}. Added v0.49.0 (2026-11-11).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Early" >}}: no committed row against Go.

#### `std/url` {#mod-url}

Overall {{< level "Solid" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/httpurlfuzz_test.go" >}}: Go's tests ported; URL fuzz test.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/url-parse-2026-10-23.md" >}}: 0.78 of Go's instructions (2026-10-23).

#### `std/uuid` {#mod-uuid}

Overall {{< level "Solid" >}}. Added v0.23.0 (2026-10-20).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/uuid" >}}: Go's tests ported.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" >}}: parse 0.91, string 0.72, bytes 1.00 of Go's wall (2026-11-03).

#### `std/websocket` {#mod-websocket}

Overall {{< level "Early" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Early" >}}: own tests only.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows3-2026-11-03.md" >}}: small messages 1.12, big 0.40, dial 0.77 of Go's wall (2026-11-03).

#### `std/x509` {#mod-x509}

Overall {{< level "Solid" >}}. Added v0.35.0 (2026-10-29).

- Features {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: all 1 mapped Go rows done.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/x509/x509_test.xo" >}}: Go's tests ported; fuzz cases in its corpus.
- Performance {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows2-2026-11-03.md" >}}: parse, verify, create and CRL at most 0.98 of Go's wall (2026-11-03).

#### `std/xml` {#mod-xml}

Overall {{< level "Solid" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}}: 0 of 1 mapped Go rows done, 1 partial.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/xmlfuzz/xmlfuzz_test.xo" >}}: Go's tests ported; fuzz corpus against encoding/xml (2,000 documents through Token, Token not strict, and RawToken, error texts exact; internal/stdtest/xmlfuzz_test.go runs fresh seeds).
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" >}}: tokens 1.15, tree 0.95 of Go's wall (2026-11-03).

#### `std/xmlcodec` {#mod-xmlcodec}

Overall {{< level "Early" >}}. Added v0.24.0 (2026-10-21).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/xmlcodec" >}}: Go's tests ported; parser with no fuzz harness.
- Performance {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/std-twin-rows-2026-11-03.md" >}}: encode 0.57, decode 1.13 of Go's wall (2026-11-03).

#### `std/yaml` {#mod-yaml}

Overall {{< level "Early" >}}. Added v0.40.0 (2026-11-05).

- Features {{< level "Solid" >}}: no Go package maps to it; covers its own domain's common uses.
- Testing {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/yaml" >}}: Go's tests ported.
- Performance {{< level "Early" >}}: no committed row against Go.

## Go packages

All 176 packages of `go list std`, by status. A package that maps to a module names it; the repository's coverage table has the notes per row.

### Covered (66)

The module covers what a backend uses of the package, on the native backends and the Go backend.

| Go package | Xo |
|---|---|
| `archive/tar` | std/archive |
| `archive/zip` | std/archive |
| `bytes` | prelude Bytes, BytesBuilder |
| `cmp` | prelude List, Map, Set, Ord |
| `compress/flate` | std/compress (and std/archive gzip, gunzip) |
| `compress/gzip` | std/compress (and std/archive gzip, gunzip) |
| `compress/zlib` | std/compress zlib, unzlib |
| `container/heap` | std/heap |
| `context` | scopes, cancellation, task.with_timeout |
| `crypto/ed25519` | std/crypto |
| `crypto/hkdf` | std/crypto |
| `crypto/hmac` | std/crypto hmac, hmac_hasher |
| `crypto/md5` | std/crypto Hash.Md5 |
| `crypto/pbkdf2` | std/crypto hash_password |
| `crypto/rand` | prelude Rand, crypto.random_bytes, token |
| `crypto/sha1` | std/crypto Hash.Sha1 |
| `crypto/sha256` | std/crypto |
| `crypto/sha3` | std/crypto Hash |
| `crypto/sha512` | std/crypto Hash |
| `crypto/subtle` | std/crypto equal |
| `database/sql/driver` | std/sql Driver, DriverConn, DriverRows, open_driver |
| `embed` | std/embed (with core 3.1's `embed`) |
| `encoding/base32` | std/base32 |
| `encoding/base64` | std/base64, prelude Bytes |
| `encoding/binary` | std/binary |
| `encoding/csv` | std/csv |
| `encoding/hex` | prelude Bytes |
| `encoding/pem` | std/crypto |
| `errors` | !` results, Error interface |
| `expvar` | std/metrics |
| `flag` | std/cli |
| `hash/crc32` | std/crc32 |
| `hash/fnv` | std/fnv |
| `html` | std/html |
| `log` | std/log |
| `maps` | prelude List, Map, Set, Ord |
| `math/bits` | prelude Int word methods |
| `math/rand` | prelude Rand capability |
| `math/rand/v2` | prelude Rand capability |
| `net/http/cookiejar` | std/cookiejar |
| `net/http/httptest` | std/testing FakeNet, Router.call |
| `net/http/pprof` | std/debug router (decision 0325) |
| `net/mail` | std/mail |
| `net/netip` | std/netip |
| `net/smtp` | std/smtp |
| `os/exec` | prelude Proc, Cmd, Child |
| `path` | std/path |
| `path/filepath` | prelude Fs paths, std/path |
| `regexp` | std/regexp |
| `regexp/syntax` | std/regexp |
| `slices` | prelude List, Map, Set, Ord |
| `sort` | prelude List, Map, Set, Ord |
| `strconv` | prelude Int.parse, parse_base, to_str_base, Float.parse, Bool.parse, quote, unquote |
| `strings` | prelude Str |
| `sync` | prelude Mutex, Atomic, Chan, task.once, semaphore |
| `sync/atomic` | prelude Mutex, Atomic, Chan, task.once, semaphore |
| `testing` | test blocks, std/testing |
| `testing/fstest` | MemFs |
| `testing/quick` | property tests |
| `testing/synctest` | FakeClock, deterministic scheduling under xo test |
| `text/tabwriter` | std/tabwriter (decision 0410) |
| `text/template` | std/template |
| `time` | prelude Time, Duration, std/time |
| `time/tzdata` | std/tzdata, embedded per use |
| `unicode` | prelude Rune |
| `unicode/utf8` | prelude Str, Bytes |

### Partial (34)

Some of it; the notes in the coverage table name what is missing.

| Go package | Xo |
|---|---|
| `bufio` | File, Conn, Child read and write, Fs.walk |
| `crypto/aes` | std/crypto |
| `crypto/cipher` | std/crypto |
| `crypto/ecdh` | inside std/native/llrt (X25519, nistec) |
| `crypto/ecdsa` | std/crypto |
| `crypto/elliptic` | std/crypto |
| `crypto/mlkem` | inside std/native/llrt/mlkem.xo |
| `crypto/rsa` | std/crypto |
| `crypto/tls` | std/http (with_tls, with_roots, tls_cert), std/tls (client) |
| `crypto/x509` | std/crypto (keys); inside std/native/llrt (x509.xo, x509verify.xo) |
| `crypto/x509/pkix` | std/crypto (keys); inside std/native/llrt (x509.xo, x509verify.xo) |
| `database/sql` | std/sql |
| `encoding/asn1` | inside std/native/llrt/asn1.xo |
| `encoding/json` | std/json |
| `encoding/xml` | std/xml |
| `fmt` | string interpolation, Display, Debug |
| `hash` | std/crypto Hasher |
| `html/template` | std/template |
| `io` | File, Conn, Child read and write, Fs.walk |
| `io/fs` | File, Conn, Child read and write, Fs.walk |
| `io/ioutil` | File, Conn, Child read and write, Fs.walk |
| `log/slog` | std/log fields, Format.Json, std/trace |
| `math` | prelude Float |
| `math/big` | std/big |
| `mime` | std/mime |
| `mime/multipart` | std/multipart |
| `mime/quotedprintable` | inside std/native/multipart and mail |
| `net` | prelude Net (TCP, Unix sockets, lookup_host, dial_timeout), std/udp, std/dns (MX, TXT, SRV, PTR), DNS client in std/native/llrt/dns.xo |
| `net/http` | std/http Client |
| `net/http/httputil` | std/http reverse_proxy |
| `net/textproto` | inside std/native/llrt (http1) |
| `net/url` | std/url, std/http parse_url and Url |
| `os` | prelude Fs, Env, Proc, Stdio |
| `os/signal` | core 7.5 shutdown, task.stop_requested, Proc.kill |

### Not applicable by design (49)

Reflection, Go source tooling, cgo and the runtime's internals are replaced by language features or the toolchain, or the algorithm is broken or legacy.

`container/list`, `crypto`, `crypto/fips140`, `crypto/mlkem/mlkemtest`, `debug/buildinfo`, `debug/dwarf`, `debug/elf`, `debug/gosym`, `debug/macho`, `debug/pe`, `debug/plan9obj`, `encoding`, `encoding/ascii85`, `go/ast`, `go/build`, `go/build/constraint`, `go/constant`, `go/doc`, `go/doc/comment`, `go/format`, `go/importer`, `go/parser`, `go/printer`, `go/scanner`, `go/token`, `go/types`, `go/version`, `iter`, `math/cmplx`, `net/http/cgi`, `net/http/fcgi`, `net/http/httptrace`, `plugin`, `reflect`, `runtime`, `runtime/cgo`, `runtime/coverage`, `runtime/debug`, `runtime/metrics`, `runtime/pprof`, `runtime/race`, `runtime/trace`, `structs`, `syscall`, `testing/cryptotest`, `testing/iotest`, `testing/slogtest`, `text/template/parse`, `unsafe`

### Gaps, potentially planned (24)

Nothing yet, wanted. See [Roadmap of gaps](#roadmap-of-gaps).

| Go package | Xo |
|---|---|
| `compress/bzip2` | none |
| `compress/lzw` | none |
| `container/ring` | none |
| `crypto/des` | none |
| `crypto/dsa` | none |
| `crypto/hpke` | none |
| `crypto/rc4` | none |
| `encoding/gob` | none |
| `hash/adler32` | std/adler32 |
| `hash/crc64` | std/crc64 |
| `hash/maphash` | none |
| `image` | none |
| `image/color` | std/image |
| `image/jpeg` | std/jpeg |
| `image/png` | std/png |
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

The repository's coverage table still lists some of these as not planned (for example `encoding/gob`, `net/rpc`, `text/scanner`, `log/syslog`, `container/ring`, `index/suffixarray`, the image packages); this page follows the owner's list, and the table moves with the decision. CBOR is not a Go package; it is listed because it is first on the list.

Sources: [std-coverage.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md), [std/changes](https://github.com/xo-lang/xo/blob/main/std/changes/README.md) (every module's change log), [decision 0276](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0276-std-follows-go-std.md) and [decision 0461](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0461-std-module-maturity.md).
