# Several metrics side by side: headcount and FTE in one calculation

Status: done
Date:   2026-09-29
Origin: grilling session on `@umriss-ui/calculation` 0.3.7. The term is in
`CONTEXT.md`, "Calculations" (**Metric**), and the decision in ADR-0038.
Rendered prototype: three variants on a throwaway branch, variant A chosen;
the branch was deleted after the release. What the variants were and why A
won stands in ADR-0038.

## Problem Statement

A staff report sums headcount from team to area to business line and wants the
full-time equivalents beside every number. A calculation holds one number per
quantity, so today it takes two calculations that repeat every label, fold
separately and cannot be read across.

## Solution

`<Calculation metrics={[…]}>` declares the metrics once, with label, unit and
places. Every given carries a number per metric (`value={{ heads: 31, fte:
27.5 }}`), and every derived quantity is evaluated per metric with the same
derivation. The statement gets a head row and one number column per metric.

The lead case, for tests and demo:

```tsx
const STAFF = [
  { id: "heads", label: "Headcount", unit: "HC", decimals: 0 },
  { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
];

<Calculation aria-label="Staff, industry, 30 Sep." metrics={STAFF}>
  <Sum label="Industry">
    <Sum label="Production">
      <Given label="Assembly" value={{ heads: 31, fte: 27.5 }} />
      <Given label="Paint shop" value={{ heads: 22, fte: 20.0 }} />
      <Given label="Quality" value={{ heads: 18, fte: 15.8 }} source="HR system" />
      <Given label="Maintenance" value={{ heads: 25, fte: 21.2 }} />
    </Sum>
    <Sum label="Logistics">
      <Given label="Warehouse" value={{ heads: 40, fte: 31.6 }} />
      <Given label="Dispatch" value={{ heads: 18, fte: 14.1 }} />
      <Given label="Student staff" value={{ heads: 6, fte: null }} explanation="FTE are not recorded for student staff" />
    </Sum>
  </Sum>
</Calculation>
```

## User Stories

1. As an operator, I see headcount and FTE of every team, area and business
   line side by side, one column each.
2. As an operator, I open an area and see its teams with both numbers, closed
   by the area's total with its units.
3. As an operator, a missing FTE figure makes only the FTE totals unknown and
   says so briefly; the headcount totals stay.
4. As an operator on a phone or in a side panel, the numbers stay in their
   columns under the head; only where they leave the label too little room does
   each row put its numbers on a line beneath the label.
5. As a screen-reader user, each row reads its formula once and then each
   metric's number, with the reason where one is missing.
6. As an application developer, I declare the metrics once and write a number
   per metric on every given, from data with `.map` as usual.
7. As an application developer, a missing or misspelt metric key, a unit on a
   quantity, a target, or a product fails on the first render with a message
   saying which and where.
8. As an application developer, a calculation without `metrics` is written and
   shown exactly as before.

## Implementation Decisions

- **API (ADR-0038).** `CalculationProps.metrics?: readonly Metric[]`, with
  `Metric = { id: string; label: string; unit?: string; decimals?: number }`,
  exported as a type. `GivenProps.value` and `ChainOperandProps.value` accept
  `number | null | undefined` or `Readonly<Record<string, number | null>>`.
- **Development errors, each with a message saying which and where**, once
  `metrics` is set: a `value` that is not an object; a missing key (the message
  lists the metric ids); an unknown key; `unit`, `format` or `decimals` on a
  quantity or an interim; `target` or `limits`; `Product`, `Quotient`,
  `Times`, `DividedBy`; `metrics` empty or with a duplicate id. Without
  `metrics`, an object `value` is an error too.
- **Model and evaluation.** The reader stays as it is. Evaluation runs once per
  metric over the same model, with the metric's number on each given and the
  metric's unit and places on every quantity. This is how the prototype does it
  (`forMetric`). Absence, the approximation mark and the "missing" reason are
  per metric. Folding, marking and hover are per quantity, as before.
- **Places.** The metric's `decimals` is used for every quantity. Without it,
  the rule for one quantity applies (a given as given, a derived at most two).
- **Head row.** The statement's first row: per metric its label, the unit
  beneath in the monospace token and secondary colour, right-aligned over the
  metric's number column. It is not part of the list for assistive technology
  (`aria-hidden`), since every row's sentence names the metrics.
