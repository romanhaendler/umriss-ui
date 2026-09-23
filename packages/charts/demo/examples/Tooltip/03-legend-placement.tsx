/* The legend above the plot and below it. Above is the default: a chart without
   `placement` looks like the left one, and `placement="top"` says the same thing
   out loud.

   A legend stands beside the plot area, never inside it - it takes its height
   from the chart, not from the curves. Hovering an entry lifts its series and
   draws the others faint. */

import { Chart, Legend, Line, XAxis, YAxis } from "../../../src";
import { furnaceData, type FurnacePoint } from "../../data";

export const title = "Legend above or below";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function LegendPlacement() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">no placement - above, the default</p>
        <Chart data={furnaceData} height={220} ariaLabel="Legend above the plot">
          <XAxis accessor={(d: FurnacePoint) => d.t} tickFormat={timeOfDay} tickCount={4} />
          <YAxis accessor={(d: FurnacePoint) => d.f1} label="°C" />
          <Line accessor={(d: FurnacePoint) => d.f1} name="Furnace 1" />
          <Line accessor={(d: FurnacePoint) => d.f2} name="Furnace 2" />
          <Legend />
        </Chart>
      </div>
      <div>
        <p className="pair-caption">placement="bottom"</p>
        <Chart data={furnaceData} height={220} ariaLabel="Legend below the plot">
          <XAxis accessor={(d: FurnacePoint) => d.t} tickFormat={timeOfDay} tickCount={4} />
          <YAxis accessor={(d: FurnacePoint) => d.f1} label="°C" />
          <Line accessor={(d: FurnacePoint) => d.f1} name="Furnace 1" />
          <Line accessor={(d: FurnacePoint) => d.f2} name="Furnace 2" />
          <Legend placement="bottom" />
        </Chart>
      </div>
    </div>
  );
}
