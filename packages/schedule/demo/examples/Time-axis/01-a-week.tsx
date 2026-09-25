import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";
import { ENGINEERS, ONCALL } from "@umriss-ui/demo/worlds/operations";

export const title = "Show a week on one axis";

export const lead = "A week of the on-call rota: the day band names each day, and the time band's step follows the zoom.";

const ROTATIONS: Task[] = [
  { id: "primary", name: "Primary", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "secondary", name: "Secondary", color: "light-dark(#0d9488, #3cc7b8)" },
];

const DUTIES: Subtask[] = ONCALL.map((duty) => ({ id: duty.id, task: duty.rotation, lane: duty.engineer, from: duty.from, to: duty.to }));

const WEEK: readonly [number, number] = [new Date(2026, 2, 16).getTime(), new Date(2026, 2, 23, 12).getTime()];

export default function AWeek() {
  return (
    <Schedule ariaLabel="On-call rota, 16 to 23 March" initialDomain={WEEK} height={420}>
      {ENGINEERS.map((engineer) => (
        <Lane key={engineer.id} id={engineer.id} label={engineer.name} />
      ))}
      <Subtasks data={DUTIES} tasks={ROTATIONS} />
    </Schedule>
  );
}
