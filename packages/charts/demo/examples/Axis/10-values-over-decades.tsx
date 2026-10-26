import { Tooltip, useChart } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

interface Burst {
  hour: number;
  /** The reading: log lines per minute. */
  reading: number;
  /** The reading's logarithm to base 10: what the chart is given. */
  v: number;
}

/** Log lines per minute over two days: a quiet system, then an incident that
    grows by decades and dies away again. */
const BURST: readonly Burst[] = Array.from({ length: 49 }, (_, hour) => {
  const reading = Math.max(1, Math.round(10 ** (2.2 + 3.6 * Math.sin((Math.PI * hour) / 40) ** 3 * (hour < 28 ? 1 : 1 - (hour - 28) / 30))));
  return { hour, reading, v: Math.log10(reading) };
});

/** log10(m * 10^k) for m from 1 to 9 in each of six decades, and the top. */
const TICKS = [...Array.from({ length: 6 }, (_, k) => Array.from({ length: 9 }, (_, m) => Math.log10((m + 1) * 10 ** k))).flat(), 6];

const isDecade = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

export const title = "Values over decades";
export const lead = "The chart's scales are straight: a log scale would break the affine mapping its axes rely on (ADR-0001, ADR-0032). So the value is `Math.log10` of the reading, `ticks` stand at 1 to 9 times every power of ten, `tickFormat` labels only the whole powers, and the series' `format` writes `10 ** v`, so that the tooltip shows the reading and not its logarithm.";

export default function Decades() {
  const { Chart, XAxis, YAxis, Line } = useChart(BURST);
  return (
    <Chart height={280} aria-label="Log lines per minute over two days, on a scale in decades">
      <XAxis value="hour" label="Hours" />
      <YAxis domain={[0, 6]} ticks={TICKS} tickFormat={(v) => (isDecade(v) ? `10^${Math.round(v)}` : "")} label="Lines per minute" />
      <Line value="v" name="Lines per minute" format={(v) => Math.round(10 ** v).toLocaleString("en")} />
      <Tooltip mode="x" />
    </Chart>
  );
}
