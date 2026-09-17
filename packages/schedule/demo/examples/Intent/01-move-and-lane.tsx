import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports, applyIntent } from "../../../src";
import type { Intent, Subtask, Task, Transport } from "../../../src";

export const title = "Moving, and putting on another lane";

/* `intents` lists what the application handles, and each name enables its
   interaction: with `move` a subtask is dragged through time, with `lane`
   onto another lane. Without `intents` the schedule is read-only - that is a
   feature, not a lesser mode.

   While the drag is in flight a ghost stands beside the unchanged plan, with
   its new times and whatever finding the drop would create. When it ends, one
   intent per change is reported. The plan changes only here, where the
   application applies the intent - `applyIntent` is the arithmetic for it. */
const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
  { id: "qa", label: "Inspection" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
  { id: "a-2045", name: "A-2045 Cover", color: "light-dark(#be185d, #f06aa6)" },
  { id: "a-2046", name: "A-2046 Axle", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), setup: min(15), teardown: min(10) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), setup: min(30), teardown: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(10), to: at(11, 30), setup: min(15) },
  { id: "a-2046-2", task: "a-2046", lane: "mill", from: at(13), to: at(14, 30), setup: min(20), teardown: min(10) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: at(12), to: at(14), setup: min(20), teardown: min(20) },
  { id: "a-2045-3", task: "a-2045", lane: "qa", from: at(15, 45), to: at(16, 30) },
];

const MOVES: readonly Transport[] = [
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", duration: min(45) },
  /* Leaves the mill at 11:30 and has ten minutes to reach the paint shop's
     setup at 11:40 - it takes twenty-five. A late transport, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", duration: min(25) },
];

export default function MoveAndLane() {
  const [steps, setSteps] = useState(STEPS);
  const [last, setLast] = useState<Intent | null>(null);

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March, editable"
        initialDomain={DAY_OF_PLAN}
        height={284}
        intents={["move", "lane"]}
        onIntent={(intent) => {
          setLast(intent);
          setSteps((current) => current.map((step) => applyIntent(step, intent)));
        }}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Transports data={MOVES} />
        <Subtasks data={steps} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-intent>
        {last === null ? "No intent yet" : JSON.stringify(last)}
      </Text>
    </Stack>
  );
}
