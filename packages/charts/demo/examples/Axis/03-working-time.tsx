import { Chart, Line, Tooltip, XAxis, YAxis } from "../../../src";

/* Data from the logistics world, written out here so the example runs on its own. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const MINUTE = 60_000;

const on = (month: number, day: number, hours = 0) => new Date(2026, month - 1, day, hours).getTime();

/** The North depot's sorting hours: Monday to Friday, 06:00 to 22:00. */
const SORTING_HOURS = Array.from({ length: 5 }, (_, day) => ({ from: on(3, 9 + day, 6), to: on(3, 9 + day, 22) }));

interface SortedPoint {
  t: number;
  /** Parcels sorted per hour. */
  parcels: number;
}

/** Last week's sorting at the North depot, quarter hour by quarter hour -
    only in its sorting hours. */
const SORTED: readonly SortedPoint[] = (() => {
  const r = random(1963);
  const points: SortedPoint[] = [];
  let parcels = 420;
  for (const { from } of SORTING_HOURS) {
    for (let quarter = 0; quarter < 4 * 16; quarter++) {
      parcels += (r() - 0.5) * 26;
      points.push({ t: from + quarter * 15 * MINUTE, parcels: Math.round(parcels) });
    }
  }
  return points;
})();

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
