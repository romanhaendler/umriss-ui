import { Calculation, Difference, Given } from "../../../src";

export const title = "A difference of three";

/* `<Difference>` takes the first operand and subtracts every other: a − b − c.
   Each operand after the first carries its minus in the operator column. */
export default function DifferenceOfThree() {
  return (
    <Calculation aria-label="Planned production time, early shift">
      <Difference label="Planned production time" unit="min">
        <Given label="Shift length" value={480} unit="min" />
        <Given label="Breaks" value={30} unit="min" />
        <Given label="Planned maintenance" value={20} unit="min" />
      </Difference>
    </Calculation>
  );
}
