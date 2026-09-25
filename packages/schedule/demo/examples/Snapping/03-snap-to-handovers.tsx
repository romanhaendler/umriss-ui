import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { SnapRaster, Subtask, Task } from "../../../src";

export const title = "Snap to handover times";

export const lead = "A `snap` raster with a step and an offset: eight-hour watches handed over at 06:00, 14:00 and 22:00 local time.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const HOUR = 3_600_000;

/* Offset from local midnight, whatever the time zone. */
const HANDOVERS: SnapRaster = { step: 8 * HOUR, offset: 6 * HOUR };

const ENGINEERS: readonly Task[] = [{ id: "ada", name: "Ada Mwangi", color: "light-dark(#7c3aed, #a98bfa)" }];

const START: readonly Subtask[] = [{ id: "watch-1", task: "ada", lane: "primary", from: at(6), to: at(14) }];

export default function SnapToHandovers() {
  const [watches, setWatches] = useState(START);
  return (
    <Schedule
      ariaLabel="An on-call watch on the handover raster"
      initialDomain={[at(4), at(24)]}
      height={110}
      snap={HANDOVERS}
      intents={["move"]}
      onIntent={(intent) => setWatches((current) => current.map((watch) => applyIntent(watch, intent)))}
    >
      <Lane id="primary" label="Primary" />
      <Subtasks data={watches} tasks={ENGINEERS} />
    </Schedule>
  );
}
