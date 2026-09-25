import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "Where a dependency anchors";

/* A dependency runs from one subtask's end to the next one's start - there is
   no other kind. Where exactly is declared per dependency: `leaves` at the end of
   the main time or after the lead-out, `arrives` at the start of the main time
   or before the lead-in. The default is the outer pair: the lag counts from the end of the
   lead-out and must have run out before the next lead-in begins.

   The anchor is what the finding is judged by, so it should say what the
   dependency really connects. Above the default, below a dependency that leaves
   straight from the main time and arrives at it. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [
  { id: "outer", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "inner", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const WORK: Subtask[] = [
  { id: "o-1", task: "outer", lane: "lathe", from: at(7), to: at(8, 30), leadOut: min(30) },
  { id: "o-2", task: "outer", lane: "mill", from: at(10, 30), to: at(12), leadIn: min(30) },
  { id: "i-1", task: "inner", lane: "lathe", from: at(12), to: at(13, 30), leadOut: min(30) },
  { id: "i-2", task: "inner", lane: "mill", from: at(15), to: at(16), leadIn: min(30) },
];

const MOVES: Dependency[] = [
  { id: "outer-move", from: "o-1", to: "o-2", lag: min(60) },
  { id: "inner-move", from: "i-1", to: "i-2", lag: min(60), leaves: "main", arrives: "main" },
];

export default function Anchors() {
  return (
    <Schedule ariaLabel="Two dependencies with different anchors" initialDomain={[at(6, 30), at(16, 30)]} height={150}>
      <Lane id="lathe" label="Lathe" />
      <Lane id="mill" label="Mill" />
      <Dependencies data={MOVES} />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
