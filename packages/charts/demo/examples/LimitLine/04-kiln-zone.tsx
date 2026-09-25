import { Chart, Legend, LimitBand, LimitLine, Line, Tooltip, XAxis, YAxis } from "../../../src";
import { KILN, plant, type Reading } from "@umriss-ui/demo/worlds/plant";

export const title = "Watch a kiln zone against its tolerance";
export const lead = "In the plant: the tolerance as a band a tile must be fired in, the alarm limit above it - the burner's overshoot crosses both.";

const SHIFT = plant(7);
/* The line counts in minutes; the early shift began at 06:00. */
const SHIFT_START = new Date(2026, 2, 17, 6).getTime();

export default function KilnZone() {
  return (
    <Chart data={SHIFT.readings} height={280} ariaLabel="Kiln K1 zone 3 against its tolerance and alarm limit over the early shift">
      <XAxis accessor={(d: Reading) => SHIFT_START + d.minute * 60_000} time />
      <YAxis accessor={(d: Reading) => d.kiln} label="°C" />
      <LimitBand from={KILN.tolerance[0]} to={KILN.tolerance[1]} severity="warning" label="Tolerance" />
      <LimitLine value={KILN.alarm} severity="alarm" label="Alarm" />
      <Line accessor={(d: Reading) => d.kiln} name="Zone 3" />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
