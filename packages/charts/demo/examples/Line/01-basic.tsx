/* One series, default axes, grid only on the first y axis. */

import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { basicData, type Point } from "../../data";

export const title = "One series";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function Basic() {
  return (
    <Chart data={basicData} height={280} ariaLabel="Basic course of one series">
      <XAxis accessor={(d: Point) => d.t} label="Index" />
      <YAxis accessor={(d: Point) => d.a} />
      <Line accessor={(d: Point) => d.a} name="Series A" />
      <Tooltip />
    </Chart>
  );
}
