import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Dependencies, Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { Dependency, Intent, Subtask, Task } from "../../../src";

export const title = "Move work onto another lane";

export const lead = "Add `lane` to `intents`: a drop reports a move and a lane change separately, and the ghost shows the findings first.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const VEHICLES = [
  { id: "truck-118", label: "Truck FP 118 R" },
  { id: "van-402", label: "Van FP 402 R" },
  { id: "truck-520", label: "Truck FP 520 E" },
  { id: "van-455", label: "E-van FP 455 R" },
  { id: "van-290", label: "Van FP 290 E" },
];

const CONSIGNMENTS: readonly Task[] = [
  { id: "c-2041", name: "C-2041 Holloway Garden Supplies", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "c-2043", name: "C-2043 Oakridge Pharmacy", color: "light-dark(#c2410c, #f08a52)" },
  { id: "c-2045", name: "C-2045 Tamsin's Bakery", color: "light-dark(#be185d, #f06aa6)" },
  { id: "c-2046", name: "C-2046 Pellham Hardware", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const LEGS: readonly Subtask[] = [
  { id: "c-2041-1", task: "c-2041", lane: "truck-118", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "c-2043-1", task: "c-2043", lane: "truck-520", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "c-2043-2", task: "c-2043", lane: "van-402", from: at(10), to: at(11, 30), leadIn: min(15) },
  { id: "c-2046-2", task: "c-2046", lane: "van-402", from: at(13), to: at(14, 30), leadIn: min(20), leadOut: min(10) },
  { id: "c-2043-3", task: "c-2043", lane: "van-455", from: at(12), to: at(14), leadIn: min(20), leadOut: min(20) },
  { id: "c-2045-3", task: "c-2045", lane: "van-290", from: at(15, 45), to: at(16, 30) },
];

const TRANSFERS: readonly Dependency[] = [
  { id: "t-2043-1", from: "c-2043-1", to: "c-2043-2", lag: min(45) },
  { id: "t-2043-2", from: "c-2043-2", to: "c-2043-3", lag: min(25) },
];

export default function MoveToAnotherLane() {
  const [legs, setLegs] = useState(LEGS);
  const [last, setLast] = useState<Intent | null>(null);

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Five vehicles on Tuesday, 17 March, editable"
        initialDomain={[at(5, 30), at(18)]}
        height={284}
        intents={["move", "lane"]}
        onIntent={(intent) => {
          setLast(intent);
          setLegs((current) => current.map((leg) => applyIntent(leg, intent)));
        }}
      >
        {VEHICLES.map((vehicle) => (
          <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
        ))}
        <Dependencies data={TRANSFERS} />
        <Subtasks data={legs} tasks={CONSIGNMENTS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-intent>
        {last === null ? "No intent yet" : JSON.stringify(last)}
      </Text>
    </Stack>
  );
}
