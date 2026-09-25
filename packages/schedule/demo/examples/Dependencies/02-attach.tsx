import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { Subtask, Task, Dependency, DependencyAttachment } from "../../../src";

export const title = "Where a line touches its bars";

/* `attach` says where a dependency's line begins and ends ON the bars: the
   `"centre"` of both, or the `"nearest"` edge - the one facing the other stop.

   `"nearest"` is the interesting one. A line leaves the lower edge of the
   upper bar and meets the upper edge of the lower one, so a short move between
   two neighbouring lanes is drawn as the short line it is instead of swinging
   out of its lane and back. Within one lane there is no nearer edge, and both
   mean the middle.

   Not to be confused with the two ANCHORS, which say what a dependency
   connects and therefore whether it is violated. This says only where the line
   touches, and changes no finding. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "frame", color: "light-dark(#2563eb, #6b9bff)" }];

const STEPS: Subtask[] = [
  { id: "saw", task: "frame", lane: "saw", from: at(7), to: at(8, 30) },
  { id: "mill", task: "frame", lane: "mill", from: at(9), to: at(10, 30) },
  { id: "press", task: "frame", lane: "press", from: at(11), to: at(12) },
  /* Back up to the saw's lane: this is the move whose edges the attach
     decides. */
  { id: "check", task: "frame", lane: "saw", from: at(12, 30), to: at(13) },
];

const MOVES: Dependency[] = [
  { id: "to-mill", from: "saw", to: "mill", lag: min(20) },
  { id: "to-press", from: "mill", to: "press", lag: min(20) },
  { id: "to-check", from: "press", to: "check", lag: min(20) },
];

function Variant({ attach }: { attach: DependencyAttachment }) {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted" mono>
        attach=&quot;{attach}&quot;
      </Text>
      <Schedule ariaLabel={`A frame through three stations, lines from the ${attach}`} initialDomain={[at(6, 30), at(13, 30)]} height={188} attach={attach}>
        <Lane id="saw" label="Saw" />
        <Lane id="mill" label="Mill" />
        <Lane id="press" label="Press" />
        <Dependencies data={MOVES} />
        <Subtasks data={STEPS} tasks={TASKS} />
      </Schedule>
    </Stack>
  );
}

export default function Attach() {
  return (
    <Stack gap={4}>
      <Variant attach="centre" />
      <Variant attach="nearest" />
    </Stack>
  );
}
