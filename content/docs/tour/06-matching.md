---
title: "Pattern matching"
description: "Exhaustive match, ranges, alternatives, list shapes, tuples, and is."
weight: 6
---

{{% example "matching" %}}

- Patterns include literals, ranges (`200..=299`), alternatives (`429 | 503`),
  list shapes (`[first, .., last]`), tuples, and enum variants with their
  fields.
- `let (n, word) = pair` destructures; `x is Pattern` tests without binding.

Every `match` must be exhaustive. Add a variant to an enum, and every `match`
that forgot it stops compiling:

{{% mistake "missingcase" %}}
