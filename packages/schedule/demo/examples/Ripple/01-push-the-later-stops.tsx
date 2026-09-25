import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { Dependencies, Lane, Schedule, Subtasks, applyIntent, ripple } from "../../../src";
import type { Dependency, MoveIntent, Subtask, Task } from "../../../src";

export const title = "Push the later stops of a tour";

export const lead = "`ripple` returns the moves that push every stop whose drive no longer fits behind a late one; you decide whether to apply them.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: readonly Task[] = [{ id: "T-01", name: "T-01 North depot", color: "light-dark(#0d9488, #3cc7b8)" }];

/* Ten minutes at each stop, twenty minutes' drive between them, and five
   minutes of slack that absorbs part of a delay. */
const START: readonly Subtask[] = [
  { id: "stop-1", task: "T-01", lane: "van-214", from: at(7, 40), to: at(7, 50), name: "Holloway" },
  { id: "stop-2", task: "T-01", lane: "van-214", from: at(8, 15), to: at(8, 25), name: "Marlow" },
  { id: "stop-3", task: "T-01", lane: "van-214", from: at(8, 50), to: at(9), name: "Oakridge" },
  { id: "stop-4", task: "T-01", lane: "van-214", from: at(9, 25), to: at(9, 35), name: "Brixley" },
];

const DRIVES: readonly Dependency[] = [
  { id: "drive-1", from: "stop-1", to: "stop-2", lag: min(20) },
  { id: "drive-2", from: "stop-2", to: "stop-3", lag: min(20) },
  { id: "drive-3", from: "stop-3", to: "stop-4", lag: min(20) },
];

const LATE: MoveIntent = { kind: "move", subtask: "stop-1", from: at(8, 10), to: at(8, 20) };

export default function PushTheLaterStops() {
  const [stops, setStops] = useState<readonly Subtask[]>(START);
  /* Nothing to push until the first stop runs late. */
  const late = stops.some((s) => s.id === LATE.subtask && s.from === LATE.from);
  const pushed = late ? ripple(stops, DRIVES, LATE) : [];

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Tour T-01 on van FP 214 K" initialDomain={[at(7, 15), at(10, 30)]} height={100}>
        <Lane id="van-214" label="Van FP 214 K" />
        <Dependencies data={DRIVES} />
        <Subtasks data={stops} tasks={TOURS} />
      </Schedule>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" onClick={() => setStops((current) => current.map((s) => applyIntent(s, LATE)))} disabled={late}>
          First stop 30 minutes late
        </Button>
        <Button
          size="sm"
          onClick={() => setStops((current) => pushed.reduce((data, move) => data.map((s) => applyIntent(s, move)), current))}
          disabled={pushed.length === 0}
        >
          Push {pushed.length} {pushed.length === 1 ? "stop" : "stops"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setStops(START)}>
          Reset
        </Button>
      </Stack>
      <Text size="xs" mono tone="muted" data-pushed>
        {pushed.length === 0 ? "Nothing to push" : pushed.map((m) => m.subtask).join(", ")}
      </Text>
    </Stack>
  );
}
