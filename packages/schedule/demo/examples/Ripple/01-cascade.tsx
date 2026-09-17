import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports, applyIntent, ripple } from "../../../src";
import type { MoveIntent, Subtask, Task, Transport } from "../../../src";

export const title = "Pushing the successors";

/* The saw runs an hour late. `ripple` takes the data, the transports and that
   one intent, and returns the moves that push every successor whose transport
   no longer fits - by exactly what is missing, down the chain, never earlier.
   The schedule never runs it; whether a successor may move is the plant's
   decision, and this application decides with a button. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "bracket", color: "light-dark(#c2410c, #f08a52)" }];

const START: Subtask[] = [
  { id: "saw", task: "bracket", lane: "saw", from: at(6), to: at(7, 30) },
  { id: "bend", task: "bracket", lane: "press", from: at(8), to: at(9) },
  { id: "weld", task: "bracket", lane: "weld", from: at(9, 30), to: at(11) },
];

const MOVES: Transport[] = [
  { id: "to-press", from: "saw", to: "bend", duration: min(20) },
  { id: "to-weld", from: "bend", to: "weld", duration: min(15) },
];

const LATE: MoveIntent = { kind: "move", subtask: "saw", from: at(7), to: at(8, 30) };

export default function Cascade() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  /* The cascade of the late saw - once the saw is late; before that there is
     nothing to push. */
  const late = work.some((s) => s.id === LATE.subtask && s.from === LATE.from);
  const pushed = late ? ripple(work, MOVES, LATE) : [];

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="A bracket through saw, press and welding" initialDomain={[at(5, 30), at(13)]} height={190}>
        <Lane id="saw" label="Saw" />
        <Lane id="press" label="Press" />
        <Lane id="weld" label="Welding" />
        <Transports data={MOVES} />
        <Subtasks data={work} tasks={TASKS} />
      </Schedule>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" onClick={() => setWork((current) => current.map((s) => applyIntent(s, LATE)))} disabled={late}>
          Saw an hour late
        </Button>
        <Button size="sm" onClick={() => setWork((current) => pushed.reduce((data, move) => data.map((s) => applyIntent(s, move)), current))} disabled={pushed.length === 0}>
          Push {pushed.length} {pushed.length === 1 ? "successor" : "successors"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setWork(START)}>
          Reset
        </Button>
      </Stack>
      <Text size="xs" mono tone="muted">
        {pushed.length === 0 ? "Nothing to push" : pushed.map((m) => m.subtask).join(", ")}
      </Text>
    </Stack>
  );
}
