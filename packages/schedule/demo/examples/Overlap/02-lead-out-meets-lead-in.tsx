import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Lead-out meeting lead-in";

export const lead = "Unloading and the next loading occupy the vehicle too: where a `leadOut` runs into the next `leadIn`, that is an overlap.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: Task[] = [
  { id: "t-04", name: "T-04 Ringway", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "t-06", name: "T-06 Riverside", color: "light-dark(#be185d, #f06aa6)" },
];

const LEGS: Subtask[] = [
  { id: "t-04-1", task: "t-04", lane: "fp-402", from: at(7), to: at(8, 30), leadOut: min(30) },
  { id: "t-06-1", task: "t-06", lane: "fp-402", from: at(9, 15), to: at(10, 45), leadIn: min(30) },
];

export default function LeadOutMeetsLeadIn() {
  return (
    <Schedule ariaLabel="Two rounds of one van, touching at unloading and loading" initialDomain={[at(6, 30), at(11, 30)]} height={110}>
      <Lane id="fp-402" label="Van FP 402 R" />
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
