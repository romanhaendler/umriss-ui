import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Main time, lead-in and lead-out";

/* A subtask is a main time with an optional lead-in before it and a lead-out
   after it. The main time is drawn full, lead-in and lead-out faint in the same
   colour with an edge: preparation reads as belonging to the work, and as not
   being it.

   Both are durations beside the main time, not times of their own - moving
   the subtask takes them along, and each is changed on its own (see Intent). */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "housing", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "plain", task: "housing", lane: "mill", from: at(6, 30), to: at(8) },
  { id: "with-lead-in", task: "housing", lane: "mill", from: at(9), to: at(10, 30), leadIn: min(30) },
  { id: "with-both", task: "housing", lane: "mill", from: at(11, 30), to: at(13), leadIn: min(20), leadOut: min(40) },
];

export default function LeadInAndLeadOut() {
  return (
    <Schedule ariaLabel="Three subtasks on the mill" initialDomain={[at(6), at(14, 30)]} height={110}>
      <Lane id="mill" label="Mill" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
