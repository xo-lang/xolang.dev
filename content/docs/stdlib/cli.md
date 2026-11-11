---
title: "std/cli"
linkTitle: "cli"
description: "Command line parsing for tools: a command is a value built by functions (flags, positional argume..."
toc: true
module: "std/cli"
source: "https://github.com/xo-lang/xo/blob/main/std/cli.xo"
generated: "scripts/sync-content.py from `xo doc std/cli`; edit the doc comments in the Xo repo, not this file"
---
## Index

- type [`Command`](#Command)
- type [`Flag`](#Flag)
- type [`Arg`](#Arg)
- type [`Parsed`](#Parsed)
  - method [`Parsed.command`](#Parsed.command)
  - method [`Parsed.bool`](#Parsed.bool)
  - method [`Parsed.str`](#Parsed.str)
  - method [`Parsed.str_opt`](#Parsed.str_opt)
  - method [`Parsed.int`](#Parsed.int)
  - method [`Parsed.int_opt`](#Parsed.int_opt)
  - method [`Parsed.duration`](#Parsed.duration)
  - method [`Parsed.duration_opt`](#Parsed.duration_opt)
  - method [`Parsed.float`](#Parsed.float)
  - method [`Parsed.float_opt`](#Parsed.float_opt)
  - method [`Parsed.strs`](#Parsed.strs)
  - method [`Parsed.is_set`](#Parsed.is_set)
  - method [`Parsed.arg`](#Parsed.arg)
  - method [`Parsed.arg_opt`](#Parsed.arg_opt)
  - method [`Parsed.rest`](#Parsed.rest)
- type [`CliErr`](#CliErr)
  - method [`CliErr.display`](#CliErr.display)
  - method [`CliErr.exit_code`](#CliErr.exit_code)
- fn [`command`](#command)
- fn [`bool_flag`](#bool_flag)
- fn [`str_flag`](#str_flag)
- fn [`int_flag`](#int_flag)
- fn [`duration_flag`](#duration_flag)
- fn [`float_flag`](#float_flag)
- fn [`choice_flag`](#choice_flag)
- fn [`strs_flag`](#strs_flag)
- fn [`arg`](#arg)
- fn [`rest`](#rest)
- fn [`parse`](#parse)
- fn [`parse_or_exit`](#parse_or_exit)
- fn [`help`](#help)
- fn [`completion`](#completion)

## Types

### Command {#Command}

```xo
struct Command {}
```

A command: a name, a help line, flags, positional arguments, and
subcommands (std.md 14.1).

[Source: `std/cli.xo:16`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L16)

### Flag {#Flag}

```xo
struct Flag {}
```

A flag (`--name value`, `-n value`, `--verbose`).

[Source: `std/cli.xo:18`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L18)

### Arg {#Arg}

```xo
struct Arg {}
```

A positional argument.

[Source: `std/cli.xo:20`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L20)

### Parsed {#Parsed}

```xo
struct Parsed {}
```

The result of `parse`: the selected command and every value.

[Source: `std/cli.xo:22`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L22)

#### Parsed.command {#Parsed.command}

```xo
fn (p: Parsed) command() -> Str
```

The selected subcommand path, words joined by one space ("" for the
root command).

[Source: `std/cli.xo:86`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L86)

#### Parsed.bool {#Parsed.bool}

```xo
fn (p: Parsed) bool(name: Str) -> Bool
```

[Source: `std/cli.xo:87`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L87)

#### Parsed.str {#Parsed.str}

```xo
fn (p: Parsed) str(name: Str) -> Str
```

The value given, else the default ("" without one).

[Source: `std/cli.xo:89`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L89)

#### Parsed.str_opt {#Parsed.str_opt}

```xo
fn (p: Parsed) str_opt(name: Str) -> Str?
```

The value given; None when the flag was not given (on the command line
or in its variable).

[Source: `std/cli.xo:92`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L92)

#### Parsed.int {#Parsed.int}

```xo
fn (p: Parsed) int(name: Str) -> Int
```

[Source: `std/cli.xo:93`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L93)

#### Parsed.int_opt {#Parsed.int_opt}

```xo
fn (p: Parsed) int_opt(name: Str) -> Int?
```

[Source: `std/cli.xo:94`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L94)

#### Parsed.duration {#Parsed.duration}

```xo
fn (p: Parsed) duration(name: Str) -> Duration
```

[Source: `std/cli.xo:95`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L95)

#### Parsed.duration_opt {#Parsed.duration_opt}

```xo
fn (p: Parsed) duration_opt(name: Str) -> Duration?
```

[Source: `std/cli.xo:96`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L96)

#### Parsed.float {#Parsed.float}

```xo
fn (p: Parsed) float(name: Str) -> Float
```

[Source: `std/cli.xo:97`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L97)

#### Parsed.float_opt {#Parsed.float_opt}

```xo
fn (p: Parsed) float_opt(name: Str) -> Float?
```

[Source: `std/cli.xo:98`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L98)

#### Parsed.strs {#Parsed.strs}

```xo
fn (p: Parsed) strs(name: Str) -> List[Str]
```

Every value of a `strs_flag`, in order.

[Source: `std/cli.xo:100`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L100)

#### Parsed.is_set {#Parsed.is_set}

```xo
fn (p: Parsed) is_set(name: Str) -> Bool
```

Whether the flag was given on the command line or in its variable.

[Source: `std/cli.xo:102`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L102)

#### Parsed.arg {#Parsed.arg}

```xo
fn (p: Parsed) arg(name: Str) -> Str
```

A required positional argument.

[Source: `std/cli.xo:104`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L104)

#### Parsed.arg_opt {#Parsed.arg_opt}

```xo
fn (p: Parsed) arg_opt(name: Str) -> Str?
```

An optional positional argument; None when absent.

[Source: `std/cli.xo:106`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L106)

#### Parsed.rest {#Parsed.rest}

```xo
fn (p: Parsed) rest(name: Str) -> List[Str]
```

The arguments collected by `rest`.

[Source: `std/cli.xo:108`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L108)

### CliErr {#CliErr}

```xo
enum CliErr {
  Help(text: Str)
  Version(text: Str)
  Usage(msg: Str, usage: Str)
}
```

Why `parse` did not return a `Parsed`. `Help` and `Version` are not
failures: the user asked for the text (exit status 0). `Usage` is a
mistake in the arguments (exit status 2). Displays as the text of
`Help` and `Version` and as the message of `Usage`.

[Source: `std/cli.xo:28`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L28)

#### CliErr.display {#CliErr.display}

```xo
fn (e: CliErr) display() -> Str
```

[Source: `std/cli.xo:37`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L37)

#### CliErr.exit_code {#CliErr.exit_code}

```xo
fn (e: CliErr) exit_code() -> Int
```

0 for `Help` and `Version`, 2 for `Usage`.

[Source: `std/cli.xo:39`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L39)

## Functions

### command {#command}

```xo
fn command(name: Str, help: Str, flags: List[Flag] = [], args: List[Arg] = [], commands: List[Command] = [], version: Str = "", single_dash_long: Bool = false, stop_at_positional: Bool = false) -> Command
```

A command. `name` is the program's name for the root command and the
word that selects a subcommand. A command with subcommands takes no
positional arguments of its own.

[Source: `std/cli.xo:44`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L44)

### bool_flag {#bool_flag}

```xo
fn bool_flag(name: Str, help: Str, short: Str = "", env: Str = "", default: Bool = false) -> Flag
```

A flag that is true when given (`--verbose`, `-v`, `--verbose=false`),
else `default`.

[Source: `std/cli.xo:48`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L48)

### str_flag {#str_flag}

```xo
fn str_flag(name: Str, help: Str, short: Str = "", default: Str = "", env: Str = "", required: Bool = false, value: Str = "str") -> Flag
```

A text flag. `value` names the value in the help (`--out <path>`).

[Source: `std/cli.xo:50`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L50)

### int_flag {#int_flag}

```xo
fn int_flag(name: Str, help: Str, short: Str = "", default: Int = 0, env: Str = "", required: Bool = false) -> Flag
```

An integer flag.

[Source: `std/cli.xo:52`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L52)

### duration_flag {#duration_flag}

```xo
fn duration_flag(name: Str, help: Str, short: Str = "", default: Duration = 0s, env: Str = "", required: Bool = false) -> Flag
```

A duration flag, in `Duration.parse` syntax (`30s`, `1m30s`).

[Source: `std/cli.xo:54`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L54)

### float_flag {#float_flag}

```xo
fn float_flag(name: Str, help: Str, short: Str = "", default: Float = 0.0, env: Str = "", required: Bool = false) -> Flag
```

A floating point flag, in `Float.parse` syntax (`1.5`, `2e-3`, `inf`;
Go's flag.Float64).

[Source: `std/cli.xo:57`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L57)

### choice_flag {#choice_flag}

```xo
fn choice_flag(name: Str, help: Str, choices: List[Str], short: Str = "", default: Str = "", env: Str = "", required: Bool = false) -> Flag
```

A text flag whose value must be one of `choices`.

[Source: `std/cli.xo:59`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L59)

### strs_flag {#strs_flag}

```xo
fn strs_flag(name: Str, help: Str, short: Str = "", env: Str = "", value: Str = "str") -> Flag
```

A text flag that may be repeated (`-t a -t b`); its variable, if any, is
split on commas.

[Source: `std/cli.xo:62`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L62)

### arg {#arg}

```xo
fn arg(name: Str, help: Str, optional: Bool = false) -> Arg
```

One positional argument, required unless `optional`.

[Source: `std/cli.xo:65`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L65)

### rest {#rest}

```xo
fn rest(name: Str, help: Str, min: Int = 0) -> Arg
```

Every remaining positional argument (at least `min`); must be last.

[Source: `std/cli.xo:67`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L67)

### parse {#parse}

```xo
fn parse(cmd: Command, args: List[Str], env: Env) -> Parsed ! CliErr uses env
```

Parses `args` (without the program name, as `Env.args` gives them)
against `cmd`. Flags not given on the command line are read from their
`env` variable through `env`.

[Source: `std/cli.xo:72`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L72)

### parse_or_exit {#parse_or_exit}

```xo
fn parse_or_exit(cmd: Command, env: Env, stdio: Stdio, proc: Proc) -> Parsed uses (env, stdio, proc)
```

`parse(cmd, env.args(), env)` for `main`: prints the help or version to
standard output and exits with status 0, or prints a usage error to
standard error and exits with status 2.

[Source: `std/cli.xo:76`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L76)

### help {#help}

```xo
fn help(cmd: Command, path: Str = "") -> Str
```

The help text of `cmd`, or of the subcommand at `path` ("remote add").

[Source: `std/cli.xo:78`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L78)

### completion {#completion}

```xo
fn completion(cmd: Command, shell: Str) -> Str ! CliErr
```

A completion script for "bash", "zsh", or "fish" (std.md 14.5,
decision 0165): subcommands, flags, and choice values; another shell
is a Usage error.

[Source: `std/cli.xo:82`](https://github.com/xo-lang/xo/blob/main/std/cli.xo#L82)
