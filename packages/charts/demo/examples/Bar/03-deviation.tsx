/* The deviation from plan, per working day: above plan upwards, below plan
   downwards, the foot at 0 in the middle of the axis.

   The foot of a bar is 0 and not the bottom of the axis - which is what lets one
   series carry both signs. The deviation is computed in the accessor, not
   stored: it is the difference of two numbers the data already has. */

import { Bar, Chart, Tooltip, XAxis, YAxis } from "../../../src";
import { outputData, type DayOutput } from "@umriss-ui/demo/worlds/plant";

export const title = "Above and below plan";

const signed = (v: number) => (v > 0 ? `+${v.toFixed(0)}` : v.toFixed(0));

export default function Deviation() {
  return (
    <Chart data={outputData} height={280} ariaLabel="Deviation from plan per working day">
      <XAxis
        accessor={(d: DayOutput) => d.day}
        ticks={outputData.map((d) => d.day)}
        tickFormat={(v) => outputData[v]?.name ?? ""}
      />
      <YAxis accessor={(d: DayOutput) => d.actual - d.planned} tickFormat={signed} label="Pieces" />
      <Bar accessor={(d: DayOutput) => d.actual - d.planned} name="Deviation from plan" />
      <Tooltip mode="x" />
    </Chart>
  );
}
