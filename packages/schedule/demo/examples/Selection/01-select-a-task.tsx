import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Select a task";

export const lead = "Click a leg and the whole consignment is outlined on every vehicle: the leg you clicked in full colour, its other legs halfway to grey, all other work grey. Click the empty plot to clear it.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const CONSIGNMENTS: readonly Task[] = [
  { id: "c-2041", name: "C-2041 Holloway Garden Supplies", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "c-2042", name: "C-2042 Marlow & Finch Books", color: "light-dark(#0d9488, #3cc7b8)" },
];

const LEGS: readonly Subtask[] = [
  { id: "c-2041-1", task: "c-2041", lane: "truck-118", from: at(6), to: at(7, 30) },
  { id: "c-2041-2", task: "c-2041", lane: "van-214", from: at(8), to: at(10, 30) },
  { id: "c-2041-3", task: "c-2041", lane: "truck-118", from: at(11), to: at(12) },
  { id: "c-2042-1", task: "c-2042", lane: "truck-118", from: at(8), to: at(9) },
  { id: "c-2042-2", task: "c-2042", lane: "van-214", from: at(11), to: at(12, 30) },
];

const TRANSFERS: readonly Dependency[] = [
  { id: "t-2041", from: "c-2041-1", to: "c-2041-2", lag: 20 * 60_000 },
  { id: "t-2041-b", from: "c-2041-2", to: "c-2041-3", lag: 20 * 60_000 },
  { id: "t-2042", from: "c-2042-1", to: "c-2042-2", lag: 20 * 60_000 },
];

export default function SelectATask() {
  return (
    <Schedule ariaLabel="Two consignments at North depot" initialDomain={[at(5, 30), at(13, 30)]} height={140}>
      <Lane id="truck-118" label="Truck FP 118 R" />
      <Lane id="van-214" label="Van FP 214 K" />
      <Dependencies data={TRANSFERS} />
      <Subtasks data={LEGS} tasks={CONSIGNMENTS} />
    </Schedule>
  );
}
