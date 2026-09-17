import { useEffect, useRef, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { ScheduleHandle, Subtask, Task } from "../../../src";

export const title = "Two schedules in step";

/* `onDomainChange` reports the visible span after the planner pans or zooms -
   two wall-clock instants, at most once per frame. Handed to a second schedule
   as its `initialDomain`, the two move together: pan or zoom either one and the
   other follows. A span handed in is not reported back, so the two do not feed
   each other.

   The same span goes to a chart's time axis where an application wants the
   plan and the measurements of the same hours under one another.

   The pin above the upper plan is the application's own DOM, placed with the
   schedule's handle: `clientPointOf` gives the client point of a time, and
   `positionAt` the time and lane at a point. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "lathe-1", label: "Lathe 1" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
  { id: "qa", label: "Inspection" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2042", name: "A-2042 Shaft", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), setup: min(15), teardown: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), setup: min(30), teardown: min(15) },
  { id: "a-2041-3", task: "a-2041", lane: "qa", from: at(11, 30), to: at(12, 15) },
  { id: "a-2042-1", task: "a-2042", lane: "saw", from: at(7, 30), to: at(8, 15), setup: min(10) },
  { id: "a-2042-2", task: "a-2042", lane: "lathe-1", from: at(9), to: at(11), setup: min(20), teardown: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), setup: min(30), teardown: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(10), to: at(11, 30), setup: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: at(12), to: at(14), setup: min(20), teardown: min(20) },
];

const MACHINES = STATIONS.slice(0, 4);
const ON_MACHINES = STEPS.filter((step) => MACHINES.some((machine) => machine.id === step.lane));
const REST = STATIONS.slice(4);
const ON_REST = STEPS.filter((step) => REST.some((machine) => machine.id === step.lane));
const SHIFT_CHANGE = new Date(2026, 2, 17, 14).getTime();

export default function InStep() {
  const [domain, setDomain] = useState(DAY_OF_PLAN);
  const upper = useRef<ScheduleHandle>(null);
  const host = useRef<HTMLDivElement>(null);
  const [pin, setPin] = useState<number | null>(null);

  /* Placed relative to this example, so the client point is turned into one
     inside it - and placed anew whenever the span moves. */
  useEffect(() => {
    const point = upper.current?.clientPointOf(SHIFT_CHANGE);
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
        ref={upper}
        ariaLabel="The machines of Tuesday, 17 March"
        initialDomain={domain}
        height={240}
        onDomainChange={setDomain}
      >
        {MACHINES.map((machine) => (
          <Lane key={machine.id} id={machine.id} label={machine.label} />
        ))}
        <Subtasks data={ON_MACHINES} tasks={ORDERS} />
      </Schedule>
      <Schedule ariaLabel="The rest of the plant, the same hours" initialDomain={domain} height={152} onDomainChange={setDomain}>
        {REST.map((machine) => (
          <Lane key={machine.id} id={machine.id} label={machine.label} />
        ))}
        <Subtasks data={ON_REST} tasks={ORDERS} />
      </Schedule>
      <Text size="xs" mono tone="muted" data-span>
        {new Date(domain[0]).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} –{" "}
        {new Date(domain[1]).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </Text>
    </Stack>
  );
}
