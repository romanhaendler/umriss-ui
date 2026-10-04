import { Legend, Tooltip, useChart } from "../../../src";

/* Data from the logistics world, written out here so the example runs on its own. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface DayDelays {
  /** The position on the x axis: the working day's index. */
  day: number;
  name: string;
  /** Minutes late across all tours, by cause; `null` where it was not logged. */
  traffic: number;
  loading: number | null;
  access: number;
}

/** Two working weeks, 2 to 13 March. On the first Wednesday the loading log
    was not kept - a gap, not a zero - and on the second Thursday a closed
    bridge takes the day. */
const DELAYS: readonly DayDelays[] = (() => {
  const r = random(1204);
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return Array.from({ length: 10 }, (_, day) => ({
    day,
    name: `${names[day % 5]} ${2 + day + 2 * Math.floor(day / 5)}`,
    traffic: Math.round((day === 8 ? 150 : 40) + r() * 30),
    loading: day === 2 ? null : Math.round(10 + r() * 45),
    access: Math.round(5 + r() * 25),
  }));
})();

export const title = "Show shares of a whole";
export const lead = "`normalize` makes each stack sum to 100 %, so the question moves from how long to of what; `format` still writes minutes.";

const minutes = (v: number) => `${v} min`;

export default function Percent() {
  const { Chart, XAxis, YAxis, Bar } = useChart(DELAYS);
  return (
    <Chart height={280} ariaLabel="Share of each cause in the minutes late per working day">
      <XAxis value="day" ticks={DELAYS.map((d) => d.day)} tickFormat={(v) => DELAYS[v]?.name ?? ""} />
      <YAxis value="traffic" />
      <Bar value="traffic" name="Traffic" stack="delay" normalize format={minutes} />
      <Bar value="loading" name="Loading" stack="delay" normalize format={minutes} />
      <Bar value="access" name="No access" stack="delay" normalize format={minutes} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
