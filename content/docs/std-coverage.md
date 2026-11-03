---
title: "Standard library coverage"
linkTitle: "Std coverage"
description: "Which of Go's 176 standard packages Xo covers, what is beyond Go, what is not applicable by design, what is a gap with its priority, and a maturity level for each std module with its evidence."
weight: 7
toc: true
---

As of Xo 0.36 (development, main 3ebae9006 of 2026-11-02); Go 1.26.1. Every count below comes from a command run on that commit: `go list std` without internal and vendor packages, and the table in the repository's [std-coverage.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md) (decision 0276: Go's standard library is std's reference scope).

## Summary

Go has **176** public standard library packages. Xo has **48** `std` modules besides the prelude (the builtin types and capabilities every program sees).

| Status | Go packages |
|---|---|
| Covered (done) | 64 |
| Partial | 33 |
| Not applicable by design | 52 |
| Gap, potentially planned | 27 |

Beyond Go: modules with no Go standard library counterpart, or going past it, are listed under [Beyond Go](#beyond-go).

## Maturity levels

Each `std` module gets three marks, one per axis, and an overall level that is the weakest of the three (owner, 2026-11-02, decision 0461).

| Axis | {{< level "Early" >}} | {{< level "Solid" >}} | {{< level "Proven" >}} |
|---|---|---|---|
| Features, against Go's package or the domain | core uses | common uses, gaps listed | near full parity, or beyond Go |
| Testing | own tests | Go's tests ported or a Go differential; parsers fuzzed | also `--race` and load stress clean, long fuzz runs, security reviewed where it applies (crypto, tls, http, x509) |
| Performance | not measured, or measured and above 2x Go | measured against Go, within 2x | at or better than Go on its benchmark |

How a mark is read here: *Features* from the rows of the coverage table that name the module (all done is Proven, any partial is Solid; a module with no Go package is Solid and says so). *Testing* from the committed corpus of Go's tests under `internal/stdtest/testdata/corpus`, Go differential tests, and fuzz tests for modules that parse untrusted input. *Performance* from a committed result file with a Go twin. A mark with no committed evidence is Early, so a missing result is the gap to close, not a hidden number. The dates are those of the result files, which can be older than this page; a re-run can only move a mark if the file is replaced.

Today: overall 0 Proven, 6 Solid, 43 Early of 49 (prelude and 48 modules). Per axis, features 22/27/0, testing 0/24/25, performance 5/6/38 (Proven/Solid/Early). No module has the committed `--race`, load stress, long fuzz and security review evidence that Proven testing needs yet.

### Per module

| Module | Overall | Features | Testing | Performance | Added |
|---|---|---|---|---|---|
| `prelude` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 15 of 18 mapped Go rows done, 3 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/prelude" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | go-compiler-final (2026-10-08) |
| `std/archive` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 2 mapped Go rows done | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/archive" >}} Go's tests ported; parser with no fuzz harness | {{< level "Early" >}} no committed row against Go | v0.11.0 (2026-10-11) |
| `std/backoff` | {{< level "Early" >}} | {{< level "Solid" >}} beyond Go: no Go std package | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/backoff" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/base32` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/base32" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.23.0 (2026-10-20) |
| `std/base64` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/base64" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.23.0 (2026-10-20) |
| `std/big` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/big" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.24.0 (2026-10-21) |
| `std/binary` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/binary" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.23.0 (2026-10-20) |
| `std/cli` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/cli" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.11.0 (2026-10-11) |
| `std/compress` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 2 mapped Go rows done | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/compress" >}} Go's tests ported; parser with no fuzz harness | {{< level "Early" >}} no committed row against Go | v0.24.0 (2026-10-21) |
| `std/crc32` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crc32" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/crypto` | {{< level "Solid" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 12 of 16 mapped Go rows done, 4 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/crypto" >}} Go's tests ported | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/aesgcm-2026-10-22.md" >}} AES-GCM bulk loop 1.12, ChaCha20-Poly1305 1.2 of Go (2026-10-22) | v0.7.0 (2026-10-08) |
| `std/csv` | {{< level "Solid" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/csvfuzz/csvfuzz_test.xo" >}} Go's tests ported; fuzz corpus against encoding/csv (2,000 texts under random Reader options, error texts exact, and the Writer's output; internal/stdtest/csvfuzz_test.go runs fresh seeds) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/csv-parse-2026-10-22.md" >}} 0.91 of Go's instructions (2026-10-22) | v0.11.0 (2026-10-11) |
| `std/debug` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.25.0 (2026-10-21) |
| `std/deque` | {{< level "Early" >}} | {{< level "Solid" >}} no Go package maps to it; covers its own domain's common uses | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/deque" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | unreleased (2026-10-30) |
| `std/dns` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/embed` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.24.0 (2026-10-21) |
| `std/fnv` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/fnv" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/go` | {{< level "Early" >}} | {{< level "Solid" >}} no Go package maps to it; covers its own domain's common uses | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.7.0 (2026-10-08) |
| `std/html` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/http` | {{< level "Solid" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 1 of 5 mapped Go rows done, 4 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/httpheadfuzz_test.go" >}} Go's tests ported; request head, response and URL fuzz tests | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/tls-h2-vs-go-2026-10-21.md" >}} HTTP/2 14 us a request against Go's 32; /alloc 0.97 of v0.35.0 (2026-11-02) | v0.7.0 (2026-10-08) |
| `std/json` | {{< level "Solid" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/jsonfuzz/jsonfuzz_test.xo" >}} Go's tests ported; fuzz corpus against encoding/json (2,003 cases; internal/stdtest/jsonfuzz_test.go runs fresh seeds) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md" >}} 0.33 to 0.49 of Go's instructions on native (2026-10-21) | v0.7.0 (2026-10-08) |
| `std/log` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 1 of 2 mapped Go rows done, 1 partial | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.7.0 (2026-10-08) |
| `std/mail` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/mail" >}} Go's tests ported; parser with no fuzz harness | {{< level "Early" >}} no committed row against Go | v0.23.0 (2026-10-20) |
| `std/metrics` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 2 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/metrics" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.25.0 (2026-10-21) |
| `std/mime` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/mime" >}} Go's tests ported; parser with no fuzz harness | {{< level "Early" >}} no committed row against Go | v0.23.0 (2026-10-20) |
| `std/multipart` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/multipart" >}} Go's tests ported; parser with no fuzz harness | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/json-vs-go-2026-10-21.md" >}} parse 1.15 of Go's instructions (2026-10-21) | v0.23.0 (2026-10-20) |
| `std/netip` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/netip" >}} Go's tests ported; parser with no fuzz harness | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/netip-2026-10-22.md" >}} 1.58 of Go's instructions (2026-10-22) | v0.23.0 (2026-10-20) |
| `std/path` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 2 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/path" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.7.0 (2026-10-08) |
| `prelude` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 15 of 18 mapped Go rows done, 3 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/prelude" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | go-compiler-final (2026-10-08) |
| `std/rate` | {{< level "Early" >}} | {{< level "Solid" >}} beyond Go: x/time/rate is outside std | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/rate" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/regexp` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/regexp" >}} Go's tests ported; parser with no fuzz harness | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/regexp-ascii-bitmap-inline-2026-10-22.md" >}} replace 1.68, match about 1.9 of Go (2026-10-22) | v0.11.0 (2026-10-11) |
| `std/smtp` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/smtp" >}} Go's tests ported; parser with no fuzz harness | {{< level "Early" >}} no committed row against Go | v0.24.0 (2026-10-21) |
| `std/sql` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 2 of 3 mapped Go rows done, 1 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/sql" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.7.0 (2026-10-08) |
| `std/tabwriter` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/tabwriter" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/task` | {{< level "Early" >}} | {{< level "Solid" >}} no Go package maps to it; covers its own domain's common uses | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.7.0 (2026-10-08) |
| `std/template` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 1 of 2 mapped Go rows done, 1 partial | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/template" >}} Go's tests ported; parser with no fuzz harness | {{< level "Early" >}} no committed row against Go | v0.24.0 (2026-10-21) |
| `std/term` | {{< level "Early" >}} | {{< level "Solid" >}} no Go package maps to it; covers its own domain's common uses | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.11.0 (2026-10-11) |
| `std/testing` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 2 mapped Go rows done | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.7.0 (2026-10-08) |
| `std/time` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/time" >}} Go's tests ported; parser with no fuzz harness | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/bench/results/time-format-2026-10-22.md" >}} format still above Go (2.5x on 2026-10-22), over the 2x line | v0.7.0 (2026-10-08) |
| `std/tls` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/llvm/tls13_diff_test.go" >}} TLS 1.3 client and server differential against Go; parser with no fuzz harness | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/bench/results/tls-h2-vs-go-2026-10-21.md" >}} HTTP/2 14 us a request against Go's 32; handshakes mixed (2026-10-21) | v0.23.0 (2026-10-20) |
| `std/toml` | {{< level "Early" >}} | {{< level "Solid" >}} beyond Go: Go has no TOML in std | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.11.0 (2026-10-11) |
| `std/trace` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.25.0 (2026-10-21) |
| `std/udp` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/url` | {{< level "Solid" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/httpurlfuzz_test.go" >}} Go's tests ported; URL fuzz test | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/url-parse-2026-10-23.md" >}} 0.78 of Go's instructions (2026-10-23) | v0.23.0 (2026-10-20) |
| `std/uuid` | {{< level "Early" >}} | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} all 1 mapped Go rows done | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/uuid" >}} Go's tests ported | {{< level "Early" >}} no committed row against Go | v0.23.0 (2026-10-20) |
| `std/websocket` | {{< level "Early" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Early" >}} own tests only | {{< level "Early" >}} no committed row against Go | v0.24.0 (2026-10-21) |
| `std/x509` | {{< level "Early" >}} | {{< level "Solid" >}} no Go package maps to it; covers its own domain's common uses | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/x509/x509_test.xo" >}} Go's tests ported; fuzz cases in its corpus | {{< level "Early" >}} no committed row against Go | v0.35.0 (2026-10-29) |
| `std/xml` | {{< level "Solid" >}} | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md" >}} 0 of 1 mapped Go rows done, 1 partial | {{< level "Solid" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/xmlfuzz/xmlfuzz_test.xo" >}} Go's tests ported; fuzz corpus against encoding/xml (2,000 documents through Token, Token not strict, and RawToken, error texts exact; internal/stdtest/xmlfuzz_test.go runs fresh seeds) | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/xml-parse-2026-10-22.md" >}} 1.00 of Go's instructions (2026-10-22) | v0.24.0 (2026-10-21) |
| `std/xmlcodec` | {{< level "Early" >}} | {{< level "Solid" >}} no Go package maps to it; covers its own domain's common uses | {{< level "Early" "https://github.com/xo-lang/xo/blob/main/internal/stdtest/testdata/corpus/xmlcodec" >}} Go's tests ported; parser with no fuzz harness | {{< level "Proven" "https://github.com/xo-lang/xo/blob/main/bench/results/xml-parse-2026-10-22.md" >}} 1.00 of Go's instructions (2026-10-22) | v0.24.0 (2026-10-21) |

## Go packages

All 176 packages of `go list std`, by status. A package that maps to a module names it; the repository's coverage table has the notes per row.

### Covered (64)

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

### Partial (33)

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
| `net/textproto` | inside std/native/llrt (http1) |
| `net/url` | std/url, std/http parse_url and Url |
| `os` | prelude Fs, Env, Proc, Stdio |
| `os/signal` | core 7.5 shutdown, task.stop_requested, Proc.kill |

### Not applicable by design (52)

Reflection, Go source tooling, cgo and the runtime's internals are replaced by language features or the toolchain, or the algorithm is broken or legacy.

`container/list`, `crypto`, `crypto/fips140`, `crypto/mlkem/mlkemtest`, `debug/buildinfo`, `debug/dwarf`, `debug/elf`, `debug/gosym`, `debug/macho`, `debug/pe`, `debug/plan9obj`, `encoding`, `encoding/ascii85`, `go/ast`, `go/build`, `go/build/constraint`, `go/constant`, `go/doc`, `go/doc/comment`, `go/format`, `go/importer`, `go/parser`, `go/printer`, `go/scanner`, `go/token`, `go/types`, `go/version`, `image/color/palette`, `image/draw`, `image/gif`, `iter`, `math/cmplx`, `net/http/cgi`, `net/http/fcgi`, `net/http/httptrace`, `plugin`, `reflect`, `runtime`, `runtime/cgo`, `runtime/coverage`, `runtime/debug`, `runtime/metrics`, `runtime/pprof`, `runtime/race`, `runtime/trace`, `structs`, `syscall`, `testing/cryptotest`, `testing/iotest`, `testing/slogtest`, `text/template/parse`, `unsafe`

### Gaps, potentially planned (27)

Nothing yet, wanted. See [Roadmap of gaps](#roadmap-of-gaps).

| Go package | Xo |
|---|---|
| `compress/bzip2` | none |
| `compress/lzw` | none |
| `container/heap` | none |
| `container/ring` | none |
| `crypto/des` | none |
| `crypto/dsa` | none |
| `crypto/hpke` | none |
| `crypto/rc4` | none |
| `encoding/gob` | none |
| `hash/adler32` | none |
| `hash/crc64` | none |
| `hash/maphash` | none |
| `image` | none |
| `image/color` | none |
| `image/jpeg` | none |
| `image/png` | none |
| `index/suffixarray` | none |
| `log/syslog` | none |
| `net/http/cookiejar` | none |
| `net/http/httputil` | none |
| `net/rpc` | none |
| `net/rpc/jsonrpc` | none |
| `os/user` | Env.home |
| `text/scanner` | none |
| `unicode/utf16` | none |
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
| 1 | CBOR; `image/png`, `image/jpeg` | Q4 2026 |
| 2 | `encoding/gob`, `net/rpc`; `compress/bzip2`, `compress/lzw`; small hashes (`hash/crc64`, `hash/adler32`); `os/user`; `log/syslog`; `expvar`; `text/scanner`; `container/ring`; `unicode/utf16`; `index/suffixarray` | Q1 2027 |
| 3 | legacy crypto (`crypto/des`, `crypto/dsa`, `crypto/rc4`); `weak`, `unique` | last, or possibly never |

The repository's coverage table still lists some of these as not planned (for example `encoding/gob`, `net/rpc`, `text/scanner`, `log/syslog`, `container/ring`, `index/suffixarray`, the image packages); this page follows the owner's list, and the table moves with the decision. CBOR is not a Go package; it is listed because it is first on the list.

Sources: [std-coverage.md](https://github.com/xo-lang/xo/blob/main/knowledgebase/infrastructure/std-coverage.md), [std/changes](https://github.com/xo-lang/xo/blob/main/std/changes/README.md) (every module's change log), [decision 0276](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0276-std-follows-go-std.md) and [decision 0461](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0461-std-module-maturity.md).
