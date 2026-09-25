import { Calculation, Chain, Given, Interim, Minus, Plus } from "../../../src";

export const title = "Mix additions and deductions";
export const lead = "Where a figure is a list of items, write each as a line of its own; a credit is a `Minus` where it stands.";

export default function TourCost() {
  return (
    <Calculation aria-label="Cost of tour T-01, Tuesday">
      <Chain>
        <Given label="Driver, 6.5 h" value={224.25} unit="€" decimals={2} />
        <Plus label="Diesel" value={13.89} unit="€" decimals={2} />
        <Plus label="Van, one day" value={58} unit="€" decimals={2} />
        <Plus label="Tolls" value={9.4} unit="€" decimals={2} />
        <Plus label="Parking" value={6} unit="€" decimals={2} />
        <Minus label="Fuel card rebate" value={0.7} unit="€" decimals={2} />
        <Interim label="Cost of the tour" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
