import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

/* Data from the plant world, written out here so the example runs on its own. */

const planAt = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [planAt(5, 30), planAt(18)];

const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "lathe-1", label: "Lathe 1" },
  { id: "lathe-2", label: "Lathe 2" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
  { id: "qa", label: "Inspection" },
] as const;

/* Colours in both schemes, as the application's own tokens would give them. */
const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2042", name: "A-2042 Shaft", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
  { id: "a-2044", name: "A-2044 Flange", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "a-2045", name: "A-2045 Cover", color: "light-dark(#be185d, #f06aa6)" },
  { id: "a-2046", name: "A-2046 Axle", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: planAt(6), to: planAt(7), leadIn: min(15), leadOut: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: planAt(8), to: planAt(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "a-2041-3", task: "a-2041", lane: "qa", from: planAt(11, 30), to: planAt(12, 15) },

  { id: "a-2042-1", task: "a-2042", lane: "saw", from: planAt(7, 30), to: planAt(8, 15), leadIn: min(10) },
  { id: "a-2042-2", task: "a-2042", lane: "lathe-1", from: planAt(9), to: planAt(11), leadIn: min(20), leadOut: min(15) },
  { id: "a-2042-3", task: "a-2042", lane: "qa", from: planAt(13), to: planAt(13, 30) },

  { id: "a-2043-1", task: "a-2043", lane: "press", from: planAt(6, 30), to: planAt(8), leadIn: min(30), leadOut: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: planAt(10), to: planAt(11, 30), leadIn: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: planAt(12), to: planAt(14), leadIn: min(20), leadOut: min(20) },

  { id: "a-2044-1", task: "a-2044", lane: "lathe-2", from: planAt(6), to: planAt(8, 30), leadIn: min(20), leadOut: min(10) },
  { id: "a-2044-2", task: "a-2044", lane: "press", from: planAt(9, 30), to: planAt(10, 45), leadIn: min(25) },
  { id: "a-2044-3", task: "a-2044", lane: "paint", from: planAt(14, 45), to: planAt(16), leadIn: min(15), leadOut: min(15) },

  { id: "a-2045-1", task: "a-2045", lane: "lathe-1", from: planAt(12), to: planAt(13, 30), leadIn: min(15), leadOut: min(10) },
  { id: "a-2045-2", task: "a-2045", lane: "press", from: planAt(14, 15), to: planAt(15), leadIn: min(20) },
  { id: "a-2045-3", task: "a-2045", lane: "qa", from: planAt(15, 45), to: planAt(16, 30) },

  { id: "a-2046-1", task: "a-2046", lane: "lathe-2", from: planAt(10), to: planAt(12), leadIn: min(20), leadOut: min(15) },
  { id: "a-2046-2", task: "a-2046", lane: "mill", from: planAt(13), to: planAt(14, 30), leadIn: min(20), leadOut: min(10) },
  { id: "a-2046-3", task: "a-2046", lane: "qa", from: planAt(15), to: planAt(15, 30) },
];

const MOVES: readonly Dependency[] = [
  { id: "t-2041-1", from: "a-2041-1", to: "a-2041-2", lag: min(10) },
  { id: "t-2041-2", from: "a-2041-2", to: "a-2041-3", lag: min(20) },
  { id: "t-2042-1", from: "a-2042-1", to: "a-2042-2", lag: min(15) },
  { id: "t-2042-2", from: "a-2042-2", to: "a-2042-3", lag: min(30), leaves: "main" },
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", lag: min(45) },
  /* Leaves the mill at 11:30 and has 10 minutes to reach the paint shop's
     lead-in at 11:40 - it takes 25: a violated dependency, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", lag: min(25) },
  { id: "t-2044-1", from: "a-2044-1", to: "a-2044-2", lag: min(20) },
  { id: "t-2044-2", from: "a-2044-2", to: "a-2044-3", lag: min(60), arrives: "main" },
  { id: "t-2045-1", from: "a-2045-1", to: "a-2045-2", lag: min(15) },
  { id: "t-2045-2", from: "a-2045-2", to: "a-2045-3", lag: min(15) },
  { id: "t-2046-1", from: "a-2046-1", to: "a-2046-2", lag: min(20) },
  { id: "t-2046-2", from: "a-2046-2", to: "a-2046-3", lag: min(10), leaves: "main" },
];

export const title = "Plan a day in the machine shop";

export const lead = "The full case: seven stations, six orders and their transports, the present marked and every order named in its bars.";

const NAMES = new Map(ORDERS.map((order) => [order.id, order.name ?? order.id]));
const HALF_PAST_TEN = new Date(2026, 2, 17, 10, 30).getTime();

export default function MachinePlan() {
  return (
    <Schedule
      ariaLabel="Machine shop, Tuesday 17 March"
      initialDomain={DAY_OF_PLAN}
      height={380}
      now={HALF_PAST_TEN}
      label={(step) => NAMES.get(step.task) ?? step.task}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Dependencies data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
