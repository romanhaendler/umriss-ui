import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Fixed";

export const lead = "A delivery slot the customer booked may not move: `\"fixed\"` sets a cap inside each end and keeps the face clear for the label.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const TOURS: Task[] = [{ id: "t-05", name: "T-05 Riverside", color: "light-dark(#2563eb, #6b9bff)" }];

const LEGS: Subtask[] = [
  { id: "movable", task: "t-05", lane: "movable", from: at(7), to: at(10) },
  { id: "nailed", task: "t-05", lane: "nailed", from: at(7), to: at(10), appearance: ["fixed"] },
];

export default function Fixed() {
  return (
    <Schedule
      ariaLabel="A round that may move above, a booked slot below"
      initialDomain={[at(6, 30), at(11)]}
      height={144}
      label={(leg) => (leg.id === "nailed" ? "T-05 · booked slot" : "T-05")}
    >
      <Lane id="movable" label="May move" />
      <Lane id="nailed" label="Fixed" />
      <Subtasks data={LEGS} tasks={TOURS} />
    </Schedule>
  );
}
