import { Lane, LaneGroup, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "A group of lanes";

/* `<LaneGroup>` puts structure over the lanes. It is not a lane itself:
   nothing sits on it, no finding is reported for it, no intent names it. A
   subtask still names a machine, and `canMoveTo` is still asked about a
   machine - a group only says which machines belong together.

   Declared by composition, so a group reads in JSX as it reads in the plant:
   the lanes inside the tags are the lanes in the hall. A lane never names its
   group; the group gives its id downwards, which is why moving a machine
   between groups is moving a line of JSX.

   An open group shows a slim head above its lanes, with its name and how many
   lanes it holds. The chevron folds it - that is the next example.

   The lanes keep the order they were DECLARED in, whatever group they are in.
   That is the order a reader wrote and the only one they can predict. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "press-1", from: at(7), to: at(9), setup: min(30) },
  { id: "a-2043-1", task: "a-2043", lane: "press-2", from: at(8), to: at(10, 30), teardown: min(15) },
  { id: "a-2041-2", task: "a-2041", lane: "weld", from: at(10), to: at(12) },
  { id: "a-2043-2", task: "a-2043", lane: "paint", from: at(11, 30), to: at(14) },
];

export default function AGroup() {
  return (
    <Schedule ariaLabel="Two presses in a hall, and two stations outside it" initialDomain={[at(6), at(15)]} height={240}>
      <LaneGroup id="presses" label="Press shop">
        <Lane id="press-1" label="Press 1" />
        <Lane id="press-2" label="Press 2" />
      </LaneGroup>
      <Lane id="weld" label="Welding bay" />
      <Lane id="paint" label="Paint shop" />
      <Subtasks data={STEPS} tasks={TASKS} />
    </Schedule>
  );
}
