---
title: "Structured concurrency"
description: "Scopes, tasks, await, channels, and cancellation without ctx plumbing."
weight: 9
---

{{% example "concurrency" %}}

- `scope s { ... }` is an expression. `s.spawn(f)` starts a task inside it,
  and `t.await` waits for its result.
- No task outlives its scope. When the body finishes, the scope waits for its
  tasks; when it fails or returns early, it cancels them and waits for them
  to unwind. There are no leaked goroutines to find later.
- If a task fails, the scope cancels its siblings and the error propagates
  like `?`.
- Channels work as in Go: `for x in ch` receives until the channel is closed
  and drained, and `select` waits on several at once.
- Deadlines and cancellation flow down the scope tree, so there is no `ctx`
  parameter to thread through every call.
- `xo test` runs tasks on a deterministic scheduler, and
  `xo test --explore=N` searches other interleavings for a failing one.
