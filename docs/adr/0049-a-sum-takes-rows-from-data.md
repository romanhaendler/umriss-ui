# A sum takes rows from data, and a line shows its contribution

Status: accepted
Date:   2026-10

A payslip adds or takes away a set of rows that comes from data - corrections,
contributions, allowances - and the set holds anything from none to many. The
writer wants it as one line that folds, then an interim. ADR-0027 let a sum
take two or more operands, so `<Minus><Sum>{rows.map(…)}</Sum></Minus>` failed
the moment the data held one row or none, and a row that takes away could only
be written by branching on its sign.

```tsx
<Chain>
  <Given label="Gross salary" value={4200} unit="€" />
  <Minus label="Income tax" value={612.5} unit="€" />
  <Plus>
    <Sum label="Corrections" unit="€">
      {corrections.map((c) => <Given key={c.id} label={c.name} value={c.amount} />)}
    </Sum>
  </Plus>
  <Interim label="Net salary" unit="€" />
</Chain>
```

The rules:

- **A sum takes any number of operands**, one or none included. The sum of
  nothing is zero. Its line stays where it is: with one operand it folds and
  opens onto that one, with none it shows 0, has no disclosure, and says "no
  entries" where the formula would stand. Written by hand or from `.map`, the
  same - a rule that told the two apart could not be explained. `Difference`,
  `Product` and `Quotient` keep their counts; an empty product is 1, which no
  reader expects.
- **A line that adds or takes away shows its contribution**: the direction as
  its operator, the number without a sign. A correction of −18 that is added
  stands as "− Corrections 18.00", never as "+ Corrections -18.00". This holds
  for the operands of `Sum` and `Difference` and for `Plus` and `Minus` in a
  chain, the first operand included ("− Refund 30.00 + Bonus 12.00"). The
  formula in names and the sentence follow the line. A factor keeps its sign:
  "× -1" stays.
- **The quantity itself keeps its own sign** - where its derivation closes, as
  an interim, as the Result, and where a reference names it. "= Corrections
  -18.00" closes the derivation whose line reads "− Corrections 18.00".
- **Zero and absence keep the operator as written**, and so does a line whose
  metrics (ADR-0038) point in different directions; there each number carries
  its sign. A metric that is zero or absent on a line takes no part in that
  check, so that one empty cell does not turn a line back to signed numbers;
  where every metric is zero or absent, the line keeps the written operator.
- **`Plus` and `Minus` stay two.** Direction is the writer's statement, sign is
  the data's. Signed rows from data go into `Plus` or stand bare in a sum; a
  quantity that is positive by nature and taken away - income tax, a sum of
  contributions - goes into `Minus`, so that it keeps its sign where it closes
  and where it is referenced.

**Emphasis and rule.** Every quantity but the Result takes `emphasis="strong"`
or `"muted"` and `rule="above"`, so a writer can set a line apart without CSS.
They name what the line is to the reader, not how it is drawn. A muted line
still counts in full. On the Result both are a development error: it is
already the heaviest line.

## Considered Options

- **The operator as written, the number with its sign** ("+ Corrections
  -18.00"). Correct, and rejected by the user: a plus before a negative number
  is read twice and still misread.
- **`Plus` and `Minus` as operands of a sum.** Proposed first for groups with
  rows of both signs. With the contribution rule a signed value already reads
  right, and the wrappers would only make the caller branch on the sign.
- **One signed element instead of `Plus` and `Minus`** (`<Entry>`). It loses
  the direction: a derived quantity that is positive by nature could then only
  be taken away by a factor of −1. A direction prop on it is the `sign` prop
  ADR-0028 rejected.
- **A chain that starts without a first quantity**, as the group. The group's
  name would stand twice, as its closing interim and as its line.
- **A tone on a line.** It would stand beside the verdict's badge and mean
  something else in the same colours.
- **Hiding a line's number.** A quantity without its number cannot be redone,
  which is what a calculation is for.

## Consequences

ADR-0027's "two or more operands" no longer holds for `Sum`. The operator
column of an additive line depends on the data. Evaluation starts a sum at
zero instead of at its first operand. A chain is unchanged: `Given` followed
directly by `Interim` stays a development error, since a chain without a step
is a given.
