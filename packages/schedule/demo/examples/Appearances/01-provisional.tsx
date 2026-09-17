import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Provisional: planned, not released";

/* `"provisional"` owns the FILL, and has none: the surface shows straight
   through, with a dashed outline in the task's colour at full weight.

   Empty, and not pale. A pale fill of the task colour already means something
   in this picture - a setup or a teardown - and the released bar above carries
   both, so the two statements stand side by side and cannot be mistaken for
   one another. That was worth a channel of its own: a planner who has to ask
   whether a faint end is preparation or a draft has lost the glance the plan
   was drawn for. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "order", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "released", task: "order", lane: "released", from: at(7), to: at(10), setup: min(30), teardown: min(30) },
  { id: "draft", task: "order", lane: "draft", from: at(7), to: at(10), appearance: ["provisional"] },
];

export default function Provisional() {
  return (
    <Schedule ariaLabel="Released work above, provisional work below" initialDomain={[at(6, 30), at(11)]} height={144}>
      <Lane id="released" label="Released, with setup" />
      <Lane id="draft" label="Provisional" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
