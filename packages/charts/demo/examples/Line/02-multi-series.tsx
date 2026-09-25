import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Several series and a gap";
export const lead = "Each `Line` may bring its own `data`; a `null` reading breaks the line instead of being bridged, and a lone reading keeps its marker.";

const CHECKOUT = metrics("checkout");
const BILLING = metrics("billing");
const SIGN_IN = metrics("sign-in");

/* The image service's exporter restarted from 04:25 to 05:45 and sent a
   single reading at 05:05 in between. */
const IMAGES = metrics("images").map((d) => {
  const minutes = new Date(d.t).getHours() * 60 + new Date(d.t).getMinutes();
  const lost = minutes >= 4 * 60 + 25 && minutes <= 5 * 60 + 45 && minutes !== 5 * 60 + 5;
  return lost ? { ...d, p95: null } : d;
});

export default function MultiSeries() {
  return (
    <Chart data={CHECKOUT} height={300} ariaLabel="95th percentile latency of four services today">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <Line accessor={(d: MetricPoint) => d.p95} name="Checkout" />
      <Line data={BILLING} accessor={(d: MetricPoint) => d.p95} name="Billing" />
      <Line data={SIGN_IN} accessor={(d: MetricPoint) => d.p95} name="Sign-in" dash={[4, 4]} />
      <Line data={IMAGES} accessor={(d: { p95: number | null }) => d.p95} name="Image service" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
