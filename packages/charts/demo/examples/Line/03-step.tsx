/* A set point is not a ramp: it holds until the next entry and jumps there.
   `step` draws a line that way - sample-and-hold - beside the temperature that
   follows it. The set point is logged only when it changes; while no recipe is
   loaded it is a gap, and the hold ends where the gap begins. The tooltip
   reports the entry the hold began with, not the nearer one after it. */

import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { corridorData, setPoints, type CorridorPoint, type SetPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Step line";

export default function StepLine() {
  return (
    <Chart data={corridorData} height={260} ariaLabel="Furnace temperature following its set point">
      <XAxis accessor={(d: { t: number }) => d.t} time />
      <YAxis accessor={(d: CorridorPoint) => d.temperature} label="°C" />
      <Line data={setPoints} accessor={(d: SetPoint) => d.setPoint} name="Set point" step strokeWidth={2} />
      <Line accessor={(d: CorridorPoint) => d.temperature} name="Temperature" />
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}
