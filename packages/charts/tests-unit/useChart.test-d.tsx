/* The typing of `useChart` and `value`, checked by the compiler
   (charts-bound-to-rows 02, ADR-0048).

   This file does not run; it is compiled, as part of `typecheck`. Every line
   under `@ts-expect-error` MUST yield an error - if one stops doing so, the
   typecheck fails. The typing is the product, as the table's is (ADR-0017). */

import { useChart } from "../src";

interface Latency {
  t: number;
  p95: number;
  p99: number | null;
  host: string;
  samples: readonly number[];
}

interface Deploy {
  t: number;
  minutes: number;
}

declare const latencies: Latency[];
declare const deploys: Deploy[];

export function Fields() {
  const { Chart, XAxis, YAxis, Line, Area, Bar, Scatter, StateBand, Matrix, BoxPlot } = useChart(latencies);

  return (
    <Chart ariaLabel="Latency">
      {/* The row type comes from the rows: a field name is checked. */}
      <XAxis value="t" time />
      <YAxis value="p95" />
      <Line value="p95" name="p95" />
      <Line value="p99" name="p99" />
      {/* @ts-expect-error an unknown field */}
      <Line value="p96" />
      {/* @ts-expect-error a field of the wrong type */}
      <Line value="host" />
      {/* @ts-expect-error the same on an axis */}
      <YAxis value="host" />

      {/* A function is typed at the row, without an annotation. */}
      <Line value={(d) => d.p95 * 2} name="Twice" />
      {/* @ts-expect-error a function reads the row as it is */}
      <Line value={(d) => d.p96} />

      {/* A series with its own data is typed by that data. */}
      <Bar data={deploys} value="minutes" name="Deploys" />
      <Bar data={deploys} value={(d) => d.minutes} name="Deploys" />
      {/* @ts-expect-error a field of the hook's row on a series with its own data */}
      <Bar data={deploys} value="p95" />

      {/* Named channels take the same two forms under their own names. */}
      <Area value="p99" baseline="p95" />
      <Area value="p99" baseline={(d) => d.p95 - 1} />
      {/* @ts-expect-error a named channel is checked as well */}
      <Area value="p99" baseline="host" />
      <BoxPlot median="p95" lowerQuartile="p95" upperQuartile="p99" lowerWhisker={(d) => d.p95} upperWhisker="p99" outliers="samples" />
      {/* @ts-expect-error outliers are a list, not a number */}
      <BoxPlot median="p95" lowerQuartile="p95" upperQuartile="p99" lowerWhisker="p95" upperWhisker="p99" outliers="p95" />
      <Matrix accessor={(d) => d.t} value="p95" />
      <Scatter value="p95" />
      <StateBand value="p95" states={[]} />

      {/* The accessor keeps working beside it until the contract. */}
      <Line accessor={(d) => d.p95} />
    </Chart>
  );
}
