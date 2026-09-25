/* What a plant screen says in colour alone - a state, a tolerance, a verdict
   per cell - told by marks as well. Each state is hatched by its name, in the
   order the names first come (the first plain), the tolerance band is
   hatched in its own colour, and a matrix hatches each step of its
   colouring. A reader who
   cannot tell the fault's red from the setup's amber still tells the hatches
   apart, and the legend shows which is which. */

import { Chart, Legend, LimitBand, LimitLine, Line, Matrix, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { MACHINES, PLANT_STATES, matrixData, shiftData, type CellPoint, type StatePoint } from "../../data";

export const title = "Bands, limits and cells";

/* The plant this is drawn from stands in the second tab, so that the
   example can be copied whole. */
export const shows = ["../../data.ts"];

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function BandsLimitsAndCells() {
  return (
    <div className="side-by-side">
      <Chart data={shiftData} height={280} ariaLabel="Furnace temperature against its tolerance above its states" encoding="marks">
        <XAxis accessor={(d: StatePoint) => d.t} tickFormat={timeOfDay} label="Time" tickCount={4} />
        <YAxis accessor={(d: StatePoint) => d.temperature} domain={[740, 900]} label="°C" />
        <YAxis id="lane" position="right" accessor={() => 0} domain={[0, 5]} ticks={[0.45]} tickFormat={() => "Furnace 1"} />
        <LimitBand from={780} to={820} severity="warning" label="Tolerance" />
        <LimitLine value={860} severity="alarm" label="Alarm" />
        <StateBand
          accessor={(d: StatePoint) => d.m1}
          states={PLANT_STATES}
          yAxisId="lane"
          laneFrom={0}
          laneTo={0.9}
          name="Furnace 1"
        />
        <Line accessor={(d: StatePoint) => d.temperature} name="Temperature" strokeWidth={1.75} />
        <Legend placement="top" />
        <Tooltip mode="x" />
      </Chart>
      <Chart data={matrixData} height={280} ariaLabel="OEE per machine and hour, by assessment and by marks" encoding="marks">
        <XAxis accessor={(d: CellPoint) => d.hour} ticks={[0, 6, 12, 18]} tickFormat={(v) => `${v}:00`} label="Hour" />
        <YAxis
          accessor={(d: CellPoint) => d.machine}
          ticks={MACHINES.map((_, i) => i)}
          tickFormat={(v) => MACHINES[v] ?? ""}
        />
        <Matrix
          accessor={(d: CellPoint) => d.machine}
          value={(d: CellPoint) => d.oee}
          coloring={{
            kind: "assessment",
            limits: {
              limits: [
                { value: 70, side: "lower", severity: "warning" },
                { value: 40, side: "lower", severity: "alarm" },
              ],
            },
          }}
          name="OEE"
        />
        <Legend placement="top" />
        <Tooltip mode="nearest" />
      </Chart>
    </div>
  );
}
