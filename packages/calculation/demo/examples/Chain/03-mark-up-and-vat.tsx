import { Calculation, Chain, Given, Interim, Plus, Times } from "../../../src";

export const title = "Multiply between two interims";
export const lead = "A chain has no precedence, so `Times` and `DividedBy` stand alone between two interims; after a `Plus` they fail on the first render.";

export default function MarkUpAndVat() {
  return (
    <Calculation aria-label="Price of a workshop day">
      <Chain>
        <Given label="Two facilitators, one day" value={960} unit="€" decimals={2} />
        <Plus label="Room and materials" value={180} unit="€" decimals={2} />
        <Interim label="Cost of the day" unit="€" decimals={2} />
        <Times label="Mark-up" value={1.25} />
        <Interim label="Net price" unit="€" decimals={2} />
        <Times label="VAT factor" value={1.19} />
        <Interim label="Gross price" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
