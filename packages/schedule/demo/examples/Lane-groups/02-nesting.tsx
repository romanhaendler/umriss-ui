import { Lane, LaneGroup, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Nest groups to any depth";

export const lead = "A depot holds a fleet of vans and a truck; an inner group keeps its fold while the outer one closes.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TOURS: Task[] = [
  { id: "t-01", name: "T-01 Harbour", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "t-03", name: "T-03 Old Town", color: "light-dark(#c2410c, #f08a52)" },
];

const LEGS: Subtask[] = [
  { id: "l1", task: "t-01", lane: "fp-214", from: at(7), to: at(9) },
  { id: "l2", task: "t-03", lane: "fp-377", from: at(8), to: at(10, 30) },
  { id: "l3", task: "t-01", lane: "fp-290", from: at(9, 30), to: at(11, 30) },
  { id: "l4", task: "t-03", lane: "fp-118", from: at(11), to: at(13) },
  { id: "l5", task: "t-01", lane: "fp-402", from: at(12), to: at(14) },
];

export default function Nesting() {
  return (
    <Schedule ariaLabel="North depot with its vans and a truck, and a van from Riverside" initialDomain={[at(6), at(15)]} height={330} headerWidth={200}>
      <LaneGroup id="north" label="North depot">
        <LaneGroup id="vans" label="Vans">
          <Lane id="fp-214" label="Van FP 214 K" />
          <Lane id="fp-377" label="E-van FP 377 K" />
          <Lane id="fp-290" label="Van FP 290 E" />
        </LaneGroup>
        <Lane id="fp-118" label="Truck FP 118 R" />
      </LaneGroup>
      <Lane id="fp-402" label="Van FP 402 R" />
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
