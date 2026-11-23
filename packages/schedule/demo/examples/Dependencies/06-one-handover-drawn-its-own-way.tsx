import { useSchedule } from "../../../src";
import type { Subtask, Task, Dependency } from "../../../src";

export const title = "Draw one handover its own way";

export const lead = "A dependency's own `attach` and `endMarks` override the schedule's for that one line: here the sign-off joins the middles and marks its ends, the rest stay quiet.";

/* Picture only, like the schedule's own `attach` and `endMarks`: the finding
   follows from `leaves` and `arrives` alone. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "design", task: "portal", lane: "noah", from: at(7), to: at(8), name: "Design" },
  { id: "build", task: "portal", lane: "arjun", from: at(8, 30), to: at(9, 30), name: "Build" },
  { id: "test", task: "portal", lane: "eva", from: at(10), to: at(11), name: "Test" },
  { id: "sign-off", task: "portal", lane: "noah", from: at(11, 30), to: at(12), name: "Sign-off" },
];

const HANDOVERS: Dependency[] = [
  { id: "to-build", predecessor: "design", successor: "build", lag: min(15) },
  { id: "to-test", predecessor: "build", successor: "test", lag: min(15) },
  /* The one that matters: the designer signs off what was tested. */
  { id: "to-sign-off", predecessor: "test", successor: "sign-off", lag: min(15), attach: "centre", endMarks: "dot" },
];

export default function OneHandoverDrawnItsOwnWay() {
  const { Schedule, Lane, Subtasks, Dependencies } = useSchedule({ initialView: { domain: [at(6, 30), at(12, 30)] } });
  return (
    <Schedule aria-label="Design, build, test and a sign-off drawn its own way" height={188} attach="nearest" endMarks="none">
      <Lane id="noah" label="Noah Fischer" />
      <Lane id="arjun" label="Arjun Mehta" />
      <Lane id="eva" label="Eva Novak" />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
