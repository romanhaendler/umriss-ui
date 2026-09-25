/* The same two furnaces twice: on the left the tooltip reports every series at
   the x position, on the right only the point nearest the pointer.

   `"x"` answers "what was everything at 08:40"; `"nearest"` answers "which
   curve is this". The hit is searched per series in its own axis space and
   compared in pixels, so the crosshair snaps to a data point and never stands
   between two. Hover to see the difference - a picture of the page cannot. */

import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { furnaceData, type FurnacePoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Mode x or nearest";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function Furnaces({ mode }: { mode: "x" | "nearest" }) {
  return (
    <Chart data={furnaceData} height={220} ariaLabel={`Two furnace temperatures, tooltip mode ${mode}`}>
      <XAxis accessor={(d: FurnacePoint) => d.t} tickFormat={timeOfDay} tickCount={4} />
      <YAxis accessor={(d: FurnacePoint) => d.f1} label="°C" />
      <Line accessor={(d: FurnacePoint) => d.f1} name="Furnace 1" />
      <Line accessor={(d: FurnacePoint) => d.f2} name="Furnace 2" />
      <Tooltip mode={mode} />
    </Chart>
  );
}

export default function XOrNearest() {
  return (
    <div className="pair">
      <div>
        <p className="pair-caption">mode="x" - every series at the x position</p>
        <Furnaces mode="x" />
      </div>
      <div>
        <p className="pair-caption">mode="nearest" - only the nearest point</p>
        <Furnaces mode="nearest" />
      </div>
    </div>
  );
}
