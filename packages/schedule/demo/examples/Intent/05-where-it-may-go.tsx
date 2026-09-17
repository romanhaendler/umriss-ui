import { useState } from "react";
import { Card, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, applyIntent, subtaskFromPlace } from "../../../src";
import type { Intent, PlacingItem, Subtask, Task } from "../../../src";

export const title = "Where a subtask may go";

/* Not every stop may go on every machine. A mould fits one press, a part that
   has been set up may move in time but not to another station, and a plant
   knows both - the schedule does not.

   `canMoveTo` asks the application, once per lane when the drag takes hold and
   again at the drop. The lanes it turns down are marked from the first frame:
   drawn back and hatched, their headers with them, so that nobody has to try a
   lane to learn it is closed. Over one of them the ghost stays on the last
   lane that was allowed, the cursor says no, and a line ties the ghost to the
   pointer it is not following - it is being held, not stuck.

   A refusal costs the lane and nothing else. Drop after it and the move in
   time is still reported: one rule of the plant must not take away the other
   half of a gesture. And none of it wears a warning colour, because a mould
   that fits one press is nobody's mistake.

   It narrows `"lane"`; it does not enable it. Dragging in time keeps working
   for everything below - a restriction on the lane is not a restriction on the
   clock.

   It holds for work dragged in from outside as well: the mould beside the plan
   is asked about with the key and task the application declared, and the
   welding bay is marked for it exactly as it is for the part already on the
   plan. */

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

const WAITING: PlacingItem & { label: string } = {
  item: "mould",
  label: "Mould A-77 · 2 h",
  task: "bound",
  duration: 2 * 60 * 60_000,
};

export default function WhereItMayGo() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [placing, setPlacing] = useState<PlacingItem | null>(null);
  const [last, setLast] = useState("Drag the moulded part onto the welding bay");

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") {
      setWork((current) => [...current, subtaskFromPlace(intent, `${intent.item}-${current.length}`)]);
      setLast(`${intent.item}: place`);
      return;
    }
    setWork((current) => current.map((s) => applyIntent(s, intent)));
    setLast(`${intent.subtask}: ${intent.kind}`);
  };

  return (
    <Stack gap={3}>
      <Card>
        <div
          draggable
          data-waiting={WAITING.item}
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", WAITING.item);
            event.dataTransfer.effectAllowed = "copy";
            setPlacing(WAITING);
          }}
          onDragEnd={() => setPlacing(null)}
          style={{ cursor: "grab" }}
        >
          <Text size="sm">{WAITING.label}</Text>
        </div>
      </Card>
      <Schedule
        ariaLabel="Two presses and a welding bay"
        initialDomain={[at(6, 30), at(15)]}
        height={190}
        intents={["move", "lane", "place"]}
        placing={placing}
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
