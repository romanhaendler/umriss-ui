import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Start from an empty plan";

export const lead = "With nothing planned yet, `Subtasks` gets an empty array: the lanes and the time axis still stand, ready for the first drop.";

const at = (day: number, hours: number) => new Date(2026, 2, day, hours).getTime();

const PROJECTS: Task[] = [];
const WORK: Subtask[] = [];

const PEOPLE = [
  { id: "hana", label: "Hana Sato" },
  { id: "kofi", label: "Kofi Mensah" },
  { id: "freya", label: "Freya Olsen" },
];

export default function NoWorkYet() {
  return (
    <Schedule ariaLabel="Sprint 15, nothing planned yet" initialDomain={[at(23, 8), at(27, 18)]} height={170}>
      {PEOPLE.map((person) => (
        <Lane key={person.id} id={person.id} label={person.label} />
      ))}
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
