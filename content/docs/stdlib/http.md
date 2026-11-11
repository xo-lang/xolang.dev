---
title: "std/http"
linkTitle: "http"
description: "see spec/std.md 4"
toc: true
module: "std/http"
source: "https://github.com/xo-lang/xo/blob/main/std/http.xo"
generated: "scripts/sync-content.py from `xo doc std/http`; edit the doc comments in the Xo repo, not this file"
---
## Index

- const [`CONTINUE`](#CONTINUE)
- const [`SWITCHING_PROTOCOLS`](#SWITCHING_PROTOCOLS)
- const [`PROCESSING`](#PROCESSING)
- const [`EARLY_HINTS`](#EARLY_HINTS)
- const [`OK`](#OK)
- const [`CREATED`](#CREATED)
- const [`ACCEPTED`](#ACCEPTED)
- const [`NON_AUTHORITATIVE_INFO`](#NON_AUTHORITATIVE_INFO)
- const [`NO_CONTENT`](#NO_CONTENT)
- const [`RESET_CONTENT`](#RESET_CONTENT)
- const [`PARTIAL_CONTENT`](#PARTIAL_CONTENT)
- const [`MULTI_STATUS`](#MULTI_STATUS)
- const [`ALREADY_REPORTED`](#ALREADY_REPORTED)
- const [`IM_USED`](#IM_USED)
- const [`MULTIPLE_CHOICES`](#MULTIPLE_CHOICES)
- const [`MOVED_PERMANENTLY`](#MOVED_PERMANENTLY)
- const [`FOUND`](#FOUND)
- const [`SEE_OTHER`](#SEE_OTHER)
- const [`NOT_MODIFIED`](#NOT_MODIFIED)
- const [`USE_PROXY`](#USE_PROXY)
- const [`TEMPORARY_REDIRECT`](#TEMPORARY_REDIRECT)
- const [`PERMANENT_REDIRECT`](#PERMANENT_REDIRECT)
- const [`BAD_REQUEST`](#BAD_REQUEST)
- const [`UNAUTHORIZED`](#UNAUTHORIZED)
- const [`PAYMENT_REQUIRED`](#PAYMENT_REQUIRED)
- const [`FORBIDDEN`](#FORBIDDEN)
- const [`NOT_FOUND`](#NOT_FOUND)
- const [`METHOD_NOT_ALLOWED`](#METHOD_NOT_ALLOWED)
- const [`NOT_ACCEPTABLE`](#NOT_ACCEPTABLE)
- const [`PROXY_AUTH_REQUIRED`](#PROXY_AUTH_REQUIRED)
- const [`REQUEST_TIMEOUT`](#REQUEST_TIMEOUT)
- const [`CONFLICT`](#CONFLICT)
- const [`GONE`](#GONE)
- const [`LENGTH_REQUIRED`](#LENGTH_REQUIRED)
- const [`PRECONDITION_FAILED`](#PRECONDITION_FAILED)
- const [`REQUEST_ENTITY_TOO_LARGE`](#REQUEST_ENTITY_TOO_LARGE)
- const [`REQUEST_URI_TOO_LONG`](#REQUEST_URI_TOO_LONG)
- const [`UNSUPPORTED_MEDIA_TYPE`](#UNSUPPORTED_MEDIA_TYPE)
- const [`REQUESTED_RANGE_NOT_SATISFIABLE`](#REQUESTED_RANGE_NOT_SATISFIABLE)
- const [`EXPECTATION_FAILED`](#EXPECTATION_FAILED)
- const [`TEAPOT`](#TEAPOT)
- const [`MISDIRECTED_REQUEST`](#MISDIRECTED_REQUEST)
- const [`UNPROCESSABLE_ENTITY`](#UNPROCESSABLE_ENTITY)
- const [`LOCKED`](#LOCKED)
- const [`FAILED_DEPENDENCY`](#FAILED_DEPENDENCY)
- const [`TOO_EARLY`](#TOO_EARLY)
- const [`UPGRADE_REQUIRED`](#UPGRADE_REQUIRED)
- const [`PRECONDITION_REQUIRED`](#PRECONDITION_REQUIRED)
- const [`TOO_MANY_REQUESTS`](#TOO_MANY_REQUESTS)
- const [`REQUEST_HEADER_FIELDS_TOO_LARGE`](#REQUEST_HEADER_FIELDS_TOO_LARGE)
- const [`UNAVAILABLE_FOR_LEGAL_REASONS`](#UNAVAILABLE_FOR_LEGAL_REASONS)
- const [`INTERNAL_SERVER_ERROR`](#INTERNAL_SERVER_ERROR)
- const [`NOT_IMPLEMENTED`](#NOT_IMPLEMENTED)
- const [`BAD_GATEWAY`](#BAD_GATEWAY)
- const [`SERVICE_UNAVAILABLE`](#SERVICE_UNAVAILABLE)
- const [`GATEWAY_TIMEOUT`](#GATEWAY_TIMEOUT)
- const [`HTTP_VERSION_NOT_SUPPORTED`](#HTTP_VERSION_NOT_SUPPORTED)
- const [`VARIANT_ALSO_NEGOTIATES`](#VARIANT_ALSO_NEGOTIATES)
- const [`INSUFFICIENT_STORAGE`](#INSUFFICIENT_STORAGE)
- const [`LOOP_DETECTED`](#LOOP_DETECTED)
- const [`NOT_EXTENDED`](#NOT_EXTENDED)
- const [`NETWORK_AUTHENTICATION_REQUIRED`](#NETWORK_AUTHENTICATION_REQUIRED)
- type [`Router`](#Router)
  - method [`Router.handle`](#Router.handle)
  - method [`Router.handle_stream`](#Router.handle_stream)
  - method [`Router.wrap`](#Router.wrap)
  - method [`Router.mount`](#Router.mount)
  - method [`Router.not_found`](#Router.not_found)
  - method [`Router.method_not_allowed`](#Router.method_not_allowed)
  - method [`Router.call`](#Router.call)
- type [`Next`](#Next)
- type [`Status`](#Status)
- type [`StatusError`](#StatusError)
- type [`Request`](#Request)
  - method [`Request.param`](#Request.param)
  - method [`Request.param_opt`](#Request.param_opt)
  - method [`Request.param_int`](#Request.param_int)
  - method [`Request.query`](#Request.query)
  - method [`Request.query_all`](#Request.query_all)
  - method [`Request.form`](#Request.form)
  - method [`Request.multipart_form`](#Request.multipart_form)
  - method [`Request.header`](#Request.header)
  - method [`Request.json`](#Request.json)
  - method [`Request.with_header`](#Request.with_header)
  - method [`Request.with_timeout`](#Request.with_timeout)
  - method [`Request.with_host`](#Request.with_host)
  - method [`Request.with_expect_continue`](#Request.with_expect_continue)
  - method [`Request.with_idle_timeout`](#Request.with_idle_timeout)
  - method [`Request.with_body_reader`](#Request.with_body_reader)
  - method [`Request.with_trailers`](#Request.with_trailers)
  - method [`Request.header_values`](#Request.header_values)
  - method [`Request.host`](#Request.host)
  - method [`Request.tls`](#Request.tls)
  - method [`Request.tls_state`](#Request.tls_state)
  - method [`Request.raw_query`](#Request.raw_query)
  - method [`Request.escaped_path`](#Request.escaped_path)
  - method [`Request.add_header`](#Request.add_header)
  - method [`Request.client_ip`](#Request.client_ip)
  - method [`Request.with_value`](#Request.with_value)
  - method [`Request.value`](#Request.value)
  - method [`Request.cookie`](#Request.cookie)
  - method [`Request.cookies`](#Request.cookies)
  - method [`Request.with_cookie`](#Request.with_cookie)
- type [`ProxyHeader`](#ProxyHeader)
- type [`TlsState`](#TlsState)
- type [`Cookie`](#Cookie)
  - method [`Cookie.display`](#Cookie.display)
- type [`SameSite`](#SameSite)
- type [`CookieErr`](#CookieErr)
  - method [`CookieErr.display`](#CookieErr.display)
- type [`Key`](#Key)
  - method [`Key.name`](#Key.name)
- type [`Response`](#Response)
  - method [`Response.with_trailer_names`](#Response.with_trailer_names)
  - method [`Response.with_full_duplex`](#Response.with_full_duplex)
  - method [`Response.with_header`](#Response.with_header)
  - method [`Response.header`](#Response.header)
  - method [`Response.header_values`](#Response.header_values)
  - method [`Response.add_header`](#Response.add_header)
  - method [`Response.with_cookie`](#Response.with_cookie)
  - method [`Response.cookies`](#Response.cookies)
  - method [`Response.text`](#Response.text)
  - method [`Response.decode_json`](#Response.decode_json)
- type [`BodyReader`](#BodyReader)
  - method [`BodyReader.read`](#BodyReader.read)
  - method [`BodyReader.read_all`](#BodyReader.read_all)
  - method [`BodyReader.multipart`](#BodyReader.multipart)
  - method [`BodyReader.trailers`](#BodyReader.trailers)
- type [`PartReader`](#PartReader)
  - method [`PartReader.next`](#PartReader.next)
  - method [`PartReader.read`](#PartReader.read)
- type [`StreamPart`](#StreamPart)
  - method [`StreamPart.header_values`](#StreamPart.header_values)
- type [`BodyWriter`](#BodyWriter)
  - method [`BodyWriter.write`](#BodyWriter.write)
  - method [`BodyWriter.flush`](#BodyWriter.flush)
  - method [`BodyWriter.set_trailer`](#BodyWriter.set_trailer)
- type [`PipeWriter`](#PipeWriter)
  - method [`PipeWriter.write`](#PipeWriter.write)
  - method [`PipeWriter.close`](#PipeWriter.close)
  - method [`PipeWriter.close_with_error`](#PipeWriter.close_with_error)
- type [`Server`](#Server)
  - method [`Server.serve`](#Server.serve)
  - method [`Server.addr`](#Server.addr)
  - method [`Server.with_tls`](#Server.with_tls)
  - method [`Server.with_client_auth`](#Server.with_client_auth)
  - method [`Server.with_read_timeout`](#Server.with_read_timeout)
  - method [`Server.with_read_header_timeout`](#Server.with_read_header_timeout)
  - method [`Server.with_idle_timeout`](#Server.with_idle_timeout)
  - method [`Server.with_max_header_bytes`](#Server.with_max_header_bytes)
  - method [`Server.with_max_body`](#Server.with_max_body)
  - method [`Server.with_protocols`](#Server.with_protocols)
  - method [`Server.with_h2_config`](#Server.with_h2_config)
- type [`Protocol`](#Protocol)
- type [`H2Config`](#H2Config)
- type [`TlsCert`](#TlsCert)
- type [`TlsErr`](#TlsErr)
  - method [`TlsErr.display`](#TlsErr.display)
- type [`HttpErr`](#HttpErr)
  - method [`HttpErr.display`](#HttpErr.display)
- type [`Client`](#Client)
  - method [`Client.get`](#Client.get)
  - method [`Client.send`](#Client.send)
  - method [`Client.post_json`](#Client.post_json)
  - method [`Client.with_roots`](#Client.with_roots)
  - method [`Client.with_server_name`](#Client.with_server_name)
  - method [`Client.with_verify_conn`](#Client.with_verify_conn)
  - method [`Client.with_verify`](#Client.with_verify)
  - method [`Client.tls_options`](#Client.tls_options)
  - method [`Client.with_cert`](#Client.with_cert)
  - method [`Client.with_protocols`](#Client.with_protocols)
  - method [`Client.with_h2_config`](#Client.with_h2_config)
  - method [`Client.open`](#Client.open)
  - method [`Client.with_redirects`](#Client.with_redirects)
- type [`TlsOptions`](#TlsOptions)
- type [`ReverseProxy`](#ReverseProxy)
  - method [`ReverseProxy.with_rewrite`](#ReverseProxy.with_rewrite)
  - method [`ReverseProxy.serve`](#ReverseProxy.serve)
- type [`ResponseHead`](#ResponseHead)
- type [`ClientStream`](#ClientStream)
  - method [`ClientStream.head`](#ClientStream.head)
  - method [`ClientStream.read`](#ClientStream.read)
  - method [`ClientStream.read_all`](#ClientStream.read_all)
  - method [`ClientStream.close`](#ClientStream.close)
  - method [`ClientStream.trailers`](#ClientStream.trailers)
- type [`ClientErr`](#ClientErr)
  - method [`ClientErr.display`](#ClientErr.display)
- type [`Url`](#Url)
- type [`UrlErr`](#UrlErr)
  - method [`UrlErr.display`](#UrlErr.display)
- fn [`router`](#router)
- fn [`serve_component`](#serve_component)
- fn [`parse_cookie`](#parse_cookie)
- fn [`parse_set_cookie`](#parse_set_cookie)
- fn [`key`](#key)
- fn [`new_request`](#new_request)
- fn [`json`](#json)
- fn [`serve_content`](#serve_content)
- fn [`text`](#text)
- fn [`empty`](#empty)
- fn [`redirect`](#redirect)
- fn [`status_text`](#status_text)
- fn [`error_page`](#error_page)
- fn [`not_found`](#not_found)
- fn [`error_html`](#error_html)
- fn [`stream`](#stream)
- fn [`pipe`](#pipe)
- fn [`server`](#server)
- fn [`max_body`](#max_body)
- fn [`tls_cert`](#tls_cert)
- fn [`client`](#client)
- fn [`reverse_proxy`](#reverse_proxy)
- fn [`parse_url`](#parse_url)
- fn [`gzip_responses`](#gzip_responses)

## Constants

### CONTINUE {#CONTINUE}

```xo
const CONTINUE: Status = Status(100)
```

The codes Go's net/http names (std.md 4).

[Source: `std/http.xo:47`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L47)

### SWITCHING_PROTOCOLS {#SWITCHING_PROTOCOLS}

```xo
const SWITCHING_PROTOCOLS: Status = Status(101)
```

[Source: `std/http.xo:48`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L48)

### PROCESSING {#PROCESSING}

```xo
const PROCESSING: Status = Status(102)
```

[Source: `std/http.xo:49`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L49)

### EARLY_HINTS {#EARLY_HINTS}

```xo
const EARLY_HINTS: Status = Status(103)
```

[Source: `std/http.xo:50`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L50)

### OK {#OK}

```xo
const OK: Status = Status(200)
```

[Source: `std/http.xo:51`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L51)

### CREATED {#CREATED}

```xo
const CREATED: Status = Status(201)
```

[Source: `std/http.xo:52`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L52)

### ACCEPTED {#ACCEPTED}

```xo
const ACCEPTED: Status = Status(202)
```

[Source: `std/http.xo:53`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L53)

### NON_AUTHORITATIVE_INFO {#NON_AUTHORITATIVE_INFO}

```xo
const NON_AUTHORITATIVE_INFO: Status = Status(203)
```

[Source: `std/http.xo:54`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L54)

### NO_CONTENT {#NO_CONTENT}

```xo
const NO_CONTENT: Status = Status(204)
```

[Source: `std/http.xo:55`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L55)

### RESET_CONTENT {#RESET_CONTENT}

```xo
const RESET_CONTENT: Status = Status(205)
```

[Source: `std/http.xo:56`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L56)

### PARTIAL_CONTENT {#PARTIAL_CONTENT}

```xo
const PARTIAL_CONTENT: Status = Status(206)
```

[Source: `std/http.xo:57`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L57)

### MULTI_STATUS {#MULTI_STATUS}

```xo
const MULTI_STATUS: Status = Status(207)
```

[Source: `std/http.xo:58`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L58)

### ALREADY_REPORTED {#ALREADY_REPORTED}

```xo
const ALREADY_REPORTED: Status = Status(208)
```

[Source: `std/http.xo:59`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L59)

### IM_USED {#IM_USED}

```xo
const IM_USED: Status = Status(226)
```

[Source: `std/http.xo:60`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L60)

### MULTIPLE_CHOICES {#MULTIPLE_CHOICES}

```xo
const MULTIPLE_CHOICES: Status = Status(300)
```

[Source: `std/http.xo:61`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L61)

### MOVED_PERMANENTLY {#MOVED_PERMANENTLY}

```xo
const MOVED_PERMANENTLY: Status = Status(301)
```

[Source: `std/http.xo:62`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L62)

### FOUND {#FOUND}

```xo
const FOUND: Status = Status(302)
```

[Source: `std/http.xo:63`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L63)

### SEE_OTHER {#SEE_OTHER}

```xo
const SEE_OTHER: Status = Status(303)
```

[Source: `std/http.xo:64`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L64)

### NOT_MODIFIED {#NOT_MODIFIED}

```xo
const NOT_MODIFIED: Status = Status(304)
```

[Source: `std/http.xo:65`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L65)

### USE_PROXY {#USE_PROXY}

```xo
const USE_PROXY: Status = Status(305)
```

[Source: `std/http.xo:66`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L66)

### TEMPORARY_REDIRECT {#TEMPORARY_REDIRECT}

```xo
const TEMPORARY_REDIRECT: Status = Status(307)
```

[Source: `std/http.xo:67`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L67)

### PERMANENT_REDIRECT {#PERMANENT_REDIRECT}

```xo
const PERMANENT_REDIRECT: Status = Status(308)
```

[Source: `std/http.xo:68`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L68)

### BAD_REQUEST {#BAD_REQUEST}

```xo
const BAD_REQUEST: Status = Status(400)
```

[Source: `std/http.xo:69`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L69)

### UNAUTHORIZED {#UNAUTHORIZED}

```xo
const UNAUTHORIZED: Status = Status(401)
```

[Source: `std/http.xo:70`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L70)

### PAYMENT_REQUIRED {#PAYMENT_REQUIRED}

```xo
const PAYMENT_REQUIRED: Status = Status(402)
```

[Source: `std/http.xo:71`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L71)

### FORBIDDEN {#FORBIDDEN}

```xo
const FORBIDDEN: Status = Status(403)
```

[Source: `std/http.xo:72`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L72)

### NOT_FOUND {#NOT_FOUND}

```xo
const NOT_FOUND: Status = Status(404)
```

[Source: `std/http.xo:73`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L73)

### METHOD_NOT_ALLOWED {#METHOD_NOT_ALLOWED}

```xo
const METHOD_NOT_ALLOWED: Status = Status(405)
```

[Source: `std/http.xo:74`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L74)

### NOT_ACCEPTABLE {#NOT_ACCEPTABLE}

```xo
const NOT_ACCEPTABLE: Status = Status(406)
```

[Source: `std/http.xo:75`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L75)

### PROXY_AUTH_REQUIRED {#PROXY_AUTH_REQUIRED}

```xo
const PROXY_AUTH_REQUIRED: Status = Status(407)
```

[Source: `std/http.xo:76`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L76)

### REQUEST_TIMEOUT {#REQUEST_TIMEOUT}

```xo
const REQUEST_TIMEOUT: Status = Status(408)
```

[Source: `std/http.xo:77`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L77)

### CONFLICT {#CONFLICT}

```xo
const CONFLICT: Status = Status(409)
```

[Source: `std/http.xo:78`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L78)

### GONE {#GONE}

```xo
const GONE: Status = Status(410)
```

[Source: `std/http.xo:79`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L79)

### LENGTH_REQUIRED {#LENGTH_REQUIRED}

```xo
const LENGTH_REQUIRED: Status = Status(411)
```

[Source: `std/http.xo:80`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L80)

### PRECONDITION_FAILED {#PRECONDITION_FAILED}

```xo
const PRECONDITION_FAILED: Status = Status(412)
```

[Source: `std/http.xo:81`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L81)

### REQUEST_ENTITY_TOO_LARGE {#REQUEST_ENTITY_TOO_LARGE}

```xo
const REQUEST_ENTITY_TOO_LARGE: Status = Status(413)
```

[Source: `std/http.xo:82`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L82)

### REQUEST_URI_TOO_LONG {#REQUEST_URI_TOO_LONG}

```xo
const REQUEST_URI_TOO_LONG: Status = Status(414)
```

[Source: `std/http.xo:83`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L83)

### UNSUPPORTED_MEDIA_TYPE {#UNSUPPORTED_MEDIA_TYPE}

```xo
const UNSUPPORTED_MEDIA_TYPE: Status = Status(415)
```

[Source: `std/http.xo:84`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L84)

### REQUESTED_RANGE_NOT_SATISFIABLE {#REQUESTED_RANGE_NOT_SATISFIABLE}

```xo
const REQUESTED_RANGE_NOT_SATISFIABLE: Status = Status(416)
```

[Source: `std/http.xo:85`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L85)

### EXPECTATION_FAILED {#EXPECTATION_FAILED}

```xo
const EXPECTATION_FAILED: Status = Status(417)
```

[Source: `std/http.xo:86`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L86)

### TEAPOT {#TEAPOT}

```xo
const TEAPOT: Status = Status(418)
```

[Source: `std/http.xo:87`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L87)

### MISDIRECTED_REQUEST {#MISDIRECTED_REQUEST}

```xo
const MISDIRECTED_REQUEST: Status = Status(421)
```

[Source: `std/http.xo:88`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L88)

### UNPROCESSABLE_ENTITY {#UNPROCESSABLE_ENTITY}

```xo
const UNPROCESSABLE_ENTITY: Status = Status(422)
```

[Source: `std/http.xo:89`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L89)

### LOCKED {#LOCKED}

```xo
const LOCKED: Status = Status(423)
```

[Source: `std/http.xo:90`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L90)

### FAILED_DEPENDENCY {#FAILED_DEPENDENCY}

```xo
const FAILED_DEPENDENCY: Status = Status(424)
```

[Source: `std/http.xo:91`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L91)

### TOO_EARLY {#TOO_EARLY}

```xo
const TOO_EARLY: Status = Status(425)
```

[Source: `std/http.xo:92`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L92)

### UPGRADE_REQUIRED {#UPGRADE_REQUIRED}

```xo
const UPGRADE_REQUIRED: Status = Status(426)
```

[Source: `std/http.xo:93`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L93)

### PRECONDITION_REQUIRED {#PRECONDITION_REQUIRED}

```xo
const PRECONDITION_REQUIRED: Status = Status(428)
```

[Source: `std/http.xo:94`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L94)

### TOO_MANY_REQUESTS {#TOO_MANY_REQUESTS}

```xo
const TOO_MANY_REQUESTS: Status = Status(429)
```

[Source: `std/http.xo:95`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L95)

### REQUEST_HEADER_FIELDS_TOO_LARGE {#REQUEST_HEADER_FIELDS_TOO_LARGE}

```xo
const REQUEST_HEADER_FIELDS_TOO_LARGE: Status = Status(431)
```

[Source: `std/http.xo:96`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L96)

### UNAVAILABLE_FOR_LEGAL_REASONS {#UNAVAILABLE_FOR_LEGAL_REASONS}

```xo
const UNAVAILABLE_FOR_LEGAL_REASONS: Status = Status(451)
```

[Source: `std/http.xo:97`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L97)

### INTERNAL_SERVER_ERROR {#INTERNAL_SERVER_ERROR}

```xo
const INTERNAL_SERVER_ERROR: Status = Status(500)
```

[Source: `std/http.xo:98`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L98)

### NOT_IMPLEMENTED {#NOT_IMPLEMENTED}

```xo
const NOT_IMPLEMENTED: Status = Status(501)
```

[Source: `std/http.xo:99`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L99)

### BAD_GATEWAY {#BAD_GATEWAY}

```xo
const BAD_GATEWAY: Status = Status(502)
```

[Source: `std/http.xo:100`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L100)

### SERVICE_UNAVAILABLE {#SERVICE_UNAVAILABLE}

```xo
const SERVICE_UNAVAILABLE: Status = Status(503)
```

[Source: `std/http.xo:101`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L101)

### GATEWAY_TIMEOUT {#GATEWAY_TIMEOUT}

```xo
const GATEWAY_TIMEOUT: Status = Status(504)
```

[Source: `std/http.xo:102`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L102)

### HTTP_VERSION_NOT_SUPPORTED {#HTTP_VERSION_NOT_SUPPORTED}

```xo
const HTTP_VERSION_NOT_SUPPORTED: Status = Status(505)
```

[Source: `std/http.xo:103`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L103)

### VARIANT_ALSO_NEGOTIATES {#VARIANT_ALSO_NEGOTIATES}

```xo
const VARIANT_ALSO_NEGOTIATES: Status = Status(506)
```

[Source: `std/http.xo:104`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L104)

### INSUFFICIENT_STORAGE {#INSUFFICIENT_STORAGE}

```xo
const INSUFFICIENT_STORAGE: Status = Status(507)
```

[Source: `std/http.xo:105`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L105)

### LOOP_DETECTED {#LOOP_DETECTED}

```xo
const LOOP_DETECTED: Status = Status(508)
```

[Source: `std/http.xo:106`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L106)

### NOT_EXTENDED {#NOT_EXTENDED}

```xo
const NOT_EXTENDED: Status = Status(510)
```

[Source: `std/http.xo:107`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L107)

### NETWORK_AUTHENTICATION_REQUIRED {#NETWORK_AUTHENTICATION_REQUIRED}

```xo
const NETWORK_AUTHENTICATION_REQUIRED: Status = Status(511)
```

[Source: `std/http.xo:108`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L108)

## Types

### Router {#Router}

```xo
struct Router {}
```

[Source: `std/http.xo:17`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L17)

#### Router.handle {#Router.handle}

```xo
fn (var r: Router) handle[E: Error, fx: Effects](pattern: Str, h: fn(Request) -> Response ! E uses fx) uses fx
```

[Source: `std/http.xo:21`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L21)

#### Router.handle_stream {#Router.handle_stream}

```xo
fn (var r: Router) handle_stream[E: Error, fx: Effects](pattern: Str, h: fn(Request, BodyReader) -> Response ! E uses fx) uses fx
```

A route whose handler reads the request body as a stream (decision
0310): the server calls h before reading the body; req.body is empty.

[Source: `std/http.xo:24`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L24)

#### Router.wrap {#Router.wrap}

```xo
fn (var r: Router) wrap[E: Error, fx: Effects](m: fn(Request, Next) -> Response ! E uses fx) uses fx
```

[Source: `std/http.xo:25`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L25)

#### Router.mount {#Router.mount}

```xo
fn (var r: Router) mount(prefix: Str, sub: Router)
```

Adds every route of `sub` under `prefix`, behind the middleware of `sub`
(std.md 4.1).

[Source: `std/http.xo:28`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L28)

#### Router.not_found {#Router.not_found}

```xo
fn (var r: Router) not_found[E: Error, fx: Effects](h: fn(Request) -> Response ! E uses fx) uses fx
```

The response of a request no route matches, in place of the 404
(std.md 4.1); a mounted router's hook is not copied.

[Source: `std/http.xo:31`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L31)

#### Router.method_not_allowed {#Router.method_not_allowed}

```xo
fn (var r: Router) method_not_allowed[E: Error, fx: Effects](h: fn(Request) -> Response ! E uses fx) uses fx
```

The response of a request whose path a route matches with another
method, in place of the 405 (std.md 4.1); it gets the Allow header
when it lacks one.

[Source: `std/http.xo:35`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L35)

#### Router.call {#Router.call}

```xo
fn (r: Router) call(req: Request) -> Response
```

[Source: `std/http.xo:36`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L36)

### Next {#Next}

```xo
type Next = fn(Request) -> Response
```

[Source: `std/http.xo:18`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L18)

### Status {#Status}

```xo
type Status struct(Int)
```

An HTTP status code (decision 0269): a distinct integer type, so a
status cannot be mixed up with another Int.

[Source: `std/http.xo:44`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L44)

### StatusError {#StatusError}

```xo
interface StatusError {
  fn status(self) -> Int
  fn display(self) -> Str
}
```

[Source: `std/http.xo:110`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L110)

### Request {#Request}

```xo
struct Request {
  method: Str
  path: Str
  url: Url
  headers: Map[Str, Str]
  body: Bytes
  remote_ip: Str
}
```

[Source: `std/http.xo:115`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L115)

#### Request.param {#Request.param}

```xo
fn (r: Request) param(name: Str) -> Str
```

The path parameter `name` of the matched route; faults if the route has no such segment (`param_opt` answers
None instead).

[Source: `std/http.xo:125`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L125)

#### Request.param_opt {#Request.param_opt}

```xo
fn (r: Request) param_opt(name: Str) -> Str?
```

The path parameter `name`, or None when the route has no such segment.

[Source: `std/http.xo:127`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L127)

#### Request.param_int {#Request.param_int}

```xo
fn (r: Request) param_int(name: Str) -> Int
```

[Source: `std/http.xo:128`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L128)

#### Request.query {#Request.query}

```xo
fn (r: Request) query(name: Str) -> Str?
```

[Source: `std/http.xo:129`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L129)

#### Request.query_all {#Request.query_all}

```xo
fn (r: Request) query_all(name: Str) -> List[Str]
```

Every value of name in the query, in order (decision 0279).

[Source: `std/http.xo:131`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L131)

#### Request.form {#Request.form}

```xo
fn (r: Request) form() -> url.Values ! url.EscapeErr
```

The body of an `application/x-www-form-urlencoded` POST, PUT, or
PATCH as Values; empty Values for any other request (decision 0279).

[Source: `std/http.xo:134`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L134)

#### Request.multipart_form {#Request.multipart_form}

```xo
fn (r: Request) multipart_form() -> multipart.Form ! multipart.MultipartErr
```

The body of a `multipart/form-data` request as a Form (Go's
ParseMultipartForm with its 32 MB limit); MultipartErr `request
Content-Type isn't multipart/form-data` or `no multipart boundary param
in Content-Type` for any other (decision 0282).

[Source: `std/http.xo:139`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L139)

#### Request.header {#Request.header}

```xo
fn (r: Request) header(name: Str) -> Str?
```

[Source: `std/http.xo:140`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L140)

#### Request.json {#Request.json}

```xo
fn (r: Request) json[T: Json]() -> T ! json.DecodeErr
```

[Source: `std/http.xo:141`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L141)

#### Request.with_header {#Request.with_header}

```xo
fn (r: Request) with_header(name: Str, value: Str) -> Request
```

[Source: `std/http.xo:142`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L142)

#### Request.with_timeout {#Request.with_timeout}

```xo
fn (r: Request) with_timeout(d: Duration) -> Request
```

The request with its own time limit in place of its client's, for the
whole exchange with the body (Go's Client.Timeout); a client side
builder (decision 0404).

[Source: `std/http.xo:146`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L146)

#### Request.with_host {#Request.with_host}

```xo
fn (r: Request) with_host(host: Str) -> Request
```

The request sent with Host (HTTP/1.1) and :authority (HTTP/2) host in place of the URL's (Go's Request.Host); the
connection and the TLS name stay the URL's. "" is the URL's host.

[Source: `std/http.xo:149`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L149)

#### Request.with_expect_continue {#Request.with_expect_continue}

```xo
fn (r: Request) with_expect_continue(timeout: Duration = 1s) -> Request
```

The request with `Expect: 100-continue` (Go's Transport.ExpectContinueTimeout,
default 1s): an HTTP/1.1 client sends the head, waits up to timeout for
the server's `100 Continue`, then sends the body; a final response
first (a 401, a 413) is the result and the body is never sent; other
1xx are skipped. A request without a body, and an HTTP/2 or
Client.open request, send as before.

[Source: `std/http.xo:156`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L156)

#### Request.with_idle_timeout {#Request.with_idle_timeout}

```xo
fn (r: Request) with_idle_timeout(d: Duration) -> Request
```

The limit for each read of an opened stream's body in place of its
client's timeout; a client side builder (decision 0404).

[Source: `std/http.xo:159`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L159)

#### Request.with_body_reader {#Request.with_body_reader}

```xo
fn (r: Request) with_body_reader(b: BodyReader) -> Request
```

The request with its body read from b as it is sent (a handle_stream
route's body, decision 0404): chunked unless the header gives
Content-Length, never sent twice (a 307 or 308 returns the 3xx).

[Source: `std/http.xo:163`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L163)

#### Request.with_trailers {#Request.with_trailers}

```xo
fn (r: Request) with_trailers(names: List[Str], f: fn() -> Map[Str, Str]) -> Request
```

The request with trailers (Go's Request.Trailer, decision 0433): names
are declared in its head (an HTTP/2 server keeps only declared ones),
f is asked once its body has been sent and its values for those names
go after it; other names, and names Go forbids in a trailer, are
dropped. An HTTP/1.1 body is then chunked.

[Source: `std/http.xo:169`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L169)

#### Request.header_values {#Request.header_values}

```xo
fn (r: Request) header_values(name: Str) -> List[Str]
```

Every field of name, in order (decision 0288).

[Source: `std/http.xo:171`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L171)

#### Request.host {#Request.host}

```xo
fn (r: Request) host() -> Str
```

Go's Request.Host: the Host header as sent (host, or host:port;
HTTP/2's :authority); `url.host` is the name alone. "" for a request
built as a struct literal (std.md 4.3).

[Source: `std/http.xo:175`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L175)

#### Request.tls {#Request.tls}

```xo
fn (r: Request) tls() -> Bool
```

Whether the request came over TLS (Go's `r.TLS != nil`); `url.scheme`
is then "https".

[Source: `std/http.xo:178`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L178)

#### Request.tls_state {#Request.tls_state}

```xo
fn (r: Request) tls_state() -> TlsState?
```

Go's r.TLS (a tls.ConnectionState): what the connection's handshake
negotiated; None for a plain connection or a request built as a
struct literal.

[Source: `std/http.xo:182`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L182)

#### Request.raw_query {#Request.raw_query}

```xo
fn (r: Request) raw_query() -> Str
```

Go's URL.RawQuery: the query as sent, before any unescaping.

[Source: `std/http.xo:184`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L184)

#### Request.escaped_path {#Request.escaped_path}

```xo
fn (r: Request) escaped_path() -> Str
```

Go's URL.EscapedPath: the path as sent when it is a valid escaping of
`path`, else `path` escaped (std/url's path_escape).

[Source: `std/http.xo:187`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L187)

#### Request.add_header {#Request.add_header}

```xo
fn (r: Request) add_header(name: Str, value: Str) -> Request
```

The request with one more field of name.

[Source: `std/http.xo:189`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L189)

#### Request.client_ip {#Request.client_ip}

```xo
fn (r: Request) client_ip(trusted: List[netip.Prefix] = [], header: ProxyHeader = ProxyHeader.XForwardedFor) -> netip.Addr?
```

The client's address behind trusted proxies (std.md 4.3): the peer
(`remote_ip`) when it is not inside a prefix of trusted, else the
rightmost address of header (every field of it, in order) that is not
inside one; None when an address does not parse.

[Source: `std/http.xo:194`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L194)

#### Request.with_value {#Request.with_value}

```xo
fn (r: Request) with_value[T](k: Key[T], v: T) -> Request
```

[Source: `std/http.xo:204`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L204)

#### Request.value {#Request.value}

```xo
fn (r: Request) value[T](k: Key[T]) -> T?
```

[Source: `std/http.xo:205`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L205)

#### Request.cookie {#Request.cookie}

```xo
fn (r: Request) cookie(name: Str) -> Cookie?
```

The first cookie of that name in the Cookie fields (Go's
Request.Cookie, decision 0288).

[Source: `std/http.xo:208`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L208)

#### Request.cookies {#Request.cookies}

```xo
fn (r: Request) cookies() -> List[Cookie]
```

Every cookie of the Cookie fields that parses (Go's Request.Cookies).

[Source: `std/http.xo:210`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L210)

#### Request.with_cookie {#Request.with_cookie}

```xo
fn (r: Request) with_cookie(c: Cookie) -> Request
```

The request with name=value appended to its Cookie field (Go's
Request.AddCookie).

[Source: `std/http.xo:213`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L213)

### ProxyHeader {#ProxyHeader}

```xo
enum ProxyHeader {
  XForwardedFor
  Forwarded
} derive Display
```

The header a server's trusted proxies write the client chain to:
`X-Forwarded-For: client, proxy1` or RFC 7239's `Forwarded:
for=client, for=proxy1`. Only that one is read: a proxy that writes one
passes a client's own copy of the other through.

[Source: `std/http.xo:200`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L200)

### TlsState {#TlsState}

```xo
struct TlsState {
  version: Str
  cipher_suite: Str
  server_name: Str
  resumed: Bool
  peer_certificates: List[x509.Certificate]
  verified_chains: List[List[x509.Certificate]]
}
```

What a TLS connection's handshake negotiated (std.md 4.3; Go's
tls.ConnectionState).

[Source: `std/http.xo:217`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L217)

### Cookie {#Cookie}

```xo
struct Cookie {
  name: Str
  value: Str
  quoted: Bool = false
  path: Str = ""
  domain: Str = ""
  expires: Time? = None
  max_age: Int = 0
  secure: Bool = false
  http_only: Bool = false
  same_site: SameSite = SameSite.Default
  partitioned: Bool = false
}
```

An HTTP cookie (std.md 4.3, decision 0288; net/http's Cookie).

[Source: `std/http.xo:236`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L236)

#### Cookie.display {#Cookie.display}

```xo
fn (c: Cookie) display() -> Str
```

The Set-Cookie value (Go's Cookie.String); "" for a name that is not
a token.

[Source: `std/http.xo:264`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L264)

### SameSite {#SameSite}

```xo
enum SameSite {
  Default
  Lax
  Strict
  None
} derive Display
```

[Source: `std/http.xo:255`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L255)

### CookieErr {#CookieErr}

```xo
struct CookieErr {
  msg: Str
}
```

[Source: `std/http.xo:270`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L270)

#### CookieErr.display {#CookieErr.display}

```xo
fn (e: CookieErr) display() -> Str
```

The message (decision 0358).

[Source: `std/http.xo:275`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L275)

### Key {#Key}

```xo
struct Key[T] {}
```

A typed request value key (std.md 4.3).

[Source: `std/http.xo:278`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L278)

#### Key.name {#Key.name}

```xo
fn (k: Key[T]) name() -> Str
```

[Source: `std/http.xo:280`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L280)

### Response {#Response}

```xo
struct Response {
  status: Int
  headers: Map[Str, Str]
  body: Bytes
}
```

[Source: `std/http.xo:284`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L284)

#### Response.with_trailer_names {#Response.with_trailer_names}

```xo
fn (r: Response) with_trailer_names(names: List[Str]) -> Response
```

The response declaring trailer names in its `Trailer` header (HTTP/1.1;
decision 0433); set_trailer sends a name whether declared or not.

[Source: `std/http.xo:366`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L366)

#### Response.with_full_duplex {#Response.with_full_duplex}

```xo
fn (r: Response) with_full_duplex() -> Response
```

The streamed response whose function may read the request's body
while it writes (Go's ResponseController.EnableFullDuplex, decision
0433): its head goes out at once, a `100 Continue` before the first
read when asked. HTTP/1.1 only needs it; an HTTP/2 stream always is.

[Source: `std/http.xo:371`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L371)

#### Response.with_header {#Response.with_header}

```xo
fn (r: Response) with_header(name: Str, value: Str) -> Response
```

[Source: `std/http.xo:384`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L384)

#### Response.header {#Response.header}

```xo
fn (r: Response) header(name: Str) -> Str?
```

[Source: `std/http.xo:385`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L385)

#### Response.header_values {#Response.header_values}

```xo
fn (r: Response) header_values(name: Str) -> List[Str]
```

Every field of name, in order (decision 0288).

[Source: `std/http.xo:387`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L387)

#### Response.add_header {#Response.add_header}

```xo
fn (r: Response) add_header(name: Str, value: Str) -> Response
```

The response with one more field of name.

[Source: `std/http.xo:389`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L389)

#### Response.with_cookie {#Response.with_cookie}

```xo
fn (r: Response) with_cookie(c: Cookie) -> Response
```

One more Set-Cookie field (Go's SetCookie); none for an invalid name.

[Source: `std/http.xo:391`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L391)

#### Response.cookies {#Response.cookies}

```xo
fn (r: Response) cookies() -> List[Cookie]
```

Every Set-Cookie field that parses (Go's Response.Cookies).

[Source: `std/http.xo:393`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L393)

#### Response.text {#Response.text}

```xo
fn (r: Response) text() -> Str?
```

The body as text; None if it is not valid UTF-8 (std.md 4.3).

[Source: `std/http.xo:395`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L395)

#### Response.decode_json {#Response.decode_json}

```xo
fn (r: Response) decode_json[T: Json]() -> T ! json.DecodeErr
```

[Source: `std/http.xo:396`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L396)

### BodyReader {#BodyReader}

```xo
struct BodyReader {}
```

The body of a request to a handle_stream route (decision 0310).

[Source: `std/http.xo:321`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L321)

#### BodyReader.read {#BodyReader.read}

```xo
fn (b: BodyReader) read(max: Int = 32768) -> Bytes? ! IoErr
```

The next bytes of the body (at most max, at least 1), None at its end.

[Source: `std/http.xo:323`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L323)

#### BodyReader.read_all {#BodyReader.read_all}

```xo
fn (b: BodyReader) read_all() -> Bytes ! IoErr
```

The rest of the body.

[Source: `std/http.xo:325`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L325)

#### BodyReader.multipart {#BodyReader.multipart}

```xo
fn (b: BodyReader) multipart(req: Request) -> PartReader ! multipart.MultipartErr
```

The body as `multipart/form-data` parts, read as they arrive
(decision 0310 phase 3; Go's Request.MultipartReader): MultipartErr
as Request.multipart_form's for another Content-Type or no boundary.

[Source: `std/http.xo:329`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L329)

#### BodyReader.trailers {#BodyReader.trailers}

```xo
fn (b: BodyReader) trailers() -> Map[Str, Str]
```

The request's trailers (Go's Request.Trailer, decision 0433), names
canonical; empty until read has returned None.

[Source: `std/http.xo:332`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L332)

### PartReader {#PartReader}

```xo
struct PartReader {}
```

A multipart body read part by part (Go's multipart.Reader).

[Source: `std/http.xo:335`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L335)

#### PartReader.next {#PartReader.next}

```xo
fn (p: PartReader) next() -> StreamPart? ! multipart.MultipartErr
```

The next part, the open part's unread data dropped (NextPart); None
after the last part. An error sticks.

[Source: `std/http.xo:338`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L338)

#### PartReader.read {#PartReader.read}

```xo
fn (p: PartReader) read(max: Int = 32768) -> Bytes? ! multipart.MultipartErr
```

The open part's next bytes (at most max, at least 1; decoded when
quoted-printable, as Go's NextPart), None at its end or before the
first next.

[Source: `std/http.xo:342`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L342)

### StreamPart {#StreamPart}

```xo
struct StreamPart {
  name: Str
  filename: Str?
  headers: Map[Str, Str]
}
```

A part of a PartReader: multipart.Part's fields but its data, which
PartReader.read reads; headers holds each header's first value.

[Source: `std/http.xo:346`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L346)

#### StreamPart.header_values {#StreamPart.header_values}

```xo
fn (p: StreamPart) header_values(name: Str) -> List[Str]
```

Every value of the part's header name, in order (MIMEHeader's
values); [] when it has none.

[Source: `std/http.xo:353`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L353)

### BodyWriter {#BodyWriter}

```xo
struct BodyWriter {}
```

The body of a streamed response (std.md 4.3).

[Source: `std/http.xo:356`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L356)

#### BodyWriter.write {#BodyWriter.write}

```xo
fn (w: BodyWriter) write(data: Bytes) -> () ! IoErr
```

[Source: `std/http.xo:357`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L357)

#### BodyWriter.flush {#BodyWriter.flush}

```xo
fn (w: BodyWriter) flush() -> () ! IoErr
```

[Source: `std/http.xo:358`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L358)

#### BodyWriter.set_trailer {#BodyWriter.set_trailer}

```xo
fn (w: BodyWriter) set_trailer(name: Str, value: Str)
```

A trailer sent after the body (Go's TrailerPrefix, decision 0433),
the name made canonical; a name Go forbids in a trailer (Content-Length,
Host, Trailer, ...) is dropped. Not sent on a response with a
Content-Length.

[Source: `std/http.xo:363`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L363)

### PipeWriter {#PipeWriter}

```xo
struct PipeWriter {}
```

The writing end of http.pipe.

[Source: `std/http.xo:377`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L377)

#### PipeWriter.write {#PipeWriter.write}

```xo
fn (w: PipeWriter) write(data: Bytes) -> () ! IoErr
```

Io("io: read/write on closed pipe") once either end is closed.

[Source: `std/http.xo:379`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L379)

#### PipeWriter.close {#PipeWriter.close}

```xo
fn (w: PipeWriter) close()
```

The reader's next read is None (the body's end).

[Source: `std/http.xo:381`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L381)

#### PipeWriter.close_with_error {#PipeWriter.close_with_error}

```xo
fn (w: PipeWriter) close_with_error(e: IoErr)
```

The reader's next read is Err(e) (Go's CloseWithError).

[Source: `std/http.xo:383`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L383)

### Server {#Server}

```xo
struct Server {}
```

[Source: `std/http.xo:398`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L398)

#### Server.serve {#Server.serve}

```xo
fn (s: Server) serve() -> () ! HttpErr uses net.listen
```

[Source: `std/http.xo:400`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L400)

#### Server.addr {#Server.addr}

```xo
fn (s: Server) addr() -> Str
```

[Source: `std/http.xo:401`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L401)

#### Server.with_tls {#Server.with_tls}

```xo
fn (s: Server) with_tls(certs: List[TlsCert]) -> Server
```

The server with HTTPS (std.md 4.6): certs[0] unless SNI names another
certificate's host.

[Source: `std/http.xo:404`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L404)

#### Server.with_client_auth {#Server.with_client_auth}

```xo
fn (s: Server) with_client_auth(mode: tls.ClientAuth, roots: tls.Roots? = None) -> Server
```

The server asks a TLS client for its certificate (Go's
tls.Config.ClientAuth and ClientCAs; decision 0433): roots verify it,
the system's when None. A request's tls_state has the client's
certificates and verified chains.

[Source: `std/http.xo:409`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L409)

#### Server.with_read_timeout {#Server.with_read_timeout}

```xo
fn (s: Server) with_read_timeout(d: Duration) -> Server
```

Go's Server.ReadTimeout: the time a request's head and body may take
to arrive, from its first byte; a connection whose request is late
closes without a reply, as net/http's does; over TLS the handshake's
waits count too.

[Source: `std/http.xo:414`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L414)

#### Server.with_read_header_timeout {#Server.with_read_header_timeout}

```xo
fn (s: Server) with_read_header_timeout(d: Duration) -> Server
```

Go's Server.ReadHeaderTimeout: the time the head alone may take.

[Source: `std/http.xo:416`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L416)

#### Server.with_idle_timeout {#Server.with_idle_timeout}

```xo
fn (s: Server) with_idle_timeout(d: Duration) -> Server
```

Go's Server.IdleTimeout: how long a kept alive connection waits for
its next request's first byte (the read timeout when 0).

[Source: `std/http.xo:419`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L419)

#### Server.with_max_header_bytes {#Server.with_max_header_bytes}

```xo
fn (s: Server) with_max_header_bytes(n: Int) -> Server
```

Go's Server.MaxHeaderBytes (plus net/http's 4096 bytes of slack): a
longer head is `431 Request Header Fields Too Large` (1 MB when 0, as
Go's DefaultMaxHeaderBytes).

[Source: `std/http.xo:423`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L423)

#### Server.with_max_body {#Server.with_max_body}

```xo
fn (s: Server) with_max_body(n: Int) -> Server
```

The largest request body the server reads before a handler (64 MB when
0, XO_HTTP_MAX_BODY's default); a longer one is `413 Content Too
Large`. A route that needs a smaller cap wraps `max_body(n)`.

[Source: `std/http.xo:427`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L427)

#### Server.with_protocols {#Server.with_protocols}

```xo
fn (s: Server) with_protocols(p: Set[Protocol]) -> Server
```

The server speaking the protocols of p (Go's Server.Protocols;
decision 0434): #{Http1, Http2} by default; UnencryptedHttp2 serves
h2c with prior knowledge on a plain listener. serve fails on an empty
set or a TLS server with neither Http1 nor Http2.

[Source: `std/http.xo:467`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L467)

#### Server.with_h2_config {#Server.with_h2_config}

```xo
fn (s: Server) with_h2_config(c: H2Config) -> Server
```

The server's HTTP/2 settings (Go's Server.HTTP2; decision 0434).

[Source: `std/http.xo:469`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L469)

### Protocol {#Protocol}

```xo
enum Protocol {
  Http1
  Http2
  UnencryptedHttp2
} derive Display
```

The protocols a server or client speaks (Go's http.Protocols,
decision 0434).

[Source: `std/http.xo:430`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L430)

### H2Config {#H2Config}

```xo
struct H2Config {
  max_concurrent_streams: Int = 0
  max_read_frame_size: Int = 0
  max_receive_buffer_per_connection: Int = 0
  max_receive_buffer_per_stream: Int = 0
  max_decoder_header_table_size: Int = 0
  max_encoder_header_table_size: Int = 0
  send_ping_timeout: Duration = 0s
  ping_timeout: Duration = 0s
  write_byte_timeout: Duration = 0s
}
```

HTTP/2 settings (Go's http.HTTP2Config, decision 0434); 0 is the
default of each, and an out of range value is clamped as Go does.

[Source: `std/http.xo:441`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L441)

### TlsCert {#TlsCert}

```xo
type TlsCert = tls.TlsCert
```

A certificate chain with its private key (std.md 4.6): std/tls's
(decision 0433).

[Source: `std/http.xo:478`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L478)

### TlsErr {#TlsErr}

```xo
struct TlsErr {
  msg: Str
}
```

[Source: `std/http.xo:482`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L482)

#### TlsErr.display {#TlsErr.display}

```xo
fn (e: TlsErr) display() -> Str
```

The message (decision 0358).

[Source: `std/http.xo:487`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L487)

### HttpErr {#HttpErr}

```xo
enum HttpErr {
  Io(msg: Str)
  Canceled
}
```

[Source: `std/http.xo:489`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L489)

#### HttpErr.display {#HttpErr.display}

```xo
fn (e: HttpErr) display() -> Str
```

MSG for an Io, `canceled` (decision 0358).

[Source: `std/http.xo:495`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L495)

### Client {#Client}

```xo
struct Client {}
```

[Source: `std/http.xo:497`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L497)

#### Client.get {#Client.get}

```xo
fn (c: Client) get(url: Str) -> Response ! ClientErr uses net.dial
```

[Source: `std/http.xo:499`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L499)

#### Client.send {#Client.send}

```xo
fn (c: Client) send(req: Request) -> Response ! ClientErr uses net.dial
```

[Source: `std/http.xo:500`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L500)

#### Client.post_json {#Client.post_json}

```xo
fn (c: Client) post_json[T: Json](url: Str, v: T) -> Response ! ClientErr uses net.dial
```

[Source: `std/http.xo:501`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L501)

#### Client.with_roots {#Client.with_roots}

```xo
fn (c: Client) with_roots(pem: Bytes) -> Client ! TlsErr
```

The client trusting the certificates of pem instead of the system's
roots for https (std.md 4.6).

[Source: `std/http.xo:504`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L504)

#### Client.with_server_name {#Client.with_server_name}

```xo
fn (c: Client) with_server_name(name: Str) -> Client
```

The client's name for the server (Go's tls.Config.ServerName): sent as SNI and verified against the certificate in
place of the URL's host; "" keeps the URL's. A client with one has its own connections (decision 0541).

[Source: `std/http.xo:507`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L507)

#### Client.with_verify_conn {#Client.with_verify_conn}

```xo
fn (c: Client) with_verify_conn(f: fn(List[x509.Certificate]) -> () ! Str) -> Client
```

The client calling f with the server's certificates (leaf first) after the TLS handshake and its verification, before
any request byte is sent (Go's tls.Config.VerifyConnection); Err(text) fails the connection with that text. It runs
on every new connection, so a pinning check works with a self signed server. A client with one has its own
connections.

[Source: `std/http.xo:512`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L512)

#### Client.with_verify {#Client.with_verify}

```xo
fn (c: Client) with_verify(v: tls.Verify) -> Client
```

How the client checks the server's certificate for https (Go's InsecureSkipVerify when Verify.None, with
Verify.ChainOnly the chain without the name); the default is Verify.Full. UNSAFE alone: Verify.None accepts any
certificate, so a request on such a client fails ("tls: Verify.None needs a verify_conn ...") unless
with_verify_conn is set, which should pin the certificate (tls.pin_sha256, tls.pin_sha1). A client with one has
its own connections.

[Source: `std/http.xo:518`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L518)

#### Client.tls_options {#Client.tls_options}

```xo
fn (c: Client) tls_options() -> TlsOptions
```

[Source: `std/http.xo:527`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L527)

#### Client.with_cert {#Client.with_cert}

```xo
fn (c: Client) with_cert(cert: TlsCert) -> Client
```

The client presenting cert when an https server asks for a
certificate (Go's tls.Config.Certificates on a client; decision 0433).

[Source: `std/http.xo:530`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L530)

#### Client.with_protocols {#Client.with_protocols}

```xo
fn (c: Client) with_protocols(p: Set[Protocol]) -> Client
```

The client speaking the protocols of p (Go's Transport.Protocols;
decision 0434): with UnencryptedHttp2 and not Http1, an http:// URL
opens HTTP/2 with prior knowledge.

[Source: `std/http.xo:534`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L534)

#### Client.with_h2_config {#Client.with_h2_config}

```xo
fn (c: Client) with_h2_config(cfg: H2Config) -> Client
```

The client's HTTP/2 settings (Go's Transport.HTTP2; decision 0434).

[Source: `std/http.xo:536`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L536)

#### Client.open {#Client.open}

```xo
fn (c: Client) open(req: Request) -> ClientStream ! ClientErr uses net.dial
```

The request sent and the response's head read; its body follows on
the stream (redirects followed as send follows them).

[Source: `std/http.xo:566`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L566)

#### Client.with_redirects {#Client.with_redirects}

```xo
fn (c: Client) with_redirects(max: Int) -> Client
```

The client following at most max redirects (10 by default); 0 returns
a 3xx response as it came, its Location as the server sent it (Go's
ErrUseLastResponse; decision 0404).

[Source: `std/http.xo:581`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L581)

### TlsOptions {#TlsOptions}

```xo
struct TlsOptions {
  server_name: Str
  verify_conn: Bool
  custom_roots: Bool
  client_cert: Bool
  verify: tls.Verify
}
```

What a client's TLS settings are, for tests and diagnostics.

[Source: `std/http.xo:520`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L520)

### ReverseProxy {#ReverseProxy}

```xo
struct ReverseProxy {}
```

[Source: `std/http.xo:546`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L546)

#### ReverseProxy.with_rewrite {#ReverseProxy.with_rewrite}

```xo
fn (p: ReverseProxy) with_rewrite(f: fn(Request, Request) -> Request) -> ReverseProxy
```

The proxy applying f(in, out) to each outgoing request out after its
own rewrite, in being the request received (httputil's Rewrite with
ProxyRequest.In and Out).

[Source: `std/http.xo:550`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L550)

#### ReverseProxy.serve {#ReverseProxy.serve}

```xo
fn (p: ReverseProxy) serve(req: Request, body: BodyReader) -> Response uses net.dial
```

Forwards req, its body read from body, and returns the target's
response with its body streamed back.

[Source: `std/http.xo:553`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L553)

### ResponseHead {#ResponseHead}

```xo
struct ResponseHead {
  status: Int
  headers: Map[Str, Str]
}
```

A response's status and header, without its body (decision 0404).

[Source: `std/http.xo:555`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L555)

### ClientStream {#ClientStream}

```xo
struct ClientStream {}
```

A response whose body is read as it arrives (decision 0404): from
Client.open, read with read or read_all and released with close (or
when the last copy goes): a body read to its end gives its connection
back to the client's pool, any other is closed.

[Source: `std/http.xo:563`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L563)

#### ClientStream.head {#ClientStream.head}

```xo
fn (s: ClientStream) head() -> ResponseHead
```

[Source: `std/http.xo:567`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L567)

#### ClientStream.read {#ClientStream.read}

```xo
fn (s: ClientStream) read(max: Int = 32768) -> Bytes? ! ClientErr uses net.dial
```

The next bytes of the body, at most max, None at its end; a body cut
short is Protocol (unexpected EOF), never an end.

[Source: `std/http.xo:570`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L570)

#### ClientStream.read_all {#ClientStream.read_all}

```xo
fn (s: ClientStream) read_all(max_size: Int = 1073741824) -> Bytes ! ClientErr uses net.dial
```

The rest of the body; Protocol past max_size bytes.

[Source: `std/http.xo:572`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L572)

#### ClientStream.close {#ClientStream.close}

```xo
fn (s: ClientStream) close()
```

Releases the stream's connection; again does nothing.

[Source: `std/http.xo:574`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L574)

#### ClientStream.trailers {#ClientStream.trailers}

```xo
fn (s: ClientStream) trailers() -> Map[Str, Str]
```

The response's trailers (Go's Response.Trailer, decision 0433), names
canonical; empty until read has returned None.

[Source: `std/http.xo:577`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L577)

### ClientErr {#ClientErr}

```xo
enum ClientErr {
  InvalidUrl(msg: Str)
  Connect(msg: Str)
  Timeout
  Protocol(msg: Str)
  Canceled
}
```

[Source: `std/http.xo:583`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L583)

#### ClientErr.display {#ClientErr.display}

```xo
fn (e: ClientErr) display() -> Str
```

`invalid URL: MSG`, MSG for a Connect, `request timed out`, `protocol
error: MSG`, `canceled` (decision 0358).

[Source: `std/http.xo:593`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L593)

### Url {#Url}

```xo
struct Url {
  scheme: Str
  host: Str
  port: Int?
  path: Str
  query: Map[Str, Str]
}
```

[Source: `std/http.xo:597`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L597)

### UrlErr {#UrlErr}

```xo
struct UrlErr {
  msg: Str
}
```

[Source: `std/http.xo:605`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L605)

#### UrlErr.display {#UrlErr.display}

```xo
fn (e: UrlErr) display() -> Str
```

The message (decision 0358).

[Source: `std/http.xo:610`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L610)

## Functions

### router {#router}

```xo
fn router() -> Router
```

[Source: `std/http.xo:20`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L20)

### serve_component {#serve_component}

```xo
fn serve_component(r: Router)
```

Serves the request a wasi:http component was called with through r
(decision 0447): main builds the router and calls this; faults off
the wasm backend.

[Source: `std/http.xo:40`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L40)

### parse_cookie {#parse_cookie}

```xo
fn parse_cookie(line: Str) -> List[Cookie] ! CookieErr
```

The cookies of a Cookie field's value (Go's ParseCookie).

[Source: `std/http.xo:266`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L266)

### parse_set_cookie {#parse_set_cookie}

```xo
fn parse_set_cookie(line: Str) -> Cookie ! CookieErr
```

The cookie of a Set-Cookie field's value (Go's ParseSetCookie).

[Source: `std/http.xo:268`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L268)

### key {#key}

```xo
fn key[T](name: Str) -> Key[T]
```

[Source: `std/http.xo:279`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L279)

### new_request {#new_request}

```xo
fn new_request(method: Str, url: Str, headers: Map[Str, Str] = {}, body: Bytes = b"") -> Request
```

[Source: `std/http.xo:282`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L282)

### json {#json}

```xo
fn json[T: Json](status: Int, v: T) -> Response
```

[Source: `std/http.xo:289`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L289)

### serve_content {#serve_content}

```xo
fn serve_content(req: Request, name: Str, modtime: Time?, content: Bytes, headers: Map[Str, Str] = {}) -> Response
```

The response net/http's ServeContent writes for req from content
(decision 0306): Range requests (206, or multipart/byteranges for
several), the conditional requests against modtime and an ETag in
headers (304, 412), 416 for a range outside the content, the
Content-Type from headers, name's extension, or the content, and
Last-Modified, Accept-Ranges, Content-Length. headers are the fields
a Go handler sets on its ResponseWriter before the call.

[Source: `std/http.xo:297`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L297)

### text {#text}

```xo
fn text(status: Int, s: Str) -> Response
```

[Source: `std/http.xo:298`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L298)

### empty {#empty}

```xo
fn empty(status: Int) -> Response
```

[Source: `std/http.xo:299`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L299)

### redirect {#redirect}

```xo
fn redirect(req: Request, url: Str, status: Int) -> Response
```

Go's Redirect: a response of status with `Location: url`; a url with
no scheme and no host is resolved against req's escaped path (Go's
rules: the path's directory, `.` and `..` cleaned, a trailing slash
kept, the query kept apart), non ASCII bytes of the Location percent
encoded; a GET or HEAD gets `text/html; charset=utf-8` and a GET the
body `<a href="URL">Status Text</a>.` and two newlines (Go prints the body with Fprintln).

[Source: `std/http.xo:306`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L306)

### status_text {#status_text}

```xo
fn status_text(code: Int) -> Str
```

The text of an HTTP status code, as Go's http.StatusText (`Not Found` for 404); empty for a code Go does not name.

[Source: `std/http.xo:309`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L309)

### error_page {#error_page}

```xo
fn error_page(status: Int, msg: Str) -> Response
```

Go's Error: `text/plain; charset=utf-8`, `X-Content-Type-Options:
nosniff`, the body msg and a newline.

[Source: `std/http.xo:312`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L312)

### not_found {#not_found}

```xo
fn not_found() -> Response
```

Go's NotFound: error_page(404, "404 page not found").

[Source: `std/http.xo:314`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L314)

### error_html {#error_html}

```xo
fn error_html(status: Int, title: Str, detail: Str) -> Response
```

An HTML error page: text/html (nosniff), the title in \<title> and
\<h1>, the detail in \<p>, both escaped (std.md 4.3).

[Source: `std/http.xo:317`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L317)

### stream {#stream}

```xo
fn stream[fx: Effects](status: Int, f: fn(BodyWriter) -> () ! IoErr uses fx) -> Response uses fx
```

[Source: `std/http.xo:318`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L318)

### pipe {#pipe}

```xo
fn pipe() -> (PipeWriter, BodyReader)
```

A body written by one task while another sends it (Go's io.Pipe,
decision 0433): the reader goes to Request.with_body_reader, each
write waits until the request has taken its bytes.

[Source: `std/http.xo:375`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L375)

### server {#server}

```xo
fn server(l: Listener, r: Router) -> Server
```

[Source: `std/http.xo:399`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L399)

### max_body {#max_body}

```xo
fn max_body(n: Int) -> fn(Request, Next) -> Response
```

A middleware that answers `413` with Go's MaxBytesReader text
(`http: request body too large`) for a body over n bytes (a streamed
body is capped at n as it is read).

[Source: `std/http.xo:474`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L474)

### tls_cert {#tls_cert}

```xo
fn tls_cert(cert_pem: Bytes, key_pem: Bytes) -> TlsCert ! TlsErr
```

Parses a PEM certificate chain and its PEM private key (std.md 4.6).

[Source: `std/http.xo:480`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L480)

### client {#client}

```xo
fn client(net: Net, timeout: Duration = 30s) -> Client
```

[Source: `std/http.xo:498`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L498)

### reverse_proxy {#reverse_proxy}

```xo
pub fn reverse_proxy(client: Client, target: Url) -> ReverseProxy
```

A reverse proxy to target, for a handle_stream route:
`r.handle_stream("/api/", fn(req, body) { p.serve(req, body) })`. It forwards each request to
target (decision 0404, httputil.ReverseProxy with SetURL and
SetXForwarded): the target's scheme and host, its path joined before
the request's, the queries merged; hop-by-hop fields removed both
ways; X-Forwarded-For, -Host and -Proto set; rewrite applied last;
the body streamed both ways, redirects returned as they came. A
failure to reach the target is 502, a timeout 504.

[Source: `std/http.xo:545`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L545)

### parse_url {#parse_url}

```xo
fn parse_url(s: Str) -> Url ! UrlErr
```

[Source: `std/http.xo:595`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L595)

### gzip_responses {#gzip_responses}

```xo
fn gzip_responses(min_size: Int = 1024, level: compress.Level = compress.Level.Default) -> fn(Request, Next) -> Response
```

A middleware that compresses responses with gzip when the request
accepts it (std.md 4.7, decision 0305): `r.wrap(http.gzip_responses())`.

[Source: `std/http.xo:614`](https://github.com/xo-lang/xo/blob/main/std/http.xo#L614)
