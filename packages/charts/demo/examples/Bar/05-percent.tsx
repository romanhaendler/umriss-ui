/* The same downtime as shares: `normalize` on a stack makes every day sum to
   100 %, so the question moves from "how long" to "of what". The breakdown on
   the second Thursday is no longer the tallest bar - it is the widest part.

   The y axis reads in percent by itself, and so does the tooltip's row per
   reason. The total stays in minutes: it is the one number the shares hide,
   and `format` writes it, as it would write any reading. */

import { Bar, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";
import { downtimeData, type DayDowntime } from "../../data";

export const title = "Shares of a whole";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const minutes = (v: number) => `${v} min`;

export default function Percent() {
  return (
    <Chart data={downtimeData} height={280} ariaLabel="Share of each reason in the downtime per working day">
      <XAxis
        accessor={(d: DayDowntime) => d.day}
        ticks={downtimeData.map((d) => d.day)}
        tickFormat={(v) => downtimeData[v]?.name ?? ""}
      />
      <YAxis accessor={(d: DayDowntime) => d.setup} />
      <Bar accessor={(d: DayDowntime) => d.setup} name="Setup" stack="downtime" normalize format={minutes} />
      <Bar accessor={(d: DayDowntime) => d.material} name="Material" stack="downtime" normalize format={minutes} />
      <Bar accessor={(d: DayDowntime) => d.breakdown} name="Breakdown" stack="downtime" normalize format={minutes} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
