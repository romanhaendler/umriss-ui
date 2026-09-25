import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "Choose what a dependency connects";

export const lead = "By default the lag runs from the end of unloading to the start of loading; `leaves` and `arrives` set to `\"main\"` skip both.";

/* The anchor decides whether the dependency is violated, so it should say
   what really has to wait for what. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: Task[] = [
  { id: "outer", name: "T-07 East Gate", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "inner", name: "T-08 Canal Road", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const LEGS: Subtask[] = [
  { id: "o-1", task: "outer", lane: "truck", from: at(7), to: at(8, 30), leadOut: min(30) },
  { id: "o-2", task: "outer", lane: "van", from: at(10, 30), to: at(12), leadIn: min(30) },
  { id: "i-1", task: "inner", lane: "truck", from: at(12), to: at(13, 30), leadOut: min(30) },
  { id: "i-2", task: "inner", lane: "van", from: at(15), to: at(16), leadIn: min(30) },
];

const HANDOVERS: Dependency[] = [
  { id: "outer-handover", from: "o-1", to: "o-2", lag: min(60) },
  { id: "inner-handover", from: "i-1", to: "i-2", lag: min(60), leaves: "main", arrives: "main" },
];

export default function Anchors() {
  return (
    <Schedule ariaLabel="Two handovers with different anchors" initialDomain={[at(6, 30), at(16, 30)]} height={150}>
      <Lane id="truck" label="Truck FP 520 E" />
      <Lane id="van" label="Van FP 290 E" />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
