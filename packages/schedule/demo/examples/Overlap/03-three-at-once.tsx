import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Three at once";

export const lead = "Each further bar steps down a little, three levels deep at most, and every one stays inside its own lane.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const INCIDENTS: Task[] = [
  { id: "inc-1046", name: "INC-1046", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "inc-1047", name: "INC-1047", color: "light-dark(#c2410c, #f08a52)" },
  { id: "inc-1048", name: "INC-1048", color: "light-dark(#7c3aed, #a98bfa)" },
];

const WORK: Subtask[] = [
  { id: "a", task: "inc-1046", lane: "priya", from: at(8), to: at(11) },
  { id: "b", task: "inc-1047", lane: "priya", from: at(9), to: at(12) },
  { id: "c", task: "inc-1048", lane: "priya", from: at(10), to: at(13) },
  { id: "d", task: "inc-1048", lane: "jonas", from: at(10), to: at(12) },
];

export default function ThreeAtOnce() {
  return (
    <Schedule ariaLabel="Priya on three incidents at once" initialDomain={[at(7), at(14)]} height={150}>
      <Lane id="priya" label="Priya Raman" />
      <Lane id="jonas" label="Jonas Keller" />
      <Subtasks data={WORK} tasks={INCIDENTS} />
    </Schedule>
  );
}
