/* The lead case of the spec: OEE of an early shift. Shared by the tests. */

import type { CSSProperties } from "react";
import { Calculation, Difference, Given, Product, Quotient, Ref } from "../src";

export function oee({ downtime = 38 as number | null, good = 461 } = {}) {
  return (
    <Product label="OEE" format="percent" target={0.85}>
      <Quotient label="Availability" format="percent">
        <Difference id="runtime" label="Run time" unit="min">
          <Given id="planned" label="Planned production time" value={450} unit="min" />
          <Given label="Downtime" value={downtime} unit="min" />
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
        <Given label="Good count" value={good} unit="pcs" />
        <Ref to="total" />
      </Quotient>
    </Product>
  );
}

export function OeeCalculation({
  className,
  style,
  ...props
}: Parameters<typeof oee>[0] & { className?: string; style?: CSSProperties }) {
  return (
    <Calculation aria-label="OEE, early shift" className={className} style={style}>
      {oee(props)}
    </Calculation>
  );
}
