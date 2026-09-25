import { useState } from "react";
import { Button, Stack } from "@umriss-ui/core";
import { Dependencies, Lane, Schedule, Subtasks, applyIntent, shiftTask } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Move a whole tour";

export const lead = "`shiftTask` returns one move per stop, all by the same amount, so every drive that fitted still fits.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;
const HALF_HOUR = min(30);

const TOURS: readonly Task[] = [
  { id: "T-01", name: "T-01", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "T-02", name: "T-02", color: "light-dark(#7c3aed, #a98bfa)" },
];

const START: readonly Subtask[] = [
  { id: "t01-1", task: "T-01", lane: "van-214", from: at(7, 40), to: at(7, 50) },
  { id: "t01-2", task: "T-01", lane: "van-214", from: at(8, 15), to: at(8, 25) },
  { id: "t01-3", task: "T-01", lane: "van-214", from: at(8, 50), to: at(9) },
  { id: "t02-1", task: "T-02", lane: "van-377", from: at(8, 10), to: at(8, 20) },
  { id: "t02-2", task: "T-02", lane: "van-377", from: at(8, 45), to: at(8, 55) },
];

const DRIVES: readonly Dependency[] = [
  { id: "d01-1", from: "t01-1", to: "t01-2", lag: min(20) },
  { id: "d01-2", from: "t01-2", to: "t01-3", lag: min(20) },
  { id: "d02-1", from: "t02-1", to: "t02-2", lag: min(20) },
];

export default function MoveAWholeTour() {
  const [stops, setStops] = useState<readonly Subtask[]>(START);
  const move = (by: number) =>
    setStops((current) => shiftTask(current, "T-01", by).reduce((data, one) => data.map((s) => applyIntent(s, one)), current));

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Two tours from North depot" initialDomain={[at(7), at(10, 30)]} height={140}>
        <Lane id="van-214" label="Van FP 214 K" />
        <Lane id="van-377" label="E-van FP 377 K" />
        <Dependencies data={DRIVES} />
        <Subtasks data={stops} tasks={TOURS} />
      </Schedule>
      <Stack direction="row" gap={2}>
        <Button size="sm" onClick={() => move(-HALF_HOUR)}>
          T-01 half an hour earlier
        </Button>
        <Button size="sm" onClick={() => move(HALF_HOUR)}>
          T-01 half an hour later
        </Button>
      </Stack>
    </Stack>
  );
}
