import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import type { TooltipHit } from "../../../src";
import { SERVICES, metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Write the tooltip yourself";
export const lead = "`render` receives the hit - the x value and each series' point with its row - and returns the box's content, in your screen's language.";

const CHECKOUT = metrics("checkout");
const BILLING = metrics("billing");
const OBJECTIVE: Record<string, number> = Object.fromEntries(SERVICES.map((one) => [one.name, one.latencySlo]));

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function AgainstObjective({ hit }: { hit: TooltipHit<MetricPoint> }) {
  return (
    <div className="custom-tooltip">
      <strong>{timeOfDay(hit.xValue)}</strong>
      {hit.points.map((point) => {
        const off = point.datum.p95 - (OBJECTIVE[point.seriesName] ?? 0);
        return (
          <span key={point.seriesName}>
            {point.seriesName} - {point.datum.p95} ms, {Math.abs(off)} ms {off > 0 ? "over" : "under"} objective
          </span>
        );
      })}
    </div>
  );
}

export default function OwnContent() {
  return (
    <Chart data={CHECKOUT} height={280} ariaLabel="Checkout and billing latency, the tooltip against their objectives">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <Line accessor={(d: MetricPoint) => d.p95} name="Checkout" />
      <Line data={BILLING} accessor={(d: MetricPoint) => d.p95} name="Billing" />
      <Legend placement="top" />
      <Tooltip<MetricPoint> mode="x" render={(hit) => <AgainstObjective hit={hit} />} />
    </Chart>
  );
}
