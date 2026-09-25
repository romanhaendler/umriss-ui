import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { week, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Sync the cursor across charts";
export const lead = "Charts with one `syncId` share the pointer; pass them one controlled `domain` and a zoom in any of them zooms all.";

const LAST_WEEK = week("images", 5 * 60_000);

const CHANNELS = [
  { name: "Requests", unit: "/min", value: (d: MetricPoint) => d.requests },
  { name: "p95", unit: "ms", value: (d: MetricPoint) => d.p95 },
  { name: "p50", unit: "ms", value: (d: MetricPoint) => d.p50 },
] as const;

export default function CursorSync() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <div>
      {/* Each plot begins where its y axis ends: labels of one width - three
          figures here - keep the crosshairs in one column. */}
      {CHANNELS.map((c) => (
        <Chart key={c.name} data={LAST_WEEK} height={140} syncId="images" ariaLabel={`Image service ${c.name} over last week`}>
          <XAxis accessor={(d: MetricPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
          <YAxis accessor={c.value} label={c.unit} domain="visible" tickCount={4} />
          <Line accessor={c.value} name={c.name} />
          <Tooltip mode="x" />
        </Chart>
      ))}
    </div>
  );
}
