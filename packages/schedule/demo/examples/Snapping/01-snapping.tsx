import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { SnapRaster, Subtask, Task } from "../../../src";

export const title = "Snapping to a raster";

/* A drag lands on a raster. By default that is the fine band's current step -
   hours when zoomed out, quarter hours when zoomed in -, so what a planner drops
   lands on a line they can read. The upper schedule snaps to the plant's shift
   changes - eight hours, offset by six from local midnight: 06:00, 14:00,
   22:00 on the plant's clock, whatever the time zone -; the lower one does not
   snap at all.

   Snapping shapes the ghost and therefore the intent. It never touches data
   that is not being dragged. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const HOUR = 3_600_000;

const SHIFTS: SnapRaster = { step: 8 * HOUR, offset: 6 * HOUR };

const TASKS: Task[] = [{ id: "batch", color: "light-dark(#7c3aed, #a98bfa)" }];

const BATCH: Subtask[] = [{ id: "cure", task: "batch", lane: "oven", from: at(6), to: at(14) }];

function Oven({ snap, label }: { snap: SnapRaster | false; label: string }) {
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
      <Oven snap={SHIFTS} label="Shifts" />
      <div style={{ height: 12 }} />
      <Oven snap={false} label="Free" />
    </>
  );
}
