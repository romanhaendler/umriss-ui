import { useMemo } from "react";
import { Tooltip, pareto, useChart } from "../../../src";

export const title = "Shares, not counts";
export const lead = "A share reads better as sorted bars than as a pie (ADR-0059): `pareto()` gives each entry its `share` from 0 to 1, and a percent axis says it - no cumulative line and no second axis.";

/* Why deliveries failed last month, in no particular order. */
const FAILED_DELIVERIES = [
  { name: "Damaged in transit", value: 21 },
  { name: "Nobody home", value: 312 },
  { name: "Address incomplete", value: 96 },
  { name: "Refused", value: 34 },
  { name: "Business closed", value: 58 },
  { name: "No access code", value: 147 },
  { name: "Wrong address", value: 12 },
  { name: "Parcel not found", value: 8 },
  { name: "Weather", value: 6 },
  { name: "Vehicle breakdown", value: 4 },
];

export default function SharesNotCounts() {
  const { entries } = useMemo(() => pareto(FAILED_DELIVERIES, { collectRank: 6, remainderName: "Other" }), []);
  const { Chart, XAxis, YAxis, Bar } = useChart(entries);
  return (
    <Chart height={300} aria-label="Share of failed deliveries by cause, sorted">
      <XAxis value="name" />
      <YAxis label="Share of failed deliveries" tickFormat={{ style: "percent", maximumFractionDigits: 0 }} />
      <Bar value="share" name="Share" barWidth={0.72} />
      <Tooltip mode="x" />
    </Chart>
  );
}
