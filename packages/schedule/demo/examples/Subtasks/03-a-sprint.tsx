import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask } from "../../../src";
import { PEOPLE, PROJECTS, WORK } from "@umriss-ui/demo/worlds/planning";

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
