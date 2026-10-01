import { useState } from "react";
import { Alert, Badge, Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Lane, LaneGroup, Schedule, Subtasks, applyIntent, findings } from "../../src";
import type { BlockedTime, Intent, Subtask } from "../../src";

/* Data from the planning world, written out here so the example runs on its own. */

const at = (day: number, hours = 9, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
const NOW = at(17, 10, 30);

interface Person {
  id: string;
  name: string;
  role: "Developer" | "Designer" | "Product manager" | "QA engineer";
  team: "Web" | "Apps";
  /** Hours a week they can be planned for. */
  capacity: number;
}

const PEOPLE: readonly Person[] = [
  { id: "maya", name: "Maya Lindgren", role: "Product manager", team: "Web", capacity: 32 },
  { id: "arjun", name: "Arjun Mehta", role: "Developer", team: "Web", capacity: 40 },
  { id: "chloe", name: "Chloe Durand", role: "Developer", team: "Web", capacity: 40 },
  { id: "noah", name: "Noah Fischer", role: "Designer", team: "Web", capacity: 24 },
  { id: "eva", name: "Eva Novak", role: "QA engineer", team: "Web", capacity: 40 },
  { id: "luis", name: "Luis Moreno", role: "Product manager", team: "Apps", capacity: 40 },
  { id: "hana", name: "Hana Sato", role: "Developer", team: "Apps", capacity: 40 },
  { id: "kofi", name: "Kofi Mensah", role: "Developer", team: "Apps", capacity: 32 },
  { id: "freya", name: "Freya Olsen", role: "Designer", team: "Apps", capacity: 40 },
  { id: "david", name: "David Kowalski", role: "QA engineer", team: "Apps", capacity: 20 },
];

interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
}

const PROJECTS: readonly Project[] = [
  { id: "shop", name: "Online shop relaunch", client: "Pembury Home", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "booking", name: "Booking app", client: "Saltmarsh Clinics", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "portal", name: "Member portal", client: "Rowan Credit Union", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "intranet", name: "Intranet", client: "Tidewell (internal)", color: "light-dark(#c2410c, #f08a52)" },
];

interface Sprint {
  id: string;
  name: string;
  from: number;
  to: number;
  goal: string;
}

/** Two weeks each, Monday 09:00 to the second Friday 17:00. */
const SPRINTS: readonly Sprint[] = [
  { name: "Sprint 12", day: 9 - 28, goal: "Shop checkout on the new design" },
  { name: "Sprint 13", day: 9 - 14, goal: "Booking app in the stores' beta" },
  { name: "Sprint 14", day: 9, goal: "Member portal sign-in and profile" },
  { name: "Sprint 15", day: 23, goal: "Shop search and filters" },
  { name: "Sprint 16", day: 37, goal: "Booking reminders" },
].map(({ name, day, goal }) => ({ id: name.toLowerCase().replace(" ", "-"), name, from: at(day), to: at(day + 11, 17), goal }));

/** A work item, shaped as `@umriss-ui/schedule`'s `Subtask`. */
interface WorkItem {
  id: string;
  /** The project. */
  task: string;
  /** The person. */
  lane: string;
  from: number;
  to: number;
  name: string;
  sprint: string;
  /** Hours, as estimated at planning. */
  estimate: number;
  status: "to do" | "in progress" | "in review" | "done";
}

const item = (id: string, task: string, lane: string, from: number, to: number, name: string, estimate: number, status: WorkItem["status"]): WorkItem =>
  ({ id, task, lane, from, to, name, sprint: "sprint-14", estimate, status });

const WORK: readonly WorkItem[] = [
  item("w-101", "portal", "arjun", at(9), at(11, 17), "Sign-in with e-mail code", 18, "done"),
  item("w-102", "portal", "arjun", at(12), at(17, 17), "Profile page", 26, "in progress"),
  item("w-103", "portal", "chloe", at(9), at(10, 17), "Session handling", 12, "done"),
  item("w-104", "shop", "chloe", at(11), at(13, 17), "Basket keeps items across devices", 20, "in review"),
  item("w-105", "portal", "chloe", at(16), at(19, 17), "Change of address form", 24, "in progress"),
  item("w-106", "portal", "noah", at(9), at(12, 13), "Profile page design", 14, "done"),
  item("w-107", "shop", "noah", at(16), at(18, 17), "Search results layout", 12, "to do"),
  item("w-108", "portal", "eva", at(12), at(13, 17), "Test plan for sign-in", 10, "done"),
  item("w-109", "portal", "eva", at(17), at(20, 17), "Regression run", 20, "to do"),
  item("w-110", "booking", "hana", at(9), at(13, 17), "Reminder scheduling service", 32, "done"),
  item("w-111", "booking", "hana", at(16), at(20, 17), "Push notifications", 30, "in progress"),
  item("w-112", "booking", "kofi", at(10), at(12, 17), "Calendar sync", 18, "done"),
  item("w-113", "intranet", "kofi", at(16), at(18, 17), "News feed", 16, "in progress"),
  item("w-114", "booking", "freya", at(9), at(11, 17), "Reminder settings screen", 16, "done"),
  item("w-115", "booking", "freya", at(18), at(20, 17), "Store screenshots", 12, "to do"),
  item("w-116", "booking", "david", at(16), at(19, 13), "Device test matrix", 14, "to do"),
];

