import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "One series";
export const lead = "A `Line` joins the readings of one accessor in the order of x; the first y axis draws the grid.";

const CHECKOUT = metrics("checkout");

export default function OneSeries() {
  return (
    <Chart data={CHECKOUT} height={280} ariaLabel="Checkout's 95th percentile latency today">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <Line accessor={(d: MetricPoint) => d.p95} name="Checkout p95" />
      <Tooltip />
    </Chart>
  );
}
