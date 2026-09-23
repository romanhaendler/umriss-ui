import { Calculation, Difference, Given, Product, Quotient, Ref } from "../../../src";

export const title = "A missing number";

/* The downtime has not been booked yet. It shows as missing - and so does
   every figure that depends on it, each with the reason, up to the result.
   Nothing is carried on as zero: an OEE computed with no downtime would be a
   number, and a wrong one. */
export default function Missing() {
  return (
    <Calculation aria-label="OEE, late shift">
      <Product label="OEE" format="percent" target={0.85}>
        <Quotient label="Availability" format="percent">
          <Difference id="runtime" label="Run time" unit="min">
            <Given id="planned" label="Planned production time" value={450} unit="min" />
            <Given label="Downtime" value={null} unit="min" />
          </Difference>
          <Ref to="planned" />
        </Quotient>
        <Quotient label="Performance" format="percent">
          <Product label="Ideal run time" unit="min">
            <Given label="Ideal cycle time" value={0.8} unit="min/pc" />
            <Given id="total" label="Total count" value={455} unit="pcs" />
          </Product>
          <Ref to="runtime" />
        </Quotient>
        <Quotient label="Quality" format="percent">
          <Given label="Good count" value={441} unit="pcs" />
          <Ref to="total" />
        </Quotient>
      </Product>
    </Calculation>
  );
}
