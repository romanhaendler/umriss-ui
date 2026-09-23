import { Calculation, Chain, Given, Interim, Minus, Plus, Quotient, Ref } from "../../../src";

export const title = "A chain inside a tree";

/* The two forms mix. Here a quotient's numerator is a chain: the net output of
   a line, from what it made to what could be shipped. Folded, the chain stands
   for its last interim; opened, it stands indented as a statement of its own,
   in the secondary colour, above the line it feeds. The denominator is the
   chain's own first line, referred to by its id. */
export default function ChainInATree() {
  return (
    <Calculation aria-label="Shipping yield, line 4">
      <Quotient label="Shipping yield" format="percent" target={0.97}>
        <Chain>
          <Given id="made" label="Parts made" value={2400} unit="pcs" />
          <Minus label="Scrap" value={41} unit="pcs" />
          <Minus label="Held for inspection" value={26} unit="pcs" />
          <Plus label="Released after rework" value={18} unit="pcs" />
          <Interim label="Parts shipped" unit="pcs" />
        </Chain>
        <Ref to="made" />
      </Quotient>
    </Calculation>
  );
}
