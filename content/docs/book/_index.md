---
title: "The Xo book"
linkTitle: "Book overview"
description: "Longer chapters after the tour: effects and capabilities, errors, concurrency, HTTP services, testing with fakes, modules, and deploying."
weight: 25
---

The [tour](/docs/tour/) shows the language in twelve short steps. The book
goes deeper on the parts that make Xo different, one topic per chapter. Every
program in a chapter is checked, run, and tested with the current toolchain
before the site is published, and the output shown is what it printed.

1. [Effects and capabilities](/docs/book/01-effects-and-capabilities/): what a
   signature says a function can reach, and how to hand out less.
2. [Error handling](/docs/book/02-error-handling/): errors as values, `from`
   chains, the `??` forms, and when a bug is a fault instead.
3. Concurrency (planned): tasks, channels, scopes, and isolation.
4. HTTP services (planned): handlers, routing, and a service built from the
   standard library.
5. Testing with fakes (planned): the fake `Os`, virtual time, and tests that
   never touch the network.
6. Modules (planned): `xo.mod`, editions, dependencies, and publishing.
7. Deploying (planned): cross compiling and shipping one binary.

For the API of every standard module, see the
[std reference](/docs/stdlib/).
