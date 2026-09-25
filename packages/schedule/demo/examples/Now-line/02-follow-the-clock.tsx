import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Follow the clock";

export const lead = "`now` on its own reads the clock and moves on by the minute, so a plan left open on a wall screen stays true.";

const HOUR = 60 * 60_000;
const today = new Date();
today.setHours(0, 0, 0, 0);
const at = (hours: number) => today.getTime() + hours * HOUR;
const current = Date.now();

const TASKS: Task[] = [
  { id: "primary", name: "Primary", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "secondary", name: "Secondary", color: "light-dark(#0d9488, #3cc7b8)" },
];

/* Today's on-call hand-over at 09:00. */
const DUTIES: Subtask[] = [
  { id: "p-1", task: "primary", lane: "ada", from: at(-15), to: at(9) },
  { id: "p-2", task: "primary", lane: "tomasz", from: at(9), to: at(33) },
  { id: "s-1", task: "secondary", lane: "tomasz", from: at(-15), to: at(9) },
  { id: "s-2", task: "secondary", lane: "leila", from: at(9), to: at(33) },
];

export default function FollowTheClock() {
  return (
    <Schedule ariaLabel="Today's on-call rota, with the present" initialDomain={[current - 6 * HOUR, current + 6 * HOUR]} height={188} now>
      <Lane id="ada" label="Ada Mwangi" />
      <Lane id="tomasz" label="Tomasz Nowak" />
      <Lane id="leila" label="Leila Haddad" />
      <Subtasks data={DUTIES} tasks={TASKS} />
    </Schedule>
  );
}
