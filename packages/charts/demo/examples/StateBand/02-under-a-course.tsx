/* The furnace temperature, and under it the furnace's state in a lane of its
   own: where the band turns to fault, the curve climbs.

   The lane stands on a second y axis, in its domain units - the bottom unit of
   five, the rest is air for the curve. Two charts one above the other would
   need their x axes kept in step by hand; one chart has one x axis, and the
   cause lies exactly under its effect. */

import { Chart, Legend, Line, StateBand, Tooltip, XAxis, YAxis } from "../../../src";
import { PLANT_STATES, shiftData, type StatePoint } from "@umriss-ui/demo/worlds/plant";

export const title = "A state under a course";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function UnderACourse() {
  return (
    <Chart data={shiftData} height={320} ariaLabel="Furnace temperature above the states of the furnace">
      <XAxis accessor={(d: StatePoint) => d.t} tickFormat={timeOfDay} label="Time" />
      <YAxis accessor={(d: StatePoint) => d.temperature} domain={[720, 900]} label="°C" />
      <YAxis
        id="lane"
        position="right"
        accessor={() => 0}
        domain={[0, 5]}
        ticks={[0.4]}
        tickFormat={() => "State"}
      />
      <StateBand
        accessor={(d: StatePoint) => d.m1}
        states={PLANT_STATES}
        yAxisId="lane"
        laneFrom={0}
        laneTo={0.8}
        name="Furnace 1"
      />
      <Line accessor={(d: StatePoint) => d.temperature} name="Furnace temperature" strokeWidth={1.75} />
      <Legend placement="top" />
      <Tooltip mode="x" />
    </Chart>
  );
}
