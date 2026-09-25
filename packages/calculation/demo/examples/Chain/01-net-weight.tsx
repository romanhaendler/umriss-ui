import { Calculation, Chain, Given, Interim, Minus } from "../../../src";

export const title = "Take amounts away from a first quantity";
export const lead = "A chain starts with a quantity without operator; `Minus` and `Plus` take a label and a value directly, and an `Interim` ends it.";

export default function NetWeight() {
  return (
    <Calculation aria-label="Net weight, shipment FP-1004223">
      <Chain>
        <Given label="Gross weight" value={1250} unit="kg" decimals={1} />
        <Minus label="Pallet" value={25} unit="kg" decimals={1} />
        <Minus label="Crates" value={144} unit="kg" decimals={1} />
        <Minus label="Packaging" value={11.5} unit="kg" decimals={1} />
        <Interim label="Net weight" unit="kg" decimals={1} />
      </Chain>
    </Calculation>
  );
}
