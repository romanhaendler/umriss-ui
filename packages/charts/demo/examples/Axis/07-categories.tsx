import { Tooltip, useChart } from "../../../src";

export const title = "Fix the order and keep an empty place";
export const lead = "`categories` is the order and the extent: a day without a row keeps its place, and the rows may come as they like. `categoryLabel` writes a name where the rows hold a key.";

/* Minutes late per working day, as the tour log sends them: only the days
   that had a delay, the worst first. */
const LATE = [
  { day: "thu", minutes: 164 },
  { day: "mon", minutes: 71 },
  { day: "fri", minutes: 58 },
  { day: "tue", minutes: 43 },
];

const WEEK = ["mon", "tue", "wed", "thu", "fri"];
const NAMES: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" };

export default function Categories() {
  const { Chart, XAxis, YAxis, Bar } = useChart(LATE);
  return (
    <Chart height={260} aria-label="Minutes late per working day">
      <XAxis value="day" categories={WEEK} categoryLabel={(day) => NAMES[day] ?? day} />
      <YAxis label="Minutes late" />
      <Bar value="minutes" name="Late" />
      <Tooltip mode="x" />
    </Chart>
  );
}
