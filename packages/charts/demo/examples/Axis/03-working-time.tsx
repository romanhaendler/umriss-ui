import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { SORTED, SORTING_HOURS, type SortedPoint } from "@umriss-ui/demo/worlds/logistics";

export const title = "Leave out the hours nobody works";
export const lead = "Pass the working hours as `calendar` and the axis drops nights and the weekend, marking every seam where time was taken out.";

const weekdayAndTime = (v: number) =>
  new Date(v).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

export default function WorkingTime() {
  return (
    <Chart data={SORTED} height={280} ariaLabel="Parcels sorted per hour across last week's sorting hours">
      <XAxis
        accessor={(d: SortedPoint) => d.t}
        calendar={SORTING_HOURS}
        tickFormat={weekdayAndTime}
        tickCount={8}
        label="Sorting hours"
      />
      <YAxis accessor={(d: SortedPoint) => d.parcels} label="Parcels/h" />
      <Line accessor={(d: SortedPoint) => d.parcels} name="Sorted" />
      <Tooltip mode="x" />
    </Chart>
  );
}
