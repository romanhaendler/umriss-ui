import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "A day in the plant";

/* The schedule draws what it is given: lanes in the order they are declared,
   subtasks in the colour of their task, transports from one subtask's end to
   the next one's start. The day band above names the day, the fine band below
   steps from the hour down to the quarter hour as the time scale is zoomed.

   Two findings stand in this plan on purpose: two orders claim the mill at
   10:00, and the bracket cannot reach the paint shop in time. They are drawn,
   offset and marked, and nothing moves them.

   Drag the background to pan in both directions. The wheel scrolls the lanes
   and, once they are at their end, the page; Ctrl or ⌘ with the wheel, or a
   pinch, zooms; Shift with the wheel pans through time. `Transports` is declared
   before `Subtasks`, so its lines run beneath the bars. */
export default function FirstSchedule() {
  return (
    <Schedule ariaLabel="Plan of Tuesday, 17 March" initialDomain={DAY_OF_PLAN} height={380}>
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
