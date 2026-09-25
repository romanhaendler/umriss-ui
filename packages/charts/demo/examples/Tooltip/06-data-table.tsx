/* The chart's values as a table, for a reader who wants them all at once
   rather than walked. `<DataTable />` puts a key at the end of the legend;
   "Show data" lays a plain table over the plot - the time in the first column,
   then one column per visible series, every value in the format the tooltip
   writes it in - and "Hide data" gives the picture back.

   The table lists what the chart shows: hide a series in the legend, or zoom
   the axis, and the table follows. */

import { useState } from "react";
import { Chart, DataTable, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { furnaceData, type FurnacePoint } from "@umriss-ui/demo/worlds/plant";

export const title = "The values as a table";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const celsius = (v: number) => `${v.toFixed(1)} °C`;

export default function ValuesAsTable() {
  const [hidden, setHidden] = useState<readonly string[]>([]);
  const toggle = (name: string) =>
    setHidden((h) => (h.includes(name) ? h.filter((n) => n !== name) : [...h, name]));
  return (
    <Chart data={furnaceData} height={260} ariaLabel="Two furnaces over the early shift">
      <XAxis accessor={(d: FurnacePoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: FurnacePoint) => d.f1} label="°C" />
      <Line accessor={(d: FurnacePoint) => d.f1} name="Furnace 1" format={celsius} hidden={hidden.includes("Furnace 1")} />
      <Line accessor={(d: FurnacePoint) => d.f2} name="Furnace 2" format={celsius} hidden={hidden.includes("Furnace 2")} />
      <Legend onToggle={toggle} />
      <Tooltip mode="x" />
      <DataTable />
    </Chart>
  );
}
