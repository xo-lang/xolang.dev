---
title: "Diagnostic codes"
description: "Every XOnnnn code the xo toolchain reports, with an example and a fix."
weight: 40
generated: "scripts/sync-content.py; edit the source, not this file"
---
Every problem `xo check` reports has a stable code. A code never changes
meaning; new problems get new codes. `xo check --json` reports them as
JSON with notes and machine applicable fixes, and `xo explain <code>`
prints the explanation below in a terminal.

| Code | Severity | Phase | Meaning |
|---|---|---|---|
| [`XO0101`](xo0101/) | error | checker | name breaks the enforced naming rules (core 1.5) |
| [`XO0110`](xo0110/) | error | checker | unused local binding or import (core 3.1) |
| [`XO0150`](xo0150/) | error | lexer | character that cannot start any token |
| [`XO0151`](xo0151/) | error | lexer | string, raw string, bytes, or triple quoted string not closed |
| [`XO0152`](xo0152/) | error | lexer | rune literal that is empty, unterminated, or holds more than one character |
| [`XO0153`](xo0153/) | error | lexer | unknown or malformed escape sequence |
| [`XO0154`](xo0154/) | error | lexer | bad digit, misplaced `_`, missing digits, or out of range integer |
| [`XO0155`](xo0155/) | error | lexer | unknown duration unit, fractional or non decimal duration |
| [`XO0156`](xo0156/) | error | lexer | `${` without a matching `}` in the same string |
| [`XO0157`](xo0157/) | error | lexer | `${}` with no expression |
| [`XO0158`](xo0158/) | error | lexer | `use` not followed by a valid import path |
| [`XO0160`](xo0160/) | error | parser | a token that does not fit the grammar here |
| [`XO0161`](xo0161/) | error | parser | list element followed by a newline instead of a comma (core 1.3) |
| [`XO0162`](xo0162/) | error | parser | `else` must be on the line of the closing brace (core 1.3) |
| [`XO0163`](xo0163/) | error | parser | unparenthesized struct literal in a condition (core 1.4) |
| [`XO0164`](xo0164/) | error | parser | `(`, `[`, or `{` not closed before end of file |
| [`XO0165`](xo0165/) | error | parser | syntax that is not a pattern (core 3.5) |
| [`XO0166`](xo0166/) | error | parser | `while cond` used as an expression; only `while { }` is one |
| [`XO0167`](xo0167/) | error | parser | top level declaration (fn, struct, const, ...) inside a block |
| [`XO0168`](xo0168/) | error | parser | statement (let, expression, ...) at top level |
| [`XO0169`](xo0169/) | error | parser | match or select arms separated by `,` instead of newlines |
| [`XO0170`](xo0170/) | error | parser | several effects in a function type must be parenthesized (core 15) |
| [`XO0171`](xo0171/) | error | parser | `..` used more than once or not last in pattern fields |
| [`XO0172`](xo0172/) | error | parser | function declaration without a body |
| [`XO0173`](xo0173/) | error | parser | `use` after the first declaration (core 15: File) |
| [`XO0174`](xo0174/) | error | parser | bare `self` parameter outside an interface method signature |
| [`XO0175`](xo0175/) | error | parser | two statements or arms on one line |
| [`XO0176`](xo0176/) | error | parser | `pub` before something that cannot be exported |
| [`XO0177`](xo0177/) | error | parser | syntax from another language (Go, Rust, TypeScript, Python, Swift, Kotlin); names the habit and the Xo form (decision 0087) |
| [`XO0178`](xo0178/) | error | parser | a line starts with a binary operator (`\|\|`, `&&`, `+`, `==`, ...); end the previous line with it (core 1.3, decision 0136) |
| [`XO0201`](xo0201/) | error | checker | Result value is never used (core 2.6) |
| [`XO0202`](xo0202/) | error | checker | error type does not convert to the enclosing error type (core 2.6) |
| [`XO0203`](xo0203/) | error | checker | success of a Result typed T must be written Ok(x) (core 2.6) |
| [`XO0204`](xo0204/) | error | checker | `?` on an Option in a function returning a Result (core 2.5) |
| [`XO0205`](xo0205/) | error | checker | `?` where the enclosing function cannot return the failure (core 2.5, 2.6) |
| [`XO0206`](xo0206/) | error | checker | `let _ =` discards a Result; use `.ignore_err("reason")` (core 2.6) |
| [`XO0207`](xo0207/) | warning | vet | method chain on the right of `??` starts at a literal, so it applies only to the default (core 15 precedence) |
| [`XO0208`](xo0208/) | note | vet | `.ignore_err("reason")` discards an error; listed with its reason for review (core 2.6) |
| [`XO0209`](xo0209/) | error | checker | an expression statement discards the result of a call that only computes it, such as `xs.reverse()` (core 2.6) |
| [`XO0301`](xo0301/) | error | checker | match does not cover every case (core 2.3) |
| [`XO0302`](xo0302/) | error | checker | pattern does not fit the type of the matched value (core 3.5) |
| [`XO0303`](xo0303/) | error | checker | refutable pattern where an irrefutable one is required (core 3.5) |
| [`XO0304`](xo0304/) | error | checker | alternatives of an or pattern bind different names or types (core 3.5) |
| [`XO0305`](xo0305/) | warning | checker | `_` arm hides variants of an enum declared in this module (core 3.5) |
| [`XO0401`](xo0401/) | error | checker | value of the wrong type; only three implicit conversions exist (core 2.10) |
| [`XO0402`](xo0402/) | error | checker | type arguments cannot be inferred (core 2.7) |
| [`XO0403`](xo0403/) | error | checker | wrong arguments or fields: count, names, missing, or duplicates |
| [`XO0404`](xo0404/) | error | checker | type does not implement a required interface or constraint (core 2.4) |
| [`XO0405`](xo0405/) | error | checker | type cannot be inferred here; annotate it |
| [`XO0406`](xo0406/) | error | checker | operator, index, slice, or iteration not defined for the type |
| [`XO0407`](xo0407/) | error | checker | name used as the wrong kind of thing (a type as a value, a value that is not callable) |
| [`XO0408`](xo0408/) | error | checker | a block const initializer is not a compile time value (core 3.1) |
| [`XO0409`](xo0409/) | error | checker | invalid explicit conversion (core 2.1) |
| [`XO0410`](xo0410/) | error | checker | reading a Map by index; use `get` or `get_or_fault` (core 3.6) |
| [`XO0411`](xo0411/) | error | checker | two fields have one wire key under a derive the struct has (core 2.2, decision 0277) |
| [`XO0412`](xo0412/) | error | checker | empty wire name, `as ""` (core 2.2) |
| [`XO0413`](xo0413/) | error | checker | unknown derive argument or `case:` value, or an argument on a derive that takes none (core 2.2) |
| [`XO0414`](xo0414/) | warning | checker | a wire name on a struct with no derive that maps fields to keys (core 2.2) |
| [`XO0415`](xo0415/) | error | checker | a top-level constant's initializer performs an effect (core 3.1, decision 0332) |
| [`XO0416`](xo0416/) | error | checker | a constant's value holds a handle (`Mutex`, `Chan`, `Atomic`, `Task`, a file) (core 3.1, decision 0332) |
| [`XO0420`](xo0420/) | error | checker | constant std/time layout is invalid: unknown field, bad field form, or stray brace (std.md 13.3) |
| [`XO0421`](xo0421/) | error | checker | integer literal does not fit the integer type it takes in context (1.6) |
| [`XO0422`](xo0422/) | error | checker | unknown wire name option; the only one is `omitempty` (core 2.2, decision 0309) |
| [`XO0423`](xo0423/) | error | checker | a field has two wire strings for one format (`json "a" json "b"`) (core 2.2, decision 0315) |
| [`XO0424`](xo0424/) | error | checker | a format's wire string (`json`, `sql`, `xml`) on a struct that does not derive that format (core 2.2, decision 0315) |
| [`XO0425`](xo0425/) | error | checker | a field type, a type parameter list, or a nested struct that `derive Xml` cannot map (core 2.9, decision 0315) |
| [`XO0426`](xo0426/) | error | checker | a bad `xml` wire string: an unknown or unsupported option, `attr` with a path, `chardata` or `attr` on a type that cannot hold it (core 2.9, decision 0315) |
| [`XO0427`](xo0427/) | error | checker | `xml.encode_value` or `xml.decode` of a type parameter instead of a concrete struct (core 2.9, decision 0315) |
| [`XO0501`](xo0501/) | error | checker | var method called on a non var binding (core 3.4) |
| [`XO0502`](xo0502/) | error | checker | assignment to an immutable binding or to a captured variable (core 5.2, 3.3) |
| [`XO0503`](xo0503/) | error | checker | one variable or overlapping places passed to two `var` parameters of one call (core 5.2, decision 0111) |
| [`XO0510`](xo0510/) | error | checker | use of a moved Buf, StrBuilder, BytesBuilder, or std move only handle (core 5.3) |
| [`XO0520`](xo0520/) | error | checker | mutation of a copied or stored collection element is never written back (core 5.2) |
| [`XO0530`](xo0530/) | warning | vet | binding the payload of a field shares every heap field of a large value (decision 0263) |
| [`XO0531`](xo0531/) | warning | vet | a large parameter is only stored while each caller passes its last use, so its heap fields are shared and dropped again (decision 0263) |
| [`XO0532`](xo0532/) | note | vet | a Map value read into a `var`, changed, and stored back; `Map.update` does it in one lookup (decision 0266) |
| [`XO0534`](xo0534/) | note | vet | a task captures a value with many heap fields (32 or more), sharing each at the spawn (core 5.1, decision 0294) |
| [`XO0535`](xo0535/) | note | vet | `${x.debug()}` in a string, which `${x:?}` writes shorter; its fix rewrites it (core 1.6, decision 0296) |
| [`XO0536`](xo0536/) | note | vet | a collection copied out of a list element, changed, and stored back, so its first change copies all of it; change the element in place (core 5.1, decision 0294) |
| [`XO0537`](xo0537/) | warning | vet | retired, never reported; was: a by value receiver read before an argument that changes it; decision 0326 defines that order, so the check is gone (the code stays reserved) |
| [`XO0538`](xo0538/) | warning | vet | a `var` local written after a closure that reads it was created and before the closure is used: the closure keeps the value from its creation (core 5.1) |
| [`XO0540`](xo0540/) | warning | checker | a `Mutex.with` closure writes its `var` value, then a path returns `Err`, which undoes the write (core 5.4) |
| [`XO0601`](xo0601/) | error | checker | name does not resolve (core 4.3) |
| [`XO0602`](xo0602/) | error | checker | import path does not yield a valid local name (core 4.1) |
| [`XO0603`](xo0603/) | error | checker | name declared twice in one scope, or a predeclared name redefined (core 3.1, 1.4) |
| [`XO0604`](xo0604/) | error | checker | cyclic module imports (core 4.1) |
| [`XO0605`](xo0605/) | error | checker | name is not `pub` in its module, or the std type is an opaque handle (core 1.5) |
| [`XO0606`](xo0606/) | error | checker | method declared outside the module of its type (core 3.4) |
| [`XO0607`](xo0607/) | error | checker | `break` or `continue` outside a loop, or an unknown label (core 3.5) |
| [`XO0608`](xo0608/) | error | checker | two C ABI export modules of the native std (std/native/llrt/cabi*.xo) define the same function name, one symbol `xo_x_<name>` (decision 0207) |
| [`XO0701`](xo0701/) | error | checker | effect performed outside the declared set (core 6.2) |
| [`XO0702`](xo0702/) | error | checker | unknown effect label (core 6.1) |
| [`XO0703`](xo0703/) | warning | vet | effect declared in `uses` is never performed (core 6.2) |
| [`XO0801`](xo0801/) | error | checker | child or group task error does not convert to the enclosing error type (core 7.1) |
| [`XO0802`](xo0802/) | error | checker | scope handle, or a value containing a task group, escapes its scope (core 7.1) |
| [`XO0803`](xo0803/) | error | checker | task started without a scope handle (core 7.1) |
| [`XO0804`](xo0804/) | warning | checker | value read in one `Mutex.with` is written back in a later one (core 5.4) |
| [`XO0900`](xo0900/) | warning | checker | typed hole report (core 3.7) |
| [`XO0901`](xo0901/) | warning | vet | `dbg(...)` left in code (core 11.4) |
| [`XO0902`](xo0902/) | warning | vet | `tls.Verify.None`: a TLS client that checks no certificate (std.md 27, decision 0281) |
| [`XO0903`](xo0903/) | warning | vet | the error of a filesystem, network, or process call turned into a default (`.ok() ?? d`, or `Err(_) => <empty>` with no NotFound arm), so a transient error gives a smaller answer instead of an error; `// xo:allow XO0903 <reason>` on the line or above it allows one |
| [`XO0906`](xo0906/) | note | vet | a `match` that only unwraps an Option or a Result or leaves, which `x ?? return v` (`r ?? e => return v`) writes in one line (core 2.5, 2.6, decision 0321) |
| [`XO0907`](xo0907/) | note | vet --cost | a loop that copies every entry of a map before it starts (a log-mode map through a forked view, or a body the in-place walk does not take; decision 0327) |
| [`XO0908`](xo0908/) | note | vet --cost | in a loop, an element of a collection made outside it is counted up and down each iteration (passed to a function value whose result has its type, which takes it), or a prelude method hands each element holding heap memory to such a function value (`map`, `filter`, `find`, `any`, `all`, `fold` of a List, Map, or Set; decisions 0327, 0337) |
| [`XO0909`](xo0909/) | note | vet --cost | a list update in a loop that copies the whole list every iteration: the list is also kept in the same iteration (stored, captured, or a name used after the update), so it is shared when the update runs (decision 0327) |
| [`XO0910`](xo0910/) | note | vet --cost | a value over 8 words copied where the source shows no copy: captured by a closure, or, in a loop, an element of a collection wrapped whole in an Option or enum value (decision 0327) |
| [`XO0911`](xo0911/) | note | vet --cost | a view of a parameter's text (a slice or trim made in a loop, or an element of its split or lines) stored in a field or a returned collection keeps the whole input alive; `clone()` it (decision 0330) |
| [`XO0904`](xo0904/) | warning | vet | a file an embed constant embeds is ignored or untracked by git, so a build of a clean checkout embeds something else or fails (decision 0304) |
| [`XO1001`](xo1001/) | error | reserved | `std/sys/<os>` used outside the matching target arm (core 12.2) |
| [`XO1101`](xo1101/) | error | checker | Go package cannot be bound (not found, does not build, main package, or binding error) |
| [`XO1102`](xo1102/) | error | checker | Go name exists but its signature does not map to Xo, so the binding skipped it |
| [`XO1103`](xo1103/) | note | vet | per module report of `use go` packages and the functions that perform `go` (decision 0041) |
| [`XO1104`](xo1104/) | error | checker | C header cannot be bound (not found, clang cannot read it, a `link` file is missing, or an unknown effect in its `uses`) |
| [`XO1105`](xo1105/) | error | checker | C function exists in the header but its signature does not map to Xo, so the binding skipped it |
| [`XO1201`](xo1201/) | error | no GC check, checker (`use c` without `--no-gc`) | construct, std API, or effect not available without a garbage collector (`--no-gc`); planned or impossible |
| [`XO1301`](xo1301/) | error | modules | malformed xo.mod require or deny line, xo.lock, or xo.work line, or a deny rule naming a package that does not exist (core 4.2, 4.3) |
| [`XO1302`](xo1302/) | error | modules | module version cannot be fetched from git or a module proxy (XO_PROXY): repository, tag, or version missing, or its xo.mod declares another path |
| [`XO1303`](xo1303/) | error | modules | module version is not in the module cache and the build is offline (XO_OFFLINE, --offline) |
| [`XO1304`](xo1304/) | error | modules | module tree does not match its xo.lock content hash (core 4.3) |
| [`XO1305`](xo1305/) | error | modules | xo.lock has no hash for a module version the build uses; run `xo mod tidy` |
| [`XO1306`](xo1306/) | error | checker | import of a package from a module that xo.mod does not require |
| [`XO1307`](xo1307/) | error | modules | vendor/ does not match xo.mod; run `xo vendor` |
| [`XO1308`](xo1308/) | error | build | release build (`xo build --release`, or `--ci`) while an xo.work workspace overrides required modules |
| [`XO1309`](xo1309/) | error | checker | call into a dependency performs an effect above its ceiling (`require ... uses ...` in xo.mod, `use ... uses ...` in xo.work) |
| [`XO1310`](xo1310/) | error | publish | `xo publish`: a minor or patch release removes or changes an export, or adds an effect to one |
| [`XO1311`](xo1311/) | error | publish | `xo publish`: the release cannot be made (not in a git repository, a subdirectory module path not ending in its directory, uncommitted changes, tag exists, version not above the last, wrong /vN path) |
| [`XO1312`](xo1312/) | error | checker | `use` of a package that a `deny` rule of xo.mod forbids (decision 0095) |
| [`XO1313`](xo1313/) | error | modules | a fetched module version disagrees with the checksum log (XO_SUMDB), or the log's signature or proofs do not verify (4.3, decision 0124) |
| [`XO1314`](xo1314/) | error | modules | the checksum log cannot be consulted, or XO_PROXY, XO_SUMDB, XO_NOPROXY, or XO_NOSUMDB is malformed (4.2, decisions 0124, 0126) |
| [`XO1315`](xo1315/) | note | checker | `edition 2026` in xo.mod (or `xo 2026` in xo.work) is the old name of `edition preview`; the fix rewrites it (13, decision 0155) |
| [`XO1316`](xo1316/) | error | checker, xo get | `use c` or `use go` of an impure Go package in a required module without the consumer's `vouch` for that version (4.2, decision 0156) |
| [`XO1317`](xo1317/) | error | modules | a dependency's effects are wider than its `effects` line in xo.lock (4.3, decision 0156) |
| [`XO1318`](xo1318/) | error | modules | a module's tree cannot be read (an I/O error) for its content hash, the effect or escape hatch audit, or `xo mod tidy`'s import scan, so none of them answers from a partial tree (4.3, decision 0156) |
| [`XO1401`](xo1401/) | error | checker | allocation in a real-time function (literal, interpolation, `+` on Str or List, closure, growth method) |
| [`XO1402`](xo1402/) | error | checker | loop without a provable bound in a real-time function, or a `bound N` that is not a constant or is exceeded by a constant range |
| [`XO1403`](xo1403/) | error | checker | call in a real-time function of a function that is not real-time, a function value, or an interface method |
| [`XO1404`](xo1404/) | error | checker | recursion among real-time functions |
| [`XO1405`](xo1405/) | error | checker | blocking operation (channel, Mutex, scope, select, task) or capability effect in a real-time function |
| [`XO1501`](xo1501/) | error | build | `--stamp NAME=VALUE` names no `const NAME: Str = "..."` (a plain string literal) of the main module (decision 0165) |
| [`XO1502`](xo1502/) | error | build | the go command the Go backend runs (`$XO_GO`, else `go` on PATH) is older than Go 1.24, the oldest Go that builds generated programs and the runtime (decision 0176) |
| [`XO1503`](xo1503/) | error | build | the Go backend finds no go command: `$XO_GO` is not an executable file, or there is no `go` on PATH; the native backends need none (decision 0176) |
| [`XO1504`](xo1504/) | error | build | the program uses a std API the LLVM backend's runtime does not support on the build's target yet: none since stage 2 of decision 0197 (2026-10-12; stage 1 left out processes on Windows); the message names them, and the Go backend builds the program |
| [`XO1505`](xo1505/) | error | build | the LLVM backend's clang (`$XO_CLANG`, else `clang`, or `--cc`) is an LLVM clang older than 16, whose LLVM lacks llvm.threadlocal.address; Apple's clang (numbered apart) is not checked (gotchas/llvm-thread-local-constant.md) |
| [`XO1506`](xo1506/) | error | checker | `embed("...")` names no file, more than one for a `Str` or `Bytes` constant, a file that cannot be read, or more than an embed may hold (64 MiB each, 256 MiB a program; decision 0304) |
| [`XO1507`](xo1507/) | error | checker | an `embed` path leaves the module: absolute, `..`, `.`, an empty segment, or a symbolic link (decision 0304) |
| [`XO1508`](xo1508/) | error | checker | a `Str` embed constant's file is not valid UTF-8; declare it `Bytes` (decision 0304) |
| [`XO1509`](xo1509/) | error | checker | `embed` used other than as the initializer of a constant typed `Str`, `Bytes`, or `embed.Dir`, with one plain string literal (decision 0304) |
{.codes}
