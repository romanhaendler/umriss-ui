import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { BlockedTime, Intent, Subtask, Task } from "../../../src";

export const title = "Plan work around someone's leave";

export const lead = "A drag does not put work into blocked time: the ghost stays where it was allowed until the pointer is past it.";

/* Blocked time is part of where a subtask may go. Drag the review towards
   Anna's leave and the ghost stops short of it, the cursor says no and a line
   ties the ghost to the pointer; carry on past the leave, or onto Ben's lane,
   and it follows again. Alt with an arrow key steps over the leave instead of
   stopping in front of it.

   Work the data already put into blocked time is never locked there: it may be
   moved within that blocked time, and out of it. The finding stays until it
   is. */

const day = (d: number, hours = 0) => new Date(2026, 2, 16 + d, hours).getTime();

const PROJECTS: readonly Task[] = [{ id: "portal", name: "Customer portal", color: "light-dark(#2563eb, #6b9bff)" }];

const START: readonly Subtask[] = [
  { id: "review", task: "portal", lane: "anna", from: day(0, 9), to: day(1, 12), name: "Design review" },
  { id: "tests", task: "portal", lane: "ben", from: day(2, 9), to: day(3, 17), name: "Tests" },
];

const BLOCKED: readonly BlockedTime[] = [{ id: "anna-leave", lane: "anna", from: day(2, 0), to: day(4, 0), label: "Leave" }];

export default function DragAround() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [last, setLast] = useState("Drag the design review into Anna's leave");

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    setWork((current) => current.map((s) => applyIntent(s, intent)));
    setLast(`${intent.subtask}: ${intent.kind}`);
  };

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Two people, one on leave"
        initialDomain={[day(0, 6), day(5, 0)]}
        height={150}
        intents={["move", "lane"]}
        onIntent={onIntent}
      >
        <Lane id="anna" label="Anna Berg" />
        <Lane id="ben" label="Ben Ortiz" />
        <BlockedTimes data={BLOCKED} />
        <Subtasks data={work} tasks={PROJECTS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-move>
        {last}
      </Text>
    </Stack>
  );
}
