import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "A dependency whose lag does not fit";

/* The forklift needs forty minutes from the saw to the press; the plan gives it
   twenty-five. A violated dependency is drawn dashed in the colour of a finding, as
   loud as a double booking, and the schedule moves nothing to make it fit.
   Whether the press waits or the saw starts earlier is the planner's decision -
   `ripple` offers the arithmetic for the first. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "frame", color: "light-dark(#c2410c, #f08a52)" }];

const WORK: Subtask[] = [
  { id: "cut", task: "frame", lane: "saw", from: at(7), to: at(8, 30), leadOut: min(5) },
  { id: "press", task: "frame", lane: "press", from: at(9, 15), to: at(10, 30), leadIn: min(15) },
];

const MOVES: Dependency[] = [{ id: "forklift", from: "cut", to: "press", lag: min(40) }];

export default function ViolatedDependency() {
  return (
    <Schedule ariaLabel="A violated dependency from the saw to the press" initialDomain={[at(6, 30), at(11)]} height={150}>
      <Lane id="saw" label="Saw" />
      <Lane id="press" label="Press" />
      <Dependencies data={MOVES} />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
