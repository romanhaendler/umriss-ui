import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { week, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Align a second axis to the grid";
export const lead = "With `alignTicks` a further y axis widens its domain until its ticks, in 1-2-5 steps, fall on the first axis' grid lines.";

const LAST_WEEK = week("search", 5 * 60_000);

export default function AlignedTicks() {
  return (
    <Chart data={LAST_WEEK} height={260} ariaLabel="Search requests and latency over last week on one grid">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.requests} label="Requests/min" />
      <YAxis id="latency" position="right" accessor={(d: MetricPoint) => d.p95} label="ms" alignTicks />
      <Line accessor={(d: MetricPoint) => d.requests} name="Requests" />
      <Line accessor={(d: MetricPoint) => d.p95} yAxisId="latency" name="p95" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
