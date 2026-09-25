/* A chart with a tooltip is one tab stop (ADR-0030). Tab into it: the Active
   point stands at the newest value, ← and → walk the readings, ↑ and ↓ choose
   the series read first, Home and End go to the ends, Escape clears. Where the
   axis is zoomable, + and − zoom, Shift with ← or → pans, 0 shows the week
   again. A screen reader hears the values once the keys rest, and the plot
   is described by a summary of what it shows.

   The words are the chart's own register (ADR-0031): English without a value,
   German from `@umriss-ui/charts/wording/de`. */

import { useState } from "react";
import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { GERMAN_CHARTS_WORDING } from "../../../src/wording/de";
import { kilnData, type KilnPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "By keyboard and screen reader";

export default function KeyboardAndScreenReader() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <div>
      <Chart data={kilnData} height={200} ariaLabel="Kiln and flue gas across a week">
        <XAxis accessor={(d: KilnPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
        <YAxis accessor={(d: KilnPoint) => d.temperature} label="°C" />
        <Line accessor={(d: KilnPoint) => d.temperature} name="Kiln" />
        <Line accessor={(d: KilnPoint) => d.flue} name="Flue gas" />
        <Tooltip mode="x" />
      </Chart>
      <Chart
        data={kilnData}
        height={200}
        ariaLabel="Ofen und Rauchgas über eine Woche"
        wording={GERMAN_CHARTS_WORDING}
      >
        <XAxis accessor={(d: KilnPoint) => d.t} time domain={domain} onDomainChange={setDomain} />
        <YAxis accessor={(d: KilnPoint) => d.temperature} label="°C" />
        <Line accessor={(d: KilnPoint) => d.temperature} name="Ofen" />
        <Line accessor={(d: KilnPoint) => d.flue} name="Rauchgas" />
        <Tooltip mode="x" />
      </Chart>
    </div>
  );
}
