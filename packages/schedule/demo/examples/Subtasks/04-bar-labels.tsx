import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

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

const ORDER_NAMES = new Map(ORDERS.map((order) => [order.id, order.name ?? order.id]));

export default function BarLabels() {
  return (
    <Schedule
      ariaLabel="Plan of Tuesday, 17 March, with the orders written in"
      initialDomain={DAY_OF_PLAN}
      height={380}
      label={(subtask) => ORDER_NAMES.get(subtask.task) ?? subtask.task}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
