# Rows from data: a sum of any count, a line that shows its contribution

Status: done
Date:   2026-10-06
Origin: grilling session on `@umriss-ui/calculation` 0.5.3. The terms are in
`CONTEXT.md`, "Calculations" (**Operator**, **Contribution**, **Emphasis**),
and the decision in ADR-0049.

## Problem Statement

A writer of a payslip, a costing sheet or a staff report adds or takes away a
set of rows that comes from data - corrections, contributions, allowances -
and the set holds anything from none to many, of either sign. They want it as
one line that folds, followed by an interim. Today:

- a `Sum` needs two or more operands, so `<Minus><Sum>{rows.map(…)}</Sum></Minus>`
  - the shape the payslip example teaches - throws as soon as the data holds
  one row or none;
- a sum has no way to take a row away, so rows of both signs need branching,
  nesting or a second group;
- a negative operand in a sum stands as "+ Corrections -18.00", which reads
  twice and is still misread;
- a line cannot be set apart - made stronger, quieter, or ruled off - without
  CSS against class names that ADR-0045 declares internal.

## Solution

- **`Sum` takes any number of operands**, one or none included. The sum of
  nothing is zero. With one operand the line still folds and opens onto that
  one; with none it shows 0, has no disclosure, and says "no entries" where
  the formula would stand.
- **A line that adds or takes away shows its contribution**: the direction as
  its operator, the number without a sign. Signed rows from data therefore
  stand bare in a sum and read right: "+ Bonus 12.00", "− Refund 30.00".
  The quantity itself keeps its sign wherever it closes or is referenced:
  "= Corrections -18.00" closes the derivation whose line reads
  "− Corrections 18.00".
- **`emphasis="strong" | "muted"` and `rule="above"`** on every quantity but
  the Result set a line apart without CSS.

The lead case, for tests and demo:

```tsx
const CORRECTIONS = [
  { id: "c1", name: "Night shift bonus", amount: 84 },
  { id: "c2", name: "Overpaid travel, February", amount: -120 },
  { id: "c3", name: "Rounding", amount: 0.03 },
];

<Calculation aria-label="Payslip, March">
  <Chain>
    <Given label="Gross salary" value={4200} unit="€" decimals={2} />
    <Minus label="Income tax" value={612.5} unit="€" decimals={2} />
    <Plus>
      <Sum label="Corrections" unit="€" decimals={2}>
        {CORRECTIONS.map((c) => <Given key={c.id} label={c.name} value={c.amount} unit="€" decimals={2} />)}
      </Sum>
    </Plus>
    <Interim label="Net salary" unit="€" decimals={2} emphasis="strong" />
  </Chain>
</Calculation>
```

Corrections sum to −35.97: the line reads "− Corrections 35.97", opened it
shows "+ Night shift bonus 84.00", "− Overpaid travel, February 120.00",
"+ Rounding 0.03" and closes "= Corrections -35.97"; Net salary is 3551.53.

## User Stories

Rows from data

1. As a writer, I want a `Sum` to accept the rows of an array whatever their count, so that a calculation never throws because the data happened to hold one row or none.
2. As a writer, I want an empty `Sum` to be worth zero, so that the interim after it equals the value before it without any branching on my side.
3. As a writer, I want the line of an empty `Sum` to stay in place, so that the reader sees "Corrections 0.00" rather than wondering whether a line is missing.
4. As a reader, I want an empty group to say "no entries" where its formula would stand, so that I know the zero is a fact and not an absent value.
5. As a reader, I want an empty group to have no disclosure, so that I am not offered a derivation that holds nothing.
6. As a reader of a screen reader, I want an empty group's sentence to say that it has no entries, so that I hear the same fact a sighted reader sees.
7. As a writer, I want a `Sum` with one operand to fold and open like any other, so that the statement keeps its shape as the data changes.
8. As a reader, I want a group with one entry to open onto that one entry and close with "= label", so that I see where its number comes from like everywhere else.
9. As a writer, I want a hand-written `Sum` with one operand to be allowed too, so that I do not have to know whether a rule tells literals and arrays apart.
10. As a writer, I want the fold state to stay on its quantity when rows are added or removed, so that an opened group stays open while data refreshes.
11. As a writer, I want `Difference`, `Product` and `Quotient` to keep their operand counts, so that an empty product or a lone difference still fails loudly as the mistake it is.
12. As a writer, I want the error for those three to keep saying how many operands they take, so that I can fix it without looking it up.

Signs and contributions

