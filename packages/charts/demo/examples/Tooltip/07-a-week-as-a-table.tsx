import { useState } from "react";
import { Chart, DataTable, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { week, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Table a long series";
export const lead = "Above 500 rows the table lists each stretch's first, lowest, highest and last value and says so; zoom in and every reading returns.";

const LAST_WEEK = week("search", 60_000);

const milliseconds = (v: number) => `${v.toFixed(0)} ms`;

export default function WeekAsTable() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <Chart data={LAST_WEEK} height={240} ariaLabel="Search latency over last week, a reading a minute">
      <XAxis accessor={(d: MetricPoint) => d.t} time domain={domain} onDomainChange={setDomain} label="Time" />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <Line accessor={(d: MetricPoint) => d.p95} name="p95" format={milliseconds} />
      <Tooltip mode="x" />
      {/* Without a legend the key stands on a line of its own. */}
      <DataTable />
    </Chart>
  );
}
