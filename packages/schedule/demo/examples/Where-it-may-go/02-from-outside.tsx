import { useState } from "react";
import { Card, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, subtaskFromPlace } from "../../../src";
import type { Intent, PlacingItem, Subtask, Task } from "../../../src";

export const title = "The same rule for work dragged in";

/* `canMoveTo` is asked about work that is not on the plan yet too, with the
   key and task the application declared in `placing`. The welding bay is
   marked for the mould beside the plan exactly as it is for the one already on
   it, and the ghost holds on the last lane that allowed it.

   One thing is the platform's and not the schedule's: a native drag has no
   cursor of its own to give, only the browser's answer to "may this be
   dropped". That answer follows the GHOST here and not the pointer - while a
   ghost stands somewhere allowed, a release lands there, because a ghost is
   the promise of where a drop lands. It says "no drop" exactly when a release
   would place nothing.

   How a drag from a list is set up at all - `placing`, `dragstart`, `dragend`,
   and what a `place` intent carries - is *Placing from outside*. Nothing of it
   is repeated here. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [
  { id: "wide", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "bound", color: "light-dark(#c2410c, #f08a52)" },
];

const PRESSES = ["press-1", "press-2"];

const START: Subtask[] = [
  { id: "free", task: "wide", lane: "press-1", from: at(7), to: at(9) },
  { id: "welded", task: "wide", lane: "weld", from: at(12), to: at(14) },
];

/* The mould fits the two presses and nothing else. */
const mayGo = (subtask: Subtask, lane: string) => subtask.task !== "bound" || PRESSES.includes(lane);

const WAITING: PlacingItem & { label: string } = {
  item: "mould",
  label: "Mould A-77 · 2 h",
  task: "bound",
  duration: 2 * 60 * 60_000,
};

export default function FromOutside() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [placing, setPlacing] = useState<PlacingItem | null>(null);
  const [last, setLast] = useState("Drag the mould onto the welding bay");

  const onIntent = (intent: Intent) => {
    if (intent.kind !== "place") return;
    setWork((current) => [...current, subtaskFromPlace(intent, `${intent.item}-${current.length}`)]);
    setLast(`${intent.item}: place on ${intent.lane}`);
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
        ariaLabel="A mould waiting beside two presses and a welding bay"
        initialDomain={[at(6, 30), at(15)]}
        height={190}
        intents={["place"]}
        placing={placing}
        canMoveTo={mayGo}
        onIntent={onIntent}
      >
        <Lane id="press-1" label="Press 1" />
        <Lane id="press-2" label="Press 2" />
        <Lane id="weld" label="Welding bay" />
        <Subtasks data={work} tasks={TASKS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-place>
        {last}
      </Text>
    </Stack>
  );
}
