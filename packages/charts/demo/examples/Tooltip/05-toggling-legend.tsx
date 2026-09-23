/* The legend as a switch. `hidden` is the caller's state and `onToggle` hands
   it the name of the entry clicked - the chart keeps nothing of its own. A
   hidden series is not drawn and gives up its say in the extent, so the y axis
   closes in on what is left; its entry stays, struck through, to be clicked
   back. Without `onToggle` a legend is not clickable. */

import { useState } from "react";
import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { furnaceData, type FurnacePoint } from "../../data";

export const title = "Legend that hides a series";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function TogglingLegend() {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(["Set point"]));
  const toggle = (name: string) =>
    setHidden((previous) => {
      const next = new Set(previous);
      if (!next.delete(name)) next.add(name);
      return next;
    });

  return (
    <Chart data={furnaceData} height={260} ariaLabel="Two furnaces and their set point, one series hidden">
      <XAxis accessor={(d: FurnacePoint) => d.t} time />
      <YAxis accessor={(d: FurnacePoint) => d.f1} label="°C" />
      <Line accessor={(d: FurnacePoint) => d.f1} name="Furnace 1" hidden={hidden.has("Furnace 1")} />
      <Line accessor={(d: FurnacePoint) => d.f2} name="Furnace 2" hidden={hidden.has("Furnace 2")} />
      <Line
        accessor={(d: FurnacePoint) => d.setPoint}
        name="Set point"
        dash={[4, 4]}
        hidden={hidden.has("Set point")}
      />
      <Legend onToggle={toggle} />
      <Tooltip mode="x" />
    </Chart>
  );
}
