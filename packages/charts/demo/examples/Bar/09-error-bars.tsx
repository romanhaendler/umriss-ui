import { DataTable, Tooltip, useChart } from "../../../src";

export const title = "Error bars";
export const lead = "A mean per batch with its 95 % interval: a thin floating `Bar` runs from the lower bound to the upper, a `Scatter` marks the mean on it. A confidence band along a course is an `Area` with a `baseline`, and range bars, a minimum to a maximum per hour, are the same bar.";

/* Eight readings of the output in mm per batch, as the line sends them. */
const BATCHES = [
  [50.2, 49.1, 51.0, 50.4, 48.8, 49.9, 50.7, 49.5],
  [51.3, 52.0, 50.6, 51.8, 50.9, 52.4, 51.1, 51.6],
  [48.9, 49.6, 49.2, 48.4, 50.1, 49.0, 48.7, 49.8],
  [50.8, 51.5, 50.3, 51.0, 52.1, 50.5, 51.2, 50.9],
  [47.6, 48.3, 48.9, 47.9, 49.2, 48.1, 47.4, 48.6],
  [50.0, 49.4, 50.6, 49.8, 50.3, 49.1, 50.9, 49.7],
  [52.6, 51.9, 52.8, 53.4, 52.2, 51.7, 53.1, 52.5],
  [49.3, 50.1, 48.8, 49.6, 50.4, 49.0, 49.9, 50.2],
  [50.5, 51.2, 49.8, 50.9, 51.6, 50.1, 51.0, 50.3],
  [48.2, 47.8, 49.1, 48.5, 47.6, 48.9, 48.0, 48.4],
  [51.9, 51.1, 52.3, 51.4, 50.8, 52.0, 51.6, 51.2],
  [49.7, 50.5, 49.2, 50.0, 49.5, 50.8, 49.9, 50.2],
];

/* The two-sided 95 % point of Student's t with seven degrees of freedom: eight readings per batch. */
const T95 = 2.365;

/** The mean of a batch and its interval: the mean plus and minus t times the standard error. */
function interval(batch: number, readings: readonly number[]) {
  const n = readings.length;
  const mean = readings.reduce((sum, x) => sum + x, 0) / n;
  const variance = readings.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (n - 1);
  const half = T95 * Math.sqrt(variance / n);
  return { batch, mean, lower: mean - half, upper: mean + half };
}

const STATS = BATCHES.map((readings, i) => interval(i + 1, readings));

export default function ErrorBars() {
  const { Chart, XAxis, YAxis, Bar, Scatter } = useChart(STATS);
  return (
    <Chart height={280} aria-label="Mean output per batch with its 95 % interval">
      <XAxis value="batch" label="Batch" />
      <YAxis label="mm" />
      <Bar value="upper" baseline="lower" barWidth={0.08} name="95 % interval" />
      <Scatter value="mean" name="Mean" />
      <Tooltip mode="x" />
      <DataTable />
    </Chart>
  );
}
