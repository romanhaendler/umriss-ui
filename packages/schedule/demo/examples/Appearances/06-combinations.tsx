import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Several at once";

export const lead = "Muted, fixed and open on one bar stay three statements, each in its own channel; of `\"provisional\"` and `\"fixed\"` the later one wins.";

/* A hollow bar lies on the surface, so its label takes the page's text
   colour; a muted one takes whatever reads on its mix. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TOURS: Task[] = [
  { id: "own", name: "North depot", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "other", name: "Riverside depot", color: "light-dark(#c2410c, #f08a52)" },
];

const LEGS: Subtask[] = [
  /* Paler colour, capped ends, faded edge. */
  {
    id: "all-three",
    task: "other",
    lane: "all-three",
    from: at(7),
    to: at(13),
    appearance: ["fixed", "muted", "open"],
    leadIn: 30 * 60_000,
  },
  /* The rail lies on the surface the hollow bar leaves. */
  { id: "planned", task: "own", lane: "planned", from: at(7), to: at(10), appearance: ["provisional"], progress: 0.4 },
  /* `"fixed"` is the later word, so this bar is fixed. */
  { id: "settled", task: "own", lane: "settled", from: at(7), to: at(10), appearance: ["provisional", "fixed"] },
  /* And the other way round, which makes it provisional. */
  { id: "reopened", task: "own", lane: "reopened", from: at(7), to: at(10), appearance: ["fixed", "provisional"] },
];

/** What stands in each bar. */
const NAMES: Record<string, string> = {
  "all-three": "T-06 · Riverside",
  planned: "T-02 · draft",
  settled: "T-02 · released",
  reopened: "T-02 · reopened",
};

const LANES = [
  { id: "all-three", label: "Other depot, fixed, runs on" },
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
      label={(leg) => NAMES[leg.id] ?? leg.id}
    >
      {LANES.map((lane) => (
        <Lane key={lane.id} id={lane.id} label={lane.label} />
      ))}
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
