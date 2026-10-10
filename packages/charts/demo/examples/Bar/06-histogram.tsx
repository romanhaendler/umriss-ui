import { useMemo } from "react";
import { Tooltip, bin, useChart } from "../../../src";

export const title = "Count readings into a histogram";
export const lead = "`bin()` counts values into bins of one width on a tidy grid and returns each bin's bounds and count; a `Bar` on the numeric x axis draws them at `x`.";

/* How long 40 support tickets took to answer, in minutes, as the helpdesk exports them. */
const MINUTES_TO_ANSWER = [
  4, 7, 9, 11, 12, 12, 14, 15, 15, 17, 18, 19, 21, 22, 22, 23, 24, 26, 27, 28,
  29, 31, 33, 34, 36, 38, 41, 43, 47, 52, 55, 58, 63, 71, 78, 84, 96, 112, 135, 171,
];

export default function Histogram() {
  const bins = useMemo(() => bin(MINUTES_TO_ANSWER, { width: 20 }), []);
  const { Chart, XAxis, YAxis, Bar } = useChart(bins);
  return (
    <Chart height={260} ariaLabel="Minutes to answer 40 support tickets, counted in bins of 20 minutes">
      <XAxis value="x" label="minutes to answer" />
      <YAxis label="tickets" />
      <Bar value="count" name="Tickets" barWidth={0.94} />
      <Tooltip mode="x" />
    </Chart>
  );
}
