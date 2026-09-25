import { useState } from "react";
import { Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Change lead-in and lead-out";

export const lead = "Add `leadIn` and `leadOut`: a selected tour shows a grip for its loading and its unloading, each changed on its own.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TOURS: Task[] = [{ id: "north", name: "North depot tours", color: "light-dark(#0d9488, #3cc7b8)" }];

/* Lead-in is loading at the depot, lead-out unloading the returns. */
const START: Subtask[] = [
  { id: "T-01", task: "north", lane: "van-214", from: at(8), to: at(10), leadIn: min(30), leadOut: min(15) },
  { id: "T-02", task: "north", lane: "van-377", from: at(11), to: at(12, 30), leadIn: min(15) },
];

export default function ChangeLeadInAndLeadOut() {
  const [tours, setTours] = useState(START);

  return (
    <Schedule
      ariaLabel="Two tours from North depot"
      initialDomain={[at(6), at(13, 30)]}
      height={150}
      intents={["stretch", "leadIn", "leadOut"]}
      onIntent={(intent) => setTours((current) => current.map((tour) => applyIntent(tour, intent)))}
    >
      <Lane id="van-214" label="Van FP 214 K" />
      <Lane id="van-377" label="E-van FP 377 K" />
      <Subtasks data={tours} tasks={TOURS} />
    </Schedule>
  );
}
