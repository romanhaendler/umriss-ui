import { Calculation, Difference, Given, Quotient, Ref } from "../../../src";

export const title = "The availability of a service";
export const lead = "Write the figure as elements; the calculation computes every number on the screen and assesses the result against its `target`.";

export default function Availability() {
  return (
    <Calculation aria-label="Availability of Checkout, March so far">
      <Quotient label="Availability, Checkout" format="percent" decimals={2} target={0.9995}>
        <Difference label="Minutes up" unit="min">
          <Given id="month" label="Minutes this month" value={23670} unit="min" />
          <Given label="Minutes down" value={34} unit="min" />
        </Difference>
        <Ref to="month" />
      </Quotient>
    </Calculation>
  );
}
