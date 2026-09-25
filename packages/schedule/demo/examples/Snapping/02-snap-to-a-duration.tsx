import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Snap to a duration";

export const lead = "Give `snap` a number of milliseconds - here half a day - and every drag lands on that raster, whatever the zoom.";

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();
const HALF_DAY = 12 * 60 * 60_000;

const PROJECTS: readonly Task[] = [{ id: "shop", name: "Online shop relaunch", color: "light-dark(#2563eb, #6b9bff)" }];

const START: readonly Subtask[] = [
  { id: "w-104", task: "shop", lane: "chloe", from: day(17), to: day(18, 12), name: "Basket keeps items across devices" },
  { id: "w-107", task: "shop", lane: "noah", from: day(18, 12), to: day(20), name: "Search results layout" },
];

export default function SnapToADuration() {
  const [work, setWork] = useState(START);
  return (
    <Schedule
      ariaLabel="Work planned in half days"
      initialDomain={[day(16), day(21)]}
      height={140}
      snap={HALF_DAY}
      intents={["move", "stretch"]}
      onIntent={(intent) => setWork((current) => current.map((item) => applyIntent(item, intent)))}
    >
      <Lane id="chloe" label="Chloe Durand" />
      <Lane id="noah" label="Noah Fischer" />
      <Subtasks data={work} tasks={PROJECTS} />
    </Schedule>
  );
}
