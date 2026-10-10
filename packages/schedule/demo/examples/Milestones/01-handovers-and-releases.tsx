import { Stack } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Milestone, Subtask, Task } from "../../../src";

export const title = "Mark a handover and a release";

export const lead = "A point in time on a lane is a mark, not a bar: `Milestones` draws a diamond at `at`, above the work.";

/* A milestone is data beside the work: one list, each point naming its lane
   and the instant it stands at, as a release calendar holds it. It is drawn
   above the bars - the design handover below stands on the end of the design
   bar and is still seen - and it has no duration, no task and no colour of
   its own.

   Hover it and the tooltip names it and says when; the keys reach it as they
   reach the work, with the arrows in time order along the lane, and the live
   region reads its lane, its label and its time. It is not dragged and
   reports no intent. */

const day = (d: number, hours = 0) => new Date(2026, 2, 16 + d, hours).getTime();

const PROJECTS: readonly Task[] = [
  { id: "portal", name: "Customer portal", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "billing", name: "Billing rework", color: "light-dark(#0d9488, #3cc7b8)" },
];

const WORK: readonly Subtask[] = [
  { id: "portal-design", task: "portal", lane: "anna", from: day(0, 9), to: day(1, 17), name: "Design" },
  { id: "portal-front", task: "portal", lane: "chloe", from: day(1, 9), to: day(3, 17), name: "Front end" },
  { id: "billing-api", task: "billing", lane: "ben", from: day(0, 9), to: day(2, 17), name: "Invoice API" },
];

const MILESTONES: readonly Milestone[] = [
  { id: "design-handover", lane: "anna", at: day(1, 17), label: "Design handover" },
  { id: "api-freeze", lane: "ben", at: day(2, 17), label: "API freeze" },
  { id: "release", lane: "chloe", at: day(4, 12), label: "Release 2.0" },
];

export default function HandoversAndReleases() {
  const { Schedule, Lane, Subtasks, Milestones } = useSchedule({ initialView: { domain: [day(0, 6), day(5, 0)] } });
  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Portal and billing plan, week of 16 March" height={188}>
        <Lane id="anna" label="Anna Berg" />
        <Lane id="ben" label="Ben Ortiz" />
        <Lane id="chloe" label="Chloe Lind" />
        <Subtasks data={WORK} tasks={PROJECTS} />
        <Milestones data={MILESTONES} />
      </Schedule>
    </Stack>
  );
}
