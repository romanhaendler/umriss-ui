import { Area, Bar, Chart, Legend, Line, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { DEPOT_DAYS, type DepotDay } from "@umriss-ui/demo/worlds/logistics";

export const title = "Mix series kinds";
export const lead = "Bars, a range, a line and single counts share one pair of axes; the order of the children is the drawing order and the colour order.";

export default function Mixed() {
  return (
    <Chart data={DEPOT_DAYS} height={320} ariaLabel="North depot: pallets in, out and on hand over fourteen days">
      <XAxis accessor={(d: DepotDay) => d.day} label="Day of March" tickCount={7} />
      <YAxis accessor={(d: DepotDay) => d.onHand} label="Pallets" />
      <Bar accessor={(d: DepotDay) => d.arrived} name="Arrived" />
      <Bar accessor={(d: DepotDay) => d.dispatched} name="Dispatched" />
      <Area accessor={(d: DepotDay) => d.targetHigh} baseline={(d: DepotDay) => d.targetLow} name="Target range" />
      <Line accessor={(d: DepotDay) => d.onHand} name="On hand" strokeWidth={2} />
      <Scatter accessor={(d: DepotDay) => d.counted} name="Counted" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
