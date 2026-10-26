import { Button, Stack } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Zoom and fit with buttons";

export const lead = "The schedule has no zoom buttons of its own: `visibleDomain` reads the span in view, `setDomain` puts a new one in, and `setDomain(null)` fits the subtasks. The application keeps each zoom within the `zoomLimits` it passes.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const HOUR = 60 * 60_000;

const TASKS: Task[] = [{ id: "release", name: "Release 4.12", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "build", task: "release", lane: "priya", from: at(6), to: at(7) },
  { id: "rollout", task: "release", lane: "jonas", from: at(8), to: at(10, 30) },
  { id: "verify", task: "release", lane: "ada", from: at(11), to: at(12) },
];

const LIMITS = { min: 2 * HOUR, max: 48 * HOUR };

export default function ZoomAndFit() {
  const { Schedule, Lane, Subtasks, setDomain, visibleDomain } = useSchedule({
    initialView: { domain: [at(5, 30), at(18)] },
  });

  /* Halves or doubles the span about its middle, clamped to the limits. */
  const zoom = (factor: number) => {
    const [from, to] = visibleDomain();
    const middle = (from + to) / 2;
    const span = Math.min(LIMITS.max, Math.max(LIMITS.min, (to - from) * factor));
    setDomain([middle - span / 2, middle + span / 2]);
  };

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2}>
        <Button size="sm" onClick={() => zoom(0.5)}>Zoom in</Button>
        <Button size="sm" onClick={() => zoom(2)}>Zoom out</Button>
        <Button size="sm" onClick={() => setDomain(null)}>Fit</Button>
      </Stack>
      <Schedule aria-label="The release, with zoom and fit buttons" height={160} zoomLimits={LIMITS}>
        <Lane id="priya" label="Priya Raman" />
        <Lane id="jonas" label="Jonas Keller" />
        <Lane id="ada" label="Ada Mwangi" />
        <Subtasks data={WORK} tasks={TASKS} />
      </Schedule>
    </Stack>
  );
}
