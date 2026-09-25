import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Place without snapping";

export const lead = "`snap={false}` lets a drag land on any minute - for times that follow the pointer rather than a raster.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const ENGINEERS: readonly Task[] = [{ id: "sam", name: "Sam Okafor", color: "light-dark(#0d9488, #3cc7b8)" }];

const START: readonly Subtask[] = [{ id: "window-1", task: "sam", lane: "notifications", from: at(13, 5), to: at(13, 50), name: "Maintenance window" }];

export default function NoSnapping() {
  const [windows, setWindows] = useState(START);
  return (
    <Schedule
      ariaLabel="A maintenance window placed freely"
      initialDomain={[at(10), at(18)]}
      height={100}
      snap={false}
      intents={["move"]}
      onIntent={(intent) => setWindows((current) => current.map((one) => applyIntent(one, intent)))}
    >
      <Lane id="notifications" label="Notifications" />
      <Subtasks data={windows} tasks={ENGINEERS} />
    </Schedule>
  );
}
