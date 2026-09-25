import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Dependencies, findings } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "The findings beside the picture";

/* What the schedule draws, `findings` returns: every overlap with its lane, the
   two subtasks and the time they share, and every violated dependency with its
   departure, its arrival and how much time is missing. It is a pure function of
   the same data - a list, a count on a tile, a filter for "everything that does
   not work" is one call away. `overlaps` and `violatedDependencies` are the two
   halves on their own. */

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

const time = (instant: number) => new Date(instant).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function AsData() {
  const found = findings(STEPS, MOVES);

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Plan of Tuesday, 17 March" initialDomain={DAY_OF_PLAN} height={196}>
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Dependencies data={MOVES} />
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {found.overlaps.map((o) => (
          <Text as="li" size="sm" key={`${o.first}/${o.second}`}>
            Overlap on {o.lane}: {o.first} and {o.second}, {time(o.from)}–{time(o.to)}
          </Text>
        ))}
        {found.violatedDependencies.map((l) => (
          <Text as="li" size="sm" key={l.dependency}>
            Violated dependency {l.dependency}: {Math.round(l.shortBy / 60_000)} minutes short
          </Text>
        ))}
      </ul>
    </Stack>
  );
}
