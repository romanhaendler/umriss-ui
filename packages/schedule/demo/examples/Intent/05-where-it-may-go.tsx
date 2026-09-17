import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Intent, Subtask, Task } from "../../../src";

export const title = "Where a subtask may go";

/* Not every stop may go on every machine. A mould fits one press, a part that
   has been set up may move in time but not to another station, and a plant
   knows both - the schedule does not.

   `canMoveTo` asks the application, per subtask and lane, while the drag runs
   and again at the drop. The ghost stays on the last lane that was allowed, so
   a planner always sees where the drop would land, and the label says why it
   is not following. A refused drop reports nothing at all.

   It narrows `"lane"`; it does not enable it. Dragging in time keeps working
   for everything below - a restriction on the lane is not a restriction on the
   clock. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [
  { id: "wide", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "bound", color: "light-dark(#c2410c, #f08a52)" },
];

const PRESSES = ["press-1", "press-2"];

const START: Subtask[] = [
  { id: "free", task: "wide", lane: "press-1", from: at(7), to: at(9) },
  { id: "moulded", task: "bound", lane: "press-2", from: at(9, 30), to: at(11, 30) },
  { id: "welded", task: "wide", lane: "weld", from: at(12), to: at(14) },
];

/* The mould fits the two presses and nothing else; everything else may go
   anywhere. A real plant reads this off its own master data. */
const mayGo = (subtask: Subtask, lane: string) => subtask.task !== "bound" || PRESSES.includes(lane);

export default function WhereItMayGo() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [last, setLast] = useState("Drag the moulded part onto the welding bay");

  const onIntent = (intent: Intent) => {
    setWork((current) => current.map((s) => applyIntent(s, intent)));
    setLast(`${intent.kind === "place" ? intent.item : intent.subtask}: ${intent.kind}`);
  };

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Two presses and a welding bay"
        initialDomain={[at(6, 30), at(15)]}
        height={190}
        intents={["move", "lane"]}
        canMoveTo={mayGo}
        onIntent={onIntent}
      >
        <Lane id="press-1" label="Press 1" />
        <Lane id="press-2" label="Press 2" />
        <Lane id="weld" label="Welding bay" />
        <Subtasks data={work} tasks={TASKS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-move>
        {last}
      </Text>
    </Stack>
  );
}
