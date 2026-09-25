import { useState } from "react";
import { Card, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Dependencies, applyIntent, subtaskFromPlace } from "../../../src";
import type { Intent, PlacingItem, Subtask, Task, Dependency } from "../../../src";

export const title = "Dragging unplanned work onto the plan";

/* Work that is not on the plan yet is dragged in from a list beside it - with
   the browser's own drag and drop, so the source can be any list the
   application has.

   The browser hands the dragged data over only on the drop, so the ghost before
   it cannot come from there: the application declares what it is dragging in
   `placing`, on its own `dragstart`, and clears it on `dragend`. While the drag
   is over a lane, the schedule shows the ghost at the snapped time with the
   findings the drop would create - the last of the three below collides with
   the press wherever it is put in the morning.

   The drop reports a `place` intent: the key the application gave the item, the
   task, the lane and the times. It creates no subtask itself - the id is the
   application's, and `subtaskFromPlace` builds the subtask from the intent. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "press", label: "Press 2" },
  { id: "qa", label: "Inspection" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
  { id: "a-2044", name: "A-2044 Flange", color: "light-dark(#7c3aed, #a98bfa)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "a-2044-2", task: "a-2044", lane: "press", from: at(9, 30), to: at(10, 45), leadIn: min(25) },
  { id: "a-2041-3", task: "a-2041", lane: "qa", from: at(11, 30), to: at(12, 15) },
];

const MOVES: readonly Dependency[] = [
  { id: "t-2041-3", from: "a-2041-1", to: "a-2041-3", lag: min(20) },
];

const HOUR = 3_600_000;

const WAITING: readonly (PlacingItem & { label: string })[] = [
  { item: "a-2047", label: "A-2047 Cap · 2 h", task: "a-2041", duration: 2 * HOUR, leadIn: 15 * 60_000 },
  { item: "a-2048", label: "A-2048 Ring · 1 h", task: "a-2042", duration: HOUR },
  { item: "a-2049", label: "A-2049 Plate · 4 h", task: "a-2043", duration: 4 * HOUR, leadOut: 20 * 60_000 },
];

export default function DragIn() {
  const [plan, setPlan] = useState<{ steps: readonly Subtask[]; placed: number; last: string }>({
    steps: STEPS,
    placed: 0,
    last: "Drag an order onto a lane",
  });
  const [placing, setPlacing] = useState<PlacingItem | null>(null);

  /* One functional update, so that a second intent in the same tick - and the
     counter the new id is built from - starts from the plan the first left. */
  const onIntent = (intent: Intent) =>
    setPlan((current) => {
      if (intent.kind !== "place") {
        return { ...current, steps: current.steps.map((step) => applyIntent(step, intent)), last: `${intent.kind} ${intent.subtask}` };
      }
      const placed = current.placed + 1;
      const id = `${intent.item}-${placed}`;
      return {
        steps: [...current.steps, subtaskFromPlace(intent, id)],
        placed,
        last: `place ${intent.item} on ${intent.lane} as ${id}`,
      };
    });

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2}>
        {WAITING.map((order) => (
          <Card key={order.item}>
            <div
              draggable
              data-waiting={order.item}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", order.item);
                event.dataTransfer.effectAllowed = "copy";
                setPlacing(order);
              }}
              onDragEnd={() => setPlacing(null)}
              style={{ cursor: "grab" }}
            >
              <Text size="sm">{order.label}</Text>
            </div>
          </Card>
        ))}
      </Stack>
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March, with unplanned work beside it"
        initialDomain={DAY_OF_PLAN}
        height={196}
        intents={["place", "move", "lane"]}
        placing={placing}
        onIntent={onIntent}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Dependencies data={MOVES} />
        <Subtasks data={plan.steps} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-place>
        {plan.last}
      </Text>
    </Stack>
  );
}
