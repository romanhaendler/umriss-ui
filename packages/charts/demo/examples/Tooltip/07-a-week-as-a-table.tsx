/* A week of a kiln, a reading a minute: 10,080 rows, and no reader wants
   them all. Above 500 rows the table lists the course the way the line is
   drawn - the first, lowest, highest and last value of each stretch of the
   week - and its caption says how many readings the rows stand for. Zoom in
   (Ctrl or ⌘ with the wheel) and the table lists every reading again.

   Without a legend the key stands on a line of its own. */

import { useState } from "react";
import { Chart, DataTable, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { kilnData, type KilnPoint } from "../../data";

export const title = "A week as a table";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const celsius = (v: number) => `${v.toFixed(0)} °C`;

export default function WeekAsTable() {
  const [domain, setDomain] = useState<"data" | readonly [number, number]>("data");
  return (
    <Chart data={kilnData} height={240} ariaLabel="Kiln temperature across a week">
      <XAxis accessor={(d: KilnPoint) => d.t} time domain={domain} onDomainChange={setDomain} label="Time" />
      <YAxis accessor={(d: KilnPoint) => d.temperature} label="°C" />
      <Line accessor={(d: KilnPoint) => d.temperature} name="Kiln" format={celsius} />
      <Tooltip mode="x" />
      <DataTable />
    </Chart>
  );
}
