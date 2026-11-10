---
title: "Documentation"
description: "Start here: install Xo, write a first program, and find the specification."
---

Xo (pronounced *ex-oh*) is a small, statically typed language for backends, tools, and
web services, designed so AI agents can write, check, cross compile, and debug
programs with fast, structured feedback.

- [Why Xo? (FAQ)](faq/): what Xo is for, how it relates to Go, and what experimental means.
- [Xo and Go](xo-and-go/): how they relate, where each is the better choice, and measured numbers with sources.
- [Xo and Rust](xo-and-rust/), [Xo and TypeScript](xo-and-typescript/), [Xo and Python](xo-and-python/): the same comparison against each, with the rows where Xo is slower.
- [Performance](performance/): measured speed, memory, compile time and binary size against Go, each figure linked to its results file, with the rows where Xo is behind.
- [Getting started](getting-started/): build the toolchain and run a first program.
- [A tour of Xo](tour/): twelve short steps through the language.
- [Dependencies and capabilities](dependencies/): limit what a dependency can do, with ceilings, the effect lock, vouches, and `xo audit`.
- [Diagnostic codes](diagnostics/): every error code, with an example and a fix.
- [Roadmap](/roadmap/): what is done, in progress, and next on the way to 1.0.
- [Core language specification](spec/core/): the source of truth for syntax and semantics.
- [Standard library](spec/std/): prelude methods and the `std` packages.
- [Conventions](spec/conventions/): how to write Xo, each rule marked enforced (by the checker, `xo fmt` or `xo vet`) or advisory, with its source.
- [Standard library coverage](std-coverage/): which of Go's standard library packages Xo covers, what is beyond Go, the gaps, and a maturity level for each module with its evidence.

Every page is also available as Markdown for agents: add `index.md` to its URL,
or start from [/llms.txt](/llms.txt).
