import { useState } from "react";
import { Chart, DataTable, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { BURNDOWN, type BurndownPoint } from "@umriss-ui/demo/worlds/planning";

export const title = "Show the values as a table";
export const lead = "`DataTable` adds a key to the legend that lays a table of what the chart shows over the plot, and takes it back.";

const day = (v: number) => new Date(v).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
const hours = (v: number) => `${v.toFixed(0)} h`;

export default function ValuesAsTable() {
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const toggle = (name: string) => setHidden((h) => (h.includes(name) ? h.filter((n) => n !== name) : [...h, name]));
  return (
    <Chart data={BURNDOWN} height={260} ariaLabel="Sprint 14: hours left against the ideal">
      <XAxis accessor={(d: BurndownPoint) => d.t} ticks={BURNDOWN.map((d) => d.t)} tickFormat={day} />
      <YAxis accessor={(d: BurndownPoint) => d.ideal} label="Hours left" />
      <Line accessor={(d: BurndownPoint) => d.ideal} name="Ideal" format={hours} hidden={hidden.includes("Ideal")} />
      <Line accessor={(d: BurndownPoint) => d.remaining} name="Remaining" format={hours} hidden={hidden.includes("Remaining")} />
      <Legend onToggle={toggle} />
      <Tooltip mode="x" />
      {/* The table lists what the chart shows: hide a series and it follows. */}
      <DataTable />
    </Chart>
  );
}
