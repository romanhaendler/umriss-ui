import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Fill a pane of fixed height";

export const lead = "Without `height`, a schedule takes the height of its frame: this pane is 480 px, and the schedule is exactly that, bands included. Drag the pane's corner and the schedule follows.";

const at = (hours: number) => new Date(2026, 2, 17, hours).getTime();

const ORDERS: Task[] = [{ id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" }];

const STEPS: Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10) },
  { id: "a-2041-3", task: "a-2041", lane: "qa", from: at(11), to: at(12) },
];

export default function FillsItsPane() {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [at(5), at(13)] } });
  return (
    <div data-pane="" style={{ height: 480, resize: "vertical", overflow: "hidden" }}>
      <Schedule ariaLabel="Plan of Tuesday in a pane">
        <Lane id="saw" label="Saw" />
        <Lane id="mill" label="Mill" />
        <Lane id="qa" label="Inspection" />
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
    </div>
  );
}
