/* Three y axes with clearly different extents: one on the left, two stacked on
   the right (the second lies outside, separated by the gap). The series "large"
   is bound to a second x axis on top and counts in relative steps - the tooltip
   still compares the series correctly in pixel space.

   Only the first registered axis per orientation draws a grid. Two grids over
   one plot area are two rulers over one drawing. */

import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { axesData, type DualPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Multiple axes";

export default function Axes() {
  return (
    <Chart data={axesData} height={340} ariaLabel="Three extents on three y axes">
      <XAxis accessor={(d: DualPoint) => d.t} label="Step" />
      <XAxis id="top" position="top" accessor={(d: DualPoint) => d.t - 2000} label="Step (relative)" />
      <YAxis id="small" position="left" label="small" accessor={(d: DualPoint) => d.small} />
      <YAxis id="large" position="right" label="large" accessor={(d: DualPoint) => d.large} />
      <YAxis id="medium" position="right" label="medium" accessor={(d: DualPoint) => d.medium} />
      <Line accessor={(d: DualPoint) => d.small} yAxisId="small" name="small" />
      <Line
        accessor={(d: DualPoint) => d.large}
        xAxisId="top"
        yAxisId="large"
        name="large"
        dash={[4, 4]}
      />
      <Line accessor={(d: DualPoint) => d.medium} yAxisId="medium" name="medium" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
