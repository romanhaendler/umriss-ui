# 02 — A line shows its contribution

Status: ready-for-agent
Type: task

Blocked by: 01
Spec: "Solution" (second bullet), "Implementation Decisions" (Contribution,
The first operand's operator, Formula and sentence, Closing row), "Examples"
4–9, 15, 17; user stories 13–30, 34–36

## What to build

Every line that adds or takes away shows its **Contribution** (`CONTEXT.md`,
ADR-0049): the direction as its operator, the number without a sign. Signed
rows from data stand bare in a sum and read right - "+ Bonus 84.00",
"− Overpaid travel 120.00" - and a group that turns negative stands as
"− Corrections 35.97" while its derivation closes "= Corrections -35.97".

The rule holds for the operands of `Sum` and `Difference`, the first operand
included (a negative first operand draws a leading "−", a positive one none),
for a chain's `Plus` and `Minus`, and for a chain's first quantity. The folded
formula in names, the formula in numbers and the sentence follow the drawn
operators. The quantity itself keeps its sign where its derivation closes, as
an interim, as the Result and where a reference names it. A factor keeps its
sign ("× -1"). Zero and absent lines keep the written operator. Assessment,
targets, limits and the approximation mark stay on the signed value.

## Acceptance

- [ ] Rendered tests through `rows()`, `formulaOf()` and the sentence: the
      lead case of the spec (Corrections −35.97, Net salary 3551.53), a
      negative first operand, a `Difference` with a negative subtrahend, a
      chain's `Plus` with a negative value and `Minus` with a positive one
      reading alike, a negative first quantity of a chain, a negative factor,
      a zero and an absent line, a reference to a negative quantity, a
      negative interim.
- [ ] Rendered test: a limit on a negative quantity is still assessed on its
      signed value.
- [ ] Examples on Rows from data: "Rows of both signs", "A group that turns
      negative", "Plus or Minus", "A deduction first", "Zero and missing keep
      their sign", "A sum from data in a tree".
- [ ] The payslip example's lead names `Minus` for a quantity positive by
      nature and points to Rows from data; the Tree "from data" example is
      checked and extended if it builds a `Sum` from an array.
- [ ] Every existing screenshot baseline that changes is listed with its
      reason in the comments below.
