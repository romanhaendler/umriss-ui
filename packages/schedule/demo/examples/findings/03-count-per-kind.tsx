import { Badge, Stack } from "@umriss-ui/core";
import { Dependencies, Lane, Schedule, Subtasks, overlaps, violatedDependencies } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Count the findings per kind";

export const lead = "`overlaps` and `violatedDependencies` are the halves of `findings` on their own - here as counts above the day's legs.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const VEHICLES = [
  { id: "van-402", label: "Van FP 402 R" },
  { id: "truck-520", label: "Truck FP 520 E" },
  { id: "van-455", label: "E-van FP 455 R" },
];

const CONSIGNMENTS: readonly Task[] = [
  { id: "c-2041", name: "C-2041 Holloway Garden Supplies", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "c-2043", name: "C-2043 Oakridge Pharmacy", color: "light-dark(#c2410c, #f08a52)" },
];

const LEGS: readonly Subtask[] = [
  { id: "c-2041-2", task: "c-2041", lane: "van-402", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "c-2043-1", task: "c-2043", lane: "truck-520", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "c-2043-2", task: "c-2043", lane: "van-402", from: at(10), to: at(11, 30), leadIn: min(15) },
  { id: "c-2043-3", task: "c-2043", lane: "van-455", from: at(12), to: at(14), leadIn: min(20), leadOut: min(20) },
];

const TRANSFERS: readonly Dependency[] = [
  { id: "t-2043-1", from: "c-2043-1", to: "c-2043-2", lag: min(45) },
  { id: "t-2043-2", from: "c-2043-2", to: "c-2043-3", lag: min(25) },
];

export default function CountPerKind() {
  const doubleBooked = overlaps(LEGS).length;
  const late = violatedDependencies(LEGS, TRANSFERS).length;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2}>
        <Badge tone={doubleBooked > 0 ? "warning" : "success"}>{doubleBooked} double-booked</Badge>
        <Badge tone={late > 0 ? "warning" : "success"}>{late} transfers too short</Badge>
      </Stack>
      <Schedule ariaLabel="The day's legs with their findings counted" initialDomain={[at(5, 30), at(18)]} height={196}>
        {VEHICLES.map((vehicle) => (
          <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
        ))}
        <Dependencies data={TRANSFERS} />
        <Subtasks data={LEGS} tasks={CONSIGNMENTS} />
      </Schedule>
    </Stack>
  );
}
