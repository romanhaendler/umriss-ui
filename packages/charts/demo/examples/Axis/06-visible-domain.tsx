import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { week, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Fit the y axis to what is visible";
export const lead = "With `domain=\"visible\"` the y axis fits the zoomed stretch - here Saturday evening's outage - and follows when you zoom out.";

const LAST_WEEK = week("search", 60_000);
const SATURDAY = new Date(2026, 2, 14).getTime();
const HOUR = 3_600_000;

export default function VisibleDomain() {
  const [domain, setDomain] = useState<readonly [number, number]>([SATURDAY + 16 * HOUR, SATURDAY + 22 * HOUR]);
  return (
    <Chart data={LAST_WEEK} height={260} ariaLabel="Search latency on Saturday evening, the y axis fitted to it">
      <XAxis accessor={(d: MetricPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" domain="visible" />
      <Line accessor={(d: MetricPoint) => d.p95} name="p95" />
      <Tooltip mode="x" />
    </Chart>
  );
}
