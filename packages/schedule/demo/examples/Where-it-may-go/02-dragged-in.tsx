import { useState } from "react";
import { Card, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, subtaskFromPlace } from "../../../src";
import type { Intent, PlacingItem, Subtask, Task } from "../../../src";

export const title = "Apply the same rule to work dragged in";

export const lead = "`canMoveTo` is asked about work in `placing` too; the ghost holds on the last lane that allowed it, and a drop lands there.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const GOODS: Task[] = [
  { id: "dry", name: "Dry goods", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "chilled", name: "Chilled goods", color: "light-dark(#c2410c, #f08a52)" },
];

const COOLED = ["cool-1", "cool-2"];

const START: Subtask[] = [
  { id: "parcels", task: "dry", lane: "cool-1", from: at(7), to: at(9) },
  { id: "books", task: "dry", lane: "dry", from: at(12), to: at(14) },
];

const mayGo = (subtask: Subtask, lane: string) => subtask.task !== "chilled" || COOLED.includes(lane);

const WAITING: PlacingItem & { label: string } = {
  item: "insulin",
  label: "Oakridge Pharmacy, chilled · 2 h",
  task: "chilled",
  duration: 2 * 60 * 60_000,
};

export default function DraggedIn() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [placing, setPlacing] = useState<PlacingItem | null>(null);
  const [last, setLast] = useState("Drag the chilled delivery onto the dry van");

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
        ariaLabel="A chilled delivery waiting beside two cooled vans and a dry van"
        initialDomain={[at(6, 30), at(15)]}
        height={190}
        intents={["place"]}
        placing={placing}
        canMoveTo={mayGo}
        onIntent={onIntent}
      >
        <Lane id="cool-1" label="Cooled van FP 377 K" />
        <Lane id="cool-2" label="Cooled van FP 455 R" />
        <Lane id="dry" label="Van FP 214 K" />
        <Subtasks data={work} tasks={GOODS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-place>
        {last}
      </Text>
    </Stack>
  );
}
