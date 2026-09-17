/* The first question after a bad week. Bars sorted descending, the cumulative
   line on a second y axis on the right, categories as indices on the ordinary
   numeric x axis (ADR-0002).

   The long tail is collected into "Other" and stands LAST - independently of its
   value, because otherwise the chart would claim there is a downtime reason
   called "Other" in third place.

   `pareto()` is the pure module: sort, accumulate, collect. The composition
   below it is four lines and belongs to the caller - which is why there is no
   <Pareto> that would co-own the second axis. */

import { useMemo } from "react";
import { Bar, Chart, Legend, LimitLine, Line, Tooltip, XAxis, YAxis, pareto } from "../../../src";
import type { ParetoEntry } from "../../../src";
import { DOWNTIME_REASONS } from "../../data";

export const title = "Pareto";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function ParetoExample() {
  const result = useMemo(() => pareto(DOWNTIME_REASONS, { collectRank: 6, remainderName: "Other" }), []);
  const entries = result.entries;

  return (
    <Chart data={entries as ParetoEntry[]} height={300} ariaLabel="Downtime reasons by frequency">
      <XAxis
        accessor={(d: ParetoEntry) => d.index}
        ticks={entries.map((e) => e.index)}
        tickFormat={(v) => entries[v]?.name ?? ""}
      />
      <YAxis accessor={(d: ParetoEntry) => d.value} label="Minutes" />
      <YAxis
        id="share"
        position="right"
        accessor={(d: ParetoEntry) => d.cumulative * 100}
        domain={[0, 100]}
        tickFormat={(v) => `${v.toFixed(0)} %`}
        label="cumulative"
      />
      <Bar accessor={(d: ParetoEntry) => d.value} name="Downtime" barWidth={0.72} />
      <Line
        accessor={(d: ParetoEntry) => d.cumulative * 100}
        yAxisId="share"
        name="cumulative"
        markers="always"
        strokeWidth={1.75}
      />
      <LimitLine value={80} axisId="share" severity="warning" label="80 %" inExtent={false} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
