import { useEffect, useRef, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { ScheduleHandle } from "../../../src";
import { DAY_OF_PLAN, ORDERS, STATIONS, STEPS } from "../../data";

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
      <Schedule ariaLabel="The rest of the plant, the same hours" initialDomain={domain} height={200} onDomainChange={setDomain}>
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
