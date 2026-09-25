import { Chart, Legend, LimitBand, LimitLine, Line, Matrix, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { VEHICLE_STATES, batteryDay, vehicleDay, type BatteryPoint, type StatePoint } from "@umriss-ui/demo/worlds/logistics";
import { SERVICES, SUCCESS_BY_HOUR, type SuccessCell } from "@umriss-ui/demo/worlds/operations";

export const title = "Mark bands, limits and cells";
export const lead = "What is otherwise said in colour alone - a state, a limit band, a verdict per cell - gets a hatch by its place as well.";

const BATTERY = batteryDay("v2");
const STATES = vehicleDay("v2");

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function BandsLimitsAndCells() {
  return (
    <div className="side-by-side">
      <Chart data={BATTERY} height={280} ariaLabel="An e-van's battery against its reserve, above its states" encoding="marks">
        <XAxis accessor={(d: BatteryPoint) => d.t} tickFormat={timeOfDay} label="Time" tickCount={4} />
        <YAxis accessor={(d: BatteryPoint) => d.charge ?? 0} domain={[-40, 100]} ticks={[0, 20, 40, 60, 80, 100]} label="%" />
        <YAxis id="lane" position="right" accessor={() => 0} domain={[0, 5]} ticks={[0.45]} tickFormat={() => "FP 377 K"} />
        <LimitBand from={10} to={20} severity="warning" label="Reserve" />
        <LimitLine value={10} severity="alarm" label="Empty soon" />
        <StateBand data={STATES} accessor={(d: StatePoint) => d.state} states={VEHICLE_STATES} yAxisId="lane" laneFrom={0} laneTo={0.9} name="FP 377 K" />
        <Line accessor={(d: BatteryPoint) => d.charge} name="Charge" strokeWidth={1.75} />
        <Legend placement="top" />
        <Tooltip mode="x" />
      </Chart>
      <Chart data={SUCCESS_BY_HOUR} height={280} ariaLabel="Successful requests per service and hour, by limits and by marks" encoding="marks">
        <XAxis accessor={(d: SuccessCell) => d.hour} ticks={[0, 6, 12, 18]} tickFormat={(v) => `${v}:00`} label="Hour" />
        <YAxis accessor={(d: SuccessCell) => d.service} ticks={SERVICES.map((_, i) => i)} tickFormat={(v) => SERVICES[v]?.name ?? ""} />
        <Matrix
          accessor={(d: SuccessCell) => d.service}
          value={(d: SuccessCell) => d.success}
          coloring={{
            kind: "assessment",
            limits: {
              limits: [
                { value: 99, side: "lower", severity: "warning" },
                { value: 98, side: "lower", severity: "alarm" },
              ],
            },
          }}
          name="Success rate"
        />
        <Legend placement="top" />
        <Tooltip mode="nearest" />
      </Chart>
    </div>
  );
}
