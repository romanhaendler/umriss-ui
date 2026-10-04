import { Lane, LaneGroup, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Start with groups folded";

export const lead = "`defaultCollapsedGroups` folds groups when the schedule mounts and leaves the rest to the planner: Discovery starts folded, and its chevron opens it.";

/* Uncontrolled: the schedule keeps the fold from here on. To store it or
   steer it, pass `collapsedGroups` instead. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TASKS: Task[] = [{ id: "release", name: "Release 4.12", color: "light-dark(#0d9488, #3cc7b8)" }];

const WORK: Subtask[] = [
  { id: "s1", task: "release", lane: "priya", from: at(7), to: at(9) },
  { id: "s2", task: "release", lane: "jonas", from: at(9, 30), to: at(11) },
  { id: "s3", task: "release", lane: "tomasz", from: at(11, 30), to: at(13) },
  { id: "s4", task: "release", lane: "leila", from: at(13), to: at(14, 30) },
];

export default function StartWithGroupsFolded() {
  return (
    <Schedule
      ariaLabel="Two teams rolling out a release, Discovery folded at the start"
      initialDomain={[at(6), at(15)]}
      height={280}
      defaultCollapsedGroups={["discovery"]}
    >
      <LaneGroup id="payments" label="Payments">
        <Lane id="priya" label="Priya Raman" />
        <Lane id="jonas" label="Jonas Keller" />
      </LaneGroup>
      <LaneGroup id="discovery" label="Discovery">
        <Lane id="tomasz" label="Tomasz Nowak" />
        <Lane id="leila" label="Leila Haddad" />
      </LaneGroup>
      <Subtasks data={WORK} tasks={TASKS} />
    </Schedule>
  );
}
