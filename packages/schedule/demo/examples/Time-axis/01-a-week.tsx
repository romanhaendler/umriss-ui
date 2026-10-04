import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

interface Engineer {
  id: string;
  name: string;
  team: string;
}

const ENGINEERS: readonly Engineer[] = [
  { id: "priya", name: "Priya Raman", team: "Payments" },
  { id: "jonas", name: "Jonas Keller", team: "Payments" },
  { id: "ada", name: "Ada Mwangi", team: "Identity" },
  { id: "tomasz", name: "Tomasz Nowak", team: "Discovery" },
  { id: "leila", name: "Leila Haddad", team: "Discovery" },
  { id: "sam", name: "Sam Okafor", team: "Messaging" },
  { id: "ines", name: "Ines Duarte", team: "Integrations" },
  { id: "felix", name: "Felix Brandt", team: "Insights" },
];

interface OnCall {
  id: string;
  engineer: string;
  rotation: "primary" | "secondary";
  from: number;
  to: number;
}

/** Monday 16 to Monday 23 March, handed over every morning at 09:00: the
    secondary of one day is the primary of the next. */
const ONCALL: readonly OnCall[] = Array.from({ length: 7 }, (_, day) => [
  { rotation: "primary" as const, engineer: ENGINEERS[day % ENGINEERS.length]!.id },
  { rotation: "secondary" as const, engineer: ENGINEERS[(day + 1) % ENGINEERS.length]!.id },
].map(({ rotation, engineer }) => ({
  id: `${rotation}-${16 + day}`,
  engineer,
  rotation,
  from: at(16 + day, 9),
  to: at(17 + day, 9),
}))).flat();

export const title = "Show a week on one axis";

export const lead = "A week of the on-call rota: the day band names each day, and the time band's step follows the zoom.";

const ROTATIONS: Task[] = [
  { id: "primary", name: "Primary", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "secondary", name: "Secondary", color: "light-dark(#0d9488, #3cc7b8)" },
];

const DUTIES: Subtask[] = ONCALL.map((duty) => ({ id: duty.id, task: duty.rotation, lane: duty.engineer, from: duty.from, to: duty.to }));

const WEEK: readonly [number, number] = [new Date(2026, 2, 16).getTime(), new Date(2026, 2, 23, 12).getTime()];

export default function AWeek() {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: WEEK } });
  return (
    <Schedule ariaLabel="On-call rota, 16 to 23 March" height={420}>
      {ENGINEERS.map((engineer) => (
        <Lane key={engineer.id} id={engineer.id} label={engineer.name} />
      ))}
      <Subtasks data={DUTIES} tasks={ROTATIONS} />
    </Schedule>
  );
}
