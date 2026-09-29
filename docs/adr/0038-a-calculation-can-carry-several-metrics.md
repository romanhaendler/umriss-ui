# A calculation can carry several metrics

Status: accepted
Date:   2026-09

Staff reports show headcount and full-time equivalents side by side. Both are
summed from team to area to business line, and the reader wants both in view on
one sheet. Two calculations next to each other would repeat every label and
could not be kept in step. A calculation therefore gets **Metrics**: one
derivation, and every quantity in it carries one number per metric.

```tsx
<Calculation
  aria-label="Staff, industry, 30 Sep."
  metrics={[
    { id: "heads", label: "Headcount", unit: "HC", decimals: 0 },
    { id: "fte", label: "Full-time equivalents", unit: "FTE", decimals: 1 },
  ]}
>
  <Sum label="Industry">
    <Sum label="Production">
      <Given label="Assembly" value={{ heads: 31, fte: 27.5 }} />
      <Given label="Paint shop" value={{ heads: 22, fte: 20 }} />
    </Sum>
    …
  </Sum>
</Calculation>
```

The rules:

- **The derivation is the same for every metric, and each metric is worked on
  its own.** No operation takes numbers from two metrics. A ratio across them,
  such as FTE per head, is a calculation of its own.
- **A calculation with metrics only adds and subtracts**: `Sum`, `Difference`,
  `Plus`, `Minus`. `Product`, `Quotient`, `Times` and `DividedBy` are a
  development error. A factor would have to be dimensionless in every metric
  ("1.05 HC" is nonsense), and no case has asked for one yet.
- **Unit, places and label belong to the metric.** `unit`, `format` and
  `decimals` on a quantity are a development error once `metrics` is set.
- **`value` is an object with exactly the metrics' ids as keys.** A missing or
  unknown key is a development error, and only an explicit `null` is an
  **Absent value**. The object is longer than an array, but a swapped pair shows
  and a typo fails loudly.
- **Absence stays in its metric.** A missing FTE figure makes absent only what
  depends on it in FTE; the headcount sums go on.
- **`target` and `limits` are a development error with metrics** for now. An
  assessment per cell would need a badge per cell.
- Without `metrics`, a calculation is written as before.

## How it is shown

Settled on a rendered prototype (branch `prototype/calculation-metrics`),
variant A of three:

- **A head row** above the statement names each metric, with its unit beneath
  the name. The operand rows show numbers only, one column per metric, aligned
  on their last digit.
- **The unit stands again wherever a result closes**: on the Result, on every
  interim of a chain in view, and on the closing row "= label" of an open
  derivation. There the rule is drawn and the number gets quoted. The unit column
  exists for every metric; operand rows leave it empty.
- **An absent metric's badge is short**: "FTE is missing", which is the metric's
  unit in the existing wording. The sentence carries the full reason. A long
  badge pushed the numbers aside when wide and was cut off when narrow.
- **Two lines only where one does not fit.** The component measures the width
  its number columns take and the width its longest label needs. Where the
  figures leave less than that, and less than 10 rem, it sets each row's
  numbers on a line beneath its label, still in their columns under the head.
  Above 10 rem a long label wraps instead. A breakpoint cannot know this,
  because it depends on the labels, the number of metrics and the number of
  digits. Two metrics with short labels stay on one line on a phone; three do
  not.
- **The sentence** names the formula once and then each metric's number:
  "Logistics equals Warehouse plus Dispatch plus Student staff: Headcount
  64 HC; Full-time equivalents unknown, Student staff is missing". The formula
  in numbers is left out with metrics. The operand lines beneath read their
  own numbers.

## Considered Options

- **Cross-metric operations** (FTE = heads × rate in the row). Rejected:
  a calculation would work in two directions and become a worksheet, which
  **Calculation** is not.
- **Variants of the same derivation as columns** (plan / actual). Not asked
  for. The metric model does not prevent it later, but it is not this decision.
- **An array per value** (`value={[31, 27.5]}`). Rejected by the user in
  favour of the safest form.
- **A unit in every cell** (variants B and C). B stacked the numbers when
  narrow, and a column could no longer be read down. C went to two lines at a
  fixed width, too early for two metrics.
- **The reason on the given only**, the sums showing just "—". Rejected: every
  absent quantity says why.
- **An approximate sum**, where the known part is shown with "≈". Rejected:
  a missing figure is never guessed around.

## Consequences

`Given` and the chain's line tags take `value` as a number or as an object by
metric. TypeScript cannot tie the object's keys to the `metrics` prop, as
ADR-0027 already accepts for references; the check is at the first render.
The approximation mark is per cell. The narrow layout of ADR-0028 stays for a
calculation without metrics.
