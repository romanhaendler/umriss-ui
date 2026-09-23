/* Planned and made, side by side: two bar series on the same x axis share the
   step and stand next to each other, centred on the day as a group.

   `barWidth` is the fraction of the step the whole group takes - so both series
   carry the same value, and a different one would be a DEV warning. The plan
   gets a quiet `color` of its own: it is the reference, and the palette colour
   goes to what was made. A token, so that it follows the colour scheme - the
   canvas resolves it like the palette. */

import { Bar, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { outputData, type DayOutput } from "../../data";

export const title = "Grouped bars";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function Grouped() {
  return (
    <Chart data={outputData} height={280} ariaLabel="Planned and made output per working day">
      <XAxis
        accessor={(d: DayOutput) => d.day}
        ticks={outputData.map((d) => d.day)}
        tickFormat={(v) => outputData[v]?.name ?? ""}
      />
      <YAxis accessor={(d: DayOutput) => d.actual} label="Pieces" />
      <Bar accessor={(d: DayOutput) => d.planned} name="Planned" color="var(--uc-color-text)" barWidth={0.7} />
      <Bar accessor={(d: DayOutput) => d.actual} name="Made" barWidth={0.7} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
