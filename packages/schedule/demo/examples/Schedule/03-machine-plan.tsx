import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "@umriss-ui/demo/worlds/plant";

export const title = "Plan a day in the machine shop";

export const lead = "The full case: seven stations, six orders and their transports, the present marked and every order named in its bars.";

const NAMES = new Map(ORDERS.map((order) => [order.id, order.name ?? order.id]));
const HALF_PAST_TEN = new Date(2026, 2, 17, 10, 30).getTime();

export default function MachinePlan() {
  return (
    <Schedule
      ariaLabel="Machine shop, Tuesday 17 March"
      initialDomain={DAY_OF_PLAN}
      height={380}
      now={HALF_PAST_TEN}
      label={(step) => NAMES.get(step.task) ?? step.task}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Dependencies data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
