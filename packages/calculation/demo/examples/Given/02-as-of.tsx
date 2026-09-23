import { Calculation, Given, Product } from "../../../src";

export const title = "An as-of time without ages";

/* `asOf` alone states when the number was true, as a time. With `ages` as
   well, the given carries a freshness through core, as a `Stat` does - the
   library has no default ages, because "stale" at a furnace means something
   else than on a monthly report. */
export default function AsOf() {
  return (
    <Calculation aria-label="Value of the stock, bar steel">
      <Product label="Value of the stock" unit="€" decimals={2}>
        <Given label="Bar steel in stock" value={18.4} unit="t" source="Stocktaking" asOf={new Date(2026, 2, 13, 16, 0)} />
        <Given label="Price" value={812} unit="€/t" source="Price list 2026-Q1" asOf={new Date(2026, 0, 2, 8, 0)} />
      </Product>
    </Calculation>
  );
}
