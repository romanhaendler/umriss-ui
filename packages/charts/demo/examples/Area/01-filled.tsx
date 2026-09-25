import { Area, Chart, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Fill down to zero";
export const lead = "Without `baseline` an area is filled down to 0, and 0 stays in the y extent - a quantity is read from its foot.";

const CHECKOUT = metrics("checkout");

export default function Filled() {
  return (
    <Chart data={CHECKOUT} height={260} ariaLabel="Checkout's requests per minute today">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.requests} label="Requests/min" />
      <Area accessor={(d: MetricPoint) => d.requests} name="Requests" fillOpacity={0.35} strokeWidth={2} />
      <Tooltip mode="x" />
    </Chart>
  );
}
