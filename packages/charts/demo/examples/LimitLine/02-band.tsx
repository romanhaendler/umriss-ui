import { Chart, LimitBand, LimitLine, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Lay a band under the series";
export const lead = "A `LimitBand` fills from `from` to `to` below every series - ground to read against - while a line stays on top as the landmark.";

const CHECKOUT = metrics("checkout");

export default function Band() {
  return (
    <Chart data={CHECKOUT} height={260} ariaLabel="Checkout's error rate against its warning band and alarm limit">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.errorRate} label="Errors %" />
      <LimitBand from={1} to={2} severity="warning" label="Watch" />
      <LimitLine value={2} severity="alarm" label="Alert" />
      <Line accessor={(d: MetricPoint) => d.errorRate} name="Error rate" />
      <Tooltip mode="x" />
    </Chart>
  );
}
