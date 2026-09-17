import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Colour is the task's";

/* Every subtask of a task shares one colour, and the colour is the caller's:
   any CSS colour, a token of the application, a `light-dark()` pair. Here it
   means the order's priority rather than the order itself - two rush orders in
   the danger colour, the rest in the accent.

   A subtask whose task is not in `tasks` is drawn muted: it is on the plan, and
   nobody said what it is. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [
  { id: "rush-1", color: "var(--u-color-danger)" },
  { id: "rush-2", color: "var(--u-color-danger)" },
  { id: "normal", color: "var(--u-color-accent)" },
];

const WORK: Subtask[] = [
  { id: "r1-a", task: "rush-1", lane: "saw", from: at(6), to: at(7) },
  { id: "r1-b", task: "rush-1", lane: "lathe", from: at(7, 30), to: at(9) },
  { id: "r2-a", task: "rush-2", lane: "saw", from: at(7, 15), to: at(8, 15) },
  { id: "n-a", task: "normal", lane: "lathe", from: at(9, 30), to: at(11) },
  { id: "unknown", task: "not-listed", lane: "saw", from: at(9), to: at(10, 30) },
];

export default function TaskColours() {
  return (
    <Schedule ariaLabel="Rush orders among the rest" initialDomain={[at(5, 30), at(11, 30)]} height={150}>
      <Lane id="saw" label="Saw" />
      <Lane id="lathe" label="Lathe" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
