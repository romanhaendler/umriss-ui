/* A furnace and the line it heats, on two y axes: each series writes its value
   in its own unit, through `format`. Without it the tooltip would take the y
   axis' `tickFormat`, and without that the default - a bare number beside
   another bare number. No render prop is needed for "°C". Hover to read it. */

import { Chart, Legend, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { corridorData, powerData, type CorridorPoint, type PowerPoint } from "@umriss-ui/demo/worlds/plant";

export const title = "Value format per series";

const celsius = (v: number) => `${v.toFixed(1)} °C`;
const kilowatts = (v: number) => `${v.toFixed(0)} kW`;

export default function ValueFormat() {
  return (
    <Chart data={corridorData} height={260} ariaLabel="Furnace temperature and power draw with their units">
      <XAxis accessor={(d: { t: number }) => d.t} time />
      <YAxis accessor={(d: CorridorPoint) => d.temperature} label="°C" />
      <YAxis id="power" position="right" accessor={(d: PowerPoint) => d.kw} label="kW" />
      <Line accessor={(d: CorridorPoint) => d.temperature} name="Furnace" format={celsius} />
      <Line data={powerData} accessor={(d: PowerPoint) => d.kw} yAxisId="power" name="Power draw" format={kilowatts} />
      <Legend />
      <Tooltip mode="x" />
    </Chart>
  );
}
