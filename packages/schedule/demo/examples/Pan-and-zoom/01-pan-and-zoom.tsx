import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Move through the plan";

export const lead = "Drag, wheel, Ctrl with the wheel and a pinch need nothing switched on; `zoomLimits` only bounds the span, here two hours to two days.";

/* Without `zoomLimits` the span may run from an hour to twenty-eight days. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;
const HOUR = 60 * 60_000;

const TASKS: Task[] = [
  { id: "release", name: "Release 4.12", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "inc-1048", name: "INC-1048 follow-up", color: "light-dark(#c2410c, #f08a52)" },
];

const ENGINEERS = [
  { id: "priya", label: "Priya Raman" },
  { id: "jonas", label: "Jonas Keller" },
  { id: "ada", label: "Ada Mwangi" },
];

const WORK: Subtask[] = [
  { id: "build", task: "release", lane: "priya", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "rollout", task: "release", lane: "jonas", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "timeline", task: "inc-1048", lane: "ada", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "postmortem", task: "inc-1048", lane: "jonas", from: at(12), to: at(13, 30), leadIn: min(15) },
];

export default function PanAndZoom() {
  return (
    <Schedule
      ariaLabel="A plan to pan and zoom"
      initialDomain={[at(5, 30), at(18)]}
      height={196}
      zoomLimits={{ min: 2 * HOUR, max: 48 * HOUR }}
    >
      {ENGINEERS.map((engineer) => (
        <Lane key={engineer.id} id={engineer.id} label={engineer.label} />
      ))}
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
