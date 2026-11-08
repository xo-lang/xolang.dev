---
title: "What Xo promises before 1.0, and what it will promise at 1.0"
date: 2026-11-08T07:30:00-05:00
description: "Xo is on 0.x and a minor release may break code. The written policy: every break ships with an xo fix rewrite and a changelog line, deprecations come a release before removal, diagnostic codes keep their meaning, and the 1.0 promise is editions."
---

Xo is on 0.x, so a minor release may change the language. That is honest, but
it is not a policy: a user of 0.x could not tell what a minor release may do
to their code. The project owner asked for the policy to be written now and
frozen later ("you can write that policy now and then we will freeze later",
2026-11-08), and it is decision 0567. As usual, AI agents wrote it and the
owner set the direction.

## What 0.x promises

Four rules, all in force now:

1. **`edition preview` is not frozen.** A minor release may change the
   language, the prelude and the standard library. A patch release is a fix
   with no spec change.
2. **Every break ships with a rewrite and a changelog line.** The release that
   breaks code also brings an `xo fix` rewrite (or a diagnostic that names the
   replacement), and a changelog entry marked **Breaking** that says how to
   migrate.
3. **Deprecate first, remove in a later minor release.** Never in the same
   release. The first case was `uuid.Uuid`: its `u.0` form was a vet warning in
   0.33.0 and a type error in 0.34.0, with the migration written out in the
   changelog. The rule that case implies is at least one minor release between
   the warning and the removal.
4. **Diagnostic codes never change meaning.** A code you search for or silence
   today means the same thing in a later release. A code that is no longer
   reported stays in the table, marked retired.

## What 1.0 will promise

The promise is spec section 13, and it is built on editions. At 1.0 the owner
names the first frozen edition, and `xo fix` rewrites `edition preview` to it.
From then on, code that builds under an edition keeps its meaning under later
toolchains; a new edition may change syntax and defaults but never the meaning
of code in older editions; `xo fix --edition=<name>` migrates a module and
leaves it compiling; and the standard library never removes an API within an
edition, with a rewrite for every deprecation.

## The road to 1.0

1.0 is the owner's call and has no date. The criteria the policy proposes, for
the owner to edit: every open question in the spec's Appendix B answered by a
decision record; several outside projects in real use for some months; a run
of releases with no breaking change; one or two release candidates; and a
tester round per release, as with 0.33.0.

The full text is on the [compatibility policy](/docs/compatibility/) page.
