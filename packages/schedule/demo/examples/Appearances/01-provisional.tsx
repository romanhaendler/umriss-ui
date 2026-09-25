import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Provisional";

export const lead = "Work pencilled in but not agreed: `\"provisional\"` leaves the bar hollow with a dashed outline, never pale like a lead-in.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "agreed", task: "portal", lane: "released", from: at(7), to: at(10), leadIn: min(30), leadOut: min(30) },
  { id: "pencilled", task: "portal", lane: "draft", from: at(7), to: at(10), appearance: ["provisional"] },
];

export default function Provisional() {
  return (
    <Schedule ariaLabel="Agreed work above, provisional work below" initialDomain={[at(6, 30), at(11)]} height={144}>
      <Lane id="released" label="Agreed, with lead-in" />
      <Lane id="draft" label="Provisional" />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
