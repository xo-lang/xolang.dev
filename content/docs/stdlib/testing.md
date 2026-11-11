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

- type [`TestOs`](#testos)
- type [`Expect`](#expect)
- type [`FakeNet`](#fakenet)
  - method [`FakeNet.listen`](#fakenetlisten)
  - method [`FakeNet.dial`](#fakenetdial)
  - method [`FakeNet.dial_timeout`](#fakenetdial_timeout)
  - method [`FakeNet.lookup_host`](#fakenetlookup_host)
  - method [`FakeNet.interfaces`](#fakenetinterfaces)
  - method [`FakeNet.only`](#fakenetonly)
  - method [`FakeNet.handle`](#fakenethandle)
  - method [`FakeNet.handle_tls`](#fakenethandle_tls)
  - method [`FakeNet.fail`](#fakenetfail)
  - method [`FakeNet.fail_next`](#fakenetfail_next)
  - method [`FakeNet.clear_failures`](#fakenetclear_failures)
  - method [`FakeNet.requests`](#fakenetrequests)
- type [`FakeClock`](#fakeclock)
  - method [`FakeClock.now`](#fakeclocknow)
  - method [`FakeClock.sleep`](#fakeclocksleep)
  - method [`FakeClock.sleep_or_cancel`](#fakeclocksleep_or_cancel)
  - method [`FakeClock.since`](#fakeclocksince)
  - method [`FakeClock.advance`](#fakeclockadvance)
  - method [`FakeClock.set`](#fakeclockset)
  - method [`FakeClock.sleeps`](#fakeclocksleeps)
- type [`FsOp`](#fsop)
- type [`MemFs`](#memfs)
  - method [`MemFs.sub`](#memfssub)
  - method [`MemFs.cwd`](#memfscwd)
  - method [`MemFs.cwd_path`](#memfscwd_path)
  - method [`MemFs.read_only`](#memfsread_only)
  - method [`MemFs.write_only`](#memfswrite_only)
  - method [`MemFs.case_sensitive`](#memfscase_sensitive)
  - method [`MemFs.stat`](#memfsstat)
  - method [`MemFs.exists`](#memfsexists)
  - method [`MemFs.disk_usage`](#memfsdisk_usage)
  - method [`MemFs.read`](#memfsread)
  - method [`MemFs.read_text`](#memfsread_text)
  - method [`MemFs.read_dir`](#memfsread_dir)
  - method [`MemFs.walk`](#memfswalk)
  - method [`MemFs.write`](#memfswrite)
  - method [`MemFs.create_temp`](#memfscreate_temp)
  - method [`MemFs.rename`](#memfsrename)
  - method [`MemFs.remove`](#memfsremove)
  - method [`MemFs.remove_all`](#memfsremove_all)
  - method [`MemFs.create_dir_all`](#memfscreate_dir_all)
  - method [`MemFs.set_modified`](#memfsset_modified)
  - method [`MemFs.open`](#memfsopen)
  - method [`MemFs.create`](#memfscreate)
  - method [`MemFs.open_append`](#memfsopen_append)
  - method [`MemFs.open_rw`](#memfsopen_rw)
  - method [`MemFs.create_new`](#memfscreate_new)
  - method [`MemFs.append`](#memfsappend)
  - method [`MemFs.copy`](#memfscopy)
  - method [`MemFs.mode`](#memfsmode)
  - method [`MemFs.set_mode`](#memfsset_mode)
  - method [`MemFs.symlink`](#memfssymlink)
  - method [`MemFs.read_link`](#memfsread_link)
  - method [`MemFs.glob`](#memfsglob)
  - method [`MemFs.lock`](#memfslock)
  - method [`MemFs.try_lock`](#memfstry_lock)
  - method [`MemFs.fail_next`](#memfsfail_next)
  - method [`MemFs.set_case_sensitive`](#memfsset_case_sensitive)
  - method [`MemFs.set_disk_usage`](#memfsset_disk_usage)
  - method [`MemFs.files`](#memfsfiles)
- type [`FakeEnv`](#fakeenv)
  - method [`FakeEnv.get`](#fakeenvget)
  - method [`FakeEnv.vars`](#fakeenvvars)
  - method [`FakeEnv.args`](#fakeenvargs)
  - method [`FakeEnv.program`](#fakeenvprogram)
  - method [`FakeEnv.home`](#fakeenvhome)
  - method [`FakeEnv.only`](#fakeenvonly)
  - method [`FakeEnv.config_dir`](#fakeenvconfig_dir)
  - method [`FakeEnv.cache_dir`](#fakeenvcache_dir)
  - method [`FakeEnv.hostname`](#fakeenvhostname)
  - method [`FakeEnv.set`](#fakeenvset)
  - method [`FakeEnv.set_args`](#fakeenvset_args)
- type [`FakeStdio`](#fakestdio)
  - method [`FakeStdio.print`](#fakestdioprint)
  - method [`FakeStdio.println`](#fakestdioprintln)
  - method [`FakeStdio.eprint`](#fakestdioeprint)
  - method [`FakeStdio.eprintln`](#fakestdioeprintln)
  - method [`FakeStdio.write`](#fakestdiowrite)
  - method [`FakeStdio.read_line`](#fakestdioread_line)
  - method [`FakeStdio.read_all`](#fakestdioread_all)
  - method [`FakeStdio.lines`](#fakestdiolines)
  - method [`FakeStdio.stdin_is_tty`](#fakestdiostdin_is_tty)
  - method [`FakeStdio.stdout_is_tty`](#fakestdiostdout_is_tty)
  - method [`FakeStdio.stderr_is_tty`](#fakestdiostderr_is_tty)
  - method [`FakeStdio.width`](#fakestdiowidth)
  - method [`FakeStdio.read_secret`](#fakestdioread_secret)
  - method [`FakeStdio.raw_input`](#fakestdioraw_input)
  - method [`FakeStdio.read_bytes`](#fakestdioread_bytes)
  - method [`FakeStdio.read_all_bytes`](#fakestdioread_all_bytes)
  - method [`FakeStdio.set_input`](#fakestdioset_input)
  - method [`FakeStdio.set_tty`](#fakestdioset_tty)
  - method [`FakeStdio.set_input_bytes`](#fakestdioset_input_bytes)
  - method [`FakeStdio.output`](#fakestdiooutput)
  - method [`FakeStdio.errors`](#fakestdioerrors)
- type [`FakeProc`](#fakeproc)
  - method [`FakeProc.exit`](#fakeprocexit)
  - method [`FakeProc.set_grace`](#fakeprocset_grace)
  - method [`FakeProc.run`](#fakeprocrun)
  - method [`FakeProc.only`](#fakeproconly)
  - method [`FakeProc.cmd`](#fakeproccmd)
  - method [`FakeProc.pipeline`](#fakeprocpipeline)
  - method [`FakeProc.exit_code`](#fakeprocexit_code)
  - method [`FakeProc.signal_after`](#fakeprocsignal_after)
  - method [`FakeProc.on_run`](#fakeprocon_run)
  - method [`FakeProc.kill`](#fakeprockill)
  - method [`FakeProc.notify`](#fakeprocnotify)
  - method [`FakeProc.stop_notify`](#fakeprocstop_notify)
  - method [`FakeProc.request_stop`](#fakeprocrequest_stop)
  - method [`FakeProc.pid`](#fakeprocpid)
  - method [`FakeProc.ppid`](#fakeprocppid)
  - method [`FakeProc.usage`](#fakeprocusage)
  - method [`FakeProc.children_usage`](#fakeprocchildren_usage)
  - method [`FakeProc.killed`](#fakeprockilled)
  - method [`FakeProc.runs`](#fakeprocruns)
- fn [`expect`](#expect)
- fn [`gen`](#gen)
- fn [`logs`](#logs)
- fn [`fake_db`](#fake_db)
- fn [`run_main`](#run_main)

## Types

### TestOs

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

### Expect

```xo
struct Expect[T] {}
```

[Source: `std/testing.xo:29`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L29)

### FakeNet

```xo
struct FakeNet {}
```

[Source: `std/testing.xo:41`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L41)

#### FakeNet.listen

```xo
fn (n: FakeNet) listen(addr: Str) -> Listener ! NetErr uses net.listen
```

[Source: `std/testing.xo:42`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L42)

#### FakeNet.dial

```xo
fn (n: FakeNet) dial(addr: Str) -> Conn ! NetErr uses net.dial
```

[Source: `std/testing.xo:43`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L43)

#### FakeNet.dial_timeout

```xo
fn (n: FakeNet) dial_timeout(addr: Str, d: Duration) -> Conn ! NetErr uses net.dial
```

[Source: `std/testing.xo:44`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L44)

#### FakeNet.lookup_host

```xo
fn (n: FakeNet) lookup_host(host: Str) -> List[Str] ! NetErr uses net.dial
```

[Source: `std/testing.xo:45`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L45)

#### FakeNet.interfaces

```xo
fn (n: FakeNet) interfaces() -> List[NetInterface] ! NetErr uses net.listen
```

[Source: `std/testing.xo:46`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L46)

#### FakeNet.only

```xo
fn (n: FakeNet) only(hosts: List[Str]) -> Net
```

[Source: `std/testing.xo:47`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L47)

#### FakeNet.handle

```xo
fn (n: FakeNet) handle(pattern: Str, h: fn(http.Request) -> http.Response)
```

[Source: `std/testing.xo:48`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L48)

#### FakeNet.handle_tls

```xo
fn (n: FakeNet) handle_tls(pattern: Str, cert: tls.TlsCert, h: fn(http.Request) -> http.Response)
```

Like handle for an https pattern, with the certificate the server presents: a request it matches first runs the
client's checks against `cert` as a real handshake would (the roots, the server name, `with_verify`,
`with_verify_conn`, with the handshake's error texts) and fails before the handler when one refuses; the handler's
`tls_state()` reports the server name the client sent (decision 0544).

[Source: `std/testing.xo:53`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L53)

#### FakeNet.fail

```xo
fn (n: FakeNet) fail(pattern: Str, err: http.ClientErr)
```

Every matching request fails with err, until clear_failures. The handler is skipped, so it never sees the
request: use requests() to see what was sent.

[Source: `std/testing.xo:56`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L56)

#### FakeNet.fail_next

```xo
fn (n: FakeNet) fail_next(pattern: Str, err: http.ClientErr)
```

The next matching request fails with err, once; like fail, it skips the handler and requests() still lists it.

[Source: `std/testing.xo:58`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L58)

#### FakeNet.clear_failures

```xo
fn (n: FakeNet) clear_failures()
```

[Source: `std/testing.xo:59`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L59)

#### FakeNet.requests

```xo
fn (n: FakeNet) requests() -> List[http.Request]
```

[Source: `std/testing.xo:60`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L60)

### FakeClock

```xo
struct FakeClock {}
```

[Source: `std/testing.xo:63`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L63)

#### FakeClock.now

```xo
fn (c: FakeClock) now() -> Time uses clock
```

[Source: `std/testing.xo:64`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L64)

#### FakeClock.sleep

```xo
fn (c: FakeClock) sleep(d: Duration) uses clock
```

[Source: `std/testing.xo:65`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L65)

#### FakeClock.sleep_or_cancel

```xo
fn (c: FakeClock) sleep_or_cancel(d: Duration) -> () ! ClockErr uses clock
```

[Source: `std/testing.xo:66`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L66)

#### FakeClock.since

```xo
fn (c: FakeClock) since(t: Time) -> Duration uses clock
```

[Source: `std/testing.xo:67`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L67)

#### FakeClock.advance

```xo
fn (c: FakeClock) advance(d: Duration)
```

[Source: `std/testing.xo:68`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L68)

#### FakeClock.set

```xo
fn (c: FakeClock) set(t: Time)
```

[Source: `std/testing.xo:69`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L69)

#### FakeClock.sleeps

```xo
fn (c: FakeClock) sleeps() -> List[Duration]
```

[Source: `std/testing.xo:70`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L70)

### FsOp

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

### MemFs

```xo
struct MemFs {}
```

[Source: `std/testing.xo:82`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L82)

#### MemFs.sub

```xo
fn (f: MemFs) sub(dir: Str) -> Fs
```

[Source: `std/testing.xo:83`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L83)

#### MemFs.cwd

```xo
fn (f: MemFs) cwd() -> Fs
```

[Source: `std/testing.xo:84`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L84)

#### MemFs.cwd_path

```xo
fn (f: MemFs) cwd_path() -> Str ! FsErr
```

[Source: `std/testing.xo:85`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L85)

#### MemFs.read_only

```xo
fn (f: MemFs) read_only() -> Fs
```

[Source: `std/testing.xo:86`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L86)

#### MemFs.write_only

```xo
fn (f: MemFs) write_only() -> Fs
```

[Source: `std/testing.xo:87`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L87)

#### MemFs.case_sensitive

```xo
fn (f: MemFs) case_sensitive() -> Bool
```

[Source: `std/testing.xo:88`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L88)

#### MemFs.stat

```xo
fn (f: MemFs) stat(path: Str) -> FileInfo? ! FsErr uses fs.read
```

[Source: `std/testing.xo:89`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L89)

#### MemFs.exists

```xo
fn (f: MemFs) exists(path: Str) -> Bool ! FsErr uses fs.read
```

[Source: `std/testing.xo:90`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L90)

#### MemFs.disk_usage

```xo
fn (f: MemFs) disk_usage(path: Str) -> DiskUsage ! FsErr uses fs.read
```

[Source: `std/testing.xo:91`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L91)

#### MemFs.read

```xo
fn (f: MemFs) read(path: Str) -> Bytes ! FsErr uses fs.read
```

[Source: `std/testing.xo:92`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L92)

#### MemFs.read_text

```xo
fn (f: MemFs) read_text(path: Str) -> Str ! FsErr uses fs.read
```

[Source: `std/testing.xo:93`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L93)

#### MemFs.read_dir

```xo
fn (f: MemFs) read_dir(dir: Str) -> List[FileInfo] ! FsErr uses fs.read
```

[Source: `std/testing.xo:94`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L94)

#### MemFs.walk

```xo
fn (f: MemFs) walk(dir: Str) -> List[FileInfo] ! FsErr uses fs.read
```

[Source: `std/testing.xo:95`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L95)

#### MemFs.write

```xo
fn (f: MemFs) write(path: Str, data: Bytes) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:96`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L96)

#### MemFs.create_temp

```xo
fn (f: MemFs) create_temp(dir: Str, prefix: Str) -> Str ! FsErr uses fs.write
```

[Source: `std/testing.xo:97`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L97)

#### MemFs.rename

```xo
fn (f: MemFs) rename(from: Str, to: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:98`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L98)

#### MemFs.remove

```xo
fn (f: MemFs) remove(path: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:99`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L99)

#### MemFs.remove_all

```xo
fn (f: MemFs) remove_all(path: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:100`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L100)

#### MemFs.create_dir_all

```xo
fn (f: MemFs) create_dir_all(dir: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:101`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L101)

#### MemFs.set_modified

```xo
fn (f: MemFs) set_modified(path: Str, t: Time) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:102`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L102)

#### MemFs.open

```xo
fn (f: MemFs) open(path: Str) -> File ! FsErr uses fs.read
```

[Source: `std/testing.xo:103`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L103)

#### MemFs.create

```xo
fn (f: MemFs) create(path: Str) -> File ! FsErr uses fs.write
```

[Source: `std/testing.xo:104`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L104)

#### MemFs.open_append

```xo
fn (f: MemFs) open_append(path: Str) -> File ! FsErr uses fs.write
```

[Source: `std/testing.xo:105`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L105)

#### MemFs.open_rw

```xo
fn (f: MemFs) open_rw(path: Str) -> File ! FsErr uses fs.write
```

Like `Fs.open_rw`.

[Source: `std/testing.xo:107`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L107)

#### MemFs.create_new

```xo
fn (f: MemFs) create_new(path: Str) -> File ! FsErr uses fs.write
```

[Source: `std/testing.xo:108`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L108)

#### MemFs.append

```xo
fn (f: MemFs) append(path: Str, data: Bytes) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:109`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L109)

#### MemFs.copy

```xo
fn (f: MemFs) copy(from: Str, to: Str) -> () ! FsErr uses fs
```

[Source: `std/testing.xo:110`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L110)

#### MemFs.mode

```xo
fn (f: MemFs) mode(path: Str) -> Int ! FsErr uses fs.read
```

[Source: `std/testing.xo:111`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L111)

#### MemFs.set_mode

```xo
fn (f: MemFs) set_mode(path: Str, mode: Int) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:112`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L112)

#### MemFs.symlink

```xo
fn (f: MemFs) symlink(target: Str, link: Str) -> () ! FsErr uses fs.write
```

[Source: `std/testing.xo:113`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L113)

#### MemFs.read_link

```xo
fn (f: MemFs) read_link(path: Str) -> Str? ! FsErr uses fs.read
```

[Source: `std/testing.xo:114`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L114)

#### MemFs.glob

```xo
fn (f: MemFs) glob(pattern: Str) -> List[Str] ! FsErr uses fs.read
```

[Source: `std/testing.xo:115`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L115)

#### MemFs.lock

```xo
fn (f: MemFs) lock(path: Str) -> FileLock ! FsErr uses fs.write
```

[Source: `std/testing.xo:116`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L116)

#### MemFs.try_lock

```xo
fn (f: MemFs) try_lock(path: Str) -> FileLock? ! FsErr uses fs.write
```

[Source: `std/testing.xo:117`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L117)

#### MemFs.fail_next

```xo
fn (f: MemFs) fail_next(op: FsOp, path: Str, err: FsErr)
```

[Source: `std/testing.xo:118`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L118)

#### MemFs.set_case_sensitive

```xo
fn (f: MemFs) set_case_sensitive(on: Bool)
```

[Source: `std/testing.xo:119`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L119)

#### MemFs.set_disk_usage

```xo
fn (f: MemFs) set_disk_usage(u: DiskUsage)
```

What disk_usage answers for every path that exists (decision 0426).

[Source: `std/testing.xo:121`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L121)

#### MemFs.files

```xo
fn (f: MemFs) files() -> Map[Str, Bytes]
```

[Source: `std/testing.xo:122`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L122)

### FakeEnv

```xo
struct FakeEnv {}
```

[Source: `std/testing.xo:125`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L125)

#### FakeEnv.get

```xo
fn (e: FakeEnv) get(name: Str) -> Str? uses env
```

[Source: `std/testing.xo:126`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L126)

#### FakeEnv.vars

```xo
fn (e: FakeEnv) vars() -> Map[Str, Str] uses env
```

[Source: `std/testing.xo:127`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L127)

#### FakeEnv.args

```xo
fn (e: FakeEnv) args() -> List[Str] uses env
```

[Source: `std/testing.xo:128`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L128)

#### FakeEnv.program

```xo
fn (e: FakeEnv) program() -> Str uses env
```

[Source: `std/testing.xo:129`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L129)

#### FakeEnv.home

```xo
fn (e: FakeEnv) home() -> Str ! EnvErr uses env
```

[Source: `std/testing.xo:130`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L130)

#### FakeEnv.only

```xo
fn (e: FakeEnv) only(names: List[Str]) -> Env
```

[Source: `std/testing.xo:131`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L131)

#### FakeEnv.config_dir

```xo
fn (e: FakeEnv) config_dir() -> Str ! EnvErr uses env
```

[Source: `std/testing.xo:132`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L132)

#### FakeEnv.cache_dir

```xo
fn (e: FakeEnv) cache_dir() -> Str ! EnvErr uses env
```

[Source: `std/testing.xo:133`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L133)

#### FakeEnv.hostname

```xo
fn (e: FakeEnv) hostname() -> Str uses env
```

"test", or the value of HOSTNAME when the FakeEnv has one.

[Source: `std/testing.xo:135`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L135)

#### FakeEnv.set

```xo
fn (e: FakeEnv) set(name: Str, value: Str)
```

[Source: `std/testing.xo:136`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L136)

#### FakeEnv.set_args

```xo
fn (e: FakeEnv) set_args(args: List[Str])
```

[Source: `std/testing.xo:137`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L137)

### FakeStdio

```xo
struct FakeStdio {}
```

[Source: `std/testing.xo:139`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L139)

#### FakeStdio.print

```xo
fn (s: FakeStdio) print(text: Str) uses stdio
```

[Source: `std/testing.xo:140`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L140)

#### FakeStdio.println

```xo
fn (s: FakeStdio) println(text: Str) uses stdio
```

[Source: `std/testing.xo:141`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L141)

#### FakeStdio.eprint

```xo
fn (s: FakeStdio) eprint(text: Str) uses stdio
```

[Source: `std/testing.xo:142`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L142)

#### FakeStdio.eprintln

```xo
fn (s: FakeStdio) eprintln(text: Str) uses stdio
```

[Source: `std/testing.xo:143`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L143)

#### FakeStdio.write

```xo
fn (s: FakeStdio) write(data: Bytes) -> () ! IoErr uses stdio
```

[Source: `std/testing.xo:144`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L144)

#### FakeStdio.read_line

```xo
fn (s: FakeStdio) read_line() -> Str? ! IoErr uses stdio
```

[Source: `std/testing.xo:145`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L145)

#### FakeStdio.read_all

```xo
fn (s: FakeStdio) read_all() -> Str ! IoErr uses stdio
```

[Source: `std/testing.xo:146`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L146)

#### FakeStdio.lines

```xo
fn (s: FakeStdio) lines() -> List[Str] ! IoErr uses stdio
```

[Source: `std/testing.xo:147`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L147)

#### FakeStdio.stdin_is_tty

```xo
fn (s: FakeStdio) stdin_is_tty() -> Bool uses stdio
```

[Source: `std/testing.xo:148`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L148)

#### FakeStdio.stdout_is_tty

```xo
fn (s: FakeStdio) stdout_is_tty() -> Bool uses stdio
```

[Source: `std/testing.xo:149`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L149)

#### FakeStdio.stderr_is_tty

```xo
fn (s: FakeStdio) stderr_is_tty() -> Bool uses stdio
```

[Source: `std/testing.xo:150`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L150)

#### FakeStdio.width

```xo
fn (s: FakeStdio) width() -> Int? uses stdio
```

[Source: `std/testing.xo:151`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L151)

#### FakeStdio.read_secret

```xo
fn (s: FakeStdio) read_secret(prompt: Str) -> Str? ! IoErr uses stdio
```

[Source: `std/testing.xo:152`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L152)

#### FakeStdio.raw_input

```xo
fn (s: FakeStdio) raw_input(on: Bool) -> Bool uses stdio
```

[Source: `std/testing.xo:153`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L153)

#### FakeStdio.read_bytes

```xo
fn (s: FakeStdio) read_bytes(max: Int) -> Bytes? ! IoErr uses stdio
```

[Source: `std/testing.xo:154`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L154)

#### FakeStdio.read_all_bytes

```xo
fn (s: FakeStdio) read_all_bytes() -> Bytes ! IoErr uses stdio
```

[Source: `std/testing.xo:155`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L155)

#### FakeStdio.set_input

```xo
fn (s: FakeStdio) set_input(text: Str)
```

[Source: `std/testing.xo:156`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L156)

#### FakeStdio.set_tty

```xo
fn (s: FakeStdio) set_tty(width: Int)
```

The streams are terminals of `width` columns (0: not terminals, the
default), for code that checks `stdout_is_tty` or `width`.

[Source: `std/testing.xo:159`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L159)

#### FakeStdio.set_input_bytes

```xo
fn (s: FakeStdio) set_input_bytes(data: Bytes)
```

Standard input holds these bytes (any bytes, for `read_bytes`).

[Source: `std/testing.xo:161`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L161)

#### FakeStdio.output

```xo
fn (s: FakeStdio) output() -> Str
```

[Source: `std/testing.xo:162`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L162)

#### FakeStdio.errors

```xo
fn (s: FakeStdio) errors() -> Str
```

[Source: `std/testing.xo:163`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L163)

### FakeProc

```xo
struct FakeProc {}
```

[Source: `std/testing.xo:165`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L165)

#### FakeProc.exit

```xo
fn (p: FakeProc) exit(code: Int) -> Never uses proc
```

[Source: `std/testing.xo:166`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L166)

#### FakeProc.set_grace

```xo
fn (p: FakeProc) set_grace(d: Duration) uses proc
```

[Source: `std/testing.xo:167`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L167)

#### FakeProc.run

```xo
fn (p: FakeProc) run(cmd: Str, args: List[Str]) -> ProcOutput ! ProcErr uses proc
```

[Source: `std/testing.xo:168`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L168)

#### FakeProc.only

```xo
fn (p: FakeProc) only(cmds: List[Str]) -> Proc
```

[Source: `std/testing.xo:169`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L169)

#### FakeProc.cmd

```xo
fn (p: FakeProc) cmd(name: Str, args: List[Str] = []) -> Cmd
```

[Source: `std/testing.xo:170`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L170)

#### FakeProc.pipeline

```xo
fn (p: FakeProc) pipeline(cmds: List[Cmd]) -> ProcOutput ! ProcErr uses proc
```

[Source: `std/testing.xo:171`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L171)

#### FakeProc.exit_code

```xo
fn (p: FakeProc) exit_code() -> Int?
```

[Source: `std/testing.xo:172`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L172)

#### FakeProc.signal_after

```xo
fn (p: FakeProc) signal_after(d: Duration)
```

[Source: `std/testing.xo:173`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L173)

#### FakeProc.on_run

```xo
fn (p: FakeProc) on_run(cmd: Str, out: ProcOutput)
```

[Source: `std/testing.xo:174`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L174)

#### FakeProc.kill

```xo
fn (p: FakeProc) kill(pid: Int, signal: Str = "TERM") -> () ! ProcErr uses proc
```

Records the signal; nothing is sent (decision 0190).

[Source: `std/testing.xo:176`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L176)

#### FakeProc.notify

```xo
fn (p: FakeProc) notify(signals: List[Signal]) -> Chan[Signal] uses proc
```

[Source: `std/testing.xo:177`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L177)

#### FakeProc.stop_notify

```xo
fn (p: FakeProc) stop_notify(c: Chan[Signal]) uses proc
```

[Source: `std/testing.xo:178`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L178)

#### FakeProc.request_stop

```xo
fn (p: FakeProc) request_stop() uses proc
```

[Source: `std/testing.xo:179`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L179)

#### FakeProc.pid

```xo
fn (p: FakeProc) pid() -> Int uses proc
```

[Source: `std/testing.xo:180`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L180)

#### FakeProc.ppid

```xo
fn (p: FakeProc) ppid() -> Int uses proc
```

[Source: `std/testing.xo:181`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L181)

#### FakeProc.usage

```xo
fn (p: FakeProc) usage() -> ProcUsage uses proc
```

[Source: `std/testing.xo:182`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L182)

#### FakeProc.children_usage

```xo
fn (p: FakeProc) children_usage() -> ProcUsage uses proc
```

[Source: `std/testing.xo:183`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L183)

#### FakeProc.killed

```xo
fn (p: FakeProc) killed() -> List[Str]
```

The signals kill recorded, as "NAME PID", oldest first.

[Source: `std/testing.xo:185`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L185)

#### FakeProc.runs

```xo
fn (p: FakeProc) runs() -> List[Str]
```

The commands the test's code asked to run (`run`, a `Cmd`, a pipeline), oldest first, found or not (a command with no `on_run`
is listed and answers NotFound). Each entry is the program and then each argument after a space; an empty program or argument,
or one with a space or that Go's strconv.Quote writes differently, is written as strconv.Quote does (`"my sub"`, `"a\"b"`).

[Source: `std/testing.xo:189`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L189)

## Functions

### expect

```xo
fn expect[T](x: T) -> Expect[T]
```

[Source: `std/testing.xo:30`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L30)

### gen

```xo
fn gen[T](seed: Int) -> T
```

[Source: `std/testing.xo:32`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L32)

### logs

```xo
fn logs() -> List[log.Record]
```

The records logged so far in the current test, oldest first (std.md 8.6).

[Source: `std/testing.xo:35`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L35)

### fake_db

```xo
fn fake_db(schema: Str) -> sql.Db ! sql.SqlErr
```

An in memory database created from `schema` (std.md 10.6); same as `sql.memory`.

[Source: `std/testing.xo:38`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L38)

### run_main

```xo
fn run_main[fx: Effects](main: fn(Os) -> () ! Error uses fx, os: TestOs, args: List[Str] = []) -> Int uses fx
```

Runs a program's main against fakes and returns its exit status: 0, 1
for an error returned from main, or the code passed to exit (std.md 8.4).
std.md writes `main: fn(Os) -> () ! Error` without effects; a main
performs effects on its `os`, so the effects pass through an effect
variable here (a pure function type would reject every real main).

[Source: `std/testing.xo:196`](https://github.com/xo-lang/xo/blob/main/std/testing.xo#L196)
