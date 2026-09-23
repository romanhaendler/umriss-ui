/* Fill weights read against their set point: the set point as a line, the
   samples as points over it, and those out of tolerance with `tone="alarm"`.

   The outliers are a series of their own and not a colour per point - a
   scatter has one colour, and the tone is a role the theme resolves, so the
   alarm here is the same red as an alarm limit. The two channels never both
   carry a value, so no sample is drawn twice. */

import { Chart, Legend, Line, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { weightData, type WeightSample } from "../../data";

export const title = "Samples against a set point";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function OverACourse() {
  return (
    <Chart data={weightData} height={300} ariaLabel="Fill weight samples against their set point">
      <XAxis accessor={(d: WeightSample) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: WeightSample) => d.setPoint} label="g" />
      <Line accessor={(d: WeightSample) => d.setPoint} name="Set point" dash={[4, 4]} />
      <Scatter accessor={(d: WeightSample) => d.sample} name="Sample" radius={2.5} />
      <Scatter accessor={(d: WeightSample) => d.outlier} name="Out of tolerance" tone="alarm" radius={4} />
      <Legend placement="top" />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
