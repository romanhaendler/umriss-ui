import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport } from "../../../src";

export const title = "Where a transport anchors";

/* A transport runs from one subtask's end to the next one's start - there is
   no other kind. Where exactly is declared per transport: `leaves` at the end of
   the main time or after the teardown, `arrives` at the start of the main time
   or before the setup. The default is the outer pair: the part leaves once the
   machine is cleared and must be there before the next one is set up.

   The anchor is what the finding is judged by, so it should say what the
   transport really connects. Above the default, below a transport that leaves
   straight from the main time and arrives at it. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [
  { id: "outer", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "inner", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const WORK: Subtask[] = [
  { id: "o-1", task: "outer", lane: "lathe", from: at(7), to: at(8, 30), teardown: min(30) },
  { id: "o-2", task: "outer", lane: "mill", from: at(10, 30), to: at(12), setup: min(30) },
  { id: "i-1", task: "inner", lane: "lathe", from: at(12), to: at(13, 30), teardown: min(30) },
  { id: "i-2", task: "inner", lane: "mill", from: at(15), to: at(16), setup: min(30) },
];

const MOVES: Transport[] = [
  { id: "outer-move", from: "o-1", to: "o-2", duration: min(60) },
  { id: "inner-move", from: "i-1", to: "i-2", duration: min(60), leaves: "main", arrives: "main" },
];

export default function Anchors() {
  return (
    <Schedule ariaLabel="Two transports with different anchors" initialDomain={[at(6, 30), at(16, 30)]} height={150}>
      <Lane id="lathe" label="Lathe" />
      <Lane id="mill" label="Mill" />
      <Transports data={MOVES} />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
