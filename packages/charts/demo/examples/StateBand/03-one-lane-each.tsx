import { Chart, Legend, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { VEHICLES, VEHICLE_STATES, vehicleDay, type StatePoint } from "@umriss-ui/demo/worlds/logistics";

export const title = "Give each one a lane";
export const lead = "A y axis with one unit per vehicle and a band per lane: the legend explains every state once, however many lanes share them.";

const FLEET = VEHICLES.map((vehicle) => ({ vehicle, day: vehicleDay(vehicle.id) }));

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function OneLaneEach() {
  return (
    <Chart data={FLEET[0]!.day} height={300} ariaLabel="The states of all eight vehicles through the day">
      <XAxis accessor={(d: StatePoint) => d.t} tickFormat={timeOfDay} label="Time" />
      {/* Lane 0 lies at the bottom, so the first vehicle takes the top lane. */}
      <YAxis
        accessor={() => 0}
        domain={[0, FLEET.length]}
        ticks={FLEET.map((_, i) => i + 0.45)}
        tickFormat={(v) => FLEET[FLEET.length - 1 - Math.floor(v)]?.vehicle.plate ?? ""}
        grid={false}
      />
      {FLEET.map(({ vehicle, day }, i) => (
        <StateBand
          key={vehicle.id}
          data={day}
          accessor={(d: StatePoint) => d.state}
          states={VEHICLE_STATES}
          laneFrom={FLEET.length - 1 - i}
          laneTo={FLEET.length - 1 - i + 0.9}
          name={vehicle.plate}
        />
      ))}
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
