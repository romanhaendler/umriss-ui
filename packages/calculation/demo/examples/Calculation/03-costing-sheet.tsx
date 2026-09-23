import { Calculation, Chain, Given, Interim, Plus, Product, Ref, Times } from "../../../src";

export const title = "A costing sheet";

/* The same calculation read the other way: as a chain, top to bottom, the way
   a costing sheet stands on paper. Each line works its operand into the value
   before it, and an `<Interim>` names that value where it stands.

   The chain stands open, as on paper: lines, a rule, the interim, and on.
   A surcharge on an earlier line is a `<Plus>` holding a product with a
   `<Ref>` - the overhead is 120 % of the direct labour, not of the running
   value - and that product is a tree: it folds, showing the formula it hides,
   and opens beneath its line on a click. */
export default function CostingSheet() {
  return (
    <Calculation aria-label="Offer price, order A-2041">
      <Chain>
        <Given id="material" label="Direct material" value={1840} unit="€" decimals={2} />
        <Plus>
          <Product label="Material overhead" unit="€" decimals={2}>
            <Given label="Material overhead rate" value={0.12} format="percent" />
            <Ref to="material" />
          </Product>
        </Plus>
        <Interim label="Material cost" unit="€" decimals={2} />
        <Plus id="labour" label="Direct labour" value={960} unit="€" decimals={2} />
        <Plus>
          <Product label="Production overhead" unit="€" decimals={2}>
            <Given label="Production overhead rate" value={1.2} format="percent" />
            <Ref to="labour" />
          </Product>
        </Plus>
        <Interim id="production" label="Production cost" unit="€" decimals={2} />
        <Plus>
          <Product label="Administration and sales overhead" unit="€" decimals={2}>
            <Given label="Overhead rate" value={0.15} format="percent" />
            <Ref to="production" />
          </Product>
        </Plus>
        <Interim label="Cost price" unit="€" decimals={2} />
        <Times label="Profit mark-up" value={1.08} />
        <Interim label="Net offer price" unit="€" decimals={2} target={5000} />
      </Chain>
    </Calculation>
  );
}
