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
- **The chain** (ADR-0028): `Chain`, `Plus`, `Minus`, `Times`, `DividedBy` and
  `Interim` — a calculation read top to bottom, each operand worked into the
  value before it, ended by an interim. It mixes with the tree both ways.
- **The statement look**, for tree and chain alike, replacing the accordion: a
  surface in the material of the library's tables and cards, rows of one
  height, fixed columns for label, names, operator, number, unit and
  assessment. The outermost statement stands as on paper and closes on the
  Result as its last row, its number underlined twice. Every other derivation
  opens beneath its row as one group with it, joined by a falling line, and
  closes "= label". A folded row shows the formula it hides, or
  "N operands" above four. The verdict is core's `Badge`; "≈" explains itself
  in a `Tooltip`. Everything below the outermost statement starts folded.
