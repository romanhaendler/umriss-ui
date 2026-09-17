import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { Lane, LaneGroup, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Which groups are folded, controlled";

/* `collapsedGroups`, `defaultCollapsedGroups` and `onCollapsedGroupsChange`
   are the shape `selectedTask` has: leave them out and the schedule keeps the
   state itself; pass a list and the application owns it.

   Owning it is worth something. The list can be stored with the planner's
   other preferences, put in the address, or handed to a second schedule so two
   views fold together. Here two buttons move it from outside, and the readout
   is the application's own state.

   It is NOT an intent. An intent asks to change the plan, and a caller that
   applies every intent it receives must never find a fold among them: folding
   says what is on screen and nothing about what the plant is doing. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [{ id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" }];

const STEPS: Subtask[] = [
  { id: "s1", task: "a-2041", lane: "press-1", from: at(7), to: at(9) },
  { id: "s2", task: "a-2041", lane: "press-2", from: at(9, 30), to: at(11) },
  { id: "s3", task: "a-2041", lane: "weld-1", from: at(11, 30), to: at(13) },
  { id: "s4", task: "a-2041", lane: "weld-2", from: at(13), to: at(14, 30) },
];

const ALL = ["presses", "welding"];

export default function Controlled() {
  const [folded, setFolded] = useState<readonly string[]>(["welding"]);

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2}>
        <Button size="sm" variant="secondary" onClick={() => setFolded(ALL)} data-fold-all>
          Fold everything
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setFolded([])} data-unfold-all>
          Unfold everything
        </Button>
      </Stack>
      <Schedule
        ariaLabel="Two presses and two welding bays, folded from outside"
        initialDomain={[at(6), at(15)]}
        height={280}
        collapsedGroups={folded}
        onCollapsedGroupsChange={setFolded}
      >
        <LaneGroup id="presses" label="Press shop">
          <Lane id="press-1" label="Press 1" />
          <Lane id="press-2" label="Press 2" />
        </LaneGroup>
        <LaneGroup id="welding" label="Welding">
          <Lane id="weld-1" label="Bay 1" />
          <Lane id="weld-2" label="Bay 2" />
        </LaneGroup>
        <Subtasks data={STEPS} tasks={TASKS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-folded>
        {folded.length === 0 ? "nothing folded" : folded.join(", ")}
      </Text>
    </Stack>
  );
}
