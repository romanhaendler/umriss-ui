import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "More lanes than the height";

/* Twenty lanes in 300 pixels: the lanes scroll, and the lane headers go with
   them - vertically only. The day band and the time band hold still, and so
   does the column of headers when the plot pans through time.

   `height` is the whole schedule, both bands included; `laneHeight` and
   `headerWidth` set the rest. Drag the background up and down to reach the
   lower lanes. */

const LINES: Task[] = [
  { id: "line-a", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "line-b", color: "light-dark(#0d9488, #3cc7b8)" },
];

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const CELLS = Array.from({ length: 20 }, (_, i) => ({ id: `cell-${i + 1}`, label: `Cell ${String(i + 1).padStart(2, "0")}` }));

/* One subtask per cell, staggered by a quarter hour down the lanes. */
const WORK: Subtask[] = CELLS.map((cell, i) => ({
  id: `${cell.id}-job`,
  task: i % 2 === 0 ? "line-a" : "line-b",
  lane: cell.id,
  from: at(7, 15 * i),
  to: at(9, 15 * i),
  leadIn: 15 * 60_000,
}));

export default function ManyLanes() {
  return (
    <Schedule
      ariaLabel="Twenty cells, Tuesday morning"
      initialDomain={[at(6), at(14)]}
      height={300}
      laneHeight={32}
      headerWidth={110}
    >
      {CELLS.map((cell) => (
        <Lane key={cell.id} id={cell.id} label={cell.label} />
      ))}
      <Subtasks data={WORK} tasks={LINES} />
    </Schedule>
  );
}
