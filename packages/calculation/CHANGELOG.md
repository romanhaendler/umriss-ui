# Changes to `@umriss-ui/calculation`

This document describes what changes for **callers** of the package: exports,
props, behaviour. What was worked on in the repository stands in the
repository's journal (`docs/journal.md`) and in the specs under `.scratch/`.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why whatever changes existing behaviour stands
under a heading "Changed" of its own, no matter which digit rose.

---

## Unreleased

### Added

- **`Calculation`** with the elements `Given`, `Sum`, `Difference`, `Product`,
  `Quotient` and `Ref` (ADR-0027): a derivation written as it is shown,
  evaluated in full precision, drawn as a nested list of lines with formulas in
  names and in numbers, folded below the first level, assessed through core,
  and read as one sentence per line. Absent givens and division by zero
  propagate with their reason; rounded figures that do not reproduce the
  result mark it "≈". Needs the calculation wording of the next
  `@umriss-ui/core`.
