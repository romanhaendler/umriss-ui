import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Progress: how far the work has got";

/* `progress` is not an appearance but a share from 0 to 1, and it owns a RAIL:
   a band inside the main time, set in from the bar's lower edge so that it is
   a mark ON the bar and not the bar's own edge.

   Inside the main time, and stopping where it stops: progress measures the
   WORK, and a rail running on under the teardown would be measuring the
   clearing away as well. The bar below carries a teardown, so that can be
   seen.

   A rail rather than a paler remainder, for the reason every appearance here
   has: a paler part of a bar is preparation in this picture.

   Leaving `progress` out claims nothing at all. A bar at zero per cent and a
   bar that says nothing about progress are two different statements, and the
   top lane is the second of them. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "order", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "unclaimed", task: "order", lane: "unclaimed", from: at(7), to: at(10) },
  { id: "started", task: "order", lane: "started", from: at(7), to: at(10), progress: 0.65, teardown: min(30) },
];

export default function Progress() {
  return (
    <Schedule ariaLabel="Work claiming nothing above, work at 65 per cent below" initialDomain={[at(6, 30), at(11)]} height={144}>
      <Lane id="unclaimed" label="Says nothing" />
      <Lane id="started" label="65 per cent done" />
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
