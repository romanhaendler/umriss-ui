import { Calculation, Difference, Given } from "../../../src";

export const title = "Take several amounts away";
export const lead = "`Difference` takes every operand after the first away from it, each with its minus in the operator column.";

export default function DifferenceOfThree() {
  return (
    <Calculation aria-label="Plannable hours, Chloe Durand, week 12">
      <Difference label="Plannable hours, Chloe" unit="h">
        <Given label="Capacity" value={40} unit="h" />
        <Given label="Leave" value={8} unit="h" />
        <Given label="Meetings" value={5} unit="h" />
        <Given label="Support rota" value={4} unit="h" />
      </Difference>
    </Calculation>
  );
}
