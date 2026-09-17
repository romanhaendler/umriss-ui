import { Badge, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { ScheduleTooltipTarget } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "A tooltip of the application's own";

/* Resting the pointer on a subtask or a transport shows a tooltip: by default
   the order, the stop, its times, setup and teardown, and every finding on it -
   try the bracket in the paint shop at noon. Its words come from the provider's
   wording, so a German application reads it in German.

   `tooltip` takes a function instead, which receives what the pointer rests on
   together with its findings and returns the application's own content - here
   a customer that only the application knows. `tooltip={false}` switches it
   off, for an application with a detail panel of its own. */

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
      height={380}
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
