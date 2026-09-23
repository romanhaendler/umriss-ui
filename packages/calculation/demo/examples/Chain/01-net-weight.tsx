import { Calculation, Chain, Given, Interim, Minus } from "../../../src";

export const title = "Net weight";

/* The simplest chain: a first quantity with no operator, lines that take
   something away, and an `<Interim>` that names the value. `<Minus>` and
   `<Plus>` take a label and a value directly - a given written in place. */
export default function NetWeight() {
  return (
    <Calculation aria-label="Net weight, delivery 4471">
      <Chain>
        <Given label="Gross weight" value={1250} unit="kg" />
        <Minus label="Pallet" value={25} unit="kg" />
        <Minus label="Crates" value={144} unit="kg" />
        <Minus label="Packaging" value={11.5} unit="kg" />
        <Interim label="Net weight" unit="kg" decimals={1} />
      </Chain>
    </Calculation>
  );
}
