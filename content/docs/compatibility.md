---
title: "Compatibility policy"
linkTitle: "Compatibility policy"
description: "What a Xo release may change before 1.0, how breaks and deprecations are announced and migrated, and what the 1.0 promise will be."
weight: 16
toc: true
---

Xo is on 0.x. This page says what that means for code you write today, and
what changes at 1.0. The source is decision 0567 in the Xo repository, which
follows [spec section 13](/docs/spec/core/) and decisions 0089 and 0155. The
policy is in force now and is frozen when the project owner declares 1.0,
which is the owner's call and has no date.

## What 0.x promises today

**`edition preview` is not frozen.** Every module's `xo.mod` says `edition
preview`, and the name is a statement: a minor release (0.N.0) may change the
language, the prelude and the standard library. A patch release (0.N.P) is a
fix with no spec change. The toolchain's minor version matches the spec draft,
and the spec's "Changes in 0.N" section lists every language change of a
minor release.

**Every break ships with a rewrite and a changelog line.** A change that can
make code that built before stop building, or build with another meaning,
arrives in a minor release with:

- an `xo fix` rewrite in the same release (`xo fix --from=draft-0.N` migrates
  code written for an older draft), or, where no mechanical rewrite exists, a
  diagnostic that names the replacement;
- a `CHANGELOG.md` entry marked **Breaking** that states the migration: what
  changed, each old form, and what replaces it.

The rename of `edition 2026` to `edition preview` is an example: the old name
still works during 0.x, `xo check` reports the fixable note `XO1315` on it,
and `xo fix` rewrites it.

**Deprecate first, remove in a later minor release.** A feature that is going
away is deprecated in one minor release and removed in a later one, never in
the same release. The deprecation is a diagnostic that names the replacement,
and it keeps its meaning while it is deprecated. The first case is
`uuid.Uuid`: the forms `u.0` and `uuid.Uuid(s)` were deprecated in 0.33.0 (vet
warning `XO0912`) and became type errors in 0.34.0, with the migration in the
changelog (`u.0` becomes `u.display()`, `uuid.Uuid(s)` becomes
`uuid.parse(s)?`). The rule that case implies: at least one minor release
between the announcement and the removal. Flags follow it too: `--hybrid`
warns on every use before it goes.

**Diagnostic codes never change meaning.** A code means what it meant when it
was added. A new meaning gets a new code, and a code that is no longer
reported stays in the table of [diagnostics](/docs/diagnostics/), marked
retired (`XO0912` is one).

**Anything else may change in a minor release**, with the rewrite rule above
for what breaks code.

## What 1.0 will promise

This is the text of spec section 13, which stays the source:

- **A first frozen edition.** At 1.0 the owner names it, and `xo fix` rewrites
  `edition preview` to that name mechanically. The promise starts with that
  edition, not with `preview`. Whether editions are named by years or another
  scheme is decided then.
- **No change of meaning within an edition.** Code that builds under an
  edition keeps building with the same meaning under later toolchains. A new
  edition may change syntax and defaults, never the meaning of code in older
  editions. The compiler supports every edition ever released, and modules on
  different editions link together.
- **Migration is mechanical.** `xo fix --edition=<name>` migrates a module and
  must leave it compiling. An edition is not released until its rewriter is
  complete.
- **The standard library follows the same rule.** `std` APIs are never removed
  within an edition, and a deprecated API ships a rewrite in `xo fix`.
- **Diagnostic codes** keep the rule above.

Not decided yet: the status of each backend at 1.0 (decision 0089 lists the Go
backend as the supported path and the native backends as preview), the
toolchain's flags and output formats, and how long an old edition is
supported.

## Road to 1.0

These are the entry criteria the policy proposes. The owner edits them, and
declares 1.0 when the owner decides to; nothing here is dated.

1. Every open question in the spec's Appendix B is answered by a decision
   record.
2. Several outside projects have been in real use for some months.
3. A run of releases with no breaking change.
4. One or two release candidates.
5. A tester round per release, as with 0.33.0.

## What to do as a user of 0.x

- Read the changelog's **Breaking** entries before moving to a new minor
  release.
- Run `xo fix --dry-run` after upgrading to see the rewrites it would apply,
  then `xo fix`.
- Treat warnings that name a deprecation as the notice period: the replacement
  works now, and the old form goes in a later minor release.
