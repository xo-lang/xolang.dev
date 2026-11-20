---
title: "Build a todo app with std/ui, then build it again by hand"
date: 2026-11-20T09:00:00-05:00
description: "A step by step tutorial: a shared todo list in Xo with std/ui, where the server and the browser run one update function, from the Model to a wasm client that shows each action before the server answers. Then the same app built the usual way, with hand written HTML, CSS and JavaScript over a JSON API, and measurements of both in Chrome."
draft: true
---

std/ui is Xo's library for web apps. You write four things: a Model, a
Msg type, an `update` function and a `view` function. std/ui serves the
page, renders it on the server, and keeps every browser in step. Add its
wasm client and the browser runs the same `update` and `view` compiled
to WebAssembly, so an action shows before the server answers.

This post builds one app, `examples/ui-todo` in the Xo repository, step
by step: a todo list plus three seats that people can reserve. Then it
builds the same app the usual way, a hand written front end over a JSON
API, and measures the two side by side. Every figure is from
[bench/results/ui-vs-split-2026-11-20.md](https://github.com/xo-lang/xo/blob/main/bench/results/ui-vs-split-2026-11-20.md).

## 1. The layout

The app is one module with three packages:

```
examples/ui-todo/
  xo.mod          module example.com/uitodo
  todo/todo.xo    the Model, Msg, update, view and styles
  server/main.xo  the server
  client/main.xo  the browser's copy, built for wasm
```

`todo` holds everything the app is. The server and the client are a few
lines each that hand `todo` to std/ui.

## 2. The Model and the Msg

The Model is all the state there is. Each Msg is one thing a person can
do:

```xo
use std/ui

pub struct Todo {
  id: Int
  title: Str
  done: Bool
} derive Eq, Json

pub struct Model {
  todos: List[Todo]
  next_id: Int
  seats: Int
  holders: List[Str]
} derive Eq, Json

pub enum Msg {
  Add(title: Str)
  Toggle(id: Int)
  Remove(id: Int)
  Reserve(name: Str)
} derive Eq, Json

/// The Model a new list starts from: no todos and three seats.
pub fn initial() -> Model {
  Model{todos: [], next_id: 1, seats: 3, holders: []}
}
```

`derive Json` is how a Model and a Msg cross the wire. You never write
that encoding yourself; that matters later.

## 3. update

`update` takes the Model and a Msg and returns the next Model. It is a
plain function: no I/O, no clock, nothing that can differ between the
server and a browser, which is what lets both of them run it.

```xo
pub fn update(m: Model, msg: Msg) -> Model {
  var n = m
  match msg {
    Add(title) => {
      let t = title.trim()
      if t != "" && t.rune_count() <= 200 {
        n.todos.push(Todo{id: n.next_id, title: t, done: false})
        n.next_id = n.next_id + 1
      }
    }
    Toggle(id) => {
      n.todos = n.todos.map(fn(t) { if t.id == id { Todo{id: t.id, title: t.title, done: !t.done} } else { t } })
    }
    Remove(id) => {
      n.todos = n.todos.filter(fn(t) { t.id != id })
    }
    Reserve(name) => {
      let who = name.trim()
      if who != "" && n.seats > 0 && !n.holders.contains(who) {
        n.seats = n.seats - 1
        n.holders.push(who)
      }
    }
  }
  n
}
```

The checks live here, so they hold everywhere: an empty title adds
nothing, and a fourth reservation gets no seat. A test says so directly,
in `todo/todo_test.xo`:

```xo
test "update ignores empty titles and holds three seats" {
  var m = app().init
  m = update(m, Msg.Add(title: "  "))
  expect(m.todos.len()) == 0
  m = update(m, Msg.Add(title: " milk "))
  expect(m.todos[0].title) == "milk"
  for n in ["a", "b", "a", "c", "d"] {
    m = update(m, Msg.Reserve(name: n))
  }
  expect(m.holders) == ["a", "b", "c"]
  expect(m.seats) == 0
}
```

## 4. view

`view` turns a Model into HTML. Events are Msgs: `ui.on("click",
Msg.Toggle(id: id))` sends that Msg when the button is clicked, and
`ui.field("title")` fills a Msg's field from the form's input when the
form is submitted.

```xo
pub fn view(m: Model) -> ui.Html {
  var items: List[ui.Html] = []
  for t in m.todos {
    let id = t.id
    items.push(ui.el("li", [ui.attr("class", if t.done { "done" } else { "" })], [
      ui.el("button", [ui.attr("class", "check"), ui.attr("aria-label", "toggle"), ui.on("click", Msg.Toggle(id: id))], [ui.text(if t.done { "✓" } else { " " })]),
      ui.el("span", [], [ui.text(t.title)]),
      ui.el("button", [ui.attr("class", "remove"), ui.attr("aria-label", "remove ${t.title}"), ui.on("click", Msg.Remove(id: id))], [ui.text("Remove")]),
    ]))
  }
  ui.el("main", [], [
    ui.el("h1", [], [ui.text("Todos")]),
    ui.el("form", [ui.on("submit", Msg.Add(title: ui.field("title")))], [
      ui.el("input", [ui.attr("name", "title"), ui.attr("placeholder", "What needs doing?"), ui.attr("autocomplete", "off")]),
      ui.el("button", [ui.attr("type", "submit")], [ui.text("Add")]),
    ]),
    ui.el("ul", [], items),
    ui.el("h2", [], [ui.text("Seats: ${m.seats} left")]),
    ui.el("form", [ui.on("submit", Msg.Reserve(name: ui.field("name")))], [
      ui.el("input", [ui.attr("name", "name"), ui.attr("placeholder", "Your name"), ui.attr("autocomplete", "off")]),
      ui.el("button", [ui.attr("type", "submit")], [ui.text("Reserve")]),
    ]),
    ui.el("p", [ui.attr("class", "holders")], [ui.text(if m.holders.is_empty() { "No reservations yet." } else { "Reserved: ${m.holders.join(", ")}" })]),
    ui.el("p", [ui.attr("class", "status")], []),
  ])
}
```

The Msg in `ui.on` is a value of the `Msg` type, so a typo in a Msg name
or a field is a compile error, not a click that does nothing.

## 5. The App, and the one Msg that must wait

`app` puts the pieces together:

```xo
pub fn app() -> ui.App[Model, Msg] {
  // A seat is the server's to give: Reserve waits for its answer.
  ui.app(initial(), update, view).confirming(fn(m) { m is Msg.Reserve(_) })
}
```

With a wasm client, the browser shows each Msg's result at once and the
server confirms it. That is right for a todo, and wrong for a seat: two
people can each see a free seat in their own browser. `confirming` names
the Msgs that wait for the server's answer instead, so the last seat
goes to whoever the server heard first.

## 6. The server

```xo
use std/http
use std/log
use std/ui
use example.com/uitodo/todo

const CLIENT: Bytes = embed.build("example.com/uitodo/client", "wasip1/wasm")

fn main(os: Os) ! {
  let args = os.env.args()
  let addr = args.get(0) ?? ":8080"
  let client = if args.get(1) == Some("thin") { b"" } else { CLIENT }
  var r = http.router()
  ui.host(todo.app(), title: "Todos", css: todo.CSS, client: client).mount(r)
  let l = os.net.listen(addr)?
  log.info("listening", {"addr": l.addr(), "client_bytes": "${client.len()}"})
  http.server(l, r).serve()?
}
```

`ui.host(...).mount(r)` adds std/ui's routes to an ordinary `http`
router: the page at `/`, its runtime script, the sync endpoint the
browser posts Msgs to, and the live channel that tells every open
browser about a change. Run it with `xo run ./server -- :8080` and open
two windows: an add in one shows in the other.

The page std/ui sends is rendered on the server, todos included, so it
reads fine before any script runs. The same router serves a test, with
no network:

```xo
test "a browser's sync adds a todo and returns the view" {
  var r = http.router()
  ui.host(app(), title: "Todos", css: CSS).mount(r)
  let page = r.call(http.new_request("GET", "/")).text()?
  expect(page.contains("<style>")) == true
  let up = ui.Up{client: "b1", ver: 0, msgs: [ui.Envelope{seq: 1, msg: Msg.Add(title: "milk")}]}
  let resp = r.call(http.new_request("POST", "/_xo/sync?thin=1", headers: {"Content-Type": "application/json"}, body: json.encode(up)))
  let s = json.decode_str[ui.Sync[Model, Msg]](resp.text()?)?
  expect(s.ver) == 1
  expect(s.html.contains("<span>milk</span>")) == true
}
```

## 7. The wasm client

The client is the whole of `client/main.xo`:

```xo
use std/ui
use example.com/uitodo/todo

fn main(os: Os) ! {
  ui.client_main(os.stdio, todo.app())?
}
```

The server's `embed.build("example.com/uitodo/client", "wasip1/wasm")`
builds it for wasm as part of the server's own build and puts the module
in the binary ([decision 0663](https://github.com/xo-lang/xo/blob/main/knowledgebase/decisions/0663-embed-built-wasm-client.md)).
There is no separate front end build, no bundler and no second
deployment. Started with `thin` as its second argument, the same binary
sends no module, and every Msg waits for the server's view.

## 8. Styles, and what the browser is waiting for

The styles are a Xo string, `todo.CSS`, that `ui.host` puts in the page.
Three of its rules use attributes std/ui's runtime sets on `<html>`:

```css
html[data-xo-pending] .status::after{content:"Saving…";color:#374151}
html[data-xo-offline] .status::after{content:"Offline: changes will be sent when you reconnect.";color:#b91c1c}
html[data-xo-awaiting] .holders::after{content:" (waiting for the server)";color:#374151}
```

`data-xo-pending` is set while a Msg is not yet confirmed,
`data-xo-offline` while a sync cannot reach the server (the wasm client
keeps working and sends its Msgs once it can), and `data-xo-awaiting` while a
`confirming` Msg such as Reserve waits for its answer. That is the whole
loading and offline UI.

## The same app, by hand

For comparison, `examples/ui-todo/split` builds the app the usual way: a
static front end in `static/` (HTML, CSS and JavaScript), embedded in the
binary and served as files, talking to a JSON API. It keeps the same
Model and calls the same `todo.update`, so the server does the same work
and the differences come from the front end and the wire.

The server needs an API where std/ui had `mount`: a state endpoint, a
Msg endpoint, and a server-sent events stream with a map of subscribers
to wake on each change. The Msg endpoint:

```xo
r.handle("POST /api/msg", fn(req) {
  match req.json[todo.Msg]() {
    Ok(msg) => {
      let snap = st.with(fn(var s: State) -> Snap {
        s.snap = Snap{ver: s.snap.ver + 1, model: todo.update(s.snap.model, msg)}
        for (_, ch) in s.subs {
          // a stream already woken reads the newest Model anyway
          let _sent = ch.try_send(s.snap.ver)
        }
        s.snap
      })
      http.json(200, snap)
    }
    Err(e) => http.text(400, "bad Msg: ${e.display()}")
  }
})
```

The events stream is another 30 lines, and the whole server is 91 lines
against std/ui's 23. The files are one line:

```xo
const STATIC: embed.Dir = embed("static")
// ...
r.handle("GET /", http.file_server(STATIC.sub("static").fs()))
```

`index.html` holds the page's skeleton with an empty list, and `app.js`
draws the Model into it. This is `view` again, written in JavaScript:

```js
function render(snap) {
  if (snap.ver <= ver) return;
  ver = snap.ver;
  const m = snap.model;
  $("todos").replaceChildren(...m.todos.map((t) =>
    el("li", { class: t.done ? "done" : "" }, [
      el("button", { class: "check", "aria-label": "toggle", onclick: () => send({ Toggle: { id: t.id } }) }, [t.done ? "✓" : " "]),
      el("span", {}, [t.title]),
      el("button", { class: "remove", "aria-label": "remove " + t.title, onclick: () => send({ Remove: { id: t.id } }) }, ["Remove"]),
    ])));
  $("seats").textContent = "Seats: " + m.seats + " left";
  $("holders").textContent = m.holders.length ? "Reserved: " + m.holders.join(", ") : "No reservations yet.";
}
```

and the wire format, written out by hand:

```js
form("add", "title", (title) => ({ Add: { title } }));
form("reserve", "name", (name) => ({ Reserve: { name } }));
const events = new EventSource("/api/events");
events.onmessage = (ev) => { $("status").classList.remove("offline"); render(JSON.parse(ev.data)); };
```

`{ Add: { title } }` is the JSON std/json gives `todo.Msg`, and
`m.todos`, `t.done` and `m.holders` are the Model's field names. Nothing
checks either against the server's types. A renamed field in
`todo.Model` is a compile error for the std/ui version and a blank list
for this one.

## The measurements

We drove each site in headless Chrome at 390 by 844 on the Mac Studio,
cache off, server and browser on 127.0.0.1: 30 adds, 600 ms apart, so
each add starts with no request in flight; then 30 more with 100 ms of
latency added to every request. Three rounds, so each figure is a range
from the lowest round to the highest. The three sites are **ui** (std/ui
with its wasm client), **thin** (the same server started with `thin`)
and **split** (the hand written front end).

### Latency

An add, until the todo is in the page, p50 / p95 in ms:

| | ui | thin | split |
|---|---|---|---|
| no added latency | 1.3 to 1.6 / 4.0 to 9.9 | 1.9 to 2.4 / 2.9 to 5.5 | 1.7 to 2.3 / 2.7 to 71.3 |
| 100 ms added latency | 1.5 to 1.9 / 2.4 to 3.3 | 108.7 to 109.7 / 112.2 to 113.2 | 107.9 to 110.8 / 111.9 to 220.2 |

The wasm client does not wait for the network. At 100 ms added latency
an add shows in 2 ms on ui and in one round trip (about 109 ms) on thin
and on split. Thin and split are the same design for latency: both wait
for the server's answer.

### Bytes

| | ui | thin | split |
|---|---|---|---|
| Server binary (bytes) | 6,682,110 (the 205 KB wasm client embedded) | same binary | 4,917,601 |
| Cold load, bytes on the wire | 106,025 in 6 requests | 11,685 in 4 | 4,410 in 5 |
| of which: page HTML | 2,415 | 2,231 | 807 |
| of which: script | ui.js 9,059; app.wasm 93,863 | ui.js 9,059 | app.js 2,297; style.css 1,130 |

Split is the smallest first load, ui the largest: 94 KB of ui's 106 KB
is the wasm module, which buys the latency above. Thin is the choice
when first load matters more. `http.file_server` sent split's files
uncompressed; gzip -9 would make them 377, 535 and 1,072 bytes.

### Content without scripts

ui and thin send the rendered todos in the page HTML, which serves
search engines, readers without JavaScript, and a first paint before
scripts load. split's HTML is an empty `<ul>` until `app.js` fetches the
state. A split app can render on the server too, but then the view lives
in a third place.

### Code

Lines (`wc -l`, comments included) beyond the Model, Msg, `update` and
`initial` that both share:

| | ui and thin | split |
|---|---|---|
| Rendering | `view` 28 lines of Xo, `app` 5 | `static/app.js` 57 lines of JavaScript, `static/index.html` 21 lines of HTML |
| Styles | `CSS` 19 lines (a Xo string) | `static/style.css` 16 lines |
| Server | `server/main.xo` 23 | `split/main.xo` 91 (the API, the event stream, a subscriber map) |
| Client build | `client/main.xo` 9 | none |
| Total | 84 lines, one language | 185 lines, four languages |

### Server CPU

All three spent 10 to 40 ms of server CPU over a drive (60 adds, three
page loads), so at one viewer it is not a differentiator. std/ui's
costs at 1,000 viewers are measured in commit 6c37aa8c3.

## What measuring found in std/ui

Adds sent back to back, with no gap, took 215 ms on thin at 100 ms
latency: two round trips. A trace of one add showed three sequential
`POST /_xo/sync`. The live channel's notice for a change arrived while
that change's own sync was in flight and queued another sync with
nothing new to fetch. A lone add was still one round trip, as in the
table. The fix (task #500, commit 2b06a76c4) drops that redundant sync.

## When to use which

- **std/ui with its wasm client** when actions should feel instant on a
  slow network and a 100 KB first load is fine.
- **std/ui thin** when the first load must be small and one round trip
  per action is fine. You still get server rendering, one language, and
  types checked from the Model to the click.
- **A split front end** when the front end is its own product, with its
  own team and its own build, or when you need the smallest static
  bundle and accept writing the view and the wire format twice.
