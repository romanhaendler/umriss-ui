/* Two quantities, two y axes, one grid: the kiln's temperature on the left and
   the gas it burns on the right. Only the first axis draws grid lines; with
   `alignTicks` the gas axis takes its tick count and widens its own domain
   until each of its ticks stands on one of those lines - in steps of 1, 2 or
   5, never 17.3. Without it the right labels would float between the lines,
   and a reader would take a line for a value it is not. */

import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { kilnData, type KilnPoint } from "../../data";

export const title = "Aligned ticks";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

export default function AlignedTicks() {
  return (
    <Chart data={kilnData} height={260} ariaLabel="Kiln temperature and gas flow across a week on one grid">
      <XAxis accessor={(d: KilnPoint) => d.t} time />
      <YAxis accessor={(d: KilnPoint) => d.temperature} label="°C" />
      <YAxis id="gas" position="right" accessor={(d: KilnPoint) => d.gas} label="m³/h" alignTicks />
      <Line accessor={(d: KilnPoint) => d.temperature} name="Temperature" />
      <Line accessor={(d: KilnPoint) => d.gas} yAxisId="gas" name="Gas" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
