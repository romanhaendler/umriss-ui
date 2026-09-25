import { Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Lane, Schedule, Subtasks, findings } from "../../../src";
import type { BlockedTime, Subtask, Task } from "../../../src";

export const title = "Leave and maintenance on the lanes";

export const lead = "A person on leave, a server in maintenance: `BlockedTimes` hatches that time on the lane, and work planned into it is a finding.";

/* Blocked time is data beside the work: one list, each interval naming its
   lane, as a leave table or a maintenance plan holds it. The schedule draws it
   behind everything on the lane - hatched, in the muted ink, in forced colours
   too - and a subtask that covers some of it is marked like an overlap, named
   in its tooltip and counted in what a screen reader hears.

   `findings` takes the same list as its third argument and returns every
   subtask in blocked time with the interval it covers. */

const day = (d: number, hours = 0) => new Date(2026, 2, 16 + d, hours).getTime();

const PEOPLE = [
  { id: "anna", label: "Anna Berg" },
  { id: "ben", label: "Ben Ortiz" },
  { id: "chloe", label: "Chloe Lind" },
  { id: "build", label: "Build server" },
];

const PROJECTS: readonly Task[] = [
  { id: "portal", name: "Customer portal", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "billing", name: "Billing rework", color: "light-dark(#0d9488, #3cc7b8)" },
];

const WORK: readonly Subtask[] = [
  { id: "portal-design", task: "portal", lane: "anna", from: day(0, 9), to: day(1, 17), name: "Design" },
  /* Planned into Anna's leave - the finding. */
  { id: "portal-review", task: "portal", lane: "anna", from: day(2, 13), to: day(3, 12), name: "Design review" },
  { id: "billing-api", task: "billing", lane: "ben", from: day(0, 9), to: day(2, 17), name: "Invoice API" },
  { id: "portal-front", task: "portal", lane: "chloe", from: day(1, 9), to: day(4, 17), name: "Front end" },
  { id: "billing-ci", task: "billing", lane: "build", from: day(3, 9), to: day(3, 15), name: "Release build" },
];

const BLOCKED: readonly BlockedTime[] = [
  { id: "anna-leave", lane: "anna", from: day(3, 0), to: day(5, 0), label: "Leave" },
  { id: "build-maintenance", lane: "build", from: day(1, 18), to: day(2, 12), label: "Maintenance" },
];

const time = (instant: number) =>
  new Date(instant).toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

export default function Leave() {
  const found = findings(WORK, [], BLOCKED);

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Team plan, week of 16 March" initialDomain={[day(0, 6), day(5, 0)]} height={240}>
        {PEOPLE.map((person) => (
          <Lane key={person.id} id={person.id} label={person.label} />
        ))}
        <BlockedTimes data={BLOCKED} />
        <Subtasks data={WORK} tasks={PROJECTS} />
      </Schedule>
      <ul style={{ margin: 0, paddingLeft: 18 }} data-blocked-findings>
        {found.inBlockedTime.map((f) => (
          <li key={`${f.subtask}:${f.blocked}`}>
            <Text size="sm" mono>
              {`${f.subtask} in ${f.blocked}, ${time(f.from)} to ${time(f.to)}`}
            </Text>
          </li>
        ))}
      </ul>
    </Stack>
  );
}
