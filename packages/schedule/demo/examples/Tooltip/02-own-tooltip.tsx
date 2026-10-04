import { Badge, Stack, Text } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Dependency, ScheduleTooltipTarget, Subtask, Task } from "../../../src";

export const title = "Write your own tooltip content";

export const lead = "Pass `tooltip` a function to show what only your application knows - here the load - with the findings the schedule found.";

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

/* What the application knows and the schedule does not. */
const LOADS: Record<string, string> = {
  "c-2041": "6 pallets · 1,140 kg",
  "c-2043": "2 pallets · 420 kg, chilled",
};

function LoadTooltip({ target }: { target: ScheduleTooltipTarget }) {
  const task = target.task;
  const found = target.kind === "subtask" ? target.overlapping.length + target.violatedDependencies.length : target.violated ? 1 : 0;
  return (
    <Stack gap={1}>
      <Text size="sm" weight="semibold">
        {task?.name ?? "Unknown consignment"}
      </Text>
      <Text size="xs" tone="secondary">
        {task ? LOADS[task.id] : ""}
      </Text>
      {found > 0 && <Badge tone="danger">{found === 1 ? "1 finding" : `${found} findings`}</Badge>}
    </Stack>
  );
}

export default function OwnTooltip() {
  const { Schedule, Lane, Subtasks, Dependencies } = useSchedule();
  return (
    <Schedule
      ariaLabel="Three vehicles with the load in the tooltip"
      initialDomain={[at(5, 30), at(18)]}
      height={196}
      tooltip={(target) => <LoadTooltip target={target} />}
    >
      {VEHICLES.map((vehicle) => (
        <Lane key={vehicle.id} id={vehicle.id} label={vehicle.label} />
      ))}
      <Dependencies data={TRANSFERS} />
      <Subtasks data={LEGS} tasks={CONSIGNMENTS} />
    </Schedule>
  );
}
