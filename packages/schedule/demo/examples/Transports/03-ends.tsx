import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport, TransportEnds } from "../../../src";

export const title = "Whether the ends carry a dot";

/* `ends` decides whether a transport's two ends are marked with a dot. The dot
   says where the line is anchored - a help while a plan is being read, and
   noise in a plan full of short moves. So it is the caller's choice, and a
   single transport may say otherwise for itself.

   Picture only, like `route` and `attach`: no finding follows from it. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "frame", color: "light-dark(#2563eb, #6b9bff)" }];

const STEPS: Subtask[] = [
  { id: "saw", task: "frame", lane: "saw", from: at(7), to: at(8) },
  { id: "mill", task: "frame", lane: "mill", from: at(8, 30), to: at(9, 30) },
  { id: "press", task: "frame", lane: "press", from: at(10), to: at(11) },
];

const MOVES: Transport[] = [
  { id: "to-mill", from: "saw", to: "mill", duration: min(15) },
  { id: "to-press", from: "mill", to: "press", duration: min(15) },
];

function Variant({ ends }: { ends: TransportEnds }) {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted" mono>
        ends=&quot;{ends}&quot;
      </Text>
      <Schedule ariaLabel={`Three short moves, ends ${ends}`} initialDomain={[at(6, 30), at(11, 30)]} height={188} attach="nearest" ends={ends}>
        <Lane id="saw" label="Saw" />
        <Lane id="mill" label="Mill" />
        <Lane id="press" label="Press" />
        <Transports data={MOVES} />
        <Subtasks data={STEPS} tasks={TASKS} />
      </Schedule>
    </Stack>
  );
}

export default function Ends() {
  return (
    <Stack gap={4}>
      <Variant ends="dot" />
      <Variant ends="none" />
    </Stack>
  );
}
