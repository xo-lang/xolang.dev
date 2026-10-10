---
title: "A small web service"
description: "std/http routing, JSON, typed path parameters, errors that map to status codes, and in process tests."
weight: 11
---

{{% example "webservice" %}}

- `"GET /todos/{id:Int}"` declares a typed path parameter. A request with a
  non numeric id gets a 400 before the handler runs.
- `derive Json` on `Todo` generates the encoder `http.json` uses.
- A handler can fail. `ApiErr` has `status` and `display` methods, so a
  `NotFound` becomes a 404 with a JSON error body. Any other error is a 500,
  and a fault in a handler is isolated to that request.
- `r.call(request)` runs the router in process, so the test needs no network.
- `main` is the only place that touches the network: `os.net.listen` gives
  the listener to the server.
