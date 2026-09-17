import { useState } from "react";
import { Lane, LaneGroup, Schedule, Subtasks, Transports, applyIntent, findings } from "../../../src";
import { Stack, Text } from "@umriss-ui/core";
import type { Subtask, Task, Transport } from "../../../src";

export const title = "What a folded group shows";

/* A folded group is not a closed box. It shows a **miniature**: every lane in
   it as a thin strip, at a smaller scale, with its work in the tasks' own
   colours. The real work, smaller - not a summary, not a packing, not a
   utilisation band.

   Fold the hall and watch what survives. The transport from the saw still
   arrives, at the strip of the machine it arrives at. The overlap on the mill
   is still marked, on the strip AND on the row, because folding is a planner
   tidying the view and must never be a planner hiding a finding. Hover a strip
   and the tooltip names the stop; click it and its whole task is outlined
   across the plan.

   What a strip does NOT show is everything that needs room to be read: no
   appearance, no label, no progress rail, and no grips - a bar three pixels
   high is not something to stretch by three pixels. That is what unfolding is
   for.

   A drag held over the folded hall opens it for the gesture, so work can be
   moved into a group without preparing the view first. It shuts again when the
   drag ends - the application did not fold anything, so its own list is never
   written to and it hears nothing.

   `findings()` is the proof that nothing moved: the list below is computed
   from the data and does not change by one entry when the hall folds. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6, 30), to: at(8), teardown: min(15) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(9), to: at(11, 30), setup: min(30) },
  { id: "a-2043-1", task: "a-2043", lane: "lathe", from: at(7), to: at(9) },
  /* Claims the mill while the housing still has it: an overlap, on purpose. */
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(11), to: at(13), setup: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: at(13, 30), to: at(15) },
];

const MOVES: Transport[] = [
  /* Out of the saw, which stands outside the hall, into a machine inside it. */
  { id: "t-1", from: "a-2041-1", to: "a-2041-2", duration: min(20) },
  { id: "t-2", from: "a-2043-1", to: "a-2043-2", duration: min(30) },
  { id: "t-3", from: "a-2043-2", to: "a-2043-3", duration: min(20) },
];

const FOUND = findings(STEPS, MOVES);

export default function TheMiniature() {
  const [folded, setFolded] = useState<readonly string[]>(["hall"]);
  const [work, setWork] = useState<readonly Subtask[]>(STEPS);
  const [last, setLast] = useState("Hold a bar over the folded hall");

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="A hall that folds into one row"
        initialDomain={[at(6), at(16)]}
        height={240}
        collapsedGroups={folded}
        onCollapsedGroupsChange={setFolded}
        intents={["move", "lane"]}
        onIntent={(intent) => {
          if (intent.kind === "place") return;
          setWork((current) => current.map((step) => applyIntent(step, intent)));
          setLast(`${intent.subtask}: ${intent.kind}`);
        }}
      >
        <Lane id="saw" label="Saw 1" />
        <LaneGroup id="hall" label="Hall A">
          <Lane id="lathe" label="Lathe 1" />
          <Lane id="mill" label="Mill" />
        </LaneGroup>
        <Lane id="paint" label="Paint shop" />
        <Transports data={MOVES} />
        <Subtasks data={work} tasks={TASKS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-move>
        {last}
      </Text>
      <Text size="sm" mono tone="secondary" data-findings-count>
        {FOUND.overlaps.length} overlap and {FOUND.lateTransports.length} late transport - folded or not
      </Text>
    </Stack>
  );
}
