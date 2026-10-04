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

const HOUR = 3_600_000;

const on = (month: number, day: number, hours = 0) => new Date(2026, month - 1, day, hours).getTime();

interface DepotLoad {
  t: number;
  /** Freight loaded per hour at each depot, in tonnes. */
  north: number;
  river: number;
  east: number;
}

/** Monday 06:00 to Tuesday 06:00, hour by hour. East Gate closes at night, and
    Riverside's night trucks take over its share. */
const TONNES_PER_HOUR: readonly DepotLoad[] = (() => {
  const r = random(911);
  return Array.from({ length: 25 }, (_, i) => {
    const hour = (6 + i) % 24;
    const night = hour >= 22 || hour < 6;
    return {
      t: on(3, 16, 6) + i * HOUR,
      north: Math.round((6 + r() * 2) * 10) / 10,
      river: Math.round(((night ? 7 : 4) + r() * 1.5) * 10) / 10,
      east: night ? 0 : Math.round((3.5 + r() * 2) * 10) / 10,
    };
  });
})();

export const title = "Show shares of the whole over time";
export const lead = "`normalize` on a stack makes every hour sum to 100 %: the axis reads in per cent, and `format` still writes the tooltip's readings in tonnes.";

const tonnes = (v: number) => `${v.toFixed(1)} t`;

export default function Shares() {
  const { Chart, XAxis, YAxis, Area } = useChart(TONNES_PER_HOUR);
  return (
    <Chart height={280} ariaLabel="Each depot's share of the freight loaded per hour">
      <XAxis value="t" time domain="data" />
      <YAxis value="north" label="Share of the hour" />
      <Area value="north" name="North" stack="depots" normalize format={tonnes} fillOpacity={0.5} strokeWidth={1} />
      <Area value="river" name="Riverside" stack="depots" normalize format={tonnes} fillOpacity={0.5} strokeWidth={1} />
      <Area value="east" name="East Gate" stack="depots" normalize format={tonnes} fillOpacity={0.5} strokeWidth={1} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
