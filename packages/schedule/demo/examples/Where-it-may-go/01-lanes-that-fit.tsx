import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Intent, Subtask, Task } from "../../../src";

export const title = "Keep work on the lanes that fit";

export const lead = "`canMoveTo` names the lanes a subtask may go to; the others are hatched as the drag begins, and a drop there keeps only the move in time.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const GOODS: Task[] = [
  { id: "dry", name: "Dry goods", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "chilled", name: "Chilled goods", color: "light-dark(#c2410c, #f08a52)" },
];

const COOLED = ["cool-1", "cool-2"];

const START: Subtask[] = [
  { id: "parcels", task: "dry", lane: "cool-1", from: at(7), to: at(9) },
  { id: "vaccines", task: "chilled", lane: "cool-2", from: at(9, 30), to: at(11, 30) },
  { id: "books", task: "dry", lane: "dry", from: at(12), to: at(14) },
];

/* Chilled goods go on a cooled van; dry goods go anywhere. */
const mayGo = (subtask: Subtask, lane: string) => subtask.task !== "chilled" || COOLED.includes(lane);

export default function LanesThatFit() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [last, setLast] = useState("Drag the vaccines onto the dry van");

  /* Only `move` and `lane` are enabled, but the type is the whole union, and
     a `place` names no subtask. */
  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    setWork((current) => current.map((s) => applyIntent(s, intent)));
    setLast(`${intent.subtask}: ${intent.kind}`);
  };

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Two cooled vans and a dry van"
        initialDomain={[at(6, 30), at(15)]}
        height={190}
        intents={["move", "lane"]}
        canMoveTo={mayGo}
        onIntent={onIntent}
      >
        <Lane id="cool-1" label="Cooled van FP 377 K" />
        <Lane id="cool-2" label="Cooled van FP 455 R" />
        <Lane id="dry" label="Van FP 214 K" />
        <Subtasks data={work} tasks={GOODS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-move>
        {last}
      </Text>
    </Stack>
  );
}
