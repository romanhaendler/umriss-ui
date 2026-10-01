import { Area, Chart, Legend, Tooltip, XAxis, YAxis } from "../../../src";

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

const HOUR = 60 * MINUTE;

interface DepotHour {
  t: number;
  /** Parcels loaded per hour at each depot. */
  north: number;
  river: number;
  east: number;
}

/** Monday 06:00 to Tuesday 06:00, hour by hour. East Gate closes at night and
    loads nothing - 0, not nothing. */
const PARCELS_PER_HOUR: readonly DepotHour[] = (() => {
  const r = random(906);
  return Array.from({ length: 25 }, (_, i) => {
    const hour = (6 + i) % 24;
    const night = hour >= 22 || hour < 6;
    return {
      t: on(3, 16, 6) + i * HOUR,
      north: Math.round(120 + r() * 30),
      river: Math.round((night ? 60 : 90) + r() * 25),
      east: night ? 0 : Math.round(70 + r() * 30),
    };
  });
})();

export const title = "Stack areas";
export const lead = "Areas with the same `stack` stand on the ones before them: the top edge is the whole, each band one depot's part.";

export default function StackedAreas() {
  return (
    <Chart data={PARCELS_PER_HOUR} height={280} ariaLabel="Parcels loaded per hour at three depots, stacked">
      <XAxis accessor={(d: DepotHour) => d.t} time domain="data" />
      <YAxis accessor={(d: DepotHour) => d.north} label="Parcels per hour" />
      <Area accessor={(d: DepotHour) => d.north} name="North" stack="depots" fillOpacity={0.5} strokeWidth={1} />
      <Area accessor={(d: DepotHour) => d.river} name="Riverside" stack="depots" fillOpacity={0.5} strokeWidth={1} />
      <Area accessor={(d: DepotHour) => d.east} name="East Gate" stack="depots" fillOpacity={0.5} strokeWidth={1} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
