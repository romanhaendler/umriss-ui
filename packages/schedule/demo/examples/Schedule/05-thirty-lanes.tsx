import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Thirty lanes, a floor of 400 px";

export const lead = "In a block with no height, a schedule is 400 px whatever its lanes. The lanes beyond the plot scroll inside it, and the page does not grow.";

const at = (hours: number) => new Date(2026, 2, 17, hours).getTime();

const ORDERS: Task[] = [{ id: "round", name: "Round", color: "light-dark(#0d9488, #3cc7b8)" }];

const STATIONS = Array.from({ length: 30 }, (_, index) => ({ id: `s-${index + 1}`, label: `Station ${index + 1}` }));

const STEPS: Subtask[] = STATIONS.map((station, index) => ({
  id: `round-${index + 1}`,
  task: "round",
  lane: station.id,
  from: at(6 + (index % 6)),
  to: at(7 + (index % 6)),
}));

export default function ThirtyLanes() {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [at(5), at(14)] } });
  return (
    <Schedule ariaLabel="Round of thirty stations">
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
