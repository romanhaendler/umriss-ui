/* The generic wrapper of the README compiles: the field is named `Extract<keyof Z, string>` and cast to `never` where
   the chart wants a field it cannot check. */

import { useChart } from "../src";

export function Course<Z extends object>({ rows, field }: { rows: Z[]; field: Extract<keyof Z, string> }) {
  const { Chart, XAxis, YAxis, Line } = useChart(rows);
  return (
    <Chart aria-label={field}>
      <XAxis value={field as never} />
      <YAxis />
      <Line value={field as never} name={field} />
    </Chart>
  );
}
