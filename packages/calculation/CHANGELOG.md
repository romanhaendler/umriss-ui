# Changes to `@umriss-ui/calculation`

This document describes what changes for **callers** of the package: exports,
props, behaviour. What was worked on in the repository stands in the
repository's journal (`docs/journal.md`) and in the specs under `.scratch/`.

**The numbers.** The middle digit rises when something is added; the last one
when something is repaired. As long as the first digit is `0`, no number
promises compatibility — which is why whatever changes existing behaviour stands
under a heading "Changed" of its own, no matter which digit rose.

---

## 0.3.4 – Core 0.14.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.14; the peer range moves to `^0.14.0`. Nothing else changes for a caller.

---

## 0.3.3 – Core 0.13.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.13; the peer range moves to `^0.13.0`. Nothing else changes for a caller.

---

## 0.3.2 – Core 0.12.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.12; the peer range moves to `^0.12.0`. Nothing else changes for a caller.

---

## 0.3.1 – Core 0.11.0 (Sep. 2026)

Needs `@umriss-ui/core` 0.11; the peer range moves to `^0.11.0`. Nothing else changes for a caller.

---

## 0.3.0 – Forced colours and agent-readable docs (Sep. 2026)

Needs `@umriss-ui/core` 0.10; the peer range moves to `^0.10.0`.

### Added

- **The Windows contrast mode** (`forced-colors: active`, forced-colors 03).
  The hover coupling keeps its band as an outline in the system's selection
  colour, the open derivation its spine, the frame and the disclosure's ring an
  outline where the box-shadow stood; the verdicts keep their words. Nothing
  changes outside forced colours.
- **`docs/llms-full.md`**, the package's documentation as one Markdown file for
  a coding agent, in the npm package and pinned to its version: every demo page
  with its import line, its examples' source, its props tables and why it is
  built as it is, and the declaration of every other export. The same text
  stands online as <https://romanhaendler.github.io/umriss-ui/calculation/llms-full.txt>,
  with an index of the pages beside it (`llms.txt`).

## 0.2.4 – Core 0.9.0 (Sep. 2026)

Admits `@umriss-ui/core` 0.9, which only adds a token; the peer range moves to `^0.9.0`. Nothing else changes.

---

## 0.2.3 – Core 0.8.0: the canon of states (Sep. 2026)

Needs `@umriss-ui/core` 0.8: it reads core's pressed surfaces and motion tokens; the peer range moves to `^0.8.0`.

### Changed

- **The disclosure sinks while pressed** - on the key and on a foldable row -
  with core's `--u-color-surface-pressed`, like every quiet key of the library.

---

## 0.2.2 – Core 0.7.0 (Sep. 2026)

### Changed

- **The worst-verdict glyph and the lost freshness read core's
  `--u-color-danger-text`** - lighter in the dark theme, 4.5:1 on every surface.
  The peer range moves to `@umriss-ui/core` `^0.7.0`.

---

## 0.2.1 – Core 0.6.0 (Sep. 2026)

### Changed

- **The calculation takes `@umriss-ui/core` 0.6.** Nothing in the calculation
  changed; the peer range moves to `^0.6.0`, so that it installs beside
  `@umriss-ui/table` 0.3, which needs core's new wording.

---

## 0.2.0 – A chain stands open (Sep. 2026)

0.1.0 was committed in the repository but never published; this is the first
version on npm.

### Changed

- **A chain in view no longer folds.** Every line and every interim stands
  open, as on paper - gross salary, each deduction with its minus, the net
  salary beneath a rule once they all stand. What should show only on request
  is written as a tree in one line: a `<Sum>` held by a `<Minus>` folds like
  any tree and opens beneath its line. A chain that is an operand still folds,
  as a whole, and opens whole.
- **No disclosure column where nothing can fold**: a calculation of givens
  and chains alone starts its labels at the surface's edge.
- **The hover band on operands** is half the accent's surface instead of a
  grey, so coloured text in a marked row keeps its contrast.

---

## 0.1.0 – First release (Sep. 2026)

A calculation a reader can follow and redo: the package evaluates every
operation it shows, so what stands on the screen cannot disagree with the
number. Takes `@umriss-ui/core` `^0.5.0` as a peer, for its wording.

### Added

- **`Calculation`** and the **tree** (ADR-0027): `Given`, `Sum`, `Difference`,
  `Product`, `Quotient` and `Ref`, written as nested elements the way the
  derivation reads. Full precision throughout, rounding only on the screen.
- **The chain** (ADR-0028): `Chain`, `Plus`, `Minus`, `Times`, `DividedBy` and
  `Interim` - a calculation read top to bottom, each operand worked into the
  value before it, ended by an interim. No precedence: a `Times` or
  `DividedBy` stands alone between two named values. Tree and chain mix both
  ways.
- **Absence and approximation.** A missing given or a division by zero makes
  every dependent quantity absent, with the reason - never zero. Where the
  rounded operands do not give the rounded result, the result is marked "≈".
- **Assessment and freshness** through core: `target` and `limits` on any
  quantity, `source`, `asOf` and `ages` on a given; the worst verdict inside a
  folded row stands beside it.
- **The statement**: a surface in the material of the library's tables and
  cards, rows of one height, fixed columns for label, names, operator, number,
  unit and assessment. The outermost statement stands as on paper and closes
  on the Result, underlined twice. Every other derivation is folded and opens
  beneath its row, joined to it by a falling line and closing with
  "= label"; the row never moves. A folded row shows the formula it hides in
  names, or how many operands there are above four. The verdict is core's
  `Badge`; "≈" explains itself in a `Tooltip`. Narrower than 34 rem the
  layout gives the numbers room.
- **Accessibility**: a nested list, one sentence per row - "Availability
  equals Run time divided by Planned production time, equals 412 min divided
  by 450 min, equals 91.6 percent" - and a disclosure button per derivation.
- **Development errors** on the first render, each saying which and where: a
  `Ref` to nothing (listing the ids that exist), a circle through references,
  a wrong operand count, a duplicate id, a component of the caller's own
  wrapping an element, and every rule of the chain.
