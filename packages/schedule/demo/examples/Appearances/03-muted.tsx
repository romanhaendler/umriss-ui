import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Muted: another shift's work";

/* `"muted"` owns the SATURATION: the task's colour mixed half into the
   surface, at full height, opaque, and with no outline.

   Full height, because a bar drawn half as high reads as a different KIND of
   thing, and loses its label with its room. Opaque and unoutlined, because
   transparency and an edge are what a setup is made of - and this example puts
   a setup right beside it so the difference has to hold. Another crew's plan
   should step back; it should not turn into preparation on the way. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "order", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "ours", task: "order", lane: "ours", from: at(7), to: at(10), setup: min(30) },
  { id: "theirs", task: "order", lane: "theirs", from: at(7), to: at(10), setup: min(30), appearance: ["muted"] },
];

export default function Muted() {
  return (
    <Schedule
      ariaLabel="This shift's work above, another shift's below"
      initialDomain={[at(6, 30), at(11)]}
      height={144}
      label={() => "A-2041 Housing"}
    >
      <Lane id="ours" label="This shift" />
      <Lane id="theirs" label="Another shift" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
