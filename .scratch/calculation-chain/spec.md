# A calculation read top to bottom: the chain

Status: ready-for-agent
Date:   2026-09-23
Origin: grilling session on the delivered `@umriss-ui/calculation`
(`.scratch/calculation/`): the tree reads badly for a costing sheet and for a
long sum. Vocabulary in `CONTEXT.md`, "Calculations" (**Tree**, **Chain**,
**Interim**); the decision in ADR-0028, which amends ADR-0027.

## Problem Statement

A costing sheet — direct material, material overhead, material cost, direct
labour, production overhead, production cost, … — is a column on paper. Written
as a tree, every interim result is the first operand of the next: four interim
results are four levels of JSX for the developer and four levels of indent for
the reader. A sum of fifteen cost items is flat, but its line repeats all
fifteen names and numbers in two formulas that wrap three times, above the
fifteen lines that list them anyway.

## Solution

A second form beside the tree: the **Chain**, read top to bottom. A first
quantity, then `Plus`, `Minus`, `Times` or `DividedBy`, each working its
operand into the value before it strictly in order, and `Interim`s naming the
value where they stand; the chain ends with one. The forms mix both ways.

The lead case, for the demo and the tests, is a costing sheet:

```tsx
<Calculation aria-label="Offer price, order A-2041">
  <Chain>
    <Given id="material" label="Direct material" value={1840} unit="€" />
    <Plus>
      <Product label="Material overhead" unit="€">
        <Given label="Material overhead rate" value={0.12} format="percent" />
        <Ref to="material" />
      </Product>
    </Plus>
    <Interim label="Material cost" unit="€" />
    <Plus id="labour" label="Direct labour" value={960} unit="€" />
    <Plus>
      <Product label="Production overhead" unit="€">
        <Given label="Production overhead rate" value={1.2} format="percent" />
        <Ref to="labour" />
      </Product>
    </Plus>
    <Interim id="production" label="Production cost" unit="€" />
    <Plus>
      <Product label="Administration and sales overhead" unit="€">
        <Given label="Overhead rate" value={0.15} format="percent" />
        <Ref to="production" />
      </Product>
    </Plus>
    <Interim label="Cost price" unit="€" />
    <Times label="Profit mark-up" value={1.08} />
    <Interim label="Net offer price" unit="€" target={5000} />
  </Chain>
</Calculation>
```

## User Stories

1. As an operator, I read a costing sheet top to bottom, as on paper.
2. As an operator, I see first the interim results, and open each to see what
   led to it.
3. As an operator, I never have to guess whether a line was multiplied before
   or after an addition.
4. As an operator, a long sum shows its items, not a formula of fifteen terms.
5. As an application developer, I write a sheet of eight interim results
   without eight levels of nesting.
6. As an application developer, a line that needs its own derivation (a
   surcharge on an earlier line) can hold a tree.
7. As an application developer, I can build a chain's lines from data with
   `.map`.
8. As an application developer, a chain I wrote wrongly fails on the first
   render with a message saying which and where.

## Implementation Decisions

- **Elements (ADR-0028).** `Chain` holds the lines. `Plus`, `Minus`, `Times`,
  `DividedBy` take either the props of a `Given` (label, value, unit, format,
  source, …) or exactly one child quantity (a tree, a `Ref`, a nested
  `Chain`). `Interim` takes the quantity props (label, id, unit, format,
  decimals, target, limits, explanation, aside) and no value.
- **Rules, each a development error with a message saying which and where.**
  The first line of a chain is a quantity with no operator (`Given`, `Ref`, a
  tree, a chain). A chain ends with an `Interim`. Two `Interim`s in a row, or an
  interim with no operand since the one before, is an error. `Times` or
  `DividedBy` stands alone between two named values: directly after the first
  quantity or an interim, directly before an interim.
- **Model.** An interim is a derived quantity: its operands are the value
  before (the first quantity or the previous interim, as a reference) and the
  operands since. Between two interims it is either a **signed sum** (a new
  operator: operands each with plus or minus — `Difference` is `a − b − c`
  only) or one product or quotient. `id` on an interim makes it referable. A
  chain as an operand in a tree stands for its last interim.
- **Evaluation.** Unchanged in kind: full precision, absence with its reason,
  division by zero, the approximation mark computed from the operands as
  shown, assessment through `assess()`.
- **Folding.** An interim folds the lines since the interim before it. A chain
  starts folded to its interims. A tree starts as before: the Result's
  operands shown, each folded.
- **The tree's long operator.** A sum or product of more than four operands
  shows no formula on its line, only how many operands it has. Fixed, not a
  prop.
- **The look (ADR-0028, "How it is shown"), for tree and chain alike.** The
  design session after the grilling settled it; it replaces the accordion the
  first delivery shipped:
  - a result beneath its operands under a rule; the Result with a double rule
    beneath and the heaviest weight;
  - columns label · operator · number · unit; numbers right-aligned in the
    monospace token with tabular figures; "≈" in a result's operator column;
  - nested levels indent their label only; an unfolded inner derivation's
    numbers, operators and rules in the secondary colour;
  - no chevron: the label is the disclosure button; folded, the formula in
    names stands beneath it ("15 operands" above four); unfolded, none;
  - at most two rows per quantity: beneath the label formula, reason,
    explanation, source, freshness, aside; beneath the number verdict and
    target - the 10 rem assessment column goes;
  - as wide as the content, the label column wrapping at a measure;
  - hover coupling as a flat band, references in italics;
  - no font named anywhere: tokens only (the library ships no fonts).
- **Line.** An operand line shows its operator and its own number. Only an
  interim or a derived result shows the value it stands for.
- **Accessibility.** The chain is a list; every line keeps its sentence —
  "plus Direct labour, 960 €"; an interim reads "Production cost equals
  Material cost plus Direct labour plus Production overhead, equals …".
- **Wording.** Entries in core, English and German, for the operator column's
  words if they differ from the tree's, and "4 operands" for the long operator.

## Testing Decisions

- The reading of a chain is a pure function and tested as one: the lead case,
  `.map` of lines, a chain in a tree and a tree in a chain, and one test per
  development error asserting its message.
- Evaluation: the signed sum in operand order, a product after an interim, an
  absent line making every later interim absent, the approximation mark on an
  interim.
- Rendering through the lead case: initial folding to interims, unfolding, the
  operator column, the sentence, the long operator without formula.
- The first delivery's rendering tests are rewritten for the new look, not
  kept beside it.
- The demo's image and accessibility checks include the new pages; every
  existing baseline of the package is renewed.
- **The demo carries many more worked examples**, from the simplest sum to a
  full costing of a production order (ticket 04).

## Out of Scope

- Precedence of any kind inside a chain.
- A running value on every line (ADR-0028: only interims show it).
- A percentage surcharge as a shorthand element (`<Surcharge rate of>`); a
  surcharge is a `Plus` holding a product with a `Ref`. Revisit if the demo
  shows it is too long to write.
- Everything the first spec left out.

## Further Notes

Terms introduced: **Tree**, **Chain**, **Interim** — in `CONTEXT.md`.
"Zwischenergebnis" left the avoid list of **Quantity** and is the German word
for **Interim**. Avoided: *subtotal* (after a times it is no sum), *step*,
*line* as a term.
