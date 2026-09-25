import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { week, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Zoom and pan";
export const lead = "With `onDomainChange` the x axis proposes a domain on Ctrl or ⌘ with the wheel, a pinch or a drag; you pass it back.";

const LAST_WEEK = week("search", 60_000);

export default function ZoomAndPan() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <Chart data={LAST_WEEK} height={260} ariaLabel="Search latency over last week, a reading a minute, zoomable">
      {/* The domain stays yours: clamp it on the way back if you need to. A
          double click shows the whole week again. */}
      <XAxis accessor={(d: MetricPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
      <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" />
      <Line accessor={(d: MetricPoint) => d.p95} name="p95" />
      <Tooltip mode="x" />
    </Chart>
  );
}
