import { Calculation, Given, Product } from "../../../src";

export const title = "Multiply quantities with units";
export const lead = "A `unit` is a label you write, never converted or checked; `decimals` fixes the places shown while every operation uses the full value.";

export default function ProductWithUnits() {
  return (
    <Calculation aria-label="Diesel cost of tour T-01">
      <Product label="Diesel, tour T-01" unit="€" decimals={2}>
        <Given label="Distance" value={87} unit="km" />
        <Given label="Consumption" value={0.095} unit="l/km" />
        <Given label="Diesel price" value={1.68} unit="€/l" decimals={2} />
      </Product>
    </Calculation>
  );
}
