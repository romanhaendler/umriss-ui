import { Chart, Legend, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { VEHICLE_STATES, vehicleDay, type StatePoint } from "@umriss-ui/demo/worlds/logistics";

export const title = "One vehicle through the day";
export const lead = "The accessor returns a state's place in `states`; each segment runs to the next reading, and a `null` leaves a hole.";

const DAY = vehicleDay("v1");

export default function OneVehicle() {
  return (
    <Chart data={DAY} height={150} ariaLabel="States of van FP 214 K through the day">
      <XAxis accessor={(d: StatePoint) => d.t} time label="Time" />
      {/* Without a lane the band fills its y axis; one tick names it. */}
      <YAxis accessor={() => 0} domain={[0, 1]} ticks={[0.5]} tickFormat={() => "FP 214 K"} grid={false} />
      <StateBand accessor={(d: StatePoint) => d.state} states={VEHICLE_STATES} name="FP 214 K" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
