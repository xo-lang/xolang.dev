---
title: "One todo app built with std/ui and by hand"
date: 2026-11-20T09:00:00-05:00
description: "We built the same small app twice: once with std/ui, where the server and the browser run one Xo update function, and once the usual way, with hand written HTML, CSS and JavaScript over a JSON API and server-sent events. Then we measured both in Chrome: latency, bytes, what is in the HTML, and the code each needs."
draft: true
---

std/ui is Xo's library for web apps: you write a Model, a Msg type, an
`update` function and a `view` function, and std/ui serves the page,
renders it on the server, and keeps every browser in step. With its wasm
client, the browser runs the same `update` and `view` compiled to
WebAssembly, so an action shows before the server answers.

The usual alternative is a split: a static front end written in HTML,
CSS and JavaScript, talking to a JSON API. We wanted numbers, not a
feeling, so we built one app both ways and measured them side by side.
Every figure below is from
[bench/results/ui-vs-split-2026-11-20.md](https://github.com/xo-lang/xo/blob/main/bench/results/ui-vs-split-2026-11-20.md).

## The app

The app is `examples/ui-todo`: a todo list plus three seats people can
reserve. It runs three ways, and all three share one Model and one
`todo.update`:

- **ui**: std/ui with its wasm client.
- **thin**: the same server started with `thin`, which sends only std/ui's
  runtime JavaScript, so every action waits for the server's view.
- **split**: `examples/ui-todo/split`, a hand written front end embedded
  in the binary and served as files. The API is `GET /api/state` and
  `POST /api/msg`, and server-sent events on `GET /api/events` push each
  change. The browser renders the Model itself.

Sharing `update` keeps the comparison honest. The split version's server
does the same work as std/ui's, so the differences come from the front
end and the wire, not from the business logic.

We drove each site in headless Chrome at phone width on the Mac Studio,
with the cache off. Each run added 30 todos with nothing else in flight,
then 30 more with 100 ms of latency added to every request, and the
whole thing ran three times.

## Latency

Each figure is the time from submitting the form until the new todo is
in the page, as p50 in ms across the three rounds:

| | ui | thin | split |
|---|---|---|---|
| no added latency | 1.3 to 1.6 | 1.9 to 2.4 | 1.7 to 2.3 |
| 100 ms added latency | 1.5 to 1.9 | 108.7 to 109.7 | 107.9 to 110.8 |

On a fast network the three sites are the same. With 100 ms of latency,
thin and split both wait one round trip, because both show the server's
answer. The wasm client shows the todo in about 2 ms either way: it runs
`update` locally, and the server's reply confirms it later.

## Bytes

| | ui | thin | split |
|---|---|---|---|
| Cold load, bytes on the wire | 106,025 | 11,685 | 4,410 |
| Server binary | 6,682,110 | same binary | 4,917,601 |

The split front end is the smallest first load, and it isn't close.
std/ui's runtime, `ui.js`, is 9,059 bytes on the wire, and the wasm
module is 93,863 of the 106,025. That module is what buys the 2 ms adds, so thin is the right
mode when first load matters more than latency. Note that `http.file_server`
sent split's files uncompressed: gzipped, they would be smaller still.

## What is in the HTML

Fetch `/` with no browser and you get different pages. ui and thin
include the rendered todos, because std/ui renders the page on the
server. That serves search engines, readers without JavaScript, and a
first paint before any script runs. split's HTML is an empty list until
`app.js` fetches the state. A split app can render on the server too,
but then the view lives in two places, which is the next point.

## Code

Not counting the Model and `update` that both share:

| | ui and thin | split |
|---|---|---|
| Rendering | `view`, 28 lines of Xo, plus `app`, 5 | `app.js`, 57 lines of JavaScript; `index.html`, 21 |
| Styles | 19 lines | 16 lines |
| Server | 23 lines | 91 lines (the API, the event stream, a subscriber map) |
| Client build | 9 lines | none |
| Total | 84 lines, one language | 185 lines, four languages |

The line counts matter less than what `app.js` repeats. It writes out
the Model's field names and the JSON form of each Msg
(`{"Add":{"title":...}}`) by hand, and nothing checks them against the
server's types. Rename a field in `todo.Model`, and std/ui fails to
compile, while split shows a blank list.

## What the comparison found in std/ui

Measuring found a std/ui inefficiency. When adds ran back to back, with
no gap between them, thin took two round trips per add (215 ms at 100
ms latency). A trace showed three `POST /_xo/sync` per add. The live
channel's notice for a change arrives while that change's own sync is
still in flight, and it queues another sync that has nothing new to
fetch. A single add is still one round trip, as in the table above.
The fix is task #500.

## When to use which

- **std/ui with its wasm client** when actions should feel instant on a
  slow network, and a 100 KB first load is fine.
- **std/ui thin** when the first load must be small and one round trip
  per action is fine. You still get server rendering and a single
  language.
- **A split front end** when the front end is its own product, with its
  own team and its own build, or when you need the smallest possible
  static bundle and accept writing the view and the wire format twice.
