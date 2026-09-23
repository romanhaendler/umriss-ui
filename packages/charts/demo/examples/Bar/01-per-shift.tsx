/* Scrap per shift: one bar series, the shifts as positions 0 to 8 on the
   ordinary numeric x axis, named by the tickFormat (ADR-0002).

   A category is a number the axis places and a function names - no band scale,
   no category axis. `ticks` puts one tick under every bar; without it the 1-2-5
   algorithm would pick its own positions and name every second shift. */

import { Bar, Chart, Tooltip, XAxis, YAxis } from "../../../src";
import { scrapData, type ShiftScrap } from "../../data";

export const title = "One bar per shift";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function PerShift() {
  return (
    <Chart data={scrapData} height={260} ariaLabel="Scrap per shift over three days">
      <XAxis
        accessor={(d: ShiftScrap) => d.shift}
        ticks={scrapData.map((d) => d.shift)}
        tickFormat={(v) => scrapData[v]?.name ?? ""}
      />
      <YAxis accessor={(d: ShiftScrap) => d.scrap} label="Pieces" />
      <Bar accessor={(d: ShiftScrap) => d.scrap} name="Scrap" />
      <Tooltip mode="x" />
    </Chart>
  );
}
