import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "Where the present stands";

/* `now` draws a line across the lanes at the present moment, and a mark where
   it meets the time band. Everything to its left should have happened; what
   still stands there in full colour is late, and a planner sees it at once.

   In an application you write `now` and nothing else: it reads the clock and
   moves on by the minute, so a schedule left open on a wall screen stays true.
   This plan is a fixed Tuesday in March, and the real clock would put the line
   outside it - where it would be as useless as the plan is old. An instant
   instead of `true` fixes the line where it belongs, which is also what a
   replay of a past shift needs, and what makes a picture of it hold still. */

const HALF_PAST_TEN = new Date(2026, 2, 17, 10, 30).getTime();

export default function NowLine() {
  return (
    <Schedule
      ariaLabel="Plan of Tuesday, 17 March, with the present"
      initialDomain={DAY_OF_PLAN}
      height={380}
      now={HALF_PAST_TEN}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
