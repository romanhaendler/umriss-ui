import { Calculation, Chain, Given, Interim, Minus, Plus, Times } from "../../../src";

export const title = "A stronger line";
export const lead =
  "`emphasis=\"strong\"` sets a line apart to be read first – here the production cost, the figure a costing sheet is usually questioned on. It changes how the line looks, never what it says: its sentence for a screen reader stays the same. Any quantity takes it but the Result, which is already the heaviest line; there it fails on the first render.";

export default function AStrongerLine() {
  return (
    <Calculation aria-label="Offer price A-2041">
      <Chain>
        <Given label="Direct material" value={1840} unit="€" decimals={2} />
        <Plus label="Material overhead" value={220.8} unit="€" decimals={2} />
        <Plus label="Direct labour" value={960} unit="€" decimals={2} />
        <Plus label="Production overhead" value={432} unit="€" decimals={2} />
        <Interim label="Production cost" unit="€" decimals={2} emphasis="strong" />
        <Minus label="Customer discount" value={86.4} unit="€" decimals={2} />
        <Interim label="Net cost" unit="€" decimals={2} />
        <Times label="Profit mark-up" value={1.08} />
        <Interim label="Net offer price" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
