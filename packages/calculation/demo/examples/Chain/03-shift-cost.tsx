import { Calculation, Chain, Given, Interim, Minus, Plus } from "../../../src";

export const title = "The cost of a shift";

/* A flat chain of cost items, plus and minus mixed: a credit for energy fed
   back is taken away where it stands. Written as a tree this would be one
   `<Sum>` whose line repeats all seven names; as a chain every item is a line
   of its own, and the interim is the sum a reader looks for. */
export default function ShiftCost() {
  return (
    <Calculation aria-label="Cost of the early shift, line 2">
      <Chain>
        <Given label="Operators" value={1152} unit="€" decimals={2} />
        <Plus label="Shift supervisor" value={264} unit="€" decimals={2} />
        <Plus label="Energy" value={418.4} unit="€" decimals={2} />
        <Plus label="Compressed air" value={96.2} unit="€" decimals={2} />
        <Plus label="Tooling wear" value={185} unit="€" decimals={2} />
        <Plus label="Cleaning" value={48} unit="€" decimals={2} />
        <Minus label="Energy fed back" value={37.6} unit="€" decimals={2} />
        <Interim label="Cost of the shift" unit="€" decimals={2} />
      </Chain>
    </Calculation>
  );
}
