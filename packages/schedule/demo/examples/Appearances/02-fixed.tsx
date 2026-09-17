import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Fixed: work that may not move";

/* `"fixed"` owns the ENDS: a cap at each end of the main time, three pixels
   wide, in the colour the bar's own label takes, set just inside the end so
   that the bar's colour frames it.

   At its ends and not across its face, for two reasons. The statement is about
   where the work begins and ends - that is where it is nailed down. And the
   face belongs to the label: a pattern over the whole bar is the loudest mark
   in the picture for the calmest thing it has to say, and it lies under the
   word a planner came to read. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [{ id: "order", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "movable", task: "order", lane: "movable", from: at(7), to: at(10) },
  { id: "nailed", task: "order", lane: "nailed", from: at(7), to: at(10), appearance: ["fixed"] },
];

export default function Fixed() {
  return (
    <Schedule
      ariaLabel="Work that may move above, fixed work below"
      initialDomain={[at(6, 30), at(11)]}
      height={144}
      label={(subtask) => (subtask.id === "nailed" ? "A-2041 · fixed" : "A-2041")}
    >
      <Lane id="movable" label="May move" />
      <Lane id="nailed" label="Fixed" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
