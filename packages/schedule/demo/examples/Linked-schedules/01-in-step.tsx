import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Keep two schedules in step";

export const lead = "Hand the span `onDomainChange` reports to both schedules' `initialDomain`: pan or zoom either one and the other follows.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DIESEL = [
  { id: "truck-118", label: "Truck FP 118 R" },
  { id: "van-214", label: "Van FP 214 K" },
  { id: "van-402", label: "Van FP 402 R" },
  { id: "truck-520", label: "Truck FP 520 E" },
];

const ELECTRIC = [
  { id: "van-455", label: "E-van FP 455 R" },
  { id: "van-377", label: "E-van FP 377 K" },
];

const CONSIGNMENTS: readonly Task[] = [
  { id: "c-2041", name: "C-2041 Holloway Garden Supplies", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "c-2042", name: "C-2042 Marlow & Finch Books", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "c-2043", name: "C-2043 Oakridge Pharmacy", color: "light-dark(#c2410c, #f08a52)" },
];

const LEGS: readonly Subtask[] = [
  { id: "c-2041-1", task: "c-2041", lane: "truck-118", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "c-2041-2", task: "c-2041", lane: "van-402", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "c-2041-3", task: "c-2041", lane: "van-377", from: at(11, 30), to: at(12, 15) },
  { id: "c-2042-1", task: "c-2042", lane: "truck-118", from: at(7, 30), to: at(8, 15), leadIn: min(10) },
  { id: "c-2042-2", task: "c-2042", lane: "van-214", from: at(9), to: at(11), leadIn: min(20), leadOut: min(15) },
  { id: "c-2043-1", task: "c-2043", lane: "truck-520", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "c-2043-2", task: "c-2043", lane: "van-402", from: at(10), to: at(11, 30), leadIn: min(15) },
  { id: "c-2043-3", task: "c-2043", lane: "van-455", from: at(12), to: at(14), leadIn: min(20), leadOut: min(20) },
];

const on = (lanes: readonly { id: string }[]) => LEGS.filter((leg) => lanes.some((lane) => lane.id === leg.lane));

const time = (instant: number) => new Date(instant).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function InStep() {
  const [domain, setDomain] = useState<readonly [number, number]>([at(5, 30), at(18)]);
  return (
    <Stack gap={2}>
      <Schedule ariaLabel="Diesel vehicles on Tuesday, 17 March" initialDomain={domain} height={240} onDomainChange={setDomain}>
        {DIESEL.map((vehicle) => (
          <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
        ))}
        <Subtasks data={on(DIESEL)} tasks={CONSIGNMENTS} />
      </Schedule>
      <Schedule ariaLabel="Electric vans, the same hours" initialDomain={domain} height={152} onDomainChange={setDomain}>
        {ELECTRIC.map((vehicle) => (
          <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
        ))}
        <Subtasks data={on(ELECTRIC)} tasks={CONSIGNMENTS} />
      </Schedule>
      <Text size="xs" mono tone="muted" data-span>
        {time(domain[0])} – {time(domain[1])}
      </Text>
    </Stack>
  );
}
