import { Area, Bar, Chart, Legend, Line, Scatter, Tooltip, XAxis, YAxis } from "../../../src";

/* Data from the logistics world, written out here so the example runs on its own. */

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface DepotDay {
  /** Day of March. */
  day: number;
  /** Pallets that arrived, and that left on the tours. */
  arrived: number;
  dispatched: number;
  /** Pallets on hand at the end of the day. */
  onHand: number;
  /** The range the stock is meant to stay in; `null` while it was reset
      after the stocktake. */
  targetLow: number | null;
  targetHigh: number | null;
  /** A pallet count by hand - it never quite agrees with the books. */
  counted: number;
}

/** The North depot's last fourteen days, 2 to 15 March. */
const DEPOT_DAYS: readonly DepotDay[] = (() => {
  const r = random(2026);
  let onHand = 62;
  return Array.from({ length: 14 }, (_, i) => {
    const arrived = 30 + r() * 25;
    const dispatched = 22 + r() * 20;
    onHand += (arrived - dispatched) * 0.35;
    const reset = i >= 6 && i <= 8;
    return {
      day: i + 2,
      arrived: Math.round(arrived),
      dispatched: Math.round(dispatched),
      onHand: Math.round(onHand),
      targetLow: reset ? null : Math.round(onHand - 9 - r() * 3),
      targetHigh: reset ? null : Math.round(onHand + 9 + r() * 3),
      counted: Math.round(onHand + (r() - 0.5) * 26),
    };
  });
})();

export const title = "Mark every kind";
export const lead = "Under `encoding=\"marks\"` bars and ranges take a hatch, lines a dash, points a shape - the same pairing of colour and mark in every chart.";

export default function MarksOnEveryKind() {
  return (
    <Chart data={DEPOT_DAYS} height={320} ariaLabel="North depot's pallets, told apart by marks" encoding="marks">
      <XAxis accessor={(d: DepotDay) => d.day} label="Day of March" tickCount={7} />
      <YAxis accessor={(d: DepotDay) => d.onHand} label="Pallets" />
      <Bar accessor={(d: DepotDay) => d.arrived} name="Arrived" />
      <Bar accessor={(d: DepotDay) => d.dispatched} name="Dispatched" />
      <Area accessor={(d: DepotDay) => d.targetHigh} baseline={(d: DepotDay) => d.targetLow} name="Target range" />
      <Line accessor={(d: DepotDay) => d.onHand} name="On hand" strokeWidth={2} />
      <Scatter accessor={(d: DepotDay) => d.counted} name="Counted" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
