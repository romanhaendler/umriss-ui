import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Write each value in its unit";
export const lead = "`format` on a series writes its value in the tooltip; without it the y axis' `tickFormat` does, and without that a bare number.";

const CHECKOUT = metrics("checkout");

const milliseconds = (v: number) => `${v.toFixed(0)} ms`;
const percent = (v: number) => `${v.toFixed(2)} %`;

export default function ValueFormat() {
  return (
    <Chart data={CHECKOUT} height={260} ariaLabel="Checkout's latency and error rate with their units">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <YAxis id="errors" position="right" accessor={(d: MetricPoint) => d.errorRate} label="Errors %" />
      <Line accessor={(d: MetricPoint) => d.p95} name="p95" format={milliseconds} />
      <Line accessor={(d: MetricPoint) => d.errorRate} yAxisId="errors" name="Error rate" format={percent} />
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}
