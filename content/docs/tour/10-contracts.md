---
title: "Contracts and tests"
description: "requires, ensures, invariants, test blocks, property tests, and contract fuzzing."
weight: 10
---

{{% example "contracts" %}}

- `requires amount > 0` faults when violated: passing a negative amount is a
  bug in the caller. `requires ... else TxErr.Insufficient` returns an error
  instead: running out of money is an expected outcome.
- `ensures` checks the result; `invariant` is checked whenever an `Account`
  is built or changed.
- `test "name" { ... }` blocks live next to the code. `expect(x) == y` prints
  both sides when it fails.
- `test "reverse twice" for xs: List[Int]` is a property test over generated
  lists.
- `xo test` also fuzzes every function that has contracts, with inputs that
  satisfy its `requires`. That is why this module reports three passing
  tests for two test blocks. A failure found this way is shrunk and saved as
  a regression test.