13. As a writer, I want to put rows of both signs into one `Sum` as they come from the data, so that I never branch on a row's sign.
14. As a reader, I want each added or subtracted line to show its direction as the operator and its number without a sign, so that I never meet "+ -120.00".
15. As a reader, I want a group whose total is negative to stand as "− Corrections 35.97" in the chain, so that the line says plainly that it lowers the value.
16. As a reader, I want the derivation of that group to close with "= Corrections -35.97", so that the quantity itself is quoted with its own sign.
17. As a reader, I want an interim and the Result to show their own sign, so that a negative net amount is never disguised as a deduction.
18. As a reader, I want a reference to a quantity to show the contribution on its line like any other operand, so that a referenced line reads the same as a defined one.
19. As a reader, I want the first operand of a sum to show "−" when it lowers the sum, so that a leading deduction is not mistaken for an addition.
20. As a reader, I want the first operand to show no "+" when it raises the sum, so that the line is not cluttered with a sign nobody writes on paper.
21. As a reader, I want the subtrahends of a `Difference` to follow the same rule, so that "a − (−5)" stands as "+ b 5.00".
22. As a reader, I want a chain's `Plus` and `Minus` lines to follow the same rule, so that `<Plus value={-18}>` and `<Minus value={18}>` read alike.
23. As a reader, I want the first quantity of a chain to follow the same rule, so that a negative opening balance stands as "− Opening balance 50.00".
24. As a reader, I want a factor to keep its own sign, so that "× -1" still says that something is negated.
25. As a reader, I want a line worth zero to show the operator as written, so that "0.00" carries no invented direction.
26. As a reader, I want an absent line to show the operator as written, so that a missing number is not given a direction it does not have.
27. As a reader, I want the folded formula in names to follow the lines, so that the formula and the opened lines never disagree on a sign.
28. As a reader of a screen reader, I want the sentence to speak the contribution ("minus Corrections 35.97"), so that I hear what a sighted reader sees.
29. As a writer, I want the approximation mark and the assessment to be unaffected by the sign rule, so that a line's verdict is still about the quantity's own value.
30. As a writer, I want limits and targets to be checked against the quantity's own signed value, so that a negative quantity below a limit is still flagged.

Signs with metrics

31. As a reader of a calculation with metrics, I want a line whose metrics all point the same way to show the contribution, so that metrics read like everything else.
32. As a reader of a calculation with metrics, I want a line whose metrics point in different directions to keep the written operator and give each number its sign, so that one operator never lies about one of the metrics.
33. As a writer, I want a metric that is zero or absent on a line to be left out when the direction is decided, so that one empty cell does not turn the line back to signed numbers.

Direction stays the writer's

34. As a writer, I want `Minus` to keep meaning "taken away here", so that a quantity that is positive by nature - income tax, a sum of contributions - keeps its sign where it closes and where it is referenced.
35. As a writer, I want `Plus` to take signed data, so that `<Plus><Sum>` is the one way to write a group of corrections.
36. As a writer, I want the docs to tell me when to use `Plus` and when `Minus`, so that I choose by meaning and not by trial.

Emphasis and rule

37. As a writer, I want `emphasis="strong"` on any quantity, so that a line I want read first stands out without CSS.
38. As a writer, I want `emphasis="muted"` on any quantity, so that an informative line recedes without CSS.
39. As a reader, I want a muted line to count in full, so that what I see receding is never left out of the sum.
40. As a writer, I want `rule="above"` on any quantity, so that I can rule off a section that is not an interim.
41. As a writer, I want `emphasis` and `rule` on the chain's `Plus`, `Minus`, `Times`, `DividedBy` and on `Interim`, so that every line of a chain can be set apart.
42. As a writer, I want `emphasis` or `rule` on the Result to fail with a message, so that I learn that the Result is already the heaviest line instead of seeing my prop ignored.
43. As a reader in forced colours, I want strong and muted lines still to differ from the others, so that emphasis does not rest on colour alone where colours are replaced.
44. As a reader, I want an emphasised line to keep its alignment, so that numbers still line up on their last digit.
45. As a reader of a screen reader, I want emphasis not to change the sentence, so that the line's meaning is carried by its words and numbers.
46. As a writer, I want emphasis and rule inside an opened derivation to work too, so that a line in a group can be set apart like any other.
47. As a writer of a calculation with metrics, I want emphasis and rule to work there too, so that a staff report can set apart its subtotals.

Documentation

