import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { applyIntent, useSchedule } from "../../../src";
import type { BlockedTime, Intent, Subtask } from "../../../src";

/* Data from the planning world, written out here so the example runs on its own. */

const at = (day: number, hours = 9, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

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

export const title = "Keep work out of someone's leave";

export const lead = "Blocked time refuses a place in time where `canMoveTo` refuses a lane; both hold together, and neither wears a warning colour.";

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();

const APPS = PEOPLE.filter((person) => person.team === "Apps" && person.role !== "Product manager");
const START: readonly Subtask[] = WORK.filter((item) => APPS.some((person) => person.id === item.lane));
const AWAY: readonly BlockedTime[] = LEAVE.filter((leave) => APPS.some((person) => person.id === leave.person)).map((leave) => ({
  id: leave.id,
  lane: leave.person,
  from: leave.from,
  to: leave.to,
  label: leave.reason,
}));

/* Work stays with people of the role it was planned for. */
const roleOf = (lane: string) => PEOPLE.find((person) => person.id === lane)?.role;
const START_ROLE = new Map(START.map((item) => [item.id, roleOf(item.lane)]));
const mayGo = (item: Subtask, lane: string) => START_ROLE.get(item.id) === roleOf(lane);

export default function AroundLeave() {
  const { Schedule, Lane, Subtasks, BlockedTimes } = useSchedule();
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [last, setLast] = useState("Drag Freya's store screenshots into her holiday");

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    setWork((current) => current.map((item) => applyIntent(item, intent)));
    setLast(`${intent.subtask}: ${intent.kind}`);
  };

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="The apps team this week, with leave"
        initialDomain={[day(9), day(21)]}
        height={236}
        intents={["move", "lane"]}
        canMoveTo={mayGo}
        onIntent={onIntent}
      >
        {APPS.map((person) => (
          <Lane key={person.id} id={person.id} label={`${person.name}, ${person.role}`} />
        ))}
        <BlockedTimes data={AWAY} />
        <Subtasks data={work} tasks={PROJECTS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-move>
        {last}
      </Text>
    </Stack>
  );
}
