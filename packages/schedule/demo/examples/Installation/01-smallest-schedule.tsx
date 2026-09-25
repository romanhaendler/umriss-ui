import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "The smallest schedule";

export const lead = "Two people, one project, one dependency: lanes in JSX, the rest as plain arrays handed to `Subtasks` and `Dependencies`.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const tasks: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#7c3aed, #a98bfa)" }];

const subtasks: Subtask[] = [
  { id: "design", task: "portal", lane: "noah", from: at(9), to: at(11), leadOut: min(15) },
  { id: "build", task: "portal", lane: "arjun", from: at(12), to: at(15, 30), leadIn: min(30) },
];

const dependencies: Dependency[] = [{ id: "handover", from: "design", to: "build", lag: min(15) }];

export default function SmallestSchedule() {
  return (
    <Schedule ariaLabel="Tuesday, design and build" initialDomain={[at(8), at(16)]} height={150}>
      <Lane id="noah" label="Noah Fischer" />
      <Lane id="arjun" label="Arjun Mehta" />
      <Dependencies data={dependencies} />
      <Subtasks data={subtasks} tasks={tasks} />
    </Schedule>
  );
}
