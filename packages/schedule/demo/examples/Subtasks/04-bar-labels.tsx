import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "What a bar says";

/* `label` writes a line into every bar: the order, the article, the quantity -
   whatever a planner reads first. The text lies on the main time, because the
   setup is not the work.

   It is cut off with an ellipsis where the bar is too narrow, and left out
   where even a word and an ellipsis would say nothing - the inspections at the
   bottom are minutes long, and a row of dots in them would be worse than
   nothing. A bar that begins before the view keeps its text at the edge, the
   way the day band keeps its date: pan into the afternoon and watch the labels
   stay.

   The text's colour follows the bar's: the schedule reads the brightness of
   the colour the caller gave the task and puts light text on a dark bar and
   dark text on a pale one. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "qa", label: "Inspection" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2044", name: "A-2044 Flange", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "a-2046", name: "A-2046 Axle", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), setup: min(30), teardown: min(15) },
  { id: "a-2044-2", task: "a-2044", lane: "press", from: at(9, 30), to: at(10, 45), setup: min(25) },
  { id: "a-2041-3", task: "a-2041", lane: "qa", from: at(11, 30), to: at(12, 15) },
  { id: "a-2046-3", task: "a-2046", lane: "qa", from: at(15), to: at(15, 30) },
];

const ORDER_NAMES = new Map(ORDERS.map((order) => [order.id, order.name ?? order.id]));

export default function BarLabels() {
  return (
    <Schedule
      ariaLabel="Plan of Tuesday, 17 March, with the orders written in"
      initialDomain={DAY_OF_PLAN}
      height={196}
      label={(subtask) => ORDER_NAMES.get(subtask.task) ?? subtask.task}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
