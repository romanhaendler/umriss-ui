import { Badge, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "What a lane header says";

export const lead = "A `label` is content, not a string: here the vehicle with its plate, and a badge for the van that is off the road.";

const at = (hours: number) => new Date(2026, 2, 17, hours).getTime();

const TOURS: Task[] = [{ id: "t-02", name: "T-02 Northfold", color: "light-dark(#0d9488, #3cc7b8)" }];

const LEGS: Subtask[] = [
  { id: "t-02-1", task: "t-02", lane: "v1", from: at(7), to: at(9) },
  { id: "t-02-2", task: "t-02", lane: "v2", from: at(9), to: at(11) },
];

export default function LaneHeaders() {
  return (
    <Schedule ariaLabel="Two vans of the North depot" initialDomain={[at(6), at(12)]} height={150} headerWidth={210}>
      <Lane
        id="v1"
        label={
          <Stack direction="row" gap={2} align="center">
            <Text size="sm">Van</Text>
            <Text size="xs" tone="muted" mono>
              FP 214 K
            </Text>
          </Stack>
        }
      />
      <Lane
        id="v2"
        label={
          <Stack direction="row" gap={2} align="center">
            <Text size="sm">E-van</Text>
            <Text size="xs" tone="muted" mono>
              FP 377 K
            </Text>
            <Badge tone="warning">Workshop</Badge>
          </Stack>
        }
      />
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
