import { Chart, Legend, Line, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { VEHICLE_STATES, batteryDay, vehicleDay, type BatteryPoint, type StatePoint } from "@umriss-ui/demo/worlds/logistics";

export const title = "Lay a state under a course";
export const lead = "Put the band on a second y axis with `laneFrom` and `laneTo`: one x axis, and the cause stands right under its effect.";

const BATTERY = batteryDay("v2");
const STATES = vehicleDay("v2");

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function UnderACourse() {
  return (
    <Chart data={BATTERY} height={320} ariaLabel="An e-van's charge above what it was doing">
      <XAxis accessor={(d: BatteryPoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: BatteryPoint) => d.charge ?? 0} domain={[-40, 100]} ticks={[0, 25, 50, 75, 100]} label="Charge %" />
      {/* The lane: the bottom unit of five, the rest is room for the course. */}
      <YAxis id="lane" position="right" accessor={() => 0} domain={[0, 5]} ticks={[0.4]} tickFormat={() => "State"} />
      <StateBand data={STATES} accessor={(d: StatePoint) => d.state} states={VEHICLE_STATES} yAxisId="lane" laneFrom={0} laneTo={0.8} name="FP 377 K" />
      <Line accessor={(d: BatteryPoint) => d.charge} name="Charge" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
