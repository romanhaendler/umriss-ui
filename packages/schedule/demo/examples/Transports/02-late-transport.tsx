import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport } from "../../../src";

export const title = "A transport that cannot arrive in time";

/* The forklift needs forty minutes from the saw to the press; the plan gives it
   twenty-five. A late transport is drawn dashed in the colour of a finding, as
   loud as a double booking, and the schedule moves nothing to make it fit.
   Whether the press waits or the saw starts earlier is the planner's decision -
   `ripple` offers the arithmetic for the first. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "frame", color: "light-dark(#c2410c, #f08a52)" }];

const WORK: Subtask[] = [
  { id: "cut", task: "frame", lane: "saw", from: at(7), to: at(8, 30), teardown: min(5) },
  { id: "press", task: "frame", lane: "press", from: at(9, 15), to: at(10, 30), setup: min(15) },
];

const MOVES: Transport[] = [{ id: "forklift", from: "cut", to: "press", duration: min(40) }];

export default function LateTransport() {
  return (
    <Schedule ariaLabel="A late transport from the saw to the press" initialDomain={[at(6, 30), at(11)]} height={150}>
      <Lane id="saw" label="Saw" />
      <Lane id="press" label="Press" />
      <Transports data={MOVES} />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
