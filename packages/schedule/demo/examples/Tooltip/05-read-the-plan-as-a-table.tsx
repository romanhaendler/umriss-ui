import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Read the plan as a table";

export const lead =
  "Place `DataTable` inside the schedule and a Show data key opens the subtasks in view as a table - lane, task, subtask, from and to with their dates, duration and findings. Press it: batch B-2 runs across midnight and overlaps B-1.";

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const BATCHES: readonly Task[] = [
  { id: "b-1", name: "Batch B-1 Oat drink", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "b-2", name: "Batch B-2 Almond drink", color: "light-dark(#c2410c, #f08a52)" },
];

/* B-2 starts on the mixer before B-1 has left it, and runs on past midnight. */
const STEPS: readonly Subtask[] = [
  { id: "b-1-mix", task: "b-1", lane: "mixer", from: at(17, 21), to: at(18, 1), name: "Mix", leadIn: min(15) },
  { id: "b-1-fill", task: "b-1", lane: "filler", from: at(18, 1, 30), to: at(18, 4), name: "Fill" },
  { id: "b-2-mix", task: "b-2", lane: "mixer", from: at(17, 23, 30), to: at(18, 3), name: "Mix" },
  { id: "b-2-fill", task: "b-2", lane: "filler", from: at(18, 4, 30), to: at(18, 6), name: "Fill", leadOut: min(30) },
];

export default function PlanAsTable() {
  const { Schedule, Lane, Subtasks, DataTable } = useSchedule({ initialView: { domain: [at(17, 20), at(18, 7)] } });
  return (
    <Schedule aria-label="Two batches over the night shift, as a plan and as a table" height={300}>
      <Lane id="mixer" label="Mixer" />
      <Lane id="filler" label="Filling line" />
      <Subtasks data={STEPS} tasks={BATCHES} />
      <DataTable />
    </Schedule>
  );
}
