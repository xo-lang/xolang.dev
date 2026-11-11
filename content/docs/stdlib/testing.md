---
title: "std/testing"
linkTitle: "testing"
description: "see spec/std.md 8, core 9.2"
toc: true
module: "std/testing"
source: "https://github.com/xo-lang/xo/blob/main/std/testing.xo"
generated: "scripts/sync-content.py from `xo doc std/testing`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`TestOs`](#TestOs)
- type [`Expect`](#Expect)
- type [`FakeNet`](#FakeNet)
  - method [`FakeNet.listen`](#FakeNet.listen)
  - method [`FakeNet.dial`](#FakeNet.dial)
  - method [`FakeNet.dial_timeout`](#FakeNet.dial_timeout)
  - method [`FakeNet.lookup_host`](#FakeNet.lookup_host)
  - method [`FakeNet.interfaces`](#FakeNet.interfaces)
  - method [`FakeNet.only`](#FakeNet.only)
  - method [`FakeNet.handle`](#FakeNet.handle)
  - method [`FakeNet.handle_tls`](#FakeNet.handle_tls)
  - method [`FakeNet.fail`](#FakeNet.fail)
  - method [`FakeNet.fail_next`](#FakeNet.fail_next)
  - method [`FakeNet.clear_failures`](#FakeNet.clear_failures)
  - method [`FakeNet.requests`](#FakeNet.requests)
- type [`FakeClock`](#FakeClock)
  - method [`FakeClock.now`](#FakeClock.now)
  - method [`FakeClock.sleep`](#FakeClock.sleep)
  - method [`FakeClock.sleep_or_cancel`](#FakeClock.sleep_or_cancel)
  - method [`FakeClock.since`](#FakeClock.since)
  - method [`FakeClock.advance`](#FakeClock.advance)
  - method [`FakeClock.set`](#FakeClock.set)
  - method [`FakeClock.sleeps`](#FakeClock.sleeps)
- type [`FsOp`](#FsOp)
- type [`MemFs`](#MemFs)
  - method [`MemFs.sub`](#MemFs.sub)
  - method [`MemFs.cwd`](#MemFs.cwd)
  - method [`MemFs.cwd_path`](#MemFs.cwd_path)
  - method [`MemFs.read_only`](#MemFs.read_only)
  - method [`MemFs.write_only`](#MemFs.write_only)
  - method [`MemFs.case_sensitive`](#MemFs.case_sensitive)
  - method [`MemFs.stat`](#MemFs.stat)
  - method [`MemFs.exists`](#MemFs.exists)
  - method [`MemFs.disk_usage`](#MemFs.disk_usage)
  - method [`MemFs.read`](#MemFs.read)
  - method [`MemFs.read_text`](#MemFs.read_text)
  - method [`MemFs.read_dir`](#MemFs.read_dir)
  - method [`MemFs.walk`](#MemFs.walk)
  - method [`MemFs.write`](#MemFs.write)
  - method [`MemFs.create_temp`](#MemFs.create_temp)
  - method [`MemFs.rename`](#MemFs.rename)
  - method [`MemFs.remove`](#MemFs.remove)
  - method [`MemFs.remove_all`](#MemFs.remove_all)
  - method [`MemFs.create_dir_all`](#MemFs.create_dir_all)
  - method [`MemFs.set_modified`](#MemFs.set_modified)
  - method [`MemFs.open`](#MemFs.open)
  - method [`MemFs.create`](#MemFs.create)
  - method [`MemFs.open_append`](#MemFs.open_append)
  - method [`MemFs.open_rw`](#MemFs.open_rw)
  - method [`MemFs.create_new`](#MemFs.create_new)
  - method [`MemFs.append`](#MemFs.append)
  - method [`MemFs.copy`](#MemFs.copy)
  - method [`MemFs.mode`](#MemFs.mode)
  - method [`MemFs.set_mode`](#MemFs.set_mode)
  - method [`MemFs.symlink`](#MemFs.symlink)
  - method [`MemFs.read_link`](#MemFs.read_link)
  - method [`MemFs.glob`](#MemFs.glob)
  - method [`MemFs.lock`](#MemFs.lock)
  - method [`MemFs.try_lock`](#MemFs.try_lock)
  - method [`MemFs.fail_next`](#MemFs.fail_next)
  - method [`MemFs.set_case_sensitive`](#MemFs.set_case_sensitive)
  - method [`MemFs.set_disk_usage`](#MemFs.set_disk_usage)
  - method [`MemFs.files`](#MemFs.files)
- type [`FakeEnv`](#FakeEnv)
  - method [`FakeEnv.get`](#FakeEnv.get)
  - method [`FakeEnv.vars`](#FakeEnv.vars)
  - method [`FakeEnv.args`](#FakeEnv.args)
  - method [`FakeEnv.program`](#FakeEnv.program)
  - method [`FakeEnv.home`](#FakeEnv.home)
  - method [`FakeEnv.only`](#FakeEnv.only)
  - method [`FakeEnv.config_dir`](#FakeEnv.config_dir)
  - method [`FakeEnv.cache_dir`](#FakeEnv.cache_dir)
  - method [`FakeEnv.hostname`](#FakeEnv.hostname)
  - method [`FakeEnv.set`](#FakeEnv.set)
  - method [`FakeEnv.set_args`](#FakeEnv.set_args)
- type [`FakeStdio`](#FakeStdio)
  - method [`FakeStdio.print`](#FakeStdio.print)
  - method [`FakeStdio.println`](#FakeStdio.println)
  - method [`FakeStdio.eprint`](#FakeStdio.eprint)
  - method [`FakeStdio.eprintln`](#FakeStdio.eprintln)
  - method [`FakeStdio.write`](#FakeStdio.write)
  - method [`FakeStdio.read_line`](#FakeStdio.read_line)
  - method [`FakeStdio.read_all`](#FakeStdio.read_all)
  - method [`FakeStdio.lines`](#FakeStdio.lines)
  - method [`FakeStdio.stdin_is_tty`](#FakeStdio.stdin_is_tty)
  - method [`FakeStdio.stdout_is_tty`](#FakeStdio.stdout_is_tty)
  - method [`FakeStdio.stderr_is_tty`](#FakeStdio.stderr_is_tty)
  - method [`FakeStdio.width`](#FakeStdio.width)
  - method [`FakeStdio.read_secret`](#FakeStdio.read_secret)
  - method [`FakeStdio.raw_input`](#FakeStdio.raw_input)
  - method [`FakeStdio.read_bytes`](#FakeStdio.read_bytes)
  - method [`FakeStdio.read_all_bytes`](#FakeStdio.read_all_bytes)
  - method [`FakeStdio.set_input`](#FakeStdio.set_input)
  - method [`FakeStdio.set_tty`](#FakeStdio.set_tty)
  - method [`FakeStdio.set_input_bytes`](#FakeStdio.set_input_bytes)
  - method [`FakeStdio.output`](#FakeStdio.output)
  - method [`FakeStdio.errors`](#FakeStdio.errors)
- type [`FakeProc`](#FakeProc)
  - method [`FakeProc.exit`](#FakeProc.exit)
  - method [`FakeProc.set_grace`](#FakeProc.set_grace)
  - method [`FakeProc.run`](#FakeProc.run)
  - method [`FakeProc.only`](#FakeProc.only)
  - method [`FakeProc.cmd`](#FakeProc.cmd)
  - method [`FakeProc.pipeline`](#FakeProc.pipeline)
  - method [`FakeProc.exit_code`](#FakeProc.exit_code)
  - method [`FakeProc.signal_after`](#FakeProc.signal_after)
  - method [`FakeProc.on_run`](#FakeProc.on_run)
  - method [`FakeProc.kill`](#FakeProc.kill)
  - method [`FakeProc.notify`](#FakeProc.notify)
  - method [`FakeProc.stop_notify`](#FakeProc.stop_notify)
  - method [`FakeProc.request_stop`](#FakeProc.request_stop)
  - method [`FakeProc.pid`](#FakeProc.pid)
  - method [`FakeProc.ppid`](#FakeProc.ppid)
  - method [`FakeProc.usage`](#FakeProc.usage)
  - method [`FakeProc.children_usage`](#FakeProc.children_usage)
  - method [`FakeProc.killed`](#FakeProc.killed)
  - method [`FakeProc.runs`](#FakeProc.runs)
- fn [`expect`](#expect)
- fn [`gen`](#gen)
- fn [`logs`](#logs)
- fn [`fake_db`](#fake_db)
- fn [`run_main`](#run_main)

## Types

### TestOs {#TestOs}

```xo
struct TestOs {
  net: FakeNet
  fs: MemFs
  clock: FakeClock
  rand: Rand
  env: FakeEnv
  stdio: FakeStdio
  proc: FakeProc
  tasks: task.Group
}
```

[Source: `std/testing.xo:17`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L17)

### Expect {#Expect}

```xo
struct Expect[T] {}
```

[Source: `std/testing.xo:29`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L29)

### FakeNet {#FakeNet}

```xo
struct FakeNet {}
```

[Source: `std/testing.xo:41`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L41)

#### FakeNet.listen {#FakeNet.listen}

```xo
fn (n: FakeNet) listen(addr: Str) -> Listener ! NetErr uses net.listen
```

[Source: `std/testing.xo:42`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L42)

#### FakeNet.dial {#FakeNet.dial}

```xo
fn (n: FakeNet) dial(addr: Str) -> Conn ! NetErr uses net.dial
```

[Source: `std/testing.xo:43`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L43)

#### FakeNet.dial_timeout {#FakeNet.dial_timeout}

```xo
fn (n: FakeNet) dial_timeout(addr: Str, d: Duration) -> Conn ! NetErr uses net.dial
```

[Source: `std/testing.xo:44`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L44)

#### FakeNet.lookup_host {#FakeNet.lookup_host}

```xo
fn (n: FakeNet) lookup_host(host: Str) -> List[Str] ! NetErr uses net.dial
```

[Source: `std/testing.xo:45`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L45)

#### FakeNet.interfaces {#FakeNet.interfaces}

```xo
fn (n: FakeNet) interfaces() -> List[NetInterface] ! NetErr uses net.listen
```

[Source: `std/testing.xo:46`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L46)

#### FakeNet.only {#FakeNet.only}

```xo
fn (n: FakeNet) only(hosts: List[Str]) -> Net
```

[Source: `std/testing.xo:47`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L47)

#### FakeNet.handle {#FakeNet.handle}

```xo
fn (n: FakeNet) handle(pattern: Str, h: fn(http.Request) -> http.Response)
```

[Source: `std/testing.xo:48`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L48)

#### FakeNet.handle_tls {#FakeNet.handle_tls}

```xo
fn (n: FakeNet) handle_tls(pattern: Str, cert: tls.TlsCert, h: fn(http.Request) -> http.Response)
```

Like handle for an https pattern, with the certificate the server presents: a request it matches first runs the
client's checks against `cert` as a real handshake would (the roots, the server name, `with_verify`,
`with_verify_conn`, with the handshake's error texts) and fails before the handler when one refuses; the handler's
`tls_state()` reports the server name the client sent (decision 0544).

[Source: `std/testing.xo:53`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L53)

#### FakeNet.fail {#FakeNet.fail}

```xo
fn (n: FakeNet) fail(pattern: Str, err: http.ClientErr)
```

Every matching request fails with err, until clear_failures. The handler is skipped, so it never sees the
request: use requests() to see what was sent.

[Source: `std/testing.xo:56`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L56)

#### FakeNet.fail_next {#FakeNet.fail_next}

```xo
fn (n: FakeNet) fail_next(pattern: Str, err: http.ClientErr)
```

The next matching request fails with err, once; like fail, it skips the handler and requests() still lists it.

[Source: `std/testing.xo:58`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L58)

#### FakeNet.clear_failures {#FakeNet.clear_failures}

```xo
fn (n: FakeNet) clear_failures()
```

[Source: `std/testing.xo:59`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L59)

#### FakeNet.requests {#FakeNet.requests}

```xo
fn (n: FakeNet) requests() -> List[http.Request]
```

[Source: `std/testing.xo:60`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L60)

### FakeClock {#FakeClock}

```xo
struct FakeClock {}
```

[Source: `std/testing.xo:63`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L63)

#### FakeClock.now {#FakeClock.now}

```xo
fn (c: FakeClock) now() -> Time uses clock
```

[Source: `std/testing.xo:64`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L64)

#### FakeClock.sleep {#FakeClock.sleep}

```xo
fn (c: FakeClock) sleep(d: Duration) uses clock
```

[Source: `std/testing.xo:65`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L65)

#### FakeClock.sleep_or_cancel {#FakeClock.sleep_or_cancel}

```xo
fn (c: FakeClock) sleep_or_cancel(d: Duration) -> () ! ClockErr uses clock
```

[Source: `std/testing.xo:66`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L66)

#### FakeClock.since {#FakeClock.since}

```xo
fn (c: FakeClock) since(t: Time) -> Duration uses clock
```

[Source: `std/testing.xo:67`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L67)

#### FakeClock.advance {#FakeClock.advance}

```xo
fn (c: FakeClock) advance(d: Duration)
```

[Source: `std/testing.xo:68`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L68)

#### FakeClock.set {#FakeClock.set}

```xo
fn (c: FakeClock) set(t: Time)
```

[Source: `std/testing.xo:69`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L69)

#### FakeClock.sleeps {#FakeClock.sleeps}

```xo
fn (c: FakeClock) sleeps() -> List[Duration]
```

[Source: `std/testing.xo:70`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L70)

### FsOp {#FsOp}

```xo
enum FsOp {
  Read
  Write
  Rename
  Remove
  CreateDir
  ReadDir
}
```

[Source: `std/testing.xo:73`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L73)

### MemFs {#MemFs}

```xo
struct MemFs {}
```

[Source: `std/testing.xo:82`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L82)

#### MemFs.sub {#MemFs.sub}

```xo
fn (f: MemFs) sub(dir: Str) -> Fs
```

[Source: `std/testing.xo:83`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L83)

#### MemFs.cwd {#MemFs.cwd}

```xo
fn (f: MemFs) cwd() -> Fs
```

[Source: `std/testing.xo:84`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L84)

#### MemFs.cwd_path {#MemFs.cwd_path}

```xo
fn (f: MemFs) cwd_path() -> Str ! FsErr
```

[Source: `std/testing.xo:85`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L85)

#### MemFs.read_only {#MemFs.read_only}

```xo
fn (f: MemFs) read_only() -> Fs
```

[Source: `std/testing.xo:86`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L86)

#### MemFs.write_only {#MemFs.write_only}

```xo
fn (f: MemFs) write_only() -> Fs
```

[Source: `std/testing.xo:87`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L87)

#### MemFs.case_sensitive {#MemFs.case_sensitive}

```xo
fn (f: MemFs) case_sensitive() -> Bool
```

[Source: `std/testing.xo:88`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L88)

#### MemFs.stat {#MemFs.stat}

```xo
fn (f: MemFs) stat(path: Str) -> FileInfo? ! FsErr uses fs.read
```

[Source: `std/testing.xo:89`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L89)

#### MemFs.exists {#MemFs.exists}

```xo
fn (f: MemFs) exists(path: Str) -> Bool ! FsErr uses fs.read
```

[Source: `std/testing.xo:90`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L90)

#### MemFs.disk_usage {#MemFs.disk_usage}

```xo
fn (f: MemFs) disk_usage(path: Str) -> DiskUsage ! FsErr uses fs.read
```

[Source: `std/testing.xo:91`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L91)

#### MemFs.read {#MemFs.read}

```xo
fn (f: MemFs) read(path: Str) -> Bytes ! FsErr uses fs.read
```

[Source: `std/testing.xo:92`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L92)

#### MemFs.read_text {#MemFs.read_text}

```xo
fn (f: MemFs) read_text(path: Str) -> Str ! FsErr uses fs.read
```

[Source: `std/testing.xo:93`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L93)

#### MemFs.read_dir {#MemFs.read_dir}

```xo
fn (f: MemFs) read_dir(dir: Str) -> List[FileInfo] ! FsErr uses fs.read
```

[Source: `std/testing.xo:94`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L94)

#### MemFs.walk {#MemFs.walk}

```xo
fn (f: MemFs) walk(dir: Str) -> List[FileInfo] ! FsErr uses fs.read
```

[Source: `std/testing.xo:95`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L95)

#### MemFs.write {#MemFs.write}

```xo
fn (f: MemFs) write(path: Str, data: Bytes) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:96`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L96)

#### MemFs.create_temp {#MemFs.create_temp}

```xo
fn (f: MemFs) create_temp(dir: Str, prefix: Str) -> Str ! FsErr uses fs.write
```

[Source: `std/testing.xo:97`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L97)

#### MemFs.rename {#MemFs.rename}

```xo
fn (f: MemFs) rename(from: Str, to: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:98`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L98)

#### MemFs.remove {#MemFs.remove}

```xo
fn (f: MemFs) remove(path: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:99`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L99)

#### MemFs.remove_all {#MemFs.remove_all}

```xo
fn (f: MemFs) remove_all(path: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:100`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L100)

#### MemFs.create_dir_all {#MemFs.create_dir_all}

```xo
fn (f: MemFs) create_dir_all(dir: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:101`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L101)

#### MemFs.set_modified {#MemFs.set_modified}

```xo
fn (f: MemFs) set_modified(path: Str, t: Time) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:102`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L102)

#### MemFs.open {#MemFs.open}

```xo
fn (f: MemFs) open(path: Str) -> File ! FsErr uses fs.read
```

[Source: `std/testing.xo:103`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L103)

#### MemFs.create {#MemFs.create}

```xo
fn (f: MemFs) create(path: Str) -> File ! FsErr uses fs.write
```

[Source: `std/testing.xo:104`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L104)

#### MemFs.open_append {#MemFs.open_append}

```xo
fn (f: MemFs) open_append(path: Str) -> File ! FsErr uses fs.write
```

[Source: `std/testing.xo:105`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L105)

#### MemFs.open_rw {#MemFs.open_rw}

```xo
fn (f: MemFs) open_rw(path: Str) -> File ! FsErr uses fs.write
```

Like `Fs.open_rw`.

[Source: `std/testing.xo:107`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L107)

#### MemFs.create_new {#MemFs.create_new}

```xo
fn (f: MemFs) create_new(path: Str) -> File ! FsErr uses fs.write
```

[Source: `std/testing.xo:108`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L108)

#### MemFs.append {#MemFs.append}

```xo
fn (f: MemFs) append(path: Str, data: Bytes) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:109`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L109)

#### MemFs.copy {#MemFs.copy}

```xo
fn (f: MemFs) copy(from: Str, to: Str) -> () ! FsErr uses fs
```

[Source: `std/testing.xo:110`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L110)

#### MemFs.mode {#MemFs.mode}

```xo
fn (f: MemFs) mode(path: Str) -> Int ! FsErr uses fs.read
```

[Source: `std/testing.xo:111`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L111)

#### MemFs.set_mode {#MemFs.set_mode}

```xo
fn (f: MemFs) set_mode(path: Str, mode: Int) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:112`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L112)

#### MemFs.symlink {#MemFs.symlink}

```xo
fn (f: MemFs) symlink(target: Str, link: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:113`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L113)

#### MemFs.read_link {#MemFs.read_link}

```xo
fn (f: MemFs) read_link(path: Str) -> Str? ! FsErr uses fs.read
```

[Source: `std/testing.xo:114`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L114)

#### MemFs.glob {#MemFs.glob}

```xo
fn (f: MemFs) glob(pattern: Str) -> List[Str] ! FsErr uses fs.read
```

[Source: `std/testing.xo:115`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L115)

#### MemFs.lock {#MemFs.lock}

```xo
fn (f: MemFs) lock(path: Str) -> FileLock ! FsErr uses fs.write
```

[Source: `std/testing.xo:116`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L116)

#### MemFs.try_lock {#MemFs.try_lock}

```xo
fn (f: MemFs) try_lock(path: Str) -> FileLock? ! FsErr uses fs.write
```

[Source: `std/testing.xo:117`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L117)

#### MemFs.fail_next {#MemFs.fail_next}

```xo
fn (f: MemFs) fail_next(op: FsOp, path: Str, err: FsErr)
```

[Source: `std/testing.xo:118`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L118)

#### MemFs.set_case_sensitive {#MemFs.set_case_sensitive}

```xo
fn (f: MemFs) set_case_sensitive(on: Bool)
```

[Source: `std/testing.xo:119`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L119)

#### MemFs.set_disk_usage {#MemFs.set_disk_usage}

```xo
fn (f: MemFs) set_disk_usage(u: DiskUsage)
```

What disk_usage answers for every path that exists (decision 0426).

[Source: `std/testing.xo:121`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L121)

#### MemFs.files {#MemFs.files}

```xo
fn (f: MemFs) files() -> Map[Str, Bytes]
```

[Source: `std/testing.xo:122`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L122)

### FakeEnv {#FakeEnv}

```xo
struct FakeEnv {}
```

[Source: `std/testing.xo:125`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L125)

#### FakeEnv.get {#FakeEnv.get}

```xo
fn (e: FakeEnv) get(name: Str) -> Str? uses env
```

[Source: `std/testing.xo:126`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L126)

#### FakeEnv.vars {#FakeEnv.vars}

```xo
fn (e: FakeEnv) vars() -> Map[Str, Str] uses env
```

[Source: `std/testing.xo:127`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L127)

#### FakeEnv.args {#FakeEnv.args}

```xo
fn (e: FakeEnv) args() -> List[Str] uses env
```

[Source: `std/testing.xo:128`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L128)

#### FakeEnv.program {#FakeEnv.program}

```xo
fn (e: FakeEnv) program() -> Str uses env
```

[Source: `std/testing.xo:129`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L129)

#### FakeEnv.home {#FakeEnv.home}

```xo
fn (e: FakeEnv) home() -> Str ! EnvErr uses env
```

[Source: `std/testing.xo:130`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L130)

#### FakeEnv.only {#FakeEnv.only}

```xo
fn (e: FakeEnv) only(names: List[Str]) -> Env
```

[Source: `std/testing.xo:131`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L131)

#### FakeEnv.config_dir {#FakeEnv.config_dir}

```xo
fn (e: FakeEnv) config_dir() -> Str ! EnvErr uses env
```

[Source: `std/testing.xo:132`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L132)

#### FakeEnv.cache_dir {#FakeEnv.cache_dir}

```xo
fn (e: FakeEnv) cache_dir() -> Str ! EnvErr uses env
```

[Source: `std/testing.xo:133`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L133)

#### FakeEnv.hostname {#FakeEnv.hostname}

```xo
fn (e: FakeEnv) hostname() -> Str uses env
```

"test", or the value of HOSTNAME when the FakeEnv has one.

[Source: `std/testing.xo:135`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L135)

#### FakeEnv.set {#FakeEnv.set}

```xo
fn (e: FakeEnv) set(name: Str, value: Str)
```

[Source: `std/testing.xo:136`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L136)

#### FakeEnv.set_args {#FakeEnv.set_args}

```xo
fn (e: FakeEnv) set_args(args: List[Str])
```

[Source: `std/testing.xo:137`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L137)

### FakeStdio {#FakeStdio}

```xo
struct FakeStdio {}
```

[Source: `std/testing.xo:139`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L139)

#### FakeStdio.print {#FakeStdio.print}

```xo
fn (s: FakeStdio) print(text: Str) uses stdio
```

[Source: `std/testing.xo:140`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L140)

#### FakeStdio.println {#FakeStdio.println}

```xo
fn (s: FakeStdio) println(text: Str) uses stdio
```

[Source: `std/testing.xo:141`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L141)

#### FakeStdio.eprint {#FakeStdio.eprint}

```xo
fn (s: FakeStdio) eprint(text: Str) uses stdio
```

[Source: `std/testing.xo:142`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L142)

#### FakeStdio.eprintln {#FakeStdio.eprintln}

```xo
fn (s: FakeStdio) eprintln(text: Str) uses stdio
```

[Source: `std/testing.xo:143`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L143)

#### FakeStdio.write {#FakeStdio.write}

```xo
fn (s: FakeStdio) write(data: Bytes) -> () ! IoErr uses stdio
```

[Source: `std/testing.xo:144`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L144)

#### FakeStdio.read_line {#FakeStdio.read_line}

```xo
fn (s: FakeStdio) read_line() -> Str? ! IoErr uses stdio
```

[Source: `std/testing.xo:145`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L145)

#### FakeStdio.read_all {#FakeStdio.read_all}

```xo
fn (s: FakeStdio) read_all() -> Str ! IoErr uses stdio
```

[Source: `std/testing.xo:146`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L146)

#### FakeStdio.lines {#FakeStdio.lines}

```xo
fn (s: FakeStdio) lines() -> List[Str] ! IoErr uses stdio
```

[Source: `std/testing.xo:147`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L147)

#### FakeStdio.stdin_is_tty {#FakeStdio.stdin_is_tty}

```xo
fn (s: FakeStdio) stdin_is_tty() -> Bool uses stdio
```

[Source: `std/testing.xo:148`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L148)

#### FakeStdio.stdout_is_tty {#FakeStdio.stdout_is_tty}

```xo
fn (s: FakeStdio) stdout_is_tty() -> Bool uses stdio
```

[Source: `std/testing.xo:149`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L149)

#### FakeStdio.stderr_is_tty {#FakeStdio.stderr_is_tty}

```xo
fn (s: FakeStdio) stderr_is_tty() -> Bool uses stdio
```

[Source: `std/testing.xo:150`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L150)

#### FakeStdio.width {#FakeStdio.width}

```xo
fn (s: FakeStdio) width() -> Int? uses stdio
```

[Source: `std/testing.xo:151`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L151)

#### FakeStdio.read_secret {#FakeStdio.read_secret}

```xo
fn (s: FakeStdio) read_secret(prompt: Str) -> Str? ! IoErr uses stdio
```

[Source: `std/testing.xo:152`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L152)

#### FakeStdio.raw_input {#FakeStdio.raw_input}

```xo
fn (s: FakeStdio) raw_input(on: Bool) -> Bool uses stdio
```

[Source: `std/testing.xo:153`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L153)

#### FakeStdio.read_bytes {#FakeStdio.read_bytes}

```xo
fn (s: FakeStdio) read_bytes(max: Int) -> Bytes? ! IoErr uses stdio
```

[Source: `std/testing.xo:154`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L154)

#### FakeStdio.read_all_bytes {#FakeStdio.read_all_bytes}

```xo
fn (s: FakeStdio) read_all_bytes() -> Bytes ! IoErr uses stdio
```

[Source: `std/testing.xo:155`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L155)

#### FakeStdio.set_input {#FakeStdio.set_input}

```xo
fn (s: FakeStdio) set_input(text: Str)
```

[Source: `std/testing.xo:156`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L156)

#### FakeStdio.set_tty {#FakeStdio.set_tty}

```xo
fn (s: FakeStdio) set_tty(width: Int)
```

The streams are terminals of `width` columns (0: not terminals, the
default), for code that checks `stdout_is_tty` or `width`.

[Source: `std/testing.xo:159`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L159)

#### FakeStdio.set_input_bytes {#FakeStdio.set_input_bytes}

```xo
fn (s: FakeStdio) set_input_bytes(data: Bytes)
```

Standard input holds these bytes (any bytes, for `read_bytes`).

[Source: `std/testing.xo:161`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L161)

#### FakeStdio.output {#FakeStdio.output}

```xo
fn (s: FakeStdio) output() -> Str
```

[Source: `std/testing.xo:162`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L162)

#### FakeStdio.errors {#FakeStdio.errors}

```xo
fn (s: FakeStdio) errors() -> Str
```

[Source: `std/testing.xo:163`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L163)

### FakeProc {#FakeProc}

```xo
struct FakeProc {}
```

[Source: `std/testing.xo:165`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L165)

#### FakeProc.exit {#FakeProc.exit}

```xo
fn (p: FakeProc) exit(code: Int) -> Never uses proc
```

[Source: `std/testing.xo:166`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L166)

#### FakeProc.set_grace {#FakeProc.set_grace}

```xo
fn (p: FakeProc) set_grace(d: Duration) uses proc
```

[Source: `std/testing.xo:167`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L167)

#### FakeProc.run {#FakeProc.run}

```xo
fn (p: FakeProc) run(cmd: Str, args: List[Str]) -> ProcOutput ! ProcErr uses proc
```

[Source: `std/testing.xo:168`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L168)

#### FakeProc.only {#FakeProc.only}

```xo
fn (p: FakeProc) only(cmds: List[Str]) -> Proc
```

[Source: `std/testing.xo:169`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L169)

#### FakeProc.cmd {#FakeProc.cmd}

```xo
fn (p: FakeProc) cmd(name: Str, args: List[Str] = []) -> Cmd
```

[Source: `std/testing.xo:170`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L170)

#### FakeProc.pipeline {#FakeProc.pipeline}

```xo
fn (p: FakeProc) pipeline(cmds: List[Cmd]) -> ProcOutput ! ProcErr uses proc
```

[Source: `std/testing.xo:171`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L171)

#### FakeProc.exit_code {#FakeProc.exit_code}

```xo
fn (p: FakeProc) exit_code() -> Int?
```

[Source: `std/testing.xo:172`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L172)

#### FakeProc.signal_after {#FakeProc.signal_after}

```xo
fn (p: FakeProc) signal_after(d: Duration)
```

[Source: `std/testing.xo:173`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L173)

#### FakeProc.on_run {#FakeProc.on_run}

```xo
fn (p: FakeProc) on_run(cmd: Str, out: ProcOutput)
```

[Source: `std/testing.xo:174`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L174)

#### FakeProc.kill {#FakeProc.kill}

```xo
fn (p: FakeProc) kill(pid: Int, signal: Str = "TERM") -> () ! ProcErr uses proc
```

Records the signal; nothing is sent (decision 0190).

[Source: `std/testing.xo:176`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L176)

#### FakeProc.notify {#FakeProc.notify}

```xo
fn (p: FakeProc) notify(signals: List[Signal]) -> Chan[Signal] uses proc
```

[Source: `std/testing.xo:177`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L177)

#### FakeProc.stop_notify {#FakeProc.stop_notify}

```xo
fn (p: FakeProc) stop_notify(c: Chan[Signal]) uses proc
```

[Source: `std/testing.xo:178`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L178)

#### FakeProc.request_stop {#FakeProc.request_stop}

```xo
fn (p: FakeProc) request_stop() uses proc
```

[Source: `std/testing.xo:179`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L179)

#### FakeProc.pid {#FakeProc.pid}

```xo
fn (p: FakeProc) pid() -> Int uses proc
```

[Source: `std/testing.xo:180`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L180)

#### FakeProc.ppid {#FakeProc.ppid}

```xo
fn (p: FakeProc) ppid() -> Int uses proc
```

[Source: `std/testing.xo:181`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L181)

#### FakeProc.usage {#FakeProc.usage}

```xo
fn (p: FakeProc) usage() -> ProcUsage uses proc
```

[Source: `std/testing.xo:182`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L182)

#### FakeProc.children_usage {#FakeProc.children_usage}

```xo
fn (p: FakeProc) children_usage() -> ProcUsage uses proc
```

[Source: `std/testing.xo:183`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L183)

#### FakeProc.killed {#FakeProc.killed}

```xo
fn (p: FakeProc) killed() -> List[Str]
```

The signals kill recorded, as "NAME PID", oldest first.

[Source: `std/testing.xo:185`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L185)

#### FakeProc.runs {#FakeProc.runs}

```xo
fn (p: FakeProc) runs() -> List[Str]
```

The commands the test's code asked to run (`run`, a `Cmd`, a pipeline), oldest first, found or not (a command with no `on_run`
is listed and answers NotFound). Each entry is the program and then each argument after a space; an empty program or argument,
or one with a space or that Go's strconv.Quote writes differently, is written as strconv.Quote does (`"my sub"`, `"a\"b"`).

[Source: `std/testing.xo:189`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L189)

## Functions

### expect {#expect}

```xo
fn expect[T](x: T) -> Expect[T]
```

[Source: `std/testing.xo:30`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L30)

### gen {#gen}

```xo
fn gen[T](seed: Int) -> T
```

[Source: `std/testing.xo:32`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L32)

### logs {#logs}

```xo
fn logs() -> List[log.Record]
```

The records logged so far in the current test, oldest first (std.md 8.6).

[Source: `std/testing.xo:35`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L35)

### fake_db {#fake_db}

```xo
fn fake_db(schema: Str) -> sql.Db ! sql.SqlErr
```

An in memory database created from `schema` (std.md 10.6); same as `sql.memory`.

[Source: `std/testing.xo:38`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L38)

### run_main {#run_main}

```xo
fn run_main[fx: Effects](main: fn(Os) -> () ! Error uses fx, os: TestOs, args: List[Str] = []) -> Int uses fx
```

Runs a program's main against fakes and returns its exit status: 0, 1
for an error returned from main, or the code passed to exit (std.md 8.4).
std.md writes `main: fn(Os) -> () ! Error` without effects; a main
performs effects on its `os`, so the effects pass through an effect
variable here (a pure function type would reject every real main).

[Source: `std/testing.xo:196`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L196)
