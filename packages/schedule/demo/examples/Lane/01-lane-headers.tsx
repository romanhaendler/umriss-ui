import { Badge, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "What a lane header says";

/* A lane is declared by its id - the one subtasks name - and a label. The label
   is content, not a string: a name with its resource number, a status beside
   it. It is real text, read by a screen reader, and it stays at the left edge
   while the plot pans.

   The lanes stand in the order they are declared. A subtask on a lane that is
   not declared is not drawn. */

const at = (hours: number) => new Date(2026, 2, 17, hours).getTime();

const TASKS: Task[] = [{ id: "order", color: "light-dark(#7c3aed, #a98bfa)" }];

const WORK: Subtask[] = [
  { id: "one", task: "order", lane: "m-104", from: at(7), to: at(9) },
  { id: "two", task: "order", lane: "m-231", from: at(9), to: at(11) },
];

export default function LaneHeaders() {
  return (
    <Schedule ariaLabel="Two presses" initialDomain={[at(6), at(12)]} height={150} headerWidth={200}>
      <Lane
        id="m-104"
        label={
          <Stack direction="row" gap={2} align="center">
            <Text size="sm">Press 1</Text>
            <Text size="xs" tone="muted" mono>
              M-104
            </Text>
          </Stack>
        }
      />
      <Lane
        id="m-231"
        label={
          <Stack direction="row" gap={2} align="center">
            <Text size="sm">Press 2</Text>
            <Badge tone="warning">Service</Badge>
          </Stack>
        }
      />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