48. As a writer, I want an example for every case above, each with a title and lead that says what it shows, so that I can find my case on the page and copy it.
49. As a writer, I want the payslip example to keep working with an empty or single-entry contribution list, so that the pattern the docs teach is the robust one.
50. As a coding agent, I want the examples to reach `llms.txt` and the generated twins like every other example, so that I write the pattern the docs show.

## Implementation Decisions

- **Reading** (the model): a `Sum` accepts 0..n operands; the count check
  stays for `Difference` (two or more), `Product` (two or more) and
  `Quotient` (exactly two), with their messages. The "more than four operands
  show their count" rule (ADR-0028) is unchanged.
- **Evaluation**: a sum starts at zero and applies each operand with its
  `negated` flag, the first one included. An empty sum is 0, never `NaN` or
  absent. Absence and the approximation mark propagate as today; an empty sum
  is neither absent nor approximate.
- **Contribution** is a presentation rule, not a model change: the quantity's
  value stays signed in the model and in the evaluation. Where a line stands
  as an operand of a sum or a difference - the first operand included - or as
  a chain's `Plus`/`Minus` or first quantity, its drawn operator is the
  direction of written-operator × value-sign, and its number is the absolute
  value. Zero, absent, and metrics that disagree keep the written operator
  and the signed number. Metrics that are zero or absent are left out of the
  agreement check; if none is left, the written operator stands.
- **The first operand's operator** is drawn when, and only when, its
  contribution is negative. Today no first operand draws an operator; the row
  and the formula both need the case.
- **Formula and sentence**: the formula in names and the formula in numbers
  follow the drawn operators. The spoken operator follows the same rule.
- **Closing row, interim, Result, reference target**: always the quantity's
  own signed value.
- **Empty sum**: the line has no disclosure and does not count towards
  "whether anything can fold"; its formula column shows a new wording entry,
  `calculationNoOperands` ("no entries" / German "keine Einträge"), which
  the sentence uses too. Both wordings ship (ADR-0018, ADR-0019).
- **Emphasis and rule**: `emphasis?: "strong" | "muted"` and
  `rule?: "above"` join `QuantityProps`, and with it `Given`, the four tree
  operators, the chain's line tags and `Interim`. On the quantity that is the
  Result, either is a development error naming the quantity. Strong sets label
  and number heavier; muted sets them in the secondary text colour; the rule
  is drawn across the row above it. All three are drawn with existing tokens;
  a new token only if none fits, with a changelog entry (ADR-0045). Emphasis
  has no effect on the sentence. Forced colours: strong keeps its weight,
  muted falls back to a system colour that still differs (GrayText), the rule
  stays visible.
- **Types**: no new exports. `QuantityProps` gains the two props; the props
  tables on the demo pick them up.
- **Release**: a minor version of `@umriss-ui/calculation` (new props, relaxed
  count, changed presentation of negative operands), with a changelog entry
  that names the contribution rule as a visible change.

## Testing Decisions

- **A good test reads what a reader reads**: the rendered rows ("operator
  label amount unit"), the folded formula, the disclosure's presence, the
  accessible sentence, and the error a wrong declaration throws. It never
  asserts on the model's keys or on evaluation internals.
- **One unit seam: `<Calculation>` rendered** with Testing Library, using the
  helpers already in the calculation's view tests (`rows()`, `rowOf()`,
  `formulaOf()`, the toggle by accessible name). Prior art: the view tests
  of the calculation and of metrics. Covered there: empty and one-operand
  sums (value, disclosure, "no entries", sentence), the contribution on every
  additive position listed above including the first operand and a chain's
  first quantity, the closing row and interim keeping their sign, factors
  keeping theirs, zero and absent keeping the written operator, metrics that
  agree and that disagree, emphasis and rule present on the row, and the
  development errors (Result with emphasis or rule; `Difference`, `Product`,
  `Quotient` with too few operands).
- **No new unit tests on `readCalculation` or `evaluate`.** Existing ones that
  assert "two or more operands" for `Sum` are updated, not duplicated.
- **Visual**: every new example is photographed by the existing screenshot
  suite and by the forced-colours suite without new test code; their baselines
  are new. Existing baselines change only where an example shows a negative
  additive operand; each such change is listed in the delivery report.
- **The wording guard and the demo smoke test** cover the new wording entry
  and the new examples as they do today.

## Examples

The user asked for many examples that explain every case precisely. Each is a
file of its own, titled by what it shows, with a lead that states the rule in
one or two sentences. A new page, **Rows from data**, in "Writing a
calculation" after Chain, holds the cases of this spec; the others extend
their pages. Pages and order may be adjusted while writing, the cases may not
be dropped.

