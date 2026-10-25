/* The typing of `useChart` and `value`, checked by the compiler
   (charts-bound-to-rows 02, ADR-0048).

   This file does not run; it is compiled, as part of `typecheck`. Every line
   under `@ts-expect-error` MUST yield an error - if one stops doing so, the
   typecheck fails. The typing is the product, as the table's is (ADR-0017). */

import { ControlChart, LimitBand, LimitLine, useChart, type TooltipPoint } from "../src";
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
    <Chart aria-label="Latency">
      {/* The row type comes from the rows: a field name is checked. */}
      <XAxis value="t" time />
      <YAxis label="ms" />
      <Line value="p95" name="p95" />
      <Line value="p99" name="p99" />
      {/* @ts-expect-error an unknown field */}
      <Line value="p96" />
      {/* @ts-expect-error a field of the wrong type */}
      <Line value="host" />
      {/* A string field on the x axis is a category (ADR-0052). */}
      <XAxis value="host" />
      <XAxis value={(d) => d.host} />
      {/* @ts-expect-error a list is no place on an axis */}
      <XAxis value="samples" />
      {/* A `Date` is an instant: in a field, out of a function, as a fixed domain. */}
      <XAxis<Deploy & { at: Date }> value="at" />
      <XAxis value={(d) => new Date(d.t)} domain={[new Date(0), new Date(1)]} />
      {/* @ts-expect-error a domain is two of a kind */}
      <XAxis value="t" domain={[0, new Date(1)]} />
      {/* @ts-expect-error a series' value is a number, not an instant */}
      <Line value={(d) => new Date(d.t)} />
      <LimitLine orientation="x" value={new Date(0)} />
      <LimitBand orientation="x" from={new Date(0)} to={new Date(1)} />
      {/* @ts-expect-error a limit stands at a number or an instant */}
      <LimitLine value="soon" />
      {/* Its own list of categories, and what is written for one. */}
      <XAxis value="host" categories={["a", "b"]} categoryLabel={(category) => category.toUpperCase()} />
      {/* @ts-expect-error categories are names */}
      <XAxis value="host" categories={[1, 2]} />
      {/* @ts-expect-error a label is text */}
      <XAxis value="host" categoryLabel={(category) => category.length} />
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
      {/* A matrix' rows named by the data (ADR-0052). */}
      <Matrix value="host" level="p95" />
      <Matrix value={(d) => d.host} level="p95" />
      {/* @ts-expect-error a list is no row */}
      <Matrix value="samples" level="p95" />
      {/* @ts-expect-error a row is a position or a name, not an instant */}
      <Matrix value={(d) => new Date(d.t)} level="p95" />
      {/* A lane by its name, or by its edges - one way or the other. */}
      <StateBand value="p95" states={[]} lane="Kiln 2" />
      <StateBand value="p95" states={[]} laneFrom={0} laneTo={0.9} />
      {/* @ts-expect-error a named lane has no edges */}
      <StateBand value="p95" states={[]} lane="Kiln 2" laneFrom={0} />
      {/* @ts-expect-error a lane's name is text */}
      <StateBand value="p95" states={[]} lane={2} />

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
  return <Chart data={latencies} aria-label="Latency" />;
}

export const unused = [FreeChart, FreeLine, FreeXAxis, FreeYAxis];

/* A matrix cell's colour reaches a custom tooltip as `level`, its channel's
   name everywhere (charts-bound-to-rows Q27). */
export function CellLevel(point: TooltipPoint<Latency>) {
  const level: number | undefined = point.level;
  // @ts-expect-error `value` names the y position, never the colour
  return [level, point.value];
}

/* The props of a state band stay an interface: one that extends them keeps
   compiling (chart-rows-as-they-come, D3 - nothing is taken away). */
import type { StateBandProps } from "../src";
export interface OwnBandProps extends StateBandProps<Latency> {
  title: string;
}
