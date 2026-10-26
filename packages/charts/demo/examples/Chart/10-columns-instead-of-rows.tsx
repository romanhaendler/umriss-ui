import { useMemo, useState } from "react";
import { Button } from "@umriss-ui/core";
import { DataTable, Tooltip, bin, useChart } from "../../../src";

export const title = "Columns instead of rows";
export const lead = "A course of 100,000 readings in two `Float64Array` columns, with no object per row: the rows are an index array, and the axis and the line read `column[i]` at each index. The rows are memoised on the columns, so a new course is read again; a function compared by its text would keep the old values. A column from Arrow comes as `getChild(name).toArray()`. Columns are no input of `useChart` itself, because a hit, `onSelect`, the tooltip and the data table are per row (ADR-0048).";

const COUNT = 100_000;

/** A small LCG - the same numbers on every computer. */
function random(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** One reading a minute, and the pressure read at it, as two columns. */
function course(seed: number): { minute: Float64Array; pressure: Float64Array } {
  const r = random(seed);
  const minute = new Float64Array(COUNT);
  const pressure = new Float64Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    minute[i] = i;
    pressure[i] = 6 + 0.8 * Math.sin(i / 500) + (r() - 0.5) * 0.6;
  }
  return { minute, pressure };
}

export default function ColumnsInsteadOfRows() {
  const [seed, setSeed] = useState(2026);
  const columns = useMemo(() => course(seed), [seed]);
  // One index per reading: the rows are read again whenever the columns are new.
  const rows = useMemo(() => Array.from({ length: columns.pressure.length }, (_, i) => i), [columns]);
  const counts = useMemo(() => bin(columns.pressure, { count: 20 }), [columns]);

  const { Chart, XAxis, YAxis, Line } = useChart(rows);
  const { Chart: Histogram, XAxis: CountXAxis, YAxis: CountYAxis, Bar } = useChart(counts);
  return (
    <>
      <div className="pair">
        <div>
          <Chart height={260} aria-label="Pressure of 100,000 readings, one a minute">
            <XAxis value={(_, i) => columns.minute[i]} label="Minute" />
            <YAxis label="bar" />
            <Line value={(_, i) => columns.pressure[i]} name="Pressure" />
            <Tooltip mode="x" />
            <DataTable />
          </Chart>
        </div>
        <div>
          <Histogram height={260} aria-label="How often each pressure was read, in 20 bins">
            <CountXAxis value="x" label="bar" />
            <CountYAxis label="readings" />
            <Bar value="count" name="Readings" barWidth={0.94} />
            <Tooltip mode="x" />
          </Histogram>
        </div>
      </div>
      <Button onClick={() => setSeed((s) => s + 1)}>New course</Button>
    </>
  );
}
