import { Calculation, Chain, Given, Interim, Plus } from "../../../src";

export const title = "A quieter line";
export const lead =
  "`emphasis=\"muted\"` lets a line recede – a small position the reader may skip. It still counts in full: the interim below includes it, and a reader who redoes the sum needs it.";

export default function AQuieterLine() {
  return (
    <Calculation aria-label="Tour cost, 17 March">
      <Chain>
        <Given label="Driver, 8.5 h" value={340} unit="€" decimals={2} />
        <Plus label="Diesel, 212 km" value={98.6} unit="€" decimals={2} />
        <Plus label="Vehicle, day rate" value={145} unit="€" decimals={2} />
        <Plus label="Tolls" value={4.2} unit="€" decimals={2} emphasis="muted" />
        <Plus label="Parking" value={3.5} unit="€" decimals={2} emphasis="muted" />
        <Interim label="Cost of the tour" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
