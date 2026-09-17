import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Open: work that goes on past the view";

/* `"open"` owns the FADE: where the bar passes the edge of the view it fades
   into the surface instead of ending in an edge a reader would take for its
   end.

   At WHICHEVER edge it passes, left as well as right. An edge of the screen is
   an edge of the screen on both sides, and a bar that began before the view
   used to say nothing at all about it - the lane below is that case. The bar
   between them passes neither edge, and fades at its own end: the statement
   belongs to the work, and must not disappear because the zoom happens to show
   all of it. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [{ id: "order", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "runs-on", task: "order", lane: "runs-on", from: at(7), to: at(13), appearance: ["open"] },
  { id: "whole", task: "order", lane: "whole", from: at(7), to: at(10), appearance: ["open"] },
  { id: "began", task: "order", lane: "began", from: at(4), to: at(10), appearance: ["open"] },
];

export default function Open() {
  return (
    <Schedule ariaLabel="Work running past the view at either edge" initialDomain={[at(6, 30), at(11)]} height={188}>
      <Lane id="runs-on" label="Runs on" />
      <Lane id="whole" label="Wholly in view" />
      <Lane id="began" label="Began before" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
