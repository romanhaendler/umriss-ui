import { Button, Stack } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Print the plan";
export const lead = "Nothing to set: a printed schedule is its lanes and bars. The lane chevrons, the resize grips and the tooltip stay off the sheet.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const DAY: readonly [number, number] = [at(5, 30), at(18)];

const VEHICLES = [
  { id: "truck", label: "Truck FP 118 R" },
  { id: "van-1", label: "Van FP 214 K" },
  { id: "e-van", label: "E-van FP 377 K" },
];

const TOURS: readonly Task[] = [
  { id: "t-01", name: "T-01 Harbour", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "t-03", name: "T-03 Old Town", color: "light-dark(#c2410c, #f08a52)" },
];

const LEGS: readonly Subtask[] = [
  { id: "t-01-1", task: "t-01", lane: "truck", from: at(6), to: at(7) },
  { id: "t-01-2", task: "t-01", lane: "van-1", from: at(8), to: at(10, 30) },
  { id: "t-03-1", task: "t-03", lane: "van-1", from: at(11), to: at(12, 30) },
  { id: "t-03-2", task: "t-03", lane: "e-van", from: at(13), to: at(15) },
];

export default function PrintThePlan() {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: DAY } });
  return (
    <Stack gap={3}>
      <Button variant="secondary" size="sm" onClick={() => window.print()} style={{ alignSelf: "flex-start" }}>
        Print this page
      </Button>
      <Schedule aria-label="Tours of Tuesday, 17 March" height={200}>
        {VEHICLES.map((vehicle) => (
          <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
        ))}
        <Subtasks data={LEGS} tasks={TOURS} />
      </Schedule>
    </Stack>
  );
}
