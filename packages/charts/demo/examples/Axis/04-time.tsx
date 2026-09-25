import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Plot instants on a time axis";
export const lead = "With `time` the values are instants: ticks stand on the local clock, labelled by hour, with the date where a day begins.";

const CHECKOUT = metrics("checkout");

export default function TimeAxis() {
  return (
    <Chart data={CHECKOUT} height={260} ariaLabel="Checkout's error rate today">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.errorRate} label="Errors %" />
      <Line accessor={(d: MetricPoint) => d.errorRate} name="Error rate" />
      <Tooltip mode="x" />
    </Chart>
  );
}
