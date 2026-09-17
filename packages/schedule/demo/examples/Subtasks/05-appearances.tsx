import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "What a bar says besides its colour";

/* The colour of a bar means the order. Everything else a plan has to say about
   a piece of work - is it released, may it be moved, is it someone else's, how
   far has it got, does it go on past the view - is said by `appearance` and
   `progress`, and each of them is a pattern or an outline rather than another
   colour: a plan that leans on colour alone is a plan half the readers of a
   control room cannot read.

   The list is closed and short on purpose. `"provisional"` and `"fixed"`
   contradict - work cannot be planned and frozen at once - and where both are
   given the later one wins, which is written down in `resolveAppearance` and
   not left to the drawing order.

   Two of them deliberately avoid the faint fill: a faint part of a bar already
   means a setup or a teardown here, so `"muted"` draws another shift's work
   SLIM at full colour, and `progress` draws a rail along the bottom of the bar
   rather than a pale remainder. Neither can be mistaken for a run-out time.

   `progress` is a share from 0 to 1. Leaving it out claims nothing: a bar at
   zero per cent and a bar that says nothing about progress are two different
   statements. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [{ id: "order", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  /* The first one carries a setup and a teardown, so that the faint ends are
     in the picture beside the appearances that must not look like them. */
  { id: "plain", task: "order", lane: "plain", from: at(7), to: at(10), setup: 30 * 60_000, teardown: 30 * 60_000 },
  { id: "provisional", task: "order", lane: "provisional", from: at(7), to: at(10), appearance: ["provisional"] },
  { id: "fixed", task: "order", lane: "fixed", from: at(7), to: at(10), appearance: ["fixed"] },
  { id: "muted", task: "order", lane: "muted", from: at(7), to: at(10), appearance: ["muted"], setup: 30 * 60_000 },
  { id: "progress", task: "order", lane: "progress", from: at(7), to: at(10), progress: 0.65, teardown: 30 * 60_000 },
  /* It runs past the right edge of this view, and says so. */
  { id: "open", task: "order", lane: "open", from: at(7), to: at(13), appearance: ["open"] },
];

const LANES = [
  { id: "plain", label: "Released, with setup" },
  { id: "provisional", label: "Provisional" },
  { id: "fixed", label: "Fixed" },
  { id: "muted", label: "Another shift" },
  { id: "progress", label: "65 per cent done" },
  { id: "open", label: "Runs on" },
];

export default function Appearances() {
  return (
    <Schedule ariaLabel="The appearances a bar can carry" initialDomain={[at(6, 30), at(11)]} height={320}>
      {LANES.map((lane) => (
        <Lane key={lane.id} id={lane.id} label={lane.label} />
      ))}
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
