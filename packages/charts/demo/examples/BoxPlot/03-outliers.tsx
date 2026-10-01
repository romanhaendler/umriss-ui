import { BoxPlot, Chart, Tooltip, XAxis, YAxis } from "../../../src";

export const title = "With outliers";
export const lead = "`outliers` returns the values beyond the whiskers, a list per box. They are drawn with their box and read in its tooltip, the first five written out; one more than three IQR beyond its box is a ring.";

interface CycleTime {
  machine: string;
  low: number;
  q1: number;
  median: number;
  q3: number;
  high: number;
  outliers: number[];
}

/* Seconds per part over the last shift. The whiskers end at the last value
   within 1.5 IQR; the database returned everything beyond as outliers. */
const CYCLE_TIMES: CycleTime[] = [
  { machine: "Press", low: 41.2, q1: 43.8, median: 44.9, q3: 46.1, high: 49.5, outliers: [52.4, 38.9] },
  { machine: "Dryer", low: 38.5, q1: 42.1, median: 44.0, q3: 47.3, high: 53.8, outliers: [58.1, 75.0] },
  { machine: "Kiln", low: 44.0, q1: 45.2, median: 45.8, q3: 46.5, high: 48.1, outliers: [49.2, 53.0, 40.1] },
  { machine: "Sorter", low: 39.9, q1: 42.6, median: 43.7, q3: 45.0, high: 48.6, outliers: [49.3, 49.8, 50.4, 51.0, 52.2, 53.5, 55.9, 37.1] },
];

export default function WithOutliers() {
  return (
    <Chart data={CYCLE_TIMES} height={300} ariaLabel="Cycle time per machine over the last shift, with outliers">
      <XAxis accessor={(_: CycleTime, i) => i} ticks={[0, 1, 2, 3]} tickFormat={(v) => CYCLE_TIMES[v]?.machine ?? ""} />
      <YAxis accessor={(d: CycleTime) => d.median} tickFormat={(v) => `${v} s`} />
      <BoxPlot
        name="Cycle time"
        median={(d: CycleTime) => d.median}
        lowerQuartile={(d: CycleTime) => d.q1}
        upperQuartile={(d: CycleTime) => d.q3}
        lowerWhisker={(d: CycleTime) => d.low}
        upperWhisker={(d: CycleTime) => d.high}
        outliers={(d: CycleTime) => d.outliers}
      />
      <Tooltip />
    </Chart>
  );
}