Rows from data (new page):

1. **Rows of any count** - a payslip's corrections from an array, three rows.
2. **No rows** - the same with an empty array: "Corrections 0.00", no
   disclosure, "no entries", Net salary equals the value before.
3. **One row** - the same with one row: the group folds and opens onto it.
4. **Rows of both signs** - the lead case: bare signed givens, each line
   showing its contribution.
5. **A group that turns negative** - the line "− Corrections 35.97" beside
   its closing row "= Corrections -35.97".
6. **Plus or Minus** - the same payslip with a group of corrections in `Plus`
   (signed data) and the social security contributions in `Minus` (positive
   by nature), the lead saying when to use which.
7. **A deduction first** - a sum whose first operand is negative, the leading
   "−".
8. **Zero and missing keep their sign** - a row worth 0 and an absent row in
   the same group.
9. **A sum from data in a tree** - a `Sum` of 0..n rows as an operand of a
   tree, not a chain.
10. **Rows of both signs with metrics** - a staff movement whose lines agree
    in direction across headcount and FTE, and one line that does not.

Calculation page (or a page **Emphasis** if the Calculation page grows too
long):

11. **A stronger line** - `emphasis="strong"` on an interim.
12. **A quieter line** - `emphasis="muted"` on an informative operand, the
    lead stating it still counts.
13. **A rule above** - `rule="above"` opening a section of a chain that is not
    an interim.
14. **Emphasis inside a group** - strong and muted inside an opened
    derivation.

Existing pages:

15. Chain, payslip: unchanged in shape, but its lead names `Minus` for a
    quantity positive by nature and points to Rows from data.
16. What can go wrong: **The Result takes no emphasis** - the development
    error, shown the way the page shows its other errors.
17. Tree, from data: checked to still read correctly; extended if it builds a
    `Sum` from an array.

## Out of Scope

- A chain without a step (`Given` directly followed by `Interim`) stays a
  development error.
- `Plus`/`Minus` as operands of a tree's `Sum`; a derived quantity that is
  positive by nature and taken away inside a group is written with a
  `Difference` until a case asks for more.
- A single signed element (`<Entry>`) in place of `Plus` and `Minus`.
- Empty `Product`, `Difference` or `Quotient`.
- A tone on a line, a hidden number, any style prop beyond `emphasis` and
  `rule`.
- The typographic minus (U+2212) in core's formats - a library-wide question.

## Further Notes

- The contribution rule changes how existing calculations with a negative
  additive operand look; the changelog says so plainly.
- ADR-0049 records the trade-offs, including the rejected "operator as
  written" and the rejected signed element.

## Comments

**Delivered** as `@umriss-ui/calculation` 0.6.0 with `@umriss-ui/core` 0.29.0
(the wording entry `calculationNoOperands`); table 0.13.5 and schedule 0.5.5
move their core peer range only.

- Tickets 01-04 landed in one commit: 01 and 02 change the same lines of the
  view and of the line text, so the slices could not be committed apart.
- One rendered seam, as agreed: `rowsFromData.test.tsx`, `emphasis.test.tsx`
  and a metrics case in `metricsView.test.tsx`. Two findings of the code review
  are fixed and tested there: the direction is taken from the number as shown
  (a line that rounds to 0.00 keeps its written operator, and a number that
  rounds to zero is never "-0"), and an empty sum that is the Result itself
  says "no entries" and draws no empty list above it.
- Examples: ten on the new page Rows from data, four for emphasis and rule on
  the page Calculation, the payslip's lead in Chain. Six of them are also
  photographed opened, since what a group holds is in no example's first
  picture.
- Deviation: the development error for emphasis or rule on the Result has no
  example on What can go wrong - every example there renders, and one that
  throws would break the page. It stands in the Calculation page's list of
  errors and in the README.
- "Night shift bonus" became "Night work bonus": the plant-word check
  (ADR-0035) keeps "shift" to the plant world.
- Baselines redrawn without a change of their own: the Tree and Calculation
  page heads grew by a sentence, and every example beneath them moved by a
  fraction of a pixel (Tree: share-with-target, from-data, limits;
  Calculation: first-sum, OEE narrow, the forced-colours hover coupling;
  Chain: fifteen-items, chain-in-a-tree, error-budget beneath the longer
  payslip lead). No existing example showed a negative additive operand, so
  the contribution rule changed no existing picture.
