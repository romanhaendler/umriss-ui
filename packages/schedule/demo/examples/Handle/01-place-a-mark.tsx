import { useEffect, useRef, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { ScheduleHandle, Subtask, Task } from "../../../src";

export const title = "Place a mark of your own";

export const lead = "`clientPointOf` turns a time into a point for your own mark; `positionAt` turns a pointer back into a time and a lane.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const VEHICLES = [
  { id: "truck-118", label: "Truck FP 118 R" },
  { id: "van-402", label: "Van FP 402 R" },
  { id: "truck-520", label: "Truck FP 520 E" },
];

const CONSIGNMENTS: readonly Task[] = [
  { id: "c-2041", name: "C-2041 Holloway Garden Supplies", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "c-2043", name: "C-2043 Oakridge Pharmacy", color: "light-dark(#c2410c, #f08a52)" },
];

const LEGS: readonly Subtask[] = [
  { id: "c-2041-1", task: "c-2041", lane: "truck-118", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "c-2041-2", task: "c-2041", lane: "van-402", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "c-2043-1", task: "c-2043", lane: "truck-520", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "c-2043-2", task: "c-2043", lane: "van-402", from: at(12), to: at(13, 30), leadIn: min(15) },
];

/** The last moment a parcel is taken for delivery today. */
const CUT_OFF = at(14);

const clock = (time: number) => new Date(time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function PlaceAMark() {
  const plan = useRef<ScheduleHandle>(null);
  const host = useRef<HTMLDivElement>(null);
  const [domain, setDomain] = useState<readonly [number, number]>([at(5, 30), at(18)]);
  const [pin, setPin] = useState<number | null>(null);
  const [under, setUnder] = useState("Move the pointer over the plan");

  /* The client point, turned into one inside this example - anew whenever the span moves. */
  useEffect(() => {
    const point = plan.current?.clientPointOf(CUT_OFF);
    const left = host.current?.getBoundingClientRect().left;
    setPin(point == null || left === undefined ? null : point.x - left);
  }, [domain]);

  return (
    <Stack gap={2}>
      <div ref={host} style={{ position: "relative", height: 12 }}>
        {pin !== null && (
          <Text size="xs" tone="muted" style={{ position: "absolute", top: -4, left: pin, transform: "translateX(-50%)" }} data-pin>
            Same-day cut-off
          </Text>
        )}
      </div>
      <Schedule
        ref={plan}
        ariaLabel="Three vehicles with a cut-off of the application's own"
        initialDomain={domain}
        height={196}
        onDomainChange={setDomain}
        onInteraction={(interaction) => {
          /* The interaction carries time and lane already; `positionAt` is for
             listeners of your own, which have only a point. */
          const there = plan.current?.positionAt(interaction.clientX, interaction.clientY);
          setUnder(there == null ? "off the plan" : `${clock(there.time)} on ${there.lane ?? "no lane"}`);
        }}
      >
        {VEHICLES.map((vehicle) => (
          <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
        ))}
        <Subtasks data={LEGS} tasks={CONSIGNMENTS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-under-pointer>
        {under}
      </Text>
    </Stack>
  );
}
