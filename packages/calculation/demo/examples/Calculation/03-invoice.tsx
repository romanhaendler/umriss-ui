import { Calculation, Chain, Given, Interim, Minus, Plus, Product, Ref } from "../../../src";

export const title = "Write a chain";
export const lead = "Put lines in a `Chain` for a sheet read top to bottom; each works into the value before it, and an `Interim` names that value.";

export default function Invoice() {
  return (
    <Calculation aria-label="Invoice INV-26-0318, Brandlow Office Supply">
      <Chain>
        <Product id="lamps" label="Desk lamps, LED" unit="€" decimals={2}>
          <Given label="Lamps" value={24} unit="pcs" />
          <Given label="Price per lamp" value={48.9} unit="€/pc" decimals={2} />
        </Product>
        <Minus>
          <Product label="Discount" unit="€" decimals={2}>
            <Given label="Discount on lamps" value={0.1} format="percent" />
            <Ref to="lamps" />
          </Product>
        </Minus>
        <Plus>
          <Product label="Printer paper" unit="€" decimals={2}>
            <Given label="Boxes" value={40} unit="boxes" />
            <Given label="Price per box" value={21.5} unit="€/box" decimals={2} />
          </Product>
        </Plus>
        <Plus label="Delivery" value={35} unit="€" decimals={2} />
        <Interim id="net" label="Net amount" unit="€" decimals={2} />
        <Plus>
          <Product label="VAT" unit="€" decimals={2}>
            <Given label="VAT rate" value={0.19} format="percent" />
            <Ref to="net" />
          </Product>
        </Plus>
        <Interim label="Invoice total" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
