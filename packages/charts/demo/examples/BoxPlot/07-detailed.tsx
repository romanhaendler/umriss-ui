import { DataTable, Legend, Tooltip, useChart } from "../../../src";

export const title = "A box per shift, its medians as a line";
export const lead = "The tiles measured in each of six shifts, one box each, and a `Line` through the medians to read the drift. The tooltip reads box and line together; `DataTable` lists every number as text.";

/* Data from the plant world: tile length per shift in millimetres, as the
   quality database sends it - quartiles and median, the whiskers at the last
   length within 1.5 IQR. */
const BOXES = [
  { shift: "Mon early", low: 599.72, q1: 599.855, median: 599.97, q3: 600.1575, high: 600.4 },
  { shift: "Mon late", low: 599.53, q1: 599.875, median: 600.025, q3: 600.15, high: 600.38 },
  { shift: "Tue early", low: 599.6, q1: 599.88, median: 600.015, q3: 600.1925, high: 600.39 },
  { shift: "Tue late", low: 599.59, q1: 599.89, median: 599.975, q3: 600.1475, high: 600.36 },
  { shift: "Wed early", low: 599.61, q1: 599.8175, median: 600.01, q3: 600.1775, high: 600.45 },
  { shift: "Wed late", low: 599.68, q1: 599.8575, median: 600.035, q3: 600.16, high: 600.53 },
];

const mm = (v: number) => `${v.toFixed(2)} mm`;

export default function Detailed() {
  const { Chart, XAxis, YAxis, BoxPlot, Line } = useChart(BOXES);
  return (
    <Chart height={320} ariaLabel="Tile length per shift, with the medians as a line">
      <XAxis value="shift" label="Shift" />
      <YAxis tickFormat={mm} />
      <BoxPlot
        name="Tile length"
        median="median"
        lowerQuartile="q1"
        upperQuartile="q3"
        lowerWhisker="low"
        upperWhisker="high"
        boxWidth={0.5}
      />
      <Line value="median" name="Median" markers="always" />
      <Legend />
      <Tooltip />
      <DataTable />
    </Chart>
  );
}
