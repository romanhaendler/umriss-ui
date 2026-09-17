import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Snapping to a raster";

/* A drag lands on a raster. By default that is the fine band's current step -
   hours when zoomed out, quarter hours when zoomed in -, so what a planner drops
   lands on a line they can read. The upper schedule snaps to a raster of two
   hours on the plant's local clock - 06:00, 08:00, 10:00, whatever the time
   zone's offset -; the lower one does not snap at all.

   Snapping shapes the ghost and therefore the intent. It never touches data
   that is not being dragged. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const HOUR = 3_600_000;

const TASKS: Task[] = [{ id: "batch", color: "light-dark(#7c3aed, #a98bfa)" }];

const BATCH: Subtask[] = [{ id: "cure", task: "batch", lane: "oven", from: at(6), to: at(14) }];

function Oven({ snap, label }: { snap: number | false; label: string }) {
  const [work, setWork] = useState(BATCH);
  return (
    <Schedule
      ariaLabel={label}
      initialDomain={[at(4), at(24)]}
      height={110}
      snap={snap}
      intents={["move"]}
      onIntent={(intent) => setWork((current) => current.map((s) => applyIntent(s, intent)))}
    >
      <Lane id="oven" label={label} />
      <Subtasks data={work} tasks={TASKS} />
    </Schedule>
  );
}

export default function Snapping() {
  return (
    <>
      <Oven snap={2 * HOUR} label="Two hours" />
      <div style={{ height: 12 }} />
      <Oven snap={false} label="Free" />
    </>
  );
}
