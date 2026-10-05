/* The typing of `useChart` and `value`, checked by the compiler
   (charts-bound-to-rows 02, ADR-0048).

   This file does not run; it is compiled, as part of `typecheck`. Every line
   under `@ts-expect-error` MUST yield an error - if one stops doing so, the
   typecheck fails. The typing is the product, as the table's is (ADR-0017). */

import { ControlChart, useChart, type TooltipPoint } from "../src";
// @ts-expect-error no free Chart: it comes from the hook (ADR-0048)
import { Chart as FreeChart } from "../src";
// @ts-expect-error no free series
import { Line as FreeLine } from "../src";
// @ts-expect-error no free axes
import { XAxis as FreeXAxis, YAxis as FreeYAxis } from "../src";

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
      <YAxis label="ms" />
      <Line value="p95" name="p95" />
      <Line value="p99" name="p99" />
      {/* @ts-expect-error an unknown field */}
      <Line value="p96" />
      {/* @ts-expect-error a field of the wrong type */}
      <Line value="host" />
      {/* @ts-expect-error the same on an axis */}
      <XAxis value="host" />
      {/* @ts-expect-error a y axis reads no value: its series place the rows */}
      <YAxis value="p95" />
      {/* @ts-expect-error a series names its value */}
      <Line name="p95" />
      {/* @ts-expect-error the old accessor is gone */}
      <Line accessor={(d) => d.p95} />

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
      <Matrix value="t" level="p95" />
      <Matrix value={(d) => d.t + 0.5} level={(d) => d.p99} />
      {/* @ts-expect-error the colour channel is checked as well */}
      <Matrix value="t" level="host" />
      <Scatter value="p95" />
      <StateBand value="p95" states={[]} />

      {/* An axis read by series with their own data names their row. */}
      <XAxis<Deploy> id="deploys" value="t" />
      {/* @ts-expect-error a field of another row */}
      <XAxis<Deploy> id="deploys" value="p95" />

      {/* The control chart is typed by its own data. */}
      <ControlChart data={deploys} value="minutes" origin={{ kind: "given", center: 5, sigma: 1 }} />
      <ControlChart data={deploys} value={(d) => d.minutes} origin={{ kind: "given", center: 5, sigma: 1 }} />
      {/* @ts-expect-error a field the control chart's rows do not have */}
      <ControlChart data={deploys} value="p95" origin={{ kind: "given", center: 5, sigma: 1 }} />
    </Chart>
  );
}

export function NoData() {
  const { Chart } = useChart(latencies);
  // @ts-expect-error the rows are the hook's, the chart takes no data
  return <Chart data={latencies} ariaLabel="Latency" />;
}

export const unused = [FreeChart, FreeLine, FreeXAxis, FreeYAxis];

/* A matrix cell's colour reaches a custom tooltip as `level`, its channel's
   name everywhere (charts-bound-to-rows Q27). */
export function CellLevel(point: TooltipPoint<Latency>) {
  const level: number | undefined = point.level;
  // @ts-expect-error `value` names the y position, never the colour
  return [level, point.value];
}
