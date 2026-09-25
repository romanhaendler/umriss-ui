import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";
import { NOW, TOURS, VEHICLES } from "@umriss-ui/demo/worlds/logistics";

export const title = "Mark the present";

export const lead = "Pass an instant to `now` and a line crosses the lanes there: a dispatcher at 10:30 sees which tours are under way.";

/* A fixed instant suits a replay and a picture that must hold still; in a
   live application `now` alone follows the clock - the next example. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const COLORS = ["light-dark(#2563eb, #6b9bff)", "light-dark(#0d9488, #3cc7b8)", "light-dark(#c2410c, #f08a52)", "light-dark(#7c3aed, #a98bfa)"];

const TASKS: Task[] = TOURS.map((tour, i) => ({ id: tour.id, name: tour.id, color: COLORS[i % COLORS.length]! }));

const ROUNDS: Subtask[] = TOURS.map((tour) => ({
  id: tour.id,
  task: tour.id,
  lane: tour.vehicle,
  from: tour.from,
  to: tour.to,
  leadIn: tour.loading * 60_000,
}));

export default function NowLine() {
  return (
    <Schedule ariaLabel="Today's tours, with the present" initialDomain={[at(5, 30), at(18)]} height={420} now={NOW}>
      {VEHICLES.map((vehicle) => (
        <Lane key={vehicle.id} id={vehicle.id} label={vehicle.plate} />
      ))}
      <Subtasks data={ROUNDS} tasks={TASKS} />
    </Schedule>
  );
}
