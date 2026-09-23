# A calculation read top to bottom: the chain

Status: done
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
- **Folding.** *(Superseded by the amendment below: a chain in view does not
  fold.)* Everything below the outermost statement starts folded. An
  interim folds the lines since the interim before it.
- **The tree's long operator.** A sum or product of more than four operands
  shows no formula on its line, only how many operands it has. Fixed, not a
  prop.
- **The look (ADR-0028, "How it is shown"), for tree and chain alike.** Settled
  in the design session and twice revised on seeing it rendered: a statement on
  a surface in the library's material, fixed columns, the Result as the last row
  underlined twice, derivations opening beneath their row as groups joined by
  a falling line and closing "= label", the verdict as core's badge, "≈" with
  a tooltip, tokens only and no font named.
- **Line.** An operand line shows its operator and its own number. Only an
  interim or a derived result shows the value it stands for.
- **Accessibility.** The chain is a list; every line keeps its sentence —
  "plus Direct labour equals 960 €"; an interim reads "Production cost equals
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

## Comments

### Delivery report (2026-09-23)

All five tickets delivered in one commit.

- **Chain.** `Chain`, `Plus`, `Minus`, `Times`, `DividedBy`, `Interim`. The
  reader turns interims into derived quantities (the interim before as a
  `previous` operand, a new signed sum for plus and minus). Every rule of
  ADR-0028 is a development error with a test asserting its message, and so is
  any prop written beside a child of a line tag.
- **The look changed during implementation.** The first build followed the
  design session: every result beneath its operands, derivations opening
  upward. Seen in the browser, the user found it confusing, because the
  clicked line moved and an open derivation no longer looked as if it belonged
  anywhere. Decided then: the outermost statement stays as on paper and does
  not fold, and every other derivation opens *beneath* its line as a nested
  calculation on the sunken surface. It has a bar hanging from the label and
  closes with a rule and "= label"; in a chain it starts with the interim
  before. ADR-0028 "How it is shown" and this spec say so. A browser test holds
  that the clicked line does not move, and one picture outside the loop shows
  OEE with derivations open.
- **Everything below the outermost statement starts folded**, tree and chain
  alike.
- **Demo:** six pages and twenty-three examples, from two numbers and a sum to
  the cost per piece of a production order. Every baseline of the package is
  renewed, and axe is clean on every page.
- **From the review:**
  - A chain folded away as an operand now carries the worst verdict of all its
    interims; a chain in view shows only what lies since the interim before
    (`worstSince`; *superseded - with chains in view open, the field went again*).
  - The sentence keeps the full formula above four operands, and the visible
    count has no "=".
  - Avoided words are out of the code: `carried` became `previous`, "run" and
    "threshold" are gone.
  - The spec's example sentence now reads "plus Direct labour equals 960 €",
    as every line does.

Left open from the review, as judgement calls:
- The closing row repeats the line's markup.
- Subtraction has two encodings, `difference` and a sum with a negated operand.
- `items()` in `Calculation.tsx` is the longest function of the package.
- The hover band on operands uses the edge token as a fill, because the sunken
  surface is invisible inside a derivation.
- An interim's operand count includes the interim before; that is intended,
  since it is a term of the interim's formula.

### Amendment (2026-09-23, after the release commit of 0.1.0)

A chain in view no longer folds (ADR-0028, amended). The payslip showed that
folding a chain to its interims hides the steps it is written for: gross
salary, each deduction on its own line with its minus, the net salary once they
all stand. Folding is now the writer's choice per line - a `<Sum>` of
contributions held by a `<Minus>` folds like any tree. A chain that is an
operand folds whole and opens whole. The spec's "Folding" decision above is
superseded by this; `@umriss-ui/calculation` 0.2.0 carries it.

