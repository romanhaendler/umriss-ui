/* Wall thickness, sampled by hand whenever the inspector came by: individual
   measurements, drawn as points and joined by nothing.

   A line between two samples would claim a thickness at every moment in
   between, and nobody measured one. `radius` is in CSS pixels; a little larger
   than the default, because each point here is a person's walk to the line. */

import { Chart, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { thicknessData, type ThicknessSample } from "@umriss-ui/demo/worlds/plant";

export const title = "Individual measurements";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function Measurements() {
  return (
    <Chart data={thicknessData} height={260} ariaLabel="Wall thickness samples over one shift">
      <XAxis accessor={(d: ThicknessSample) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: ThicknessSample) => d.mm} label="mm" />
      <Scatter accessor={(d: ThicknessSample) => d.mm} name="Wall thickness" radius={4} />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
