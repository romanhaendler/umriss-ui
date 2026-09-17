/* A span is NOT the state band. A band is a partition: every segment ends where
   the next begins. A span has an explicit end - and out of that follows both of
   the things to be seen here: IDLE TIME between two jobs, and a DOUBLE BOOKING
   on Press 1.

   That one is drawn offset and stays in its lane; packing it into sub-lanes
   automatically would turn the conflict into a layout, and the conflict is the
   finding. C-90 is still running: open to the edge. */

import { Chart, Span, Tooltip, XAxis, YAxis } from "../../../src";
import { RESOURCES, SCHEDULE, type Job } from "../../data";

export const title = "Schedule";

const timeOfDay = (v: number) =>
  new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function Schedule() {
  return (
    <Chart data={SCHEDULE as Job[]} height={240} ariaLabel="Job schedule of four resources">
      <XAxis accessor={(d: Job) => d.from} tickFormat={timeOfDay} tickCount={8} label="Time" />
      <YAxis
        accessor={(d: Job) => d.resource}
        ticks={RESOURCES.map((_, i) => i)}
        tickFormat={(v) => RESOURCES[v] ?? ""}
      />
      <Span accessor={(d: Job) => d.resource} to={(d: Job) => d.to} name="Jobs" height={0.55} />
      <Tooltip mode="nearest" />
    </Chart>
  );
}
