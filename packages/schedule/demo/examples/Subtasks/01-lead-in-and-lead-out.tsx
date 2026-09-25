import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Main time, lead-in and lead-out";

export const lead = "Loading before a round and unloading after it: `leadIn` and `leadOut` are durations beside the main time, drawn faint in the same colour.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: Task[] = [{ id: "t-02", name: "T-02 Northfold", color: "light-dark(#2563eb, #6b9bff)" }];

const ROUNDS: Subtask[] = [
  { id: "plain", task: "t-02", lane: "van", from: at(6, 30), to: at(8) },
  { id: "loaded", task: "t-02", lane: "van", from: at(9), to: at(10, 30), leadIn: min(30) },
  { id: "loaded-and-unloaded", task: "t-02", lane: "van", from: at(11, 30), to: at(13), leadIn: min(20), leadOut: min(40) },
];

export default function LeadInAndLeadOut() {
  return (
    <Schedule ariaLabel="Three rounds of one van" initialDomain={[at(6), at(14, 30)]} height={110}>
      <Lane id="van" label="Van FP 214 K" />
      <Subtasks data={ROUNDS} tasks={TOURS} />
    </Schedule>
  );
}
