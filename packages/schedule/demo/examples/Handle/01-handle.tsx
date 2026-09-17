import { useEffect, useRef, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { ScheduleHandle, Subtask, Task } from "../../../src";

export const title = "A mark of the application's own";

/* `ScheduleHandle` is everything a schedule offers imperatively, and it is
   arithmetic and nothing else: the two directions between a point on the
   screen and a time on a lane.

     clientPointOf(time, lane?)   the client point of a time, on a lane's middle
     positionAt(clientX, clientY) the time and the lane at a client point
     visibleDomain()              the span in view, as two wall-clock instants

   Everything else a schedule does is props. This is here because an
   application's own marks - a shift change, a delivery window, a pin on the
   order somebody just rang about - are the application's DOM, not the
   schedule's, and they have to be placed.

   The pin above the plan is placed with `clientPointOf`, turned into a point
   inside this example, and placed anew whenever the span moves. Pan or zoom
   the plan and watch it follow. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];

const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), setup: min(15), teardown: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), setup: min(30), teardown: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), setup: min(30), teardown: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(12), to: at(13, 30), setup: min(15) },
];

const SHIFT_CHANGE = at(14);

export default function Handle() {
  const plan = useRef<ScheduleHandle>(null);
  const host = useRef<HTMLDivElement>(null);
  const [domain, setDomain] = useState(DAY_OF_PLAN);
  const [pin, setPin] = useState<number | null>(null);
  const [under, setUnder] = useState("Move the pointer over the plan");

  /* Placed relative to this example, so the client point is turned into one
     inside it - and placed anew whenever the span moves. */
  useEffect(() => {
    const point = plan.current?.clientPointOf(SHIFT_CHANGE);
    const left = host.current?.getBoundingClientRect().left;
    setPin(point === undefined || point === null || left === undefined ? null : point.x - left);
  }, [domain]);

  return (
    <Stack gap={2}>
      <div ref={host} style={{ position: "relative", height: 12 }}>
        {pin !== null && (
          <Text size="xs" tone="muted" style={{ position: "absolute", top: -4, left: pin, transform: "translateX(-50%)" }} data-pin>
            Shift change
          </Text>
        )}
      </div>
      <Schedule
        ref={plan}
        ariaLabel="A plan with a mark of the application's own"
        initialDomain={domain}
        height={196}
        onDomainChange={setDomain}
        onInteraction={(interaction) => {
          /* `positionAt` is the other direction: a client point back to a time
             and a lane. The interaction already carries both - this is for the
             application's own listeners, which have only a point. */
          const there = plan.current?.positionAt(interaction.clientX, interaction.clientY);
          setUnder(
            there == null
              ? "off the plan"
              : `${new Date(there.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} on ${there.lane ?? "no lane"}`,
          );
        }}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-under-pointer>
        {under}
      </Text>
    </Stack>
  );
}
