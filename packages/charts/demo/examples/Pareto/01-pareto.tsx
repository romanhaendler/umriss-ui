import { useMemo } from "react";
import { Legend, LimitLine, Tooltip, pareto, useChart } from "../../../src";

export const title = "Sort causes and collect the tail";
export const lead = "`pareto()` sorts descending, adds up and folds everything past `collectRank` into one entry that stands last; the bars and the line are yours.";

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

export default function ParetoExample() {
  const { entries } = useMemo(() => pareto(FAILED_DELIVERIES, { collectRank: 6, remainderName: "Other" }), []);
  const { Chart, XAxis, YAxis, Bar, Line } = useChart(entries);
  return (
    <Chart height={300} ariaLabel="Failed deliveries by cause, sorted, with the cumulative share">
      <XAxis value="index" ticks={entries.map((e) => e.index)} tickFormat={(v) => entries[v]?.name ?? ""} />
      <YAxis label="Failed deliveries" />
      <YAxis
        id="share"
        position="right"
        domain={[0, 100]}
        tickFormat={(v) => `${v.toFixed(0)} %`}
        label="cumulative"
      />
      <Bar value="value" name="Failed" barWidth={0.72} />
      <Line value={(d) => d.cumulative * 100} yAxisId="share" name="cumulative" markers="always" strokeWidth={1.75} />
      <LimitLine value={80} axisId="share" severity="warning" label="80 %" inExtent={false} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
