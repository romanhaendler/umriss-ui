import { DataTable, Legend, Tooltip, useChart } from "../../../src";

export const title = "Mean and notches: do two medians differ?";
export const lead = "Where two boxes' notches do not overlap, their medians differ. The bounds are yours - here the usual median ± 1.57 · IQR / √n. `mean` draws a small ×: beside the median it shows a skew. `count` is read, not drawn.";

interface Batch {
  supplier: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
  mean: number;
  n: number;
}

/* Breaking strength of tiles, in newtons, per clay supplier. */
const BATCHES: Batch[] = [
  { supplier: "Hollen", low: 1310, q1: 1395, median: 1430, q3: 1468, high: 1540, mean: 1431, n: 120 },
  { supplier: "Marsk", low: 1290, q1: 1380, median: 1418, q3: 1462, high: 1555, mean: 1426, n: 64 },
  { supplier: "Velde", low: 1240, q1: 1322, median: 1352, q3: 1398, high: 1490, mean: 1371, n: 96 },
];

const notch = (d: Batch) => (1.57 * (d.q3 - d.q1)) / Math.sqrt(d.n);

export default function MeanAndNotches() {
  const { Chart, XAxis, YAxis, BoxPlot } = useChart(BATCHES);
  return (
    <Chart height={300} ariaLabel="Breaking strength per clay supplier, with mean and notches">
      <XAxis value={(_, i) => i} ticks={[0, 1, 2]} tickFormat={(v) => BATCHES[v]?.supplier ?? ""} />
      <YAxis tickFormat={(v) => `${v} N`} />
      <BoxPlot
        name="Breaking strength"
        median="median"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="low"
        upperWhisker="high"
        mean="mean"
        notchLower={(d) => d.median - notch(d)}
        notchUpper={(d) => d.median + notch(d)}
        count="n"
        format={(v) => `${Math.round(v)} N`}
        boxWidth={0.5}
      />
      <Legend />
      <Tooltip />
      <DataTable />
    </Chart>
  );
}
