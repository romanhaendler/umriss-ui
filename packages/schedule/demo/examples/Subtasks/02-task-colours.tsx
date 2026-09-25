import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Colour by what the task means";

export const lead = "Every subtask of a task shares its `color`, and the meaning is yours: here the two projects due this week are in the danger colour.";

/* A subtask whose task is missing from `tasks` is drawn muted: it is on the
   plan, and nobody said what it is. */

const at = (day: number, hours: number) => new Date(2026, 2, day, hours).getTime();

const PROJECTS: Task[] = [
  { id: "portal", name: "Member portal", color: "var(--u-color-danger)" },
  { id: "booking", name: "Booking app", color: "var(--u-color-danger)" },
  { id: "intranet", name: "Intranet", color: "var(--u-color-accent)" },
];

const WORK: Subtask[] = [
  { id: "w-105", task: "portal", lane: "chloe", from: at(16, 9), to: at(17, 17) },
  { id: "w-109", task: "portal", lane: "eva", from: at(18, 9), to: at(19, 17) },
  { id: "w-111", task: "booking", lane: "chloe", from: at(18, 9), to: at(19, 13) },
  { id: "w-113", task: "intranet", lane: "eva", from: at(16, 9), to: at(17, 13) },
  { id: "w-120", task: "not-listed", lane: "chloe", from: at(19, 14), to: at(20, 17) },
];

export default function TaskColours() {
  return (
    <Schedule ariaLabel="Projects due this week among the rest" initialDomain={[at(16, 6), at(20, 20)]} height={150}>
      <Lane id="chloe" label="Chloe Durand" />
      <Lane id="eva" label="Eva Novak" />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
