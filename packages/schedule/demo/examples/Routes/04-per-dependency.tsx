import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Per dependency";

export const lead = "A `route` on a single dependency overrides the schedule's: here only the loop back up to the designer is drawn orthogonal.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [{ id: "shop", name: "Online shop relaunch", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "layout", task: "shop", lane: "noah", from: at(7), to: at(8, 30), name: "Search results layout" },
  { id: "build", task: "shop", lane: "chloe", from: at(9), to: at(10, 30), name: "Search results page" },
  { id: "test", task: "shop", lane: "eva", from: at(11), to: at(12), name: "Test" },
  { id: "polish", task: "shop", lane: "noah", from: at(12, 30), to: at(13), name: "Polish" },
];

const HANDOVERS: Dependency[] = [
  { id: "to-build", from: "layout", to: "build", lag: min(20) },
  { id: "to-test", from: "build", to: "test", lag: min(20) },
  /* Its own route, whatever the schedule says. */
  { id: "to-polish", from: "test", to: "polish", lag: min(20), route: "orthogonal" },
];

export default function PerDependency() {
  return (
    <Schedule ariaLabel="Search results, from layout to polish, straight lines but one" initialDomain={[at(6, 30), at(13, 30)]} height={188} route="straight" attach="nearest">
      <Lane id="noah" label="Noah Fischer" />
      <Lane id="chloe" label="Chloe Durand" />
      <Lane id="eva" label="Eva Novak" />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
