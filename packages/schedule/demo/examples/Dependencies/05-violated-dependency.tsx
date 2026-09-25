import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "Show a lag that does not fit";

export const lead = "The transfer at the depot takes forty minutes and the plan leaves twenty-five: the line turns dashed in the finding colour, and nothing moves.";

/* Whether the van waits or the truck leaves earlier is the planner's
   decision - `ripple` offers the arithmetic for the first. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: Task[] = [{ id: "t-03", name: "T-03 Old Town", color: "light-dark(#c2410c, #f08a52)" }];

const LEGS: Subtask[] = [
  { id: "line-haul", task: "t-03", lane: "truck", from: at(7), to: at(8, 30), leadOut: min(5) },
  { id: "round", task: "t-03", lane: "van", from: at(9, 15), to: at(10, 30), leadIn: min(15) },
];

const HANDOVERS: Dependency[] = [{ id: "transfer", from: "line-haul", to: "round", lag: min(40) }];

export default function ViolatedDependency() {
  return (
    <Schedule ariaLabel="A handover from the truck to the van that is too short" initialDomain={[at(6, 30), at(11)]} height={150}>
      <Lane id="truck" label="Truck FP 118 R" />
      <Lane id="van" label="Van FP 214 K" />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
