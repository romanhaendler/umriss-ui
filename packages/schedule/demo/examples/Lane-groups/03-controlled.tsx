import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { Lane, LaneGroup, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Fold groups from outside";

export const lead = "Pass `collapsedGroups` and `onCollapsedGroupsChange` to own the fold: store it with the planner's preferences, or fold two views together.";

/* The shape `selectedTask` has: left out, the schedule keeps the state
   itself. A fold is not an intent - it says what is on screen, nothing about
   the plan. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [{ id: "release", name: "Release 4.12", color: "light-dark(#0d9488, #3cc7b8)" }];

const WORK: Subtask[] = [
  { id: "s1", task: "release", lane: "priya", from: at(7), to: at(9) },
  { id: "s2", task: "release", lane: "jonas", from: at(9, 30), to: at(11) },
  { id: "s3", task: "release", lane: "tomasz", from: at(11, 30), to: at(13) },
  { id: "s4", task: "release", lane: "leila", from: at(13), to: at(14, 30) },
];

const ALL = ["payments", "discovery"];

export default function Controlled() {
  const [folded, setFolded] = useState<readonly string[]>(["discovery"]);

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
        ariaLabel="Two teams rolling out a release, folded from outside"
        initialDomain={[at(6), at(15)]}
        height={280}
        collapsedGroups={folded}
        onCollapsedGroupsChange={setFolded}
      >
        <LaneGroup id="payments" label="Payments">
          <Lane id="priya" label="Priya Raman" />
          <Lane id="jonas" label="Jonas Keller" />
        </LaneGroup>
        <LaneGroup id="discovery" label="Discovery">
          <Lane id="tomasz" label="Tomasz Nowak" />
          <Lane id="leila" label="Leila Haddad" />
        </LaneGroup>
        <Subtasks data={WORK} tasks={TASKS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-folded>
        {folded.length === 0 ? "nothing folded" : folded.join(", ")}
      </Text>
    </Stack>
  );
}
