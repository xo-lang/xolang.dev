---
title: "Using Go packages"
description: "use go to call any Go package, with bindings generated automatically."
weight: 12
---

Until Xo has its own ecosystem, any Go package is one line away:

{{% example "gointerop" %}}

- A program that uses Go packages builds with the Go backend: `xo run
  --backend=go .` (it needs the Go toolchain). Without the flag, `xo`
  stops and names the package, since the default backend is native.
- `xo check`, `build`, `run`, and `test` generate the bindings themselves.
- Names follow Xo's style: `ToUpper` is `to_upper`.
- Go's `(T, error)` becomes `T ! go.Error`, so `url.parse(...)?` works like
  any Xo call, and a pointer that may be nil becomes `T?`.
- Every call into Go performs the `go` effect. Go code can reach files and
  the network without a capability, so a `pub` function that calls Go must
  say `uses go`, and that escape stays visible in signatures.

Native builds can call C the same way with `use c "header.h"`; see section
4.5 of the [specification](../../spec/core/#45-c-headers-p2-native-builds).

That is the tour. The [specification](../../spec/core/) covers everything in
full, and the [diagnostics reference](../../diagnostics/) explains every
error code.
