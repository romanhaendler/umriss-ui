/* One area, filled down to 0: the power draw of a line over the early shift.

   Without a baseline the foot is 0, and that 0 enters the extent of the y axis -
   a draw has a natural zero, and an axis that started at 30 kW would make the
   break look like a shutdown. Fill and outline are set here explicitly: the fill
   carries the quantity, the outline the course. */

import { Area, Chart, Tooltip, XAxis, YAxis } from "../../../src";
import { powerData, type PowerPoint } from "../../data";

export const title = "Filled down to 0";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function Filled() {
  return (
    <Chart data={powerData} height={260} ariaLabel="Power draw of one line over the early shift">
      <XAxis accessor={(d: PowerPoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: PowerPoint) => d.kw} label="kW" />
      <Area accessor={(d: PowerPoint) => d.kw} name="Power draw" fillOpacity={0.35} strokeWidth={2} />
      <Tooltip mode="x" />
    </Chart>
  );
}
