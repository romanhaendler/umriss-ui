import { Calculation, Chain, Given, Interim, Plus } from "../../../src";

export const title = "Fifteen items from data";

/* `.map` over data inside a chain: each cost item becomes a `<Plus>`, and all
   fifteen stand in view above their interim. Where only the total should show
   until a reader asks, the items go into one line as a `<Sum>` instead - as
   the payslip does with its contributions; folded, such a line says how many
   operands it holds rather than a formula of fifteen terms. */

const ITEMS = [
  ["Steel sheet", 412.8],
  ["Tube 40×2", 186.4],
  ["Flat bar", 94.1],
  ["Screws M8", 22.6],
  ["Nuts M8", 9.8],
  ["Washers", 4.2],
  ["Hinges", 61.5],
  ["Gas springs", 88],
  ["Seals", 17.3],
  ["Powder coating", 143.9],
  ["Primer", 38.5],
  ["Labels", 6.4],
  ["Packaging", 29.7],
  ["Pallet", 14],
  ["Freight", 120],
] as const;

export default function FifteenItems() {
  const [[firstName, firstAmount], ...rest] = ITEMS;
  return (
    <Calculation aria-label="Bought-in cost, order A-2052">
      <Chain>
        <Given label={firstName} value={firstAmount} unit="€" decimals={2} />
        {rest.map(([name, amount]) => (
          <Plus key={name} label={name} value={amount} unit="€" decimals={2} />
        ))}
        <Interim label="Bought-in cost" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
