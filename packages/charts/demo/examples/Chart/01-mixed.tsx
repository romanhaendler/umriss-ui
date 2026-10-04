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

export const title = "Mix series kinds";
export const lead = "Bars, a range, a line and single counts share one pair of axes; the order of the children is the drawing order and the colour order.";

export default function Mixed() {
  const { Chart, XAxis, YAxis, Bar, Area, Line, Scatter } = useChart(DEPOT_DAYS);
  return (
    <Chart height={320} ariaLabel="North depot: pallets in, out and on hand over fourteen days">
      <XAxis value="day" label="Day of March" tickCount={7} />
      <YAxis value="onHand" label="Pallets" />
      <Bar value="arrived" name="Arrived" />
      <Bar value="dispatched" name="Dispatched" />
      <Area value="targetHigh" baseline="targetLow" name="Target range" />
      <Line value="onHand" name="On hand" strokeWidth={2} />
      <Scatter value="counted" name="Counted" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
