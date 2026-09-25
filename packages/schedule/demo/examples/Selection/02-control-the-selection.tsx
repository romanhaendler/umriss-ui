import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, Subtask, Task } from "../../../src";

export const title = "Control the selection";

export const lead = "Hold `selectedTask` in your state to show the selection elsewhere; `onSelectedTaskChange` also names the leg that was clicked.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY: readonly [number, number] = [at(5, 30), at(18)];

const VEHICLES = [
  { id: "truck-118", label: "Truck FP 118 R" },
  { id: "van-214", label: "Van FP 214 K" },
  { id: "van-402", label: "Van FP 402 R" },
  { id: "truck-520", label: "Truck FP 520 E" },
  { id: "van-455", label: "E-van FP 455 R" },
];

const CONSIGNMENTS: readonly Task[] = [
  { id: "c-2042", name: "C-2042 Marlow & Finch Books", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "c-2043", name: "C-2043 Oakridge Pharmacy", color: "light-dark(#c2410c, #f08a52)" },
];

/* Lead-in is loading, lead-out unloading. */
const LEGS: readonly Subtask[] = [
  { id: "c-2042-1", task: "c-2042", lane: "truck-118", from: at(7, 30), to: at(8, 15), leadIn: min(10) },
  { id: "c-2042-2", task: "c-2042", lane: "van-214", from: at(9), to: at(11), leadIn: min(20), leadOut: min(15) },
  { id: "c-2043-1", task: "c-2043", lane: "truck-520", from: at(6, 30), to: at(8), leadIn: min(30), leadOut: min(15) },
  { id: "c-2043-2", task: "c-2043", lane: "van-402", from: at(10), to: at(11, 30), leadIn: min(15) },
  { id: "c-2043-3", task: "c-2043", lane: "van-455", from: at(12), to: at(14), leadIn: min(20), leadOut: min(20) },
];

const TRANSFERS: readonly Dependency[] = [
  { id: "t-2042-1", from: "c-2042-1", to: "c-2042-2", lag: min(15) },
  { id: "t-2043-1", from: "c-2043-1", to: "c-2043-2", lag: min(45) },
  /* Ten minutes between the van at 11:30 and the e-van's loading at 11:40;
     the transfer takes twenty-five. Violated, on purpose. */
  { id: "t-2043-2", from: "c-2043-2", to: "c-2043-3", lag: min(25) },
];

export default function ControlTheSelection() {
  const [selected, setSelected] = useState<string | null>("c-2043");
  const [leg, setLeg] = useState<string | null>(null);
  const consignment = CONSIGNMENTS.find((c) => c.id === selected);

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Legs at North depot on Tuesday, 17 March"
        initialDomain={DAY}
        height={284}
        selectedTask={selected}
        onSelectedTaskChange={(task, subtask) => {
          setSelected(task);
          setLeg(subtask);
        }}
      >
        {VEHICLES.map((vehicle) => (
          <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
        ))}
        <Dependencies data={TRANSFERS} />
        <Subtasks data={LEGS} tasks={CONSIGNMENTS} />
      </Schedule>
      <Text size="sm" tone="secondary" data-selected-task>
        Selected: {consignment?.name ?? "nothing"}
        {leg !== null ? `, at ${leg}` : ""}
      </Text>
    </Stack>
  );
}
