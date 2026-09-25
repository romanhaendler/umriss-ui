/* The same week, only without the hours in which nobody was there: Monday to
   Friday, 6 to 22 o'clock.

   On a wall clock axis the chart would consist, for a good forty per cent, of
   flat lines over an empty hall. Every removed span carries a break mark - a
   chart that takes a weekend out and does not say so claims a continuity it does
   not have. The scale stays affine; the mapping happens in materialisation
   (ADR-0001). */

import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { WEEK_CALENDAR, weekData, type WeekPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Working time axis";

const weekdayAndTime = (v: number) =>
  new Date(v).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

export default function WorkingTime() {
  return (
    <Chart data={weekData} height={280} ariaLabel="Output across the working time of one week">
      <XAxis
        accessor={(d: WeekPoint) => d.t}
        calendar={WEEK_CALENDAR}
        tickFormat={weekdayAndTime}
        tickCount={8}
        label="Working time"
      />
      <YAxis accessor={(d: WeekPoint) => d.output} label="Pieces/h" />
      <Line accessor={(d: WeekPoint) => d.output} name="Output" />
      <Tooltip mode="x" />
    </Chart>
  );
}
