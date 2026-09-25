import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "An overlap is a finding";

/* Two subtasks that claim the same lane at the same time are both drawn: the
   later one offset a few pixels and edged, the time they share marked across
   the lane. They are never packed into sub-lanes - packing would turn the
   double booking into layout and hide it.

   Lead-in and lead-out occupy the lane: the second pair below overlaps only
   where one's lead-out meets the other's lead-in, and that is an overlap too. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [
  { id: "first", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "second", color: "light-dark(#be185d, #f06aa6)" },
];

const WORK: Subtask[] = [
  { id: "a", task: "first", lane: "press-1", from: at(7), to: at(9, 30) },
  { id: "b", task: "second", lane: "press-1", from: at(8, 30), to: at(10, 30) },
  { id: "c", task: "first", lane: "press-2", from: at(7), to: at(8, 30), leadOut: min(30) },
  { id: "d", task: "second", lane: "press-2", from: at(9, 15), to: at(10, 45), leadIn: min(30) },
];

export default function Overlap() {
  return (
    <Schedule ariaLabel="Two overlaps on two presses" initialDomain={[at(6, 30), at(11, 30)]} height={150}>
      <Lane id="press-1" label="Press 1" />
      <Lane id="press-2" label="Press 2" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
