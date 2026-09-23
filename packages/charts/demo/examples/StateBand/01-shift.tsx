/* What one machine did over a shift, as a band: production, setup, fault,
   maintenance - every segment ends where the next begins.

   No `laneFrom`, no `laneTo`: without them a band fills the whole domain of its
   y axis, and a chart of one machine needs nothing else. The y axis carries a
   single tick in the middle of the band, and the tickFormat names the machine
   there. The legend names the states, not the series - a band is read by its
   colours. */

import { Chart, Legend, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { PLANT_STATES, shiftData, type StatePoint } from "../../data";

export const title = "One machine over a shift";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function Shift() {
  return (
    <Chart data={shiftData} height={150} ariaLabel="States of Furnace 1 over one shift">
      <XAxis accessor={(d: StatePoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={() => 0} domain={[0, 1]} ticks={[0.5]} tickFormat={() => "Furnace 1"} grid={false} />
      <StateBand accessor={(d: StatePoint) => d.m1} states={PLANT_STATES} name="Furnace 1" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
