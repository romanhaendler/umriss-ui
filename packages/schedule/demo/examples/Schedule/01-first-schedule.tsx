import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "A day of tours";

export const lead = "Vehicles as lanes, tours as tasks: each leg is a subtask with loading as its lead-in, each handover a dependency with a transfer time.";

/* Two findings stand in this plan on purpose: two tours claim van FP 214 K at
   10:00, and the Old Town tour's handover to the e-van is fifteen minutes
   short. They are drawn and marked; nothing moves them. */
const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY: readonly [number, number] = [at(5, 30), at(18)];

const VEHICLES = [
  { id: "truck", label: "Truck FP 118 R" },
  { id: "van-1", label: "Van FP 214 K" },
  { id: "van-2", label: "Van FP 402 R" },
  { id: "e-van", label: "E-van FP 377 K" },
];

const TOURS: readonly Task[] = [
  { id: "t-01", name: "T-01 Harbour", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "t-03", name: "T-03 Old Town", color: "light-dark(#c2410c, #f08a52)" },
  { id: "t-04", name: "T-04 Ringway", color: "light-dark(#7c3aed, #a98bfa)" },
];

const LEGS: readonly Subtask[] = [
  { id: "t-01-1", task: "t-01", lane: "truck", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "t-01-2", task: "t-01", lane: "van-1", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "t-03-1", task: "t-03", lane: "van-2", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "t-03-2", task: "t-03", lane: "van-1", from: at(10), to: at(11, 30), leadIn: min(15) },
  { id: "t-03-3", task: "t-03", lane: "e-van", from: at(12), to: at(14), leadIn: min(20), leadOut: min(20) },
  { id: "t-04-2", task: "t-04", lane: "van-2", from: at(9, 30), to: at(10, 45), leadIn: min(25) },
  { id: "t-04-3", task: "t-04", lane: "e-van", from: at(14, 45), to: at(16), leadIn: min(15), leadOut: min(15) },
];

const HANDOVERS: readonly Dependency[] = [
  { id: "h-01-1", from: "t-01-1", to: "t-01-2", lag: min(10) },
  { id: "h-03-1", from: "t-03-1", to: "t-03-2", lag: min(45) },
  { id: "h-04-2", from: "t-04-2", to: "t-04-3", lag: min(60), arrives: "main" },
  /* Leaves the van at 11:30 and has ten minutes to reach the e-van's loading
     at 11:40 - the transfer takes twenty-five. */
  { id: "h-03-2", from: "t-03-2", to: "t-03-3", lag: min(25) },
];

export default function FirstSchedule() {
  return (
    <Schedule ariaLabel="Tours of Tuesday, 17 March" initialDomain={DAY} height={240}>
      {VEHICLES.map((vehicle) => (
        <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
      ))}
      <Dependencies data={HANDOVERS} />
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
