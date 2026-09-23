# @umriss-ui/calculation

A calculation a reader can follow and redo. A plant screen shows a figure — an
OEE of 82 %, a cost per piece — and this package shows how it came about, as a
statement of account: the operator before each number, the final result above a
double rule, and every figure opening beneath itself into the calculation it
came from, down to the numbers at its root. The package **performs every operation it
shows**, so what stands on the screen cannot disagree with the number.

## Install

```bash
pnpm add @umriss-ui/calculation @umriss-ui/core
```

`@umriss-ui/core` is a **peer dependency**: the calculation takes its styling
regime, formats, wording, assessment and freshness from there. React 18 or 19
as a peer as well.

## Two forms, written as they are shown

A **tree** suits a figure put together from factors. Operators are elements,
their children are their operands in order, givens are the leaves (ADR-0027). A
quantity used twice is defined once and stands elsewhere as a `<Ref>`:

```tsx
import { Calculation, Difference, Given, Product, Quotient, Ref } from "@umriss-ui/calculation";

<Calculation aria-label="OEE, early shift">
  <Product label="OEE" format="percent" target={0.85}>
    <Quotient label="Availability" format="percent">
      <Difference id="runtime" label="Run time" unit="min">
        <Given id="planned" label="Planned production time" value={450} unit="min" />
        <Given label="Downtime" value={38} unit="min" />
      </Difference>
      <Ref to="planned" />
    </Quotient>
    <Quotient label="Performance" format="percent">
      <Product label="Ideal run time" unit="min">
        <Given label="Ideal cycle time" value={0.8} unit="min/pc" />
        <Given id="total" label="Total count" value={480} unit="pcs" />
      </Product>
      <Ref to="runtime" />
    </Quotient>
    <Quotient label="Quality" format="percent">
      <Given label="Good count" value={461} unit="pcs" />
      <Ref to="total" />
    </Quotient>
  </Product>
</Calculation>
```

A **chain** suits a sheet read top to bottom (ADR-0028). A first quantity,
then `Plus`, `Minus`, `Times` or `DividedBy`, each working its operand into the
value before it, strictly in order, and `Interim`s naming the value where they
stand. It starts folded to its interims:

```tsx
<Calculation aria-label="Price of a spare part">
  <Chain>
    <Given label="Cost price" value={148.2} unit="€" />
    <Plus label="Handling" value={12} unit="€" />
    <Interim label="Cost with handling" unit="€" decimals={2} />
    <Times label="Mark-up" value={1.25} />
    <Interim label="Net price" unit="€" decimals={2} />
  </Chain>
</Calculation>
```

The two mix: a line of a chain can hold a tree, and a chain can be an operand
in a tree.

- **Four operators, and nothing else:** `Sum`, `Product`, `Difference`
  (a − b − c) take two or more operands, `Quotient` exactly two.
- **A chain has no precedence**, so a `Times` or `DividedBy` stands alone
  between two named values; anything else fails on the first render.
- **Full precision throughout**; rounding happens only on the screen. Where the
  rounded operands do not give the rounded result, the result carries "≈".
- **An absent given is never zero.** Every quantity that depends on it is
  absent too, with the reason; a quotient by zero is absent with its own.
- **Target and limits** are assessed through core's `assess()`. A folded
  derivation that holds a worse verdict than its line says so, quietly.
- **A statement on a surface**, in the material of the library's tables and
  cards. A derivation opens beneath its row as one group with it and closes
  with "= label"; folded, the row shows the formula it hides in names — or how
  many operands there are, above four. The Result is the last row, its number
  underlined twice.
- **Every line is read as one sentence** — "Availability equals Run time
  divided by Planned production time, equals 412 min divided by 450 min,
  equals 91.6 percent" — and every derivation is a disclosure.
- **A declaration the calculation cannot evaluate fails on the first render**
  with a message saying which and where: a `Ref` to nothing (listing the ids
  that exist), a circle through references, a wrong operand count, a
  duplicate id, a component of your own wrapping `Given`. `.map` inside an
  operator works.

## Documentation

The demo is the documentation: `pnpm dev:calculation` in the repository, port
4177. The vocabulary — calculation, quantity, result, given, operator, operand,
derivation, reference — stands in `CONTEXT.md` under "Calculations".
