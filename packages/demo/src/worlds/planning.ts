/**
 * The planning world: Tidewell, a small studio that builds web and mobile
 * apps for its clients, in two teams.
 *
 * The standing cast:
 * - `PEOPLE` - ten people with their role, team and weekly capacity in hours;
 * - `PROJECTS` - four client projects, each with a colour;
 * - `SPRINTS` - two-week sprints; sprint 14 runs now, 9 to 20 March;
 * - `WORK` - the current sprint's work items with an estimate and a status,
 *   placed on a person over time; structurally a `Subtask` of
 *   `@umriss-ui/schedule` (`task` is the project, `lane` the person);
 * - `LEAVE` - holidays, sick days and training, to become blocked time;
 * - `BURNDOWN` - sprint 14's remaining hours at the end of each working day,
 *   up to yesterday.
 *
 * "Now" is Tuesday, 17 March 2026, 10:30 local time. Plain data and small pure
 * functions, no imports: copy the file beside an example and it runs.
 */

const at = (day: number, hours = 9, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

/** Tuesday, 17 March 2026, 10:30 - the moment the screens are read at. */
export const NOW = at(17, 10, 30);

export interface Person {
  id: string;
  name: string;
  role: "Developer" | "Designer" | "Product manager" | "QA engineer";
  team: "Web" | "Apps";
  /** Hours a week they can be planned for. */
  capacity: number;
}

export const PEOPLE: readonly Person[] = [
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

/** A project, shaped as `@umriss-ui/schedule`'s `Task`: an id, a name and a
    colour in both schemes. */
export interface Project {
  id: string;
  name: string;
  client: string;
  color: string;
}

export const PROJECTS: readonly Project[] = [
  { id: "shop", name: "Online shop relaunch", client: "Pembury Home", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "booking", name: "Booking app", client: "Saltmarsh Clinics", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "portal", name: "Member portal", client: "Rowan Credit Union", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "intranet", name: "Intranet", client: "Tidewell (internal)", color: "light-dark(#c2410c, #f08a52)" },
];

export interface Sprint {
  id: string;
  name: string;
  from: number;
  to: number;
  goal: string;
}

/** Two weeks each, Monday 09:00 to the second Friday 17:00. */
export const SPRINTS: readonly Sprint[] = [
  { name: "Sprint 12", day: 9 - 28, goal: "Shop checkout on the new design" },
  { name: "Sprint 13", day: 9 - 14, goal: "Booking app in the stores' beta" },
  { name: "Sprint 14", day: 9, goal: "Member portal sign-in and profile" },
  { name: "Sprint 15", day: 23, goal: "Shop search and filters" },
  { name: "Sprint 16", day: 37, goal: "Booking reminders" },
].map(({ name, day, goal }) => ({ id: name.toLowerCase().replace(" ", "-"), name, from: at(day), to: at(day + 11, 17), goal }));

/** A work item, shaped as `@umriss-ui/schedule`'s `Subtask`. */
export interface WorkItem {
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

export const WORK: readonly WorkItem[] = [
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

export interface Leave {
  id: string;
  person: string;
  from: number;
  to: number;
  reason: "Holiday" | "Sick" | "Training";
}

/** When people are away: blocked time on their lane. */
export const LEAVE: readonly Leave[] = [
  { id: "l-1", person: "noah", from: at(13, 0, 0), to: at(14, 0, 0), reason: "Sick" },
  { id: "l-2", person: "arjun", from: at(18, 0, 0), to: at(21, 0, 0), reason: "Holiday" },
  { id: "l-3", person: "kofi", from: at(13, 0, 0), to: at(14, 0, 0), reason: "Training" },
  { id: "l-4", person: "freya", from: at(16, 0, 0), to: at(18, 0, 0), reason: "Holiday" },
  { id: "l-5", person: "david", from: at(9, 0, 0), to: at(14, 0, 0), reason: "Holiday" },
  { id: "l-6", person: "maya", from: at(19, 13, 0), to: at(20, 17, 0), reason: "Training" },
];

export interface BurndownPoint {
  /** The working day, at 17:00. */
  t: number;
  /** Where the line would be, burning evenly. */
  ideal: number;
  /** Hours left, `null` for the days still to come. */
  remaining: number | null;
}

/** Sprint 14's ten working days. The team fell behind in the first week, when
    two were away, and is catching up. */
export const BURNDOWN: readonly BurndownPoint[] = (() => {
  const total = WORK.reduce((sum, one) => sum + one.estimate, 0);
  const days = [9, 10, 11, 12, 13, 16, 17, 18, 19, 20];
  const burnt = [0, 22, 38, 60, 71, 98];
  return days.map((day, i) => ({
    t: at(day, 17),
    ideal: Math.round(total * (1 - i / (days.length - 1))),
    remaining: burnt[i] === undefined ? null : total - burnt[i]!,
  }));
})();
