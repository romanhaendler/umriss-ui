# @umriss-ui/calculation

A calculation a reader can follow and redo. A plant screen shows a figure — an
OEE of 82 %, a cost per piece — and this package shows how it came about, line
by line down to the numbers it came from, each line with its formula in names
and in numbers and its result. The package **performs every operation it
shows**, so what stands on the screen cannot disagree with the number.

## Install

```bash
pnpm add @umriss-ui/calculation @umriss-ui/core
```

`@umriss-ui/core` is a **peer dependency**: the calculation takes its styling
regime, formats, wording, assessment and freshness from there. React 18 or 19
as a peer as well.

## Written as it is shown

Operators are elements, their children are their operands in order, givens are
the leaves (ADR-0027). A quantity used twice is defined once and stands
elsewhere as a `<Ref>`:

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

- **Four operators, and nothing else:** `Sum`, `Product`, `Difference`
  (a − b − c) take two or more operands, `Quotient` exactly two.
- **Full precision throughout**; rounding happens only on the screen. Where the
  rounded operands do not give the rounded result, the result carries "≈".
- **An absent given is never zero.** Every quantity that depends on it is
  absent too, with the reason; a quotient by zero is absent with its own.
- **Target and limits** are assessed through core's `assess()`. A folded
  derivation that holds a worse verdict than its line says so, quietly.
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
