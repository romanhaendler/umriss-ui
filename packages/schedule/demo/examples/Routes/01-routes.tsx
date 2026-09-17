import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport, TransportRoute } from "../../../src";

export const title = "The shape of a transport's line";

/* `route` gives a transport's line its shape, and nothing else:

     "curve"        leaves forwards and arrives forwards - the default
     "straight"     the shortest line between its two ends
     "orthogonal"   out of the bar, across, and in again

   A curve that leaves and arrives forwards says which way the work is going,
   even where the arrival lies before the departure - such a move loops back,
   which is the picture of what it is. Straight lines suit a plan read from a
   distance; orthogonal ones suit a plant whose moves really do run along
   aisles.

   It is the schedule's option, and a single transport may say otherwise for
   itself. Where its line touches the bars is `attach`, and whether its ends
   carry a dot is `ends` - both on the Transports page, each its own thing.

   None of the three touches a finding. Whether a transport can arrive in time
   follows from its `leaves` and `arrives`, which say what it connects; these
   say only how it looks. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const TASKS: Task[] = [{ id: "frame", color: "light-dark(#2563eb, #6b9bff)" }];

const STEPS: Subtask[] = [
  { id: "saw", task: "frame", lane: "saw", from: at(7), to: at(8, 30) },
  { id: "mill", task: "frame", lane: "mill", from: at(9), to: at(10, 30) },
  { id: "press", task: "frame", lane: "press", from: at(11), to: at(12) },
  { id: "check", task: "frame", lane: "saw", from: at(12, 30), to: at(13) },
];

const MOVES: Transport[] = [
  { id: "to-mill", from: "saw", to: "mill", duration: min(20) },
  { id: "to-press", from: "mill", to: "press", duration: min(20) },
  /* Back up to the saw's lane: the attach decides which edges this one meets. */
  { id: "to-check", from: "press", to: "check", duration: min(20) },
];

function Variant({ route }: { route: TransportRoute }) {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted" mono>
        route=&quot;{route}&quot;
      </Text>
      <Schedule
        ariaLabel={`A frame through three stations, drawn ${route}`}
        initialDomain={[at(6, 30), at(13, 30)]}
        height={188}
        route={route}
        attach="nearest"
      >
        <Lane id="saw" label="Saw" />
        <Lane id="mill" label="Mill" />
        <Lane id="press" label="Press" />
        <Transports data={MOVES} />
        <Subtasks data={STEPS} tasks={TASKS} />
      </Schedule>
    </Stack>
  );
}

export default function Routes() {
  return (
    <Stack gap={4}>
      <Variant route="curve" />
      <Variant route="straight" />
      <Variant route="orthogonal" />
    </Stack>
  );
}
