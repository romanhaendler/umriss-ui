import { Calculation, Difference, Given, Product, Quotient, Ref } from "../../../src";

export const title = "OEE of an early shift";

/* The lead case: overall equipment effectiveness as availability × performance
   × quality, each derived from the shift's numbers. The level under the result
   is open and everything below it folded; open a line to see where it came from.

   Planned production time, run time and total count are each used twice. They
   are defined once, where they belong, and stand elsewhere as a `<Ref>` - a
   reference shows the quantity's name and number, never its derivation again.
   Hover a line and its operands and every place it is used light up. */
export default function Oee() {
  return (
    <Calculation aria-label="OEE, early shift">
      <Product label="OEE" format="percent" target={0.85}>
        <Quotient label="Availability" format="percent">
          <Difference id="runtime" label="Run time" unit="min">
            <Given id="planned" label="Planned production time" value={450} unit="min" />
            <Given label="Downtime" value={38} unit="min" />
          </Difference>
          <Ref to="planned" />
        </Quotient>
        <Quotient label="Performance" format="percent">
          <Product label="Ideal run time" unit="min">
            <Given label="Ideal cycle time" value={0.8} unit="min/pc" />
            <Given id="total" label="Total count" value={480} unit="pcs" />
          </Product>
          <Ref to="runtime" />
        </Quotient>
        <Quotient label="Quality" format="percent">
          <Given label="Good count" value={461} unit="pcs" />
          <Ref to="total" />
        </Quotient>
      </Product>
    </Calculation>
  );
}
