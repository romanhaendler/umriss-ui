import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Write into the bars";

export const lead = "`label` returns the text for each bar: here the work item's name, cut where the bar is narrow and left out of the short reviews.";

/* Pan into the afternoon: a bar that begins before the view keeps its text at
   the edge, the way the day band keeps its date. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY: readonly [number, number] = [at(5, 30), at(18)];

const PEOPLE = [
  { id: "arjun", label: "Arjun Mehta" },
  { id: "chloe", label: "Chloe Durand" },
  { id: "eva", label: "Eva Novak" },
];

const PROJECTS: readonly Task[] = [
  { id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "shop", name: "Online shop relaunch", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "booking", name: "Booking app", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const WORK: readonly Subtask[] = [
  { id: "w-102", task: "portal", lane: "arjun", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15), name: "Profile page" },
  { id: "w-104", task: "shop", lane: "chloe", from: at(9, 30), to: at(10, 45), leadIn: min(25), name: "Basket keeps items across devices" },
  { id: "w-108", task: "portal", lane: "eva", from: at(11, 30), to: at(12, 15), name: "Test plan review" },
  { id: "w-116", task: "booking", lane: "eva", from: at(15), to: at(15, 30), name: "Device check" },
];

export default function BarLabels() {
  return (
    <Schedule
      ariaLabel="Tuesday, 17 March, with the work items written in"
      initialDomain={DAY}
      height={196}
      label={(subtask) => subtask.name ?? subtask.id}
    >
      {PEOPLE.map((person) => (
        <Lane key={person.id} id={person.id} label={person.label} />
      ))}
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
