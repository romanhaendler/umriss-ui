# @umriss-ui/calculation

A calculation a reader can follow and redo. A screen shows a figure — an
availability of 99.9 %, a cost per tour, an invoice total — and this package
shows how it came about, as a
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
import { Calculation, Difference, Given, Product, Ref, Sum } from "@umriss-ui/calculation";

<Calculation aria-label="Invoice 2041">
  <Sum label="Invoice total" unit="€" decimals={2}>
    <Difference id="net" label="Net amount" unit="€">
      <Product id="lines" label="Line amount" unit="€">
        <Given label="Quantity" value={12} unit="pcs" />
        <Given label="Unit price" value={389} unit="€" />
      </Product>
      <Product label="Discount" unit="€">
        <Ref to="lines" />
        <Given label="Discount rate" value={0.05} format="percent" />
      </Product>
    </Difference>
    <Product label="VAT" unit="€">
      <Ref to="net" />
      <Given label="VAT rate" value={0.19} format="percent" />
    </Product>
  </Sum>
</Calculation>
```

A **chain** suits a sheet read top to bottom (ADR-0028). A first quantity,
then `Plus`, `Minus`, `Times` or `DividedBy`, each working its operand into the
value before it, strictly in order, and `Interim`s naming the value where they
stand. A chain stands open, as on paper - each line in view, a rule, the
interim. What should show only on request goes into one line as a tree, and
folds:

```tsx
<Calculation aria-label="Payslip, March">
  <Chain>
    <Given id="gross" label="Gross salary" value={4200} unit="€" />
    <Minus label="Income tax" value={612.5} unit="€" />
    <Minus label="Church tax" value={49} unit="€" />
    <Minus>
      <Sum label="Social security contributions" unit="€">
        <Given label="Pension insurance" value={390.6} unit="€" />
        <Given label="Unemployment insurance" value={54.6} unit="€" />
        <Given label="Health insurance" value={344.4} unit="€" />
        <Given label="Long-term care insurance" value={71.4} unit="€" />
      </Sum>
    </Minus>
    <Interim label="Net salary" unit="€" decimals={2} />
    <Minus label="Capital-forming benefits" value={40} unit="€" />
    <Plus label="Travel allowance" value={60} unit="€" />
    <Interim label="Amount paid out" unit="€" decimals={2} />
  </Chain>
</Calculation>
```

The two mix: a line of a chain can hold a tree, and a chain can be an operand
in a tree - there it folds, and opens whole.

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
- **Every line is read as one sentence** — "Net amount equals Line amount
  minus Discount, equals 4,668 € minus 233.40 €, equals 4,434.60 €" — and
  every derivation is a disclosure.
- **A declaration the calculation cannot evaluate fails on the first render**
  with a message saying which and where: a `Ref` to nothing (listing the ids
  that exist), a circle through references, a wrong operand count, a
  duplicate id, a component of your own wrapping `Given`. `.map` inside an
  operator works.

## Documentation

The demo is the documentation: `pnpm dev:calculation` in the repository, port
4177. The vocabulary — calculation, quantity, result, given, operator, operand,
derivation, reference — stands in `CONTEXT.md` under "Calculations".

For a coding agent the demo stands as one Markdown file inside the installed
package, `docs/llms-full.md`, pinned to that version: every page with its
examples' source, its props tables and why it is built as it is, and the
declaration of every other export. Online, for the latest version:
<https://romanhaendler.github.io/umriss-ui/calculation/llms.txt>.
