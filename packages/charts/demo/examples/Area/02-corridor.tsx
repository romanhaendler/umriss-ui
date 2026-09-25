/* A corridor between two channels, and the measured temperature inside it.

   The lower edge is the `baseline` accessor - a channel of the same series, not a
   second series the area is filled towards. During the recipe change there is
   no corridor: the fill gets a hole there, while the line runs on, because the
   furnace was measured the whole time. */

import { Area, Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { corridorData, type CorridorPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "A corridor with a gap";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function Corridor() {
  return (
    <Chart data={corridorData} height={280} ariaLabel="Furnace temperature inside the corridor of its recipe">
      <XAxis accessor={(d: CorridorPoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: CorridorPoint) => d.temperature} label="°C" />
      {/* An outline runs along the upper edge only; a corridor has two edges, so
          it gets neither. */}
      <Area
        accessor={(d: CorridorPoint) => d.upper}
        baseline={(d: CorridorPoint) => d.lower}
        name="Recipe corridor"
        strokeWidth={0}
      />
      <Line accessor={(d: CorridorPoint) => d.temperature} name="Furnace temperature" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
