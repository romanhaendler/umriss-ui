import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Scroll more lanes than fit";

export const lead = "Twenty vans in 300 pixels: the lanes scroll with their headers, while the time bands and the header column hold still.";

/* `height` is the whole schedule, both bands included; `laneHeight` and
   `headerWidth` set the rest. */

const DEPOTS: Task[] = [
  { id: "north", name: "North depot", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "river", name: "Riverside depot", color: "light-dark(#0d9488, #3cc7b8)" },
];

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const VANS = Array.from({ length: 20 }, (_, i) => ({ id: `van-${i + 1}`, label: `Van ${String(i + 1).padStart(2, "0")}` }));

/* One round per van, each starting a quarter hour after the one above. */
const ROUNDS: Subtask[] = VANS.map((van, i) => ({
  id: `${van.id}-round`,
  task: i % 2 === 0 ? "north" : "river",
  lane: van.id,
  from: at(7, 15 * i),
  to: at(9, 15 * i),
  leadIn: 15 * 60_000,
}));

export default function ManyLanes() {
  return (
    <Schedule
      ariaLabel="Twenty vans, Tuesday morning"
      initialDomain={[at(6), at(14)]}
      height={300}
      laneHeight={32}
      headerWidth={110}
    >
      {VANS.map((van) => (
        <Lane key={van.id} id={van.id} label={van.label} />
      ))}
      <Subtasks data={ROUNDS} tasks={DEPOTS} />
    </Schedule>
  );
}
