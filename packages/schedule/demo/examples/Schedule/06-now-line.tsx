import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "Where the present stands";

/* `now` draws a line across the lanes at the present moment, and a mark where
   it meets the time band. Everything to its left should have happened; what
   still stands there in full colour is late, and a planner sees it at once.

   `now` alone follows the clock and moves on by the minute - a schedule left
   open on a wall screen stays true. An instant instead of `true` fixes the line
   there, for a replay of yesterday's shift or a picture that must not change. */
export default function NowLine() {
  return (
    <Schedule ariaLabel="Plan of Tuesday, 17 March, with the present" initialDomain={DAY_OF_PLAN} height={380} now>
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
