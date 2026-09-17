import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "What the tooltip says";

/* Resting the pointer on a subtask names the order, the stop, its main time
   and - where it has them - its setup and teardown, and then every finding on
   it: with whom it overlaps, and by how much a transport of it is late. Try
   the bracket in the paint shop at noon, or the housing on the mill at nine.

   On a transport it names where the move goes from and to, how long it takes,
   and whether it can arrive in time.

   Every word comes from the wording of @umriss-ui/core and every number from
   its formats, so a provider switches the tooltip with everything else. It
   steps aside while a drag is in flight, and it is placed from its measured
   size: beside the pointer where there is room, on the other side where there
   is not. Nothing here configures it - this is what a schedule does by
   itself. */
export default function Tooltip() {
  return (
    <Schedule ariaLabel="Plan of Tuesday, 17 March, with its tooltip" initialDomain={DAY_OF_PLAN} height={380}>
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
