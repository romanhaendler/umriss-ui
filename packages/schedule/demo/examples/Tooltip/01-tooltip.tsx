import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "What the tooltip says";

/* Resting the pointer on a subtask names the order, the stop, its main time
   and - where it has them - its lead-in and lead-out, and then every finding on
   it: with whom it overlaps, and by how much a dependency of it is violated. Try
   the bracket in the paint shop at noon, or the housing on the mill at nine.

   On a dependency it names the two subtasks it joins, its lag, and whether
   it is violated.

   Every word comes from the wording of @umriss-ui/core and every number from
   its formats, so a provider switches the tooltip with everything else. It
   steps aside while a drag is in flight, and it is placed from its measured
   size: beside the pointer where there is room, on the other side where there
   is not. Nothing here configures it - this is what a schedule does by
   itself. */
const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(10), to: at(11, 30), leadIn: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: at(12), to: at(14), leadIn: min(20), leadOut: min(20) },
];

const MOVES: readonly Dependency[] = [
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", lag: min(45) },
  /* Leaves the mill at 11:30 and has ten minutes to reach the paint shop's
     lead-in at 11:40 - it takes twenty-five. A violated dependency, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", lag: min(25) },
];

export default function Tooltip() {
  return (
    <Schedule ariaLabel="Plan of Tuesday, 17 March, with its tooltip" initialDomain={DAY_OF_PLAN} height={196}>
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Dependencies data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
