import { useState } from "react";
import { Card, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports, applyIntent, subtaskFromPlace } from "../../../src";
import type { Intent, PlacingItem, Subtask } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

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

const HOUR = 3_600_000;

const WAITING: readonly (PlacingItem & { label: string })[] = [
  { item: "a-2047", label: "A-2047 Cap · 2 h", task: "a-2041", duration: 2 * HOUR, setup: 15 * 60_000 },
  { item: "a-2048", label: "A-2048 Ring · 1 h", task: "a-2042", duration: HOUR },
  { item: "a-2049", label: "A-2049 Plate · 4 h", task: "a-2043", duration: 4 * HOUR, teardown: 20 * 60_000 },
];

export default function DragIn() {
  const [steps, setSteps] = useState<readonly Subtask[]>(STEPS);
  const [placing, setPlacing] = useState<PlacingItem | null>(null);
  const [placed, setPlaced] = useState(0);
  const [last, setLast] = useState("Drag an order onto a lane");

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") {
      const id = `${intent.item}-${placed + 1}`;
      setPlaced(placed + 1);
      setSteps((current) => [...current, subtaskFromPlace(intent, id)]);
      setLast(`place ${intent.item} on ${intent.lane} as ${id}`);
      return;
    }
    setSteps((current) => current.map((step) => applyIntent(step, intent)));
    setLast(`${intent.kind} ${intent.subtask}`);
  };

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
        height={380}
        intents={["place", "move", "lane"]}
        placing={placing}
        onIntent={onIntent}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Transports data={MOVES} />
        <Subtasks data={steps} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-place>
        {last}
      </Text>
    </Stack>
  );
}
