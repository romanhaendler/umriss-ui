/* A day of hall temperature on a time axis: `time` says the values are
   instants, and the axis stands its ticks on the local clock and labels them by
   level - the hours, and the date where the day changes. No `tickFormat`; one
   would take over, in any language. */

import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { hallData, type HallPoint } from "../../data";

export const title = "Time axis";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function TimeAxis() {
  return (
    <Chart data={hallData} height={260} ariaLabel="Hall temperature across a day and a night">
      <XAxis accessor={(d: HallPoint) => d.t} time />
      <YAxis accessor={(d: HallPoint) => d.temperature} label="°C" />
      <Line accessor={(d: HallPoint) => d.temperature} name="Hall" />
      <Tooltip mode="x" />
    </Chart>
  );
}
