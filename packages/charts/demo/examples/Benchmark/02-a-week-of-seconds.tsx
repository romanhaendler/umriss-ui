/* Not photographed, like the benchmark above it: it measures the series draw
   (R-5.1). */

import { useCallback, useState } from "react";
import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import type { ChartPerf } from "../../../src";
import { week, type MetricPoint } from "@umriss-ui/demo/worlds/operations";

export const title = "Draw a week of seconds";
export const lead = "Two series of 604,800 readings each: every pixel column draws first, lowest, highest and last, so a spike stays; zoom in for every reading.";

export default function WeekOfSeconds() {
  // Made on first render, not on import: 604,800 readings are no page's
  // business until this one is open.
  const [data] = useState(() => week("search", 1000));
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  const [drawMs, setDrawMs] = useState(0);
  const onPerf = useCallback((p: ChartPerf) => setDrawMs(p.seriesDrawMs), []);
  return (
    <>
      <dl className="metrics">
        <div>
          <dt>Points</dt>
          <dd>{(2 * data.length).toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Series draw</dt>
          <dd>{drawMs.toFixed(1)} ms</dd>
        </div>
      </dl>
      <Chart data={data} height={300} ariaLabel="Search latency and requests over last week, a reading a second" onPerf={onPerf}>
        <XAxis accessor={(d: MetricPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
        <YAxis accessor={(d: MetricPoint) => d.p95} label="ms" domain="visible" />
        <YAxis id="requests" position="right" accessor={(d: MetricPoint) => d.requests} label="Requests/min" domain="visible" />
        <Line accessor={(d: MetricPoint) => d.p95} name="p95" />
        <Line accessor={(d: MetricPoint) => d.requests} yAxisId="requests" name="Requests" />
        <Legend placement="top" />
        <Tooltip mode="x" />
      </Chart>
    </>
  );
}
