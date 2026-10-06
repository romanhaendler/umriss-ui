# 01 — A sum of any count

Status: ready-for-agent
Type: task

Blocked by: none
Spec: "Solution" (first bullet), "Implementation Decisions" (Reading,
Evaluation, Empty sum), "Examples" 1–3; user stories 1–12, 49

## What to build

A writer hands a `Sum` the rows of an array, whatever their count, and the
calculation never throws for it. Two or more rows read as today. One row folds
and opens onto that one, closing with "= label". No rows is worth zero: the
line stays in place, has no disclosure, says "no entries" where the formula
would stand, and the interim after it equals the value before. `Difference`,
`Product` and `Quotient` keep their operand counts and their messages.

## Acceptance

- [ ] Rendered `<Calculation>` tests: a sum of none (number 0, no
      disclosure, "no entries" in the formula column and in the sentence, the
      interim after it unchanged), a sum of one (folds, opens onto its one
      operand, closes with "= label"), a hand-written sum of one.
- [ ] Rendered tests: `Difference` and `Product` with one operand and
      `Quotient` with one still throw their messages; existing tests that
      asserted "two or more" for `Sum` are updated.
- [ ] An empty sum is neither absent nor approximate; a sum starts at zero
      in evaluation (no `NaN`).
- [ ] Wording `calculationNoOperands`: "no entries" in English, "keine
      Einträge" in German; the wording guard passes.
- [ ] An empty sum does not count towards "whether anything can fold".
- [ ] A new demo page **Rows from data** in "Writing a calculation", after
      Chain, with examples "Rows of any count", "No rows" and "One row", each
      titled by what it shows and with a lead stating the rule.
- [ ] Typecheck, the package's unit tests and the demo smoke test pass; the
      new examples have screenshot and forced-colours baselines.