interface Leave {
  id: string;
  person: string;
  from: number;
  to: number;
  reason: "Holiday" | "Sick" | "Training";
}

/** When people are away: blocked time on their lane. */
const LEAVE: readonly Leave[] = [
  { id: "l-1", person: "noah", from: at(13, 0, 0), to: at(14, 0, 0), reason: "Sick" },
  { id: "l-2", person: "arjun", from: at(18, 0, 0), to: at(21, 0, 0), reason: "Holiday" },
  { id: "l-3", person: "kofi", from: at(13, 0, 0), to: at(14, 0, 0), reason: "Training" },
  { id: "l-4", person: "freya", from: at(16, 0, 0), to: at(18, 0, 0), reason: "Holiday" },
  { id: "l-5", person: "david", from: at(9, 0, 0), to: at(14, 0, 0), reason: "Holiday" },
  { id: "l-6", person: "maya", from: at(19, 13, 0), to: at(20, 17, 0), reason: "Training" },
];

export const title = "Plan the sprint around leave";

export const lead =
  "A team lead checks the running sprint against holidays, sick days and training, and moves the work that lands on someone who is away.";

export const callouts = [
  "The sprint and its goal, as the team agreed it at planning.",
  "People as lanes in their two teams; the axis leaves nights and weekends out.",
  "Leave, sickness and training, hatched on the person's lane - a drag does not put work into it.",
  "Work planned into someone's absence, listed from the same data: drag it onto a teammate and it leaves the list.",
];

export const builtFrom = [
  "schedule",
  "lane-groups",
  "blocked-time",
  "time-axis",
  "where-it-may-go",
  "findings",
  { name: "Alert", page: "@umriss-ui/core#alert" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
];

const SPRINT = SPRINTS.find((one) => one.id === "sprint-14")!;

/* The working days of the sprint: the axis shows these and nothing else. */
const WORKING_DAYS = [9, 10, 11, 12, 13, 16, 17, 18, 19, 20].map((day) => ({
  from: at(day, 8),
  to: at(day, 18),
}));

/* Added after planning, before anyone looked at the leave table. */
const START: readonly Subtask[] = [
  ...WORK,
  {
    id: "w-117",
    task: "portal",
    lane: "arjun",
    from: at(18),
    to: at(19, 17),
    name: "Account deletion",
  },
];

const BLOCKED: readonly BlockedTime[] = LEAVE.map((leave) => ({
  id: leave.id,
  lane: leave.person,
  from: leave.from,
  to: leave.to,
  label: leave.reason,
}));

const teamOf = (person: string) => PEOPLE.find((one) => one.id === person)?.team;
const nameOf = (person: string) => PEOPLE.find((one) => one.id === person)?.name ?? person;

export default function SprintAroundLeave() {
  const [work, setWork] = useState<readonly Subtask[]>(START);

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    setWork((current) => current.map((item) => applyIntent(item, intent)));
  };

  const clashes = findings(work, [], BLOCKED).inBlockedTime;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap data-callout="1">
        <Badge tone="accent">{SPRINT.name}</Badge>
        <Text size="sm">{SPRINT.goal}</Text>
        <Text size="sm" tone="secondary">
          9 to 20 March
        </Text>
      </Stack>
      <div data-callout="2">
        <Schedule
          ariaLabel="Sprint 14, work per person"
          initialDomain={[SPRINT.from, SPRINT.to]}
          calendar={WORKING_DAYS}
          height={570}
          now={NOW}
          intents={["move", "lane"]}
          canMoveTo={(item, lane) => teamOf(item.lane) === teamOf(lane)}
          onIntent={onIntent}
          label={(item) => item.name ?? ""}
        >
          {(["Web", "Apps"] as const).map((team) => (
            <LaneGroup key={team} id={team} label={`${team} team`}>
              {PEOPLE.filter((one) => one.team === team).map((person) => (
                <Lane key={person.id} id={person.id} label={person.name} />
              ))}
            </LaneGroup>
          ))}
          <BlockedTimes data={BLOCKED} />
          <Subtasks data={work} tasks={PROJECTS} />
        </Schedule>
      </div>
      <Text size="sm" tone="secondary" data-callout="3">
        Hatched: away. Work moves between people of one team only.
      </Text>
      <div data-callout="4" data-leave-findings>
        {clashes.length === 0 ? (
          <Alert tone="success" title="The sprint fits around everyone's leave" />
        ) : (
          <Alert
            tone="warning"
            title={`${clashes.length} ${clashes.length === 1 ? "item is" : "items are"} planned into an absence`}
          >
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {clashes.map((found) => {
                const item = work.find((one) => one.id === found.subtask);
                const reason = BLOCKED.find((one) => one.id === found.blocked)?.label ?? "leave";
                return (
                  <li
                    key={`${found.subtask}:${found.blocked}`}
                  >{`${item?.name ?? found.subtask}: ${nameOf(found.lane)} is away (${reason.toLowerCase()})`}</li>
                );
              })}
            </ul>
          </Alert>
        )}
      </div>
    </Stack>
  );
}
