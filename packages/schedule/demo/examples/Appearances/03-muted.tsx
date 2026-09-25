import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Muted";

export const lead = "Another team's work, shown for context: `\"muted\"` mixes the colour into the surface at full height, so it cannot pass for a lead-in.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "migration", name: "Checkout migration", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "ours", task: "migration", lane: "ours", from: at(7), to: at(10), leadIn: min(30) },
  { id: "theirs", task: "migration", lane: "theirs", from: at(7), to: at(10), leadIn: min(30), appearance: ["muted"] },
];

export default function Muted() {
  return (
    <Schedule
      ariaLabel="Our team's work above, another team's below"
      initialDomain={[at(6, 30), at(11)]}
      height={144}
      label={() => "Checkout migration"}
    >
      <Lane id="ours" label="Payments" />
      <Lane id="theirs" label="Identity" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
