import { Chart, Legend, LimitBand, LimitLine, Line, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { VEHICLES, VEHICLE_STATES, batteryDay, vehicleDay, type BatteryPoint, type StatePoint } from "@umriss-ui/demo/worlds/logistics";

export const title = "Read limits above the states";
export const lead = "A course, the limits it is read against and the states beneath it, on one x axis: where the charge runs low, the lanes say why.";

const NORTH = VEHICLES.filter((vehicle) => vehicle.depot === "north");
const BATTERY = batteryDay("v2");

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/* The lanes: one domain unit per vehicle, the rest is room for the course.
   Lane 0 lies at the bottom, so the list runs from the bottom up. */
const LANES = [...NORTH].reverse().map((vehicle) => ({ vehicle, day: vehicleDay(vehicle.id) }));

export default function LimitsAndState() {
  return (
    <Chart data={BATTERY} height={340} ariaLabel="An e-van's charge against its limits, above the states of the North depot's vehicles">
      <XAxis accessor={(d: BatteryPoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: BatteryPoint) => d.charge ?? 0} domain={[-100, 100]} ticks={[0, 20, 40, 60, 80, 100]} label="Charge %" />
      <YAxis
        id="lanes"
        position="right"
        accessor={() => 0}
        domain={[0, 8]}
        ticks={LANES.map((_, i) => i + 0.45)}
        tickFormat={(v) => LANES[Math.floor(v)]?.vehicle.plate ?? ""}
      />
      <LimitBand from={10} to={20} severity="warning" label="Reserve" />
      <LimitLine value={20} severity="warning" label="Charge soon" />
      <LimitLine value={10} severity="alarm" label="Return now" />
      {LANES.map(({ vehicle, day }, i) => (
        <StateBand
          key={vehicle.id}
          data={day}
          accessor={(d: StatePoint) => d.state}
          states={VEHICLE_STATES}
          yAxisId="lanes"
          laneFrom={i}
          laneTo={i + 0.9}
          name={vehicle.plate}
        />
      ))}
      <Line accessor={(d: BatteryPoint) => d.charge} name="Charge" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
