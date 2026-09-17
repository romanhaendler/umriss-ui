import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports, applyIntent } from "../../../src";
import type { Intent } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "Moving, and putting on another lane";

/* `intents` lists what the application handles, and each name enables its
   interaction: with `move` a subtask is dragged through time, with `lane`
   onto another lane. Without `intents` the schedule is read-only - that is a
   feature, not a lesser mode.

   While the drag is in flight a ghost stands beside the unchanged plan, with
   its new times and whatever finding the drop would create. When it ends, one
   intent per change is reported. The plan changes only here, where the
   application applies the intent - `applyIntent` is the arithmetic for it. */
export default function MoveAndLane() {
  const [steps, setSteps] = useState(STEPS);
  const [last, setLast] = useState<Intent | null>(null);

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March, editable"
        initialDomain={DAY_OF_PLAN}
        height={380}
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
