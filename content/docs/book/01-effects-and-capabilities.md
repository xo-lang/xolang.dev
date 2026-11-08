---
title: "Effects and capabilities"
description: "A signature lists what a function can reach, a capability value is the permission to reach it, and a narrowed capability is a smaller permission."
weight: 1
---

In most languages any function can open a file, read the clock, or call the
network, and you find out by reading its body. In Xo the signature says it.
Two ideas work together:

- an **effect** is a name in the `uses` clause (`fs.read`, `clock`, `stdio`);
- a **capability** is a value (`Fs`, `Clock`, `Stdio`) that grants the
  permission. `main` receives them all in `os: Os`; everything else must be
  passed one.

## Pure, and what it costs to stop being pure

{{% example "book/caps-basics" %}}

- `parse_pair` has no `uses` clause, so it cannot reach the outside world.
  Calling something that does is a compile error.
- `count_keys` takes an `Fs` and declares `uses fs.read`. The effect is the
  promise, the `Fs` argument is the means.
- `stamp` declares two effects, `clock` and `stdio`, in one `uses (...)` list.
- The tests run against a fake `os`: an in-memory file system, a virtual clock
  fixed at 1767225600, and captured output. No test touches the disk.

Forgetting the declaration is caught at compile time, with the effect named:

{{% mistake "effect" %}}

## Handing out less

A capability can be narrowed before it is passed on. A function that only
needs to read gets a read-only view; one that writes under a directory gets a
sub-directory.

{{% example "book/caps-narrow" %}}

- `os.fs.sub("/tmp")` is an `Fs` rooted at `/tmp`; `.read_only()` removes the
  write effects from what it will grant.
- `save_report` cannot tell that its `Fs` is narrowed. It still returns an
  error value, `permission denied`, instead of failing in some other way.
- A path that climbs out with `..` is refused too (the third test).

Because the narrowing is a value, you can audit a program by reading `main`:
whatever it never hands to a function, that function cannot use.

## Effects that pass through

A higher order function should not guess what its argument does. An effect
variable stands for "whatever `f` does":

{{% example "book/caps-fx" %}}

`twice[fx: Effects]` is pure when given a pure closure and prints when given a
printing one, so one definition serves both.

## What to take away

- Read a signature's `uses` clause to know what a function can reach.
- Pass the narrowest capability that does the job.
- Test with the fake `os`: the fakes are the same types as the real ones.

Next: [Error handling](/docs/book/02-error-handling/).
