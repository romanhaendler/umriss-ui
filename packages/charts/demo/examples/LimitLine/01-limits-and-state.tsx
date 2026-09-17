/* The core of a plant screen: a curve, the limits it is read against, and below
   it the state of three machines.

   Everything in ONE chart on ONE x axis - which is exactly why the fault at
   12:15 lies visibly below the temperature jump. A band lies below every series,
   a limit line above them: the one is ground, the other a landmark. Machine 3
   reports nothing for a while; a hole stays there, no colour for "unknown". */

import { Chart, Legend, LimitBand, LimitLine, Line, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { PLANT_STATES, shiftData, type StatePoint } from "../../data";

export const title = "Limits and state band";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/* The lanes of a stack: one domain unit per machine. The labelling goes through
   the axis' tickFormat - there is no lane concept of its own. */
const LANE_TICKS = [0.45, 1.45, 2.45];
/* Lane 0 lies at the bottom - the list therefore runs from the bottom upwards. */
const LANE_NAMES = ["Mill 3", "Press 2", "Furnace 1"];

export default function LimitsAndState() {
  return (
    <Chart
      data={shiftData}
      height={340}
      ariaLabel="Furnace temperature with a warning and an alarm limit above the states of three machines"
    >
      <XAxis accessor={(d: StatePoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: StatePoint) => d.temperature} domain={[740, 900]} label="°C" />
      {/* The lane axis: one unit per machine, the rest is air for the curve
          above it. Not a pixel in this file. */}
      <YAxis
        id="lanes"
        position="right"
        accessor={() => 0}
        domain={[0, 8]}
        ticks={LANE_TICKS}
        tickFormat={(v) => LANE_NAMES[Math.floor(v)] ?? ""}
      />
      <LimitBand from={780} to={820} severity="warning" label="Tolerance" />
      <LimitLine value={820} severity="warning" label="Warning limit" />
      <LimitLine value={860} severity="alarm" label="Alarm limit" />
      <StateBand
        accessor={(d: StatePoint) => d.m1}
        states={PLANT_STATES}
        yAxisId="lanes"
        laneFrom={2}
        laneTo={2.9}
        name="Furnace 1"
      />
      <StateBand
        accessor={(d: StatePoint) => d.m2}
        states={PLANT_STATES}
        yAxisId="lanes"
        laneFrom={1}
        laneTo={1.9}
        name="Press 2"
      />
      <StateBand
        accessor={(d: StatePoint) => d.m3}
        states={PLANT_STATES}
        yAxisId="lanes"
        laneFrom={0}
        laneTo={0.9}
        name="Mill 3"
      />
      <Line accessor={(d: StatePoint) => d.temperature} name="Furnace temperature" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
