import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask } from "../../../src";

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

export const title = "Plan a sprint for a team";

export const lead = "Work items straight from the team's tracker: the person is the lane, the project the task, and `name` is what the tooltip calls each one.";

const SUBTASKS: Subtask[] = WORK.map((item): Subtask => ({
  ...item,
  /* Not started yet: drawn hollow, as planned but not begun. */
  ...(item.status === "to do" ? { appearance: ["provisional"] } : {}),
}));

const SPRINT_14: readonly [number, number] = [new Date(2026, 2, 9, 6).getTime(), new Date(2026, 2, 21).getTime()];

export default function ASprint() {
  return (
    <Schedule ariaLabel="Sprint 14, 9 to 20 March" initialDomain={SPRINT_14} height={500} label={(s) => s.name ?? s.id}>
      {PEOPLE.map((person) => (
        <Lane key={person.id} id={person.id} label={person.name} />
      ))}
      <Subtasks data={SUBTASKS} tasks={PROJECTS} />
    </Schedule>
  );
}
