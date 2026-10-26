import { Tooltip, useChart } from "../../../src";

export const title = "One bar per month";
export const lead = "Rows with a `Date` per month put the axis in time, and its ticks never come closer than the bars' step: the months are named one under each bar, not the weeks that no bar stands on.";

/* Orders per month of 2026, the first of each month - as a controller exports them. */
const ORDERS = [412, 388, 455, 501, 534, 497, 462, 478, 540, 586, 611, 645].map((orders, month) => ({
  month: new Date(2026, month, 1),
  orders,
}));

export default function OneBarPerMonth() {
  const { Chart, XAxis, YAxis, Bar } = useChart(ORDERS);
  return (
    <Chart height={260} aria-label="Orders per month in 2026">
      <XAxis value="month" tickCount={16} />
      <YAxis label="Orders" />
      <Bar value="orders" name="Orders" />
      <Tooltip mode="x" />
    </Chart>
  );
}
