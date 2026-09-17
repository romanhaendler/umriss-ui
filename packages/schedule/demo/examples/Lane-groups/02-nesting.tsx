import { Lane, LaneGroup, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Hall, line, machine";

/* Groups nest, to any depth, because plants do: a hall holds lines, a line
   holds machines. Each level indents its header by one step, and each says how
   many lanes lie under it - however deep.

   Fold the inner line and the hall stays open around it. Fold the hall and the
   line goes with it: what the reader sees is one row for the whole hall. The
   inner fold is not forgotten while that happens - open the hall again and the
   line is still folded, because folding the hall never touched the line's own
   state. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: Subtask[] = [
  { id: "s1", task: "a-2041", lane: "lathe-1", from: at(7), to: at(9) },
  { id: "s2", task: "a-2043", lane: "lathe-2", from: at(8), to: at(10, 30) },
  { id: "s3", task: "a-2041", lane: "mill", from: at(9, 30), to: at(11, 30) },
  { id: "s4", task: "a-2043", lane: "press-1", from: at(11), to: at(13) },
  { id: "s5", task: "a-2041", lane: "paint", from: at(12), to: at(14) },
];

export default function Nesting() {
  return (
    <Schedule ariaLabel="A hall with a turning line and a press, and a paint shop outside it" initialDomain={[at(6), at(15)]} height={330} headerWidth={200}>
      <LaneGroup id="hall-a" label="Hall A">
        <LaneGroup id="turning" label="Turning line">
          <Lane id="lathe-1" label="Lathe 1" />
          <Lane id="lathe-2" label="Lathe 2" />
          <Lane id="mill" label="Mill" />
        </LaneGroup>
        <Lane id="press-1" label="Press 1" />
      </LaneGroup>
      <Lane id="paint" label="Paint shop" />
      <Subtasks data={STEPS} tasks={TASKS} />
    </Schedule>
  );
}