- **Columns.** Label, names, operator, then number and unit per metric, then
  assessment. Metrics after the first get a wider gap before their number.
  Rules across figures (interim, closing row) reach over every metric. The grid
  is built for any number of metrics, not by a CSS rule per count as in the
  prototype.
- **Units.** Operand rows show numbers only. The unit stands on every row that
  closes a result: the Result, an interim of a chain in view, and the closing
  row "= label". Nowhere else.
- **Absence badge.** With metrics, a row whose number is absent in a metric
  carries one badge per absent metric: `wording.calculationMissing(unit ??
  label)`, so "FTE is missing" or "FTE fehlt". No new wording entry. The full
  reason is in the sentence. In the narrow layout the badge must not widen the
  grid: core's `Badge` does not wrap, and in the prototype it pushed the grid
  past the frame.
- **Two lines only where one does not fit.** A `ResizeObserver` on the frame
  compares the frame's width with the width of the number columns (from the
  grid's resolved tracks). Where what is left for the label is less than the
  longest label needs, and less than 10 rem, the frame gets a flag, and each row places its label across the full width and
  its operator and numbers on a second line in their columns. Head, badges and
  notes follow. 10 rem is a constant, not a prop. Without the flag, the narrow
  layout of ADR-0028 applies unchanged with metrics: the names give way, the
  numbers keep their columns, and the head shows only the units.
- **Sentence.** With metrics: "{label} equals {formula in names}: {metric
  label} {number with unit}; {metric label} unknown, {reason}". The formula in
  numbers is left out. Operator prefix as today. Any word the sentence needs
  that the wording lacks goes into core, English and German.

## Testing Decisions

- The development errors: one unit test each, asserting its message.
- Evaluation: the lead case per metric; an absent FTE figure making only the FTE
  totals absent; a chain with `Minus` per metric; the approximation mark in one
  metric and not the other.
- Rendering: the head row; units only on closing rows; the short badge; the
  sentence for a whole and for an absent row; a calculation without `metrics`
  unchanged (the existing tests stay green without edits).
- The two-line switch, in the browser at 900, 360 and 300 px: two metrics on one
  line down to 300 px, three metrics on two lines at 360 px, and no overflow of
  the frame at any width (`scrollWidth === clientWidth`).
- The demo's image and accessibility checks cover the new page, light and dark,
  phone and laptop.

## Out of Scope

- Operations across metrics, and ratios.
- Products and quotients with metrics, and a dimensionless factor.
- Targets, limits and verdicts per metric.
- Variants of a derivation as columns (plan / actual, lot sizes).
- A value-based builder, and typing the value keys against `metrics`.

## Further Notes

Term introduced: **Metric**. Avoided: *column* (the table's), *series* (the
charts'), *measure*, *Kennzahl*. The prototype's variants B and C and the
reasons they lost are in ADR-0038.

## Comments

### Delivery report (2026-09-29)

All five tickets delivered; 04, the polish round, accepted by the user on the
rendered page. Released as `@umriss-ui/calculation` 0.4.0.

- **Model.** The reader is unchanged but for the checks; `perMetric` gives
  evaluation and presentation one view per metric, so the four operators,
  absence and the approximation mark work per metric without a line of their
  own.
- **Found in the browser, fixed, and held by a test:** the fixed 10 rem went
  to two lines where a short label had room - the rule now measures the
  longest label as well; three metrics overflowed a 320 px phone - narrow
  figures stand closer; setting them closer only on two lines made the flag
  flip until React gave up - the spacing follows the width alone, and a test
  walks 900 to 300 px in 10 px steps watching for page errors.
- **From the review:** the missing-key message lists the metric ids; the
  browser tests use the frame widths the spec names; per-metric readings are
  one bundle instead of parallel arrays; the grid lines are computed in one
  place beside the stylesheet's track order.
- **Left, as judgement calls:** the page sentence keeps "(columns, measures)"
  as search terms, as the other pages name theirs (search-visibility 04); the
  two-line assessment block repeats the narrow one, since the flag also
  applies outside the container query; `readCalculation` branches on
  `metrics` in five places, each a rule of its own.
- **Deviation:** the demo does not show thrown messages (ticket 03).
- **Not asked for, and in the changelog:** a frame wider than its place
  scrolls instead of clipping.
- The prototype branch was never merged, and deleted after the release.
