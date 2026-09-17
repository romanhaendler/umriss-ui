import { Badge, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { ScheduleTooltipTarget, Subtask, Task, Transport } from "../../../src";

export const title = "A tooltip of the application's own";

/* Resting the pointer on a subtask or a transport shows a tooltip: by default
   the order, the stop, its times, setup and teardown, and every finding on it -
   try the bracket in the paint shop at noon. Its words come from the provider's
   wording, so a German application reads it in German.

   `tooltip` takes a function instead, which receives what the pointer rests on
   together with its findings and returns the application's own content - here
   a customer that only the application knows. `tooltip={false}` switches it
   off, for an application with a detail panel of its own. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), setup: min(30), teardown: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), setup: min(30), teardown: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(10), to: at(11, 30), setup: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: at(12), to: at(14), setup: min(20), teardown: min(20) },
];

const MOVES: readonly Transport[] = [
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", duration: min(45) },
  /* Leaves the mill at 11:30 and has ten minutes to reach the paint shop's
     setup at 11:40 - it takes twenty-five. A late transport, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", duration: min(25) },
];

const CUSTOMERS: Record<string, string> = {
  "a-2041": "Brandt Metalworks",
  "a-2042": "Keller & Sons",
  "a-2043": "Northworks",
  "a-2044": "Brandt Metalworks",
  "a-2045": "Weiss Hydraulics",
  "a-2046": "Northworks",
};

function OrderTooltip({ target }: { target: ScheduleTooltipTarget }) {
  const task = target.task;
  const findings = target.kind === "subtask" ? target.overlapping.length + target.lateTransports.length : target.late ? 1 : 0;
  return (
    <Stack gap={1}>
      <Text size="sm" weight="semibold">
        {task?.name ?? "Unknown order"}
      </Text>
      <Text size="xs" tone="secondary">
        {task ? CUSTOMERS[task.id] : ""}
      </Text>
      {findings > 0 && <Badge tone="danger">{findings === 1 ? "1 finding" : `${findings} findings`}</Badge>}
    </Stack>
  );
}

export default function OwnTooltip() {
  return (
    <Schedule
      ariaLabel="Plan of Tuesday, 17 March, with customers"
      initialDomain={DAY_OF_PLAN}
      height={196}
      tooltip={(target) => <OrderTooltip target={target} />}
    >
      {STATIONS.map((station) => (
        <Lane key={station.id} id={station.id} label={station.label} />
      ))}
      <Transports data={MOVES} />
      <Subtasks data={STEPS} tasks={ORDERS} />
    </Schedule>
  );
}
