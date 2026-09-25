import { Lane, LaneGroup, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Group lanes under a head";

export const lead = "Wrap lanes in a `LaneGroup`: a slim head names the team and counts its lanes, and its chevron folds it.";

/* Declared by composition: a lane never names its group, so moving a person
   to another team is moving a line of JSX. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [
  { id: "portal", name: "Member portal", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "shop", name: "Online shop relaunch", color: "light-dark(#2563eb, #6b9bff)" },
];

const WORK: Subtask[] = [
  { id: "w-102", task: "portal", lane: "arjun", from: at(7), to: at(9), leadIn: min(30) },
  { id: "w-104", task: "shop", lane: "chloe", from: at(8), to: at(10, 30), leadOut: min(15) },
  { id: "w-106", task: "portal", lane: "noah", from: at(10), to: at(12) },
  { id: "w-108", task: "shop", lane: "eva", from: at(11, 30), to: at(14) },
];

export default function AGroup() {
  return (
    <Schedule ariaLabel="Two developers in a team, a designer and a tester outside it" initialDomain={[at(6), at(15)]} height={240}>
      <LaneGroup id="developers" label="Developers">
        <Lane id="arjun" label="Arjun Mehta" />
        <Lane id="chloe" label="Chloe Durand" />
      </LaneGroup>
      <Lane id="noah" label="Noah Fischer" />
      <Lane id="eva" label="Eva Novak" />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
