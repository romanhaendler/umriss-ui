import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport, TransportAttachment, TransportEnds, TransportRoute } from "../../../src";

export const title = "How a line is drawn";

/* The same four stops, drawn four ways. `route` gives the shape and `attach`
   the place on the bar where a line begins and ends; both are options of the
   schedule, and a transport may say otherwise for itself.

   `attach="nearest"` is the interesting one: a line leaves the edge of the bar
   that faces its destination - the lower edge when the next stop lies below,
   the upper one when it lies above - so a five-minute move between two
   neighbouring lanes is drawn as the short line it is instead of swinging out
   of its lane and back.

   `ends` decides whether the two ends carry a dot. The dot says where the line
   is anchored, which helps while a plan is being read and is noise in a plan
   full of short moves - the last variant below leaves it off.

   None of this touches a finding. Whether a transport can arrive in time
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

function Variant({ route, attach, ends = "dot" }: { route: TransportRoute; attach: TransportAttachment; ends?: TransportEnds }) {
  return (
    <Stack gap={1}>
      <Text size="xs" tone="muted" mono>
        route=&quot;{route}&quot; attach=&quot;{attach}&quot; ends=&quot;{ends}&quot;
      </Text>
      <Schedule
        ariaLabel={`A frame through three stations, drawn ${route} from the ${attach}`}
        initialDomain={[at(6, 30), at(13, 30)]}
        height={190}
        route={route}
        attach={attach}
        ends={ends}
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
      <Variant route="curve" attach="centre" />
      <Variant route="curve" attach="nearest" />
      <Variant route="straight" attach="nearest" />
      <Variant route="orthogonal" attach="nearest" />
      <Variant route="straight" attach="nearest" ends="none" />
    </Stack>
  );
}
