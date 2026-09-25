/* A week of a kiln at one reading a second: 604,800 points per series, two
   series. Lines and areas downsample on their own above two points per pixel
   column: each column draws where the course entered it, its lowest and its
   highest reading and where it left - a spike stays a spike -, so the week
   costs a path of a few thousand points instead of 1.2 million. Zoom in with
   Ctrl or ⌘ and the wheel: from about half an hour on, the chart draws every
   reading again. The tooltip always reads the raw data.

   It measures, like the benchmark above it - the time of the last series
   draw -, and is therefore not photographed either (R-5.1). */

import { useCallback, useState } from "react";
import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import type { ChartPerf } from "../../../src";
import { kiln, type KilnPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "A week of seconds";

export default function WeekOfSeconds() {
  // Made on first render, not on import: 604,800 readings are no page's
  // business until this one is open.
  const [data] = useState(() => kiln(2024, 1000));
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
      <Chart data={data} height={300} ariaLabel="Kiln temperature and gas flow across a week, one reading a second" onPerf={onPerf}>
        <XAxis accessor={(d: KilnPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
        <YAxis accessor={(d: KilnPoint) => d.temperature} label="°C" domain="visible" />
        <YAxis id="gas" position="right" accessor={(d: KilnPoint) => d.gas} label="m³/h" domain="visible" />
        <Line accessor={(d: KilnPoint) => d.temperature} name="Temperature" />
        <Line accessor={(d: KilnPoint) => d.gas} yAxisId="gas" name="Gas" />
        <Legend placement="top" />
        <Tooltip mode="x" />
      </Chart>
    </>
  );
}
