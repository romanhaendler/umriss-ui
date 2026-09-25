import { useState } from "react";
import { Lane, Schedule, Subtasks, Dependencies, applyIntent } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "Nights cut out of the axis";

/* The plant runs two shifts, 06:00 to 22:00. A working calendar lists the
   intervals in which time counts, and the axis leaves the rest out: three days
   in the width of two, and no empty night between the evening's work and the
   morning's. A dotted line marks each seam, because an axis that takes time
   out and does not say so claims a continuity it does not have.

   The calendar is a list of intervals and nothing more. Deriving it from a
   shift plan with its holidays is the application's business - the schedule
   draws what the list says.

   Editing follows the calendar: drag the casting into the night and the ghost
   stops at the seam where time counts again, so an intent never asks for a
   time the plant does not run. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, 16 + day, hours, minutes).getTime();

const SHIFTS = [0, 1, 2].map((day) => ({ from: at(day, 6), to: at(day, 22) }));

const TASKS: Task[] = [{ id: "casting", color: "light-dark(#c2410c, #f08a52)" }];

const STEPS: Subtask[] = [
  { id: "pour", task: "casting", lane: "foundry", from: at(0, 18), to: at(0, 21, 30), leadIn: 30 * 60_000 },
  { id: "fettle", task: "casting", lane: "fettling", from: at(1, 6, 30), to: at(1, 11), leadIn: 15 * 60_000 },
  { id: "machine", task: "casting", lane: "machining", from: at(1, 20), to: at(2, 9), leadOut: 30 * 60_000 },
];

const MOVES: Dependency[] = [
  { id: "cool", from: "pour", to: "fettle", lag: 20 * 60_000 },
  { id: "carry", from: "fettle", to: "machine", lag: 45 * 60_000 },
];

export default function WorkingCalendar() {
  const [steps, setSteps] = useState<readonly Subtask[]>(STEPS);
  return (
    <Schedule
      ariaLabel="Three days of casting, nights removed"
      initialDomain={[at(0, 6), at(2, 22)]}
      calendar={SHIFTS}
      height={220}
      intents={["move"]}
      onIntent={(intent) => setSteps((current) => current.map((step) => applyIntent(step, intent)))}
    >
      <Lane id="foundry" label="Foundry" />
      <Lane id="fettling" label="Fettling" />
      <Lane id="machining" label="Machining" />
      <Dependencies data={MOVES} />
      <Subtasks data={steps} tasks={TASKS} />
    </Schedule>
  );
}
