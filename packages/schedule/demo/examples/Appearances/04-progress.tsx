import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Progress";

export const lead = "`progress` from 0 to 1 draws a rail inside the main time; left out, the bar claims nothing - which is not zero per cent.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "unclaimed", task: "portal", lane: "unclaimed", from: at(7), to: at(10) },
  { id: "started", task: "portal", lane: "started", from: at(7), to: at(10), progress: 0.65, leadOut: min(30) },
];

export default function Progress() {
  return (
    <Schedule ariaLabel="Work claiming nothing above, work at 65 per cent below" initialDomain={[at(6, 30), at(11)]} height={144}>
      <Lane id="unclaimed" label="Says nothing" />
      <Lane id="started" label="65 per cent done" />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
