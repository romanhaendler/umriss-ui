import { useState } from "react";
import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { metrics, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Hide a series from the legend";
export const lead = "`hidden` is your state and `onToggle` hands you the clicked entry; a hidden series leaves the y extent, its entry stays struck through.";

const SERVICES = [
  { name: "Checkout", data: metrics("checkout") },
  { name: "Billing", data: metrics("billing") },
  { name: "Reporting", data: metrics("reports") },
];

export default function TogglingLegend() {
  /* Reporting's slow jobs would flatten the other two. */
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(["Reporting"]));
  const toggle = (name: string) =>
    setHidden((previous) => {
      const next = new Set(previous);
      if (!next.delete(name)) next.add(name);
      return next;
    });

  return (
    <Chart data={SERVICES[0]!.data} height={260} ariaLabel="Latency of three services, one hidden">
      <XAxis accessor={(d: MetricPoint) => d.t} time />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      {SERVICES.map((one) => (
        <Line key={one.name} data={one.data} accessor={(d: MetricPoint) => d.p95} name={one.name} hidden={hidden.has(one.name)} />
      ))}
      <Legend onToggle={toggle} />
      <Tooltip mode="x" />
    </Chart>
  );
}
