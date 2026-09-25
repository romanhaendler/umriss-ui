import { Calculation, Difference, Given, Quotient, Ref } from "../../../src";

export const title = "Use a quantity twice";
export const lead = "Give a quantity an `id` where it first belongs and write `Ref` wherever it is used again; hover either place and both light up.";

export default function UsedTwice() {
  return (
    <Calculation aria-label="Overspend of Marketing, February">
      <Quotient label="Overspend, share of budget" format="percent">
        <Difference label="Overspend" unit="€">
          <Given label="Actual, February" value={77420} unit="€" />
          <Given id="budget" label="Budget, February" value={68000} unit="€" />
        </Difference>
        <Ref to="budget" />
      </Quotient>
    </Calculation>
  );
}
