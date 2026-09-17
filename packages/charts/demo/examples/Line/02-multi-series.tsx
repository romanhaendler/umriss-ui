/* Four series, the legend on top, one dashed series and one series with a gap -
   the line is interrupted, not interpolated. A gap is a hole and never a value
   the chart invents (CONTEXT.md, **Gap**). */

import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { multiData, type Point } from "../../data";

export const title = "Several series and gaps";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function MultiSeries() {
  return (
    <Chart data={multiData} height={300} ariaLabel="Four series with a legend">
      <XAxis accessor={(d: Point) => d.t} label="Index" />
      <YAxis accessor={(d: Point) => d.a} label="Value" />
      <Line accessor={(d: Point) => d.a} name="Series A" />
      <Line accessor={(d: Point) => d.b} name="Series B" />
      <Line accessor={(d: Point) => d.c} name="Series C" dash={[4, 4]} />
      <Line accessor={(d: Point) => d.d} name="Series D (with a gap)" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
