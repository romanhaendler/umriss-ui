import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports, findings } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "The findings beside the picture";

/* What the schedule draws, `findings` returns: every overlap with its lane, the
   two subtasks and the time they share, and every late transport with its
   departure, its arrival and how much time is missing. It is a pure function of
   the same data - a list, a count on a tile, a filter for "everything that does
   not work" is one call away. `overlaps` and `lateTransports` are the two
   halves on their own. */

const time = (instant: number) => new Date(instant).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function AsData() {
  const found = findings(STEPS, MOVES);

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Plan of Tuesday, 17 March" initialDomain={DAY_OF_PLAN} height={380}>
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Transports data={MOVES} />
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {found.overlaps.map((o) => (
          <Text as="li" size="sm" key={`${o.first}/${o.second}`}>
            Overlap on {o.lane}: {o.first} and {o.second}, {time(o.from)}–{time(o.to)}
          </Text>
        ))}
        {found.lateTransports.map((l) => (
          <Text as="li" size="sm" key={l.transport}>
            Late transport {l.transport}: {Math.round(l.shortBy / 60_000)} minutes short
          </Text>
        ))}
      </ul>
    </Stack>
  );
}
