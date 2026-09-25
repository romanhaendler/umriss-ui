import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Move work in time";

export const lead = "List `move` in `intents` and apply what `onIntent` reports with `applyIntent`; the plan changes only in your state.";

const day = (d: number, hours = 9) => new Date(2026, 2, d, hours).getTime();

const PROJECTS: readonly Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#7c3aed, #a98bfa)" }];

const START: readonly Subtask[] = [
  { id: "w-102", task: "portal", lane: "arjun", from: day(17), to: day(18, 17), name: "Profile page" },
  { id: "w-105", task: "portal", lane: "chloe", from: day(18), to: day(19, 17), name: "Change of address form" },
];

export default function MoveInTime() {
  const [work, setWork] = useState(START);
  return (
    <Schedule
      ariaLabel="Two people's work this week"
      initialDomain={[day(16, 0), day(21, 0)]}
      height={140}
      intents={["move"]}
      onIntent={(intent) => setWork((current) => current.map((item) => applyIntent(item, intent)))}
    >
      <Lane id="arjun" label="Arjun Mehta" />
      <Lane id="chloe" label="Chloe Durand" />
      <Subtasks data={work} tasks={PROJECTS} />
    </Schedule>
  );
}
