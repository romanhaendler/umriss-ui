import { useMemo } from "react";
import { Tooltip, useChart } from "../../../src";

export const title = "Per month";
export const lead = "Daily readings summed into months by the application's own `perMonth()`, and drawn as one bar per month on `Date` rows. The chart draws the sums it is given: whether a bar is a sum, a count or a mean, and what it counts, is the application's to decide, not the chart's.";

/* Units shipped per day, first half of 2026, as the warehouse exports them. */
const DAYS = Array.from({ length: 181 }, (_, i) => ({
  day: new Date(2026, 0, 1 + i),
  units: Math.round(40 + 12 * Math.sin(i / 9) + ((i * 37) % 11)),
}));

/** Each month's sum, placed at the month's first instant. */
function perMonth(days: readonly { day: Date; units: number }[]): { month: Date; units: number }[] {
  const sums = new Map<number, { month: Date; units: number }>();
  for (const { day, units } of days) {
    const month = new Date(day.getFullYear(), day.getMonth(), 1);
    const row = sums.get(month.getTime()) ?? { month, units: 0 };
    row.units += units;
    sums.set(month.getTime(), row);
  }
  return [...sums.values()];
}

export default function PerMonth() {
  const months = useMemo(() => perMonth(DAYS), []);
  const { Chart, XAxis, YAxis, Bar } = useChart(months);
  return (
    <Chart height={260} aria-label="Units shipped per month in the first half of 2026">
      <XAxis value="month" />
      <YAxis label="Units" />
      <Bar value="units" name="Units" />
      <Tooltip mode="x" />
    </Chart>
  );
}
