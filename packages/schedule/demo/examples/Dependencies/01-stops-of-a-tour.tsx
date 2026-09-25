import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Join the stops of a tour";

export const lead = "Each stop is a subtask, and the drive to the next is a dependency whose `lag` is the driving time.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: Task[] = [
  { id: "t-01", name: "T-01 Harbour", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "t-02", name: "T-02 Northfold", color: "light-dark(#0d9488, #3cc7b8)" },
];

const STOPS: Subtask[] = [
  { id: "t-01-1", task: "t-01", lane: "fp-214", from: at(7, 30), to: at(7, 50), name: "Holloway Garden Supplies" },
  { id: "t-01-2", task: "t-01", lane: "fp-214", from: at(8, 15), to: at(8, 30), name: "Marlow & Finch Books" },
  { id: "t-01-3", task: "t-01", lane: "fp-214", from: at(9), to: at(9, 20), name: "Oakridge Pharmacy" },
  { id: "t-02-1", task: "t-02", lane: "fp-377", from: at(8), to: at(8, 15), name: "Brixley Cycles" },
  { id: "t-02-2", task: "t-02", lane: "fp-377", from: at(8, 45), to: at(9, 10), name: "Tamsin's Bakery" },
];

const DRIVES: Dependency[] = [
  { id: "d-01-1", from: "t-01-1", to: "t-01-2", lag: min(20) },
  { id: "d-01-2", from: "t-01-2", to: "t-01-3", lag: min(25) },
  { id: "d-02-1", from: "t-02-1", to: "t-02-2", lag: min(25) },
];

export default function StopsOfATour() {
  return (
    <Schedule ariaLabel="Two morning tours with their stops" initialDomain={[at(7), at(10)]} height={150}>
      <Lane id="fp-214" label="Van FP 214 K" />
      <Lane id="fp-377" label="E-van FP 377 K" />
      <Dependencies data={DRIVES} />
      <Subtasks data={STOPS} tasks={TOURS} />
    </Schedule>
  );
}
