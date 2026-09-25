import { useState } from "react";
import { Lane, Schedule, Subtasks, Dependencies, applyIntent } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "Cut the nights out of the axis";

export const lead = "The depot works 06:00 to 22:00: `calendar` lists those hours, the nights leave the axis, and a drag into one stops at the next morning.";

/* Three days in the width of two; a dotted line marks each seam. Deriving the
   list from opening hours and holidays is the application's business. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, 16 + day, hours, minutes).getTime();

const OPENING_HOURS = [0, 1, 2].map((day) => ({ from: at(day, 6), to: at(day, 22) }));

const TOURS: Task[] = [{ id: "t-09", name: "T-09 Line haul East", color: "light-dark(#c2410c, #f08a52)" }];

const LEGS: Subtask[] = [
  { id: "line-haul", task: "t-09", lane: "truck", from: at(0, 18), to: at(0, 21, 30), leadIn: 30 * 60_000 },
  { id: "round", task: "t-09", lane: "van-1", from: at(1, 6, 30), to: at(1, 11), leadIn: 15 * 60_000 },
  { id: "returns", task: "t-09", lane: "van-2", from: at(1, 20), to: at(2, 9), leadOut: 30 * 60_000 },
];

const HANDOVERS: Dependency[] = [
  { id: "unload", from: "line-haul", to: "round", lag: 20 * 60_000 },
  { id: "collect", from: "round", to: "returns", lag: 45 * 60_000 },
];

export default function WorkingCalendar() {
  const [legs, setLegs] = useState<readonly Subtask[]>(LEGS);
  return (
    <Schedule
      ariaLabel="Three days at East Gate depot, nights removed"
      initialDomain={[at(0, 6), at(2, 22)]}
      calendar={OPENING_HOURS}
      height={220}
      intents={["move"]}
      onIntent={(intent) => setLegs((current) => current.map((leg) => applyIntent(leg, intent)))}
    >
      <Lane id="truck" label="Truck FP 520 E" />
      <Lane id="van-1" label="Van FP 290 E" />
      <Lane id="van-2" label="E-van FP 311 E" />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={legs} tasks={TOURS} />
    </Schedule>
  );
}
