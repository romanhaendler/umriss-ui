import { useState } from "react";
import { Dependencies, Lane, Schedule, Subtasks, applyIntent, ripple } from "../../../src";
import type { Dependency, Intent, Subtask, Task } from "../../../src";

export const title = "Ripple on every drag";

export const lead = "Run `ripple` inside `onIntent` and apply its moves with the drop: drag the design later and build and test follow.";

const day = (d: number, hours = 9) => new Date(2026, 2, d, hours).getTime();

const PROJECTS: readonly Task[] = [{ id: "shop", name: "Online shop relaunch", color: "light-dark(#2563eb, #6b9bff)" }];

const START: readonly Subtask[] = [
  { id: "design", task: "shop", lane: "noah", from: day(16), to: day(17, 17), name: "Search results layout" },
  { id: "build", task: "shop", lane: "chloe", from: day(18), to: day(19, 17), name: "Search results page" },
  { id: "test", task: "shop", lane: "eva", from: day(20), to: day(20, 17), name: "Search regression run" },
];

/* Each step waits for the one before it; a hand-over takes a morning. */
const HANDOVERS: readonly Dependency[] = [
  { id: "to-build", from: "design", to: "build", lag: 4 * 60 * 60_000 },
  { id: "to-test", from: "build", to: "test", lag: 4 * 60 * 60_000 },
];

export default function RippleOnEveryDrag() {
  const [work, setWork] = useState<readonly Subtask[]>(START);

  const onIntent = (intent: Intent) =>
    setWork((current) => {
      const moved = current.map((item) => applyIntent(item, intent));
      return ripple(current, HANDOVERS, intent).reduce((data, push) => data.map((item) => applyIntent(item, push)), moved);
    });

  return (
    <Schedule
      ariaLabel="Design, build and test of the shop search, rippling"
      initialDomain={[day(16, 0), day(24, 0)]}
      height={184}
      intents={["move", "stretch"]}
      onIntent={onIntent}
    >
      <Lane id="noah" label="Noah Fischer" />
      <Lane id="chloe" label="Chloe Durand" />
      <Lane id="eva" label="Eva Novak" />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={work} tasks={PROJECTS} />
    </Schedule>
  );
}
