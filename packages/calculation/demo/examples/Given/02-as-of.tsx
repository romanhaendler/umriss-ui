import { Calculation, Given, Product } from "../../../src";

export const title = "State when a number was true";
export const lead = "`asOf` alone shows the time a number held; there are no default `ages`, because stale means different things on different screens.";

export default function AsOf() {
  return (
    <Calculation aria-label="Licence cost, design tool, March">
      <Product label="Licence cost, March" unit="€" decimals={2}>
        <Given label="Seats in use" value={12} unit="seats" source="Admin console" asOf={new Date(2026, 2, 13, 16, 0)} />
        <Given label="Price per seat" value={45} unit="€/seat" decimals={2} source="Contract with Nimbrel Software" asOf={new Date(2026, 0, 2, 8, 0)} />
      </Product>
    </Calculation>
  );
}
