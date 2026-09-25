import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Several statements on one bar";

/* A bar rarely has only one thing to say. Another shift's work may be frozen
   and may run past the view, all at once - and it must then still read as
   three statements and not as a smear.

   It can, because each of them owns a different property of the drawing. The
   saturation is muted, the ends are fixed, the edge of the view is open:
   nothing is painted twice over, so nothing cancels anything out. That is the
   whole reason the list is built that way, and this is the picture that proves
   it.

   Two of them are settled before the drawing begins. `"provisional"` and
   `"fixed"` contradict - work cannot be planned and frozen at once - so the
   later one in the list wins, and the bar shows exactly one of the two. The
   rule is `resolveAppearance`; it is the caller's to read as well.

   One combination has a visible order of its own: a FIXED bar that runs past
   the view loses its cap at that edge. The fade is painted after the caps
   because that is the truth of it - there is no end there to mark. The cap it
   still carries is the end that really is in view.

   The labels are here for one more reason. A bar's label takes whatever colour
   reads on the bar, and a hollow bar is the surface - so provisional work is
   labelled in the ordinary text colour, and a muted bar in whatever reads on
   its mix. No bar loses its label to an appearance any more. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [
  { id: "own", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "other", color: "light-dark(#c2410c, #f08a52)" },
];

const WORK: Subtask[] = [
  /* Three statements, three channels: paler colour, capped ends, faded edge. */
  {
    id: "all-three",
    task: "other",
    lane: "all-three",
    from: at(7),
    to: at(13),
    appearance: ["fixed", "muted", "open"],
    leadIn: 30 * 60_000,
  },
  /* Provisional work that has got somewhere: the rail lies on the surface the
     hollow bar leaves, in the colour text takes there. */
  { id: "planned", task: "own", lane: "planned", from: at(7), to: at(10), appearance: ["provisional"], progress: 0.4 },
  /* Both, in this order: `"fixed"` is the later word, so this bar is fixed. */
  { id: "settled", task: "own", lane: "settled", from: at(7), to: at(10), appearance: ["provisional", "fixed"] },
  /* And the other way round, which makes it provisional. */
  { id: "reopened", task: "own", lane: "reopened", from: at(7), to: at(10), appearance: ["fixed", "provisional"] },
];

/** What stands in each bar. */
const NAMES: Record<string, string> = {
  "all-three": "A-2043 · night shift",
  planned: "A-2041 · draft",
  settled: "A-2041 · released",
  reopened: "A-2041 · reopened",
};

const LANES = [
  { id: "all-three", label: "Another shift, fixed, runs on" },
  { id: "planned", label: "Provisional, 40 per cent" },
  { id: "settled", label: "provisional then fixed" },
  { id: "reopened", label: "fixed then provisional" },
];

export default function Combinations() {
  return (
    <Schedule
      ariaLabel="Bars carrying several appearances at once"
      initialDomain={[at(6, 30), at(11)]}
      height={230}
      label={(subtask) => NAMES[subtask.id] ?? subtask.id}
    >
      {LANES.map((lane) => (
        <Lane key={lane.id} id={lane.id} label={lane.label} />
      ))}
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
