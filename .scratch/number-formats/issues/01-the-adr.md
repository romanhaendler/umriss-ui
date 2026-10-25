# 01 - The ADR: a number format is Intl's options

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/number-formats/spec.md`

## What to build

Write the decision as an ADR under `docs/adr/`, with the next free number at the time of writing, and add
its line to the ADR index (area: core, table, charts, calculation). Do not change code. The text below is the
decision. Put it into the house style of the existing ADRs (title, Status, Date, prose sections) without
changing what it says.

### Decision text

**Title:** A number format is Intl's options

**Status:** accepted. **Date:** 2026-10.

Every package that writes a number as one text takes the same format: a table column's and a verdict
column's `format`, a chart series' `format` and an axis' `tickFormat`. **A format is one of the two names
umriss has, `"percent"` and `"count"`, or an object: the options of `Intl.NumberFormat`, plus the shorthand
`decimals` for a fixed number of places.** The object is written in the locale of the language in use: core's
formats (ADR-0024), and the chart's wording's `locale` (ADR-0031). umriss names no formats of its own beyond
these.

*Why Intl's vocabulary.* Intl already names every format the shakedown of 2026-10-24 asked for:

- currency, with the currency's own places;
- percent with decimals;
- scientific, engineering and compact notation;
- significant digits;
- a number without grouping (a year);
- the sign display, and accounting negatives.

A vocabulary of umriss's own would be a translation table to document and keep in step with Intl. The
options are plain data: they compare by value, so an inline object neither re-registers a chart nor
needs hoisting.

*Why the locale stays where it is.* Core's `Formats` gains one entry, `numberWith`, built per locale like
the rest, so the language tag still stands once. One pure function in core maps a format onto the entries,
and `decimals` alone still goes through `number`, so an application's own `number` keeps applying. The
charts depend on nothing (ADR-0016's reasoning, ADR-0031). They declare the same object shape themselves and
build it in their wording's locale.

*The sign is the locale's, as the separators are.* Intl writes U+002D in English and German, and U+2212 in
Swedish and Finnish. umriss does not replace it: a figure pasted into a spreadsheet stays a number, and
`NumberInput` reads what it writes. The calculation's "−" is an operator, not a sign, and stays a wording
entry. No number entry writes a negative zero.

*Where the unit is typeset apart, it stays a label.* `Stat` raises its unit, and the calculation has a unit
column (ADR-0028). Intl's currency, compact notation and accounting parentheses would put the symbol and the
sign into the figure. So these two take `unit` and `decimals`, and no Intl options. A calculation is redone by
hand and keeps fixed places. `NumberInput` takes no options because a field must read what it writes.

**Rejected.**

- *Names of umriss's own* ("currency", "year", "scientific"): Intl's options under other names.
- *A year column type, or no grouping for integers that look like years:* a heuristic would write 2,024
  pieces as "2024". What a value is follows from its type, not its content (ADR-0052). A year that is only a
  label is a string; a year that sorts and filters as a number is a number written without grouping.
- *U+2212 for every figure:* see the sign above.
- *Functions only, the charts' way, extended to the table:* the caller would hard-code the locale that the
  formats already hold, and every column would repeat Intl's construction.
- *Per-line rounding in the calculation:* the calculation computes at full precision and marks with "≈" where
  the shown lines do not add up. An amount that is legally rounded is a given that the caller rounds.

**Consequences.**

- `Formats` has one entry more. An application that builds a whole `Formats` without spreading a default set
  adds it.
- The table's exported `NumberFormat` is core's.
- `VerdictColumn` loses its local copy of the type.
- The charts' `format` and `tickFormat` take an object besides a function.
- `NumberInput` gains `grouping`, so that a year range filter writes "2024".
- In the calculation, places carry down to operands of the same unit and format.
- SI prefixes stay a caller's function on a chart and a Presentation in a table, because Intl has none.
- Exports keep raw values.
- Taking the options back would break every caller who wrote one. That is why this is an ADR.

## Acceptance criteria

- [ ] The ADR exists under `docs/adr/` with the next free number and the content above, in the house style.
- [ ] The ADR index lists it, and its count of decisions is updated.
- [ ] `pnpm check:site` passes (the site renders the workspace's documents).
- [ ] No source file changes.
