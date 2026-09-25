import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Snap to the ticks";

export const lead = "Without `snap`, a drag lands on the fine band's step: quarter hours when zoomed in, whole hours when zoomed out.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TOURS: readonly Task[] = [{ id: "river", name: "Riverside depot tours", color: "light-dark(#2563eb, #6b9bff)" }];

const START: readonly Subtask[] = [{ id: "T-04", task: "river", lane: "van-402", from: at(7, 30), to: at(12, 10) }];

export default function SnapToTheTicks() {
  const [tours, setTours] = useState(START);
  return (
    <Schedule
      ariaLabel="A tour on the default raster"
      initialDomain={[at(6), at(16)]}
      height={100}
      intents={["move"]}
      onIntent={(intent) => setTours((current) => current.map((tour) => applyIntent(tour, intent)))}
    >
      <Lane id="van-402" label="Van FP 402 R" />
      <Subtasks data={tours} tasks={TOURS} />
    </Schedule>
  );
}
