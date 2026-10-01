import { BoxPlot, Chart, DataTable, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { plant } from "@umriss-ui/demo/worlds/plant";

export const title = "A box per shift, its medians as a line";
export const lead = "The tiles measured in each of six shifts, one box each, and a `Line` through the medians to read the drift. The tooltip reads box and line together; `DataTable` lists every number as text.";

const SHIFTS = ["Mon early", "Mon late", "Tue early", "Tue late", "Wed early", "Wed late"];

interface ShiftBox {
  shift: number;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
}

/** The value at share p of the sorted values, between neighbours. */
function quantile(sorted: readonly number[], p: number): number {
  const at = (sorted.length - 1) * p;
  const lo = Math.floor(at);
  return (sorted[lo] as number) + ((sorted[Math.ceil(at)] as number) - (sorted[lo] as number)) * (at - lo);
}

/* One shift per seed; the whiskers end at the last length within 1.5 IQR. */
const BOXES: ShiftBox[] = SHIFTS.map((_, shift) => {
  const sorted = plant(shift + 1).samples.map((s) => s.length).sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const reach = 1.5 * (q3 - q1);
  const inside = sorted.filter((v) => v >= q1 - reach && v <= q3 + reach);
  return { shift, low: inside[0] as number, q1, median: quantile(sorted, 0.5), q3, high: inside[inside.length - 1] as number };
});

const mm = (v: number) => `${v.toFixed(2)} mm`;

export default function Detailed() {
  return (
    <Chart data={BOXES} height={320} ariaLabel="Tile length per shift, with the medians as a line">
      <XAxis accessor={(d: ShiftBox) => d.shift} ticks={SHIFTS.map((_, i) => i)} tickFormat={(v) => SHIFTS[v] ?? ""} label="Shift" />
      <YAxis accessor={(d: ShiftBox) => d.median} tickFormat={mm} />
      <BoxPlot
        name="Tile length"
        median={(d: ShiftBox) => d.median}
        lowerQuartile={(d: ShiftBox) => d.q1}
        upperQuartile={(d: ShiftBox) => d.q3}
        lowerWhisker={(d: ShiftBox) => d.low}
        upperWhisker={(d: ShiftBox) => d.high}
        boxWidth={0.5}
      />
      <Line accessor={(d: ShiftBox) => d.median} name="Median" markers="always" />
      <Legend />
      <Tooltip />
      <DataTable />
    </Chart>
  );
}
