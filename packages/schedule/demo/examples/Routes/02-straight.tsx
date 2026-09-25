import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Straight";

export const lead = "`route=\"straight\"` draws the shortest line between the two ends, calm in a plan read from a distance.";

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
  { id: "to-polish", from: "test", to: "polish", lag: min(20) },
];

export default function Straight() {
  return (
    <Schedule ariaLabel="Search results, from layout to polish, straight lines" initialDomain={[at(6, 30), at(13, 30)]} height={188} route="straight" attach="nearest">
      <Lane id="noah" label="Noah Fischer" />
      <Lane id="chloe" label="Chloe Durand" />
      <Lane id="eva" label="Eva Novak" />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
