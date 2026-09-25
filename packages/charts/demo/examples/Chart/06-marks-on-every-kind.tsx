import { Area, Bar, Chart, Legend, Line, Scatter, Tooltip, XAxis, YAxis } from "../../../src";
import { DEPOT_DAYS, type DepotDay } from "@umriss-ui/demo/worlds/logistics";

export const title = "Mark every kind";
export const lead = "Under `encoding=\"marks\"` bars and ranges take a hatch, lines a dash, points a shape - the same pairing of colour and mark in every chart.";

export default function MarksOnEveryKind() {
  return (
    <Chart data={DEPOT_DAYS} height={320} ariaLabel="North depot's pallets, told apart by marks" encoding="marks">
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
