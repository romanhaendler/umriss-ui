/* Downtime by reason, stacked: each day's bar is its whole downtime, and each
   reason a part of it. Every Bar with the same `stack` stands on the ones
   registered before it - the order in the JSX is the order from the foot up.

   The material log was not kept on the first Wednesday. That day's bar says
   so: its material segment is missing, the breakdown stands directly on the
   setup - a gap stacks as zero -, and the tooltip names the reasons it has
   and their total. */

import { Bar, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { downtimeData, type DayDowntime } from "../../data";

export const title = "Stacked bars";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function Stacked() {
  return (
    <Chart data={downtimeData} height={280} ariaLabel="Downtime per working day by reason">
      <XAxis
        accessor={(d: DayDowntime) => d.day}
        ticks={downtimeData.map((d) => d.day)}
        tickFormat={(v) => downtimeData[v]?.name ?? ""}
      />
      <YAxis accessor={(d: DayDowntime) => d.setup} label="Minutes" />
      <Bar accessor={(d: DayDowntime) => d.setup} name="Setup" stack="downtime" />
      <Bar accessor={(d: DayDowntime) => d.material} name="Material" stack="downtime" />
      <Bar accessor={(d: DayDowntime) => d.breakdown} name="Breakdown" stack="downtime" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
