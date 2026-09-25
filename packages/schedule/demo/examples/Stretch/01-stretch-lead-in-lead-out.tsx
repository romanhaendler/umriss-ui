import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Stretching, lead-in and lead-out";

/* The edges of the main time stretch it (`stretch`). Lead-in and lead-out have
   grips of their own, and they appear only on the selected subtask: a plan
   where every bar bristles with handles is a plan nobody can read. Click a
   subtask, then drag the grip at its outer edge (`leadIn`, `leadOut`).

   Each is changed on its own - stretching the main time leaves the lead-in as
   long as it was. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "shaft", color: "light-dark(#0d9488, #3cc7b8)" }];

const START: Subtask[] = [
  { id: "turn", task: "shaft", lane: "lathe", from: at(8), to: at(10), leadIn: min(30), leadOut: min(15) },
  { id: "grind", task: "shaft", lane: "grinder", from: at(11), to: at(12, 30), leadIn: min(15) },
];

export default function StretchLeadInLeadOut() {
  const [work, setWork] = useState(START);

  return (
    <Schedule
      ariaLabel="A shaft on the lathe and the grinder"
      initialDomain={[at(6), at(13, 30)]}
      height={150}
      intents={["stretch", "leadIn", "leadOut"]}
      onIntent={(intent) => setWork((current) => current.map((s) => applyIntent(s, intent)))}
    >
      <Lane id="lathe" label="Lathe" />
      <Lane id="grinder" label="Grinder" />
      <Subtasks data={work} tasks={TASKS} />
    </Schedule>
  );
}
