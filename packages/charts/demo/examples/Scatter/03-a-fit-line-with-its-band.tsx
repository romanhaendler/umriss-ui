import { Legend, Tooltip, useChart } from "../../../src";

/* Data from the data scientist's world, written out here so the example runs on its own. */
/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

interface Reading {
  x: number;
  y: number;
}

/** Sixty measurements along a rising course, with a bell-shaped scatter about it (Box-Muller). */
const READINGS: readonly Reading[] = (() => {
  const r = random(7);
  return Array.from({ length: 60 }, () => {
    const x = Math.round(r() * 100) / 10;
    const noise = Math.sqrt(-2 * Math.log(Math.max(r(), 1e-12))) * Math.cos(2 * Math.PI * r());
    return { x, y: Math.round((2 + 0.8 * x + 1.2 * noise) * 100) / 100 };
  });
})();

/* Ordinary least squares, and the standard error of the fitted mean at each x. */
const n = READINGS.length;
const mx = READINGS.reduce((sum, d) => sum + d.x, 0) / n;
const my = READINGS.reduce((sum, d) => sum + d.y, 0) / n;
const sxx = READINGS.reduce((sum, d) => sum + (d.x - mx) ** 2, 0);
const slope = READINGS.reduce((sum, d) => sum + (d.x - mx) * (d.y - my), 0) / sxx;
const intercept = my - slope * mx;
const sigma = Math.sqrt(READINGS.reduce((sum, d) => sum + (d.y - intercept - slope * d.x) ** 2, 0) / (n - 2));
/** 95 % under the normal approximation. */
const Z = 1.96;

interface Fit {
  x: number;
  fit: number;
  lower: number;
  upper: number;
}

const GRID: readonly Fit[] = Array.from({ length: 41 }, (_, i) => {
  const x = (i / 40) * 10;
  const fit = intercept + slope * x;
  const se = sigma * Math.sqrt(1 / n + (x - mx) ** 2 / sxx);
  return { x, fit, lower: fit - Z * se, upper: fit + Z * se };
});

export const title = "A fit line with its band";
export const lead =
  "A regression is a model the analyst chooses - which fit, which band - so it is the application's code, not the chart's: here an ordinary least-squares line, and its 95 % band of the fitted mean from the standard error at each x, by the normal approximation (1.96 standard errors). The chart draws the rows it is given.";

export default function FitLineWithBand() {
  const { Chart, XAxis, YAxis, Scatter, Line, Area } = useChart(READINGS);
  return (
    <Chart height={300} aria-label="Measurements with their least-squares fit and 95 per cent band">
      <XAxis value="x" label="x" />
      <YAxis label="y" />
      <Area data={GRID} value="upper" baseline="lower" name="95 % band" />
      <Scatter value="y" name="Measurement" radius={2.5} />
      <Line data={GRID} value="fit" name="Fit" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
