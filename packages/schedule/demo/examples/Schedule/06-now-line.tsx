import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport } from "../../../src";

export const title = "Where the present stands";

/* `now` draws a line across the lanes at the present moment, and a mark where
   it meets the time band. Everything to its left should have happened; what
   still stands there in full colour is late, and a planner sees it at once.

   In an application you write `now` and nothing else: it reads the clock and
   moves on by the minute, so a schedule left open on a wall screen stays true.
   This plan is a fixed Tuesday in March, and the real clock would put the line
   outside it - where it would be as useless as the plan is old. An instant
   instead of `true` fixes the line where it belongs, which is also what a
   replay of a past shift needs, and what makes a picture of it hold still. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), setup: min(15), teardown: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), setup: min(30), teardown: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), setup: min(30), teardown: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(10), to: at(11, 30), setup: min(15) },
];

const MOVES: readonly Transport[] = [
  { id: "t-2041-1", from: "a-2041-1", to: "a-2041-2", duration: min(10) },
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", duration: min(45) },
];

const HALF_PAST_TEN = new Date(2026, 2, 17, 10, 30).getTime();

export default function NowLine() {
  return (
    <Schedule
      ariaLabel="Plan of Tuesday, 17 March, with the present"
      initialDomain={DAY_OF_PLAN}
      height={196}
      now={HALF_PAST_TEN}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
