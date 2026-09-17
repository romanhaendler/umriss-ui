import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport } from "../../../src";

export const title = "Nights cut out of the axis";

/* The plant runs two shifts, 06:00 to 22:00. An operating calendar lists the
   intervals in which time counts, and the axis leaves the rest out: three days
   in the width of two, and no empty night between the evening's work and the
   morning's. A dotted line marks each seam, because an axis that takes time
   out and does not say so claims a continuity it does not have.

   The calendar is a list of intervals and nothing more. Deriving it from a
   shift plan with its holidays is the application's business - the schedule
   draws what the list says. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, 16 + day, hours, minutes).getTime();

const SHIFTS = [0, 1, 2].map((day) => ({ from: at(day, 6), to: at(day, 22) }));

const TASKS: Task[] = [{ id: "casting", color: "light-dark(#c2410c, #f08a52)" }];

const STEPS: Subtask[] = [
  { id: "pour", task: "casting", lane: "foundry", from: at(0, 18), to: at(0, 21, 30), setup: 30 * 60_000 },
  { id: "fettle", task: "casting", lane: "fettling", from: at(1, 6, 30), to: at(1, 11), setup: 15 * 60_000 },
  { id: "machine", task: "casting", lane: "machining", from: at(1, 20), to: at(2, 9), teardown: 30 * 60_000 },
];

const MOVES: Transport[] = [
  { id: "cool", from: "pour", to: "fettle", duration: 20 * 60_000 },
  { id: "carry", from: "fettle", to: "machine", duration: 45 * 60_000 },
];

export default function OperatingCalendar() {
  return (
    <Schedule ariaLabel="Three days of casting, nights removed" initialDomain={[at(0, 6), at(2, 22)]} calendar={SHIFTS} height={220}>
      <Lane id="foundry" label="Foundry" />
      <Lane id="fettling" label="Fettling" />
      <Lane id="machining" label="Machining" />
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={TASKS} />
    </Schedule>
  );
}
