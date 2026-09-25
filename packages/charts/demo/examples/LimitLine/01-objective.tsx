import { Chart, LimitLine, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { SERVICES, metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Draw a limit";
export const lead = "A `LimitLine` lies above the series with its label; `severity` picks its tone, and its value counts in the y extent.";

const CHECKOUT = metrics("checkout");
const OBJECTIVE = SERVICES.find((one) => one.id === "checkout")!.latencySlo;

export default function Objective() {
  return (
    <Chart data={CHECKOUT} height={260} ariaLabel="Checkout's latency against its objective">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <LimitLine value={OBJECTIVE} severity="alarm" label="Objective" />
      <Line accessor={(d: MetricPoint) => d.p95} name="p95" />
      <Tooltip mode="x" />
    </Chart>
  );
}
