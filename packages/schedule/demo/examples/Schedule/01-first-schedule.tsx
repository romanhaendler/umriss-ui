import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "A day in the plant";

/* The schedule draws what it is given: lanes in the order they are declared,
   subtasks in the colour of their task, dependencies from one subtask's end to
   the next one's start. The day band above names the day, the fine band below
   steps from the hour down to the quarter hour as the time scale is zoomed.

   Two findings stand in this plan on purpose: two orders claim the mill at
   10:00, and the bracket cannot reach the paint shop in time. They are drawn,
   offset and marked, and nothing moves them.

   Drag the background to pan in both directions. The wheel scrolls the lanes
   and, once they are at their end, the page; Ctrl or ⌘ with the wheel, or a
   pinch, zooms; Shift with the wheel pans through time. `Dependencies` is declared
   before `Subtasks`, so its lines run beneath the bars. */
const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
  { id: "a-2044", name: "A-2044 Flange", color: "light-dark(#7c3aed, #a98bfa)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(10), to: at(11, 30), leadIn: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: at(12), to: at(14), leadIn: min(20), leadOut: min(20) },
  { id: "a-2044-2", task: "a-2044", lane: "press", from: at(9, 30), to: at(10, 45), leadIn: min(25) },
  { id: "a-2044-3", task: "a-2044", lane: "paint", from: at(14, 45), to: at(16), leadIn: min(15), leadOut: min(15) },
];

const MOVES: readonly Dependency[] = [
  { id: "t-2041-1", from: "a-2041-1", to: "a-2041-2", lag: min(10) },
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", lag: min(45) },
  { id: "t-2044-2", from: "a-2044-2", to: "a-2044-3", lag: min(60), arrives: "main" },
  /* Leaves the mill at 11:30 and has ten minutes to reach the paint shop's
     lead-in at 11:40 - it takes twenty-five. A violated dependency, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", lag: min(25) },
];

export default function FirstSchedule() {
  return (
    <Schedule ariaLabel="Plan of Tuesday, 17 March" initialDomain={DAY_OF_PLAN} height={240}>
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Dependencies data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
