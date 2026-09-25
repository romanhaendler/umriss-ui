import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Open";

export const lead = "An incident still being worked runs past the view: `\"open\"` fades the bar at whichever edge it passes, and only there.";

/* The middle bar is wholly in view and carries no fade; zoom out until it
   passes an edge and the fade appears. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [{ id: "inc-1048", name: "INC-1048", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "runs-on", task: "inc-1048", lane: "runs-on", from: at(7), to: at(13), appearance: ["open"] },
  { id: "whole", task: "inc-1048", lane: "whole", from: at(7), to: at(10), appearance: ["open"] },
  { id: "began", task: "inc-1048", lane: "began", from: at(4), to: at(10), appearance: ["open"] },
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
