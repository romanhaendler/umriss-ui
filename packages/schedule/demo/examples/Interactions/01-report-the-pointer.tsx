import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Dependencies, Lane, Schedule, Subtasks } from "../../../src";
import type { Dependency, ScheduleInteraction, Subtask, Task } from "../../../src";

export const title = "Report what the pointer is on";

export const lead = "`onInteraction` hears hover, click and right-click with the target, its part, the time and the lane - here written into a status line.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const CONSIGNMENTS: readonly Task[] = [
  { id: "c-2041", name: "C-2041 Holloway Garden Supplies", color: "light-dark(#2563eb, #6b9bff)" },
];

const LEGS: readonly Subtask[] = [
  { id: "c-2041-1", task: "c-2041", lane: "truck-118", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "c-2041-2", task: "c-2041", lane: "van-402", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
];

const TRANSFERS: readonly Dependency[] = [{ id: "t-2041-1", from: "c-2041-1", to: "c-2041-2", lag: min(10) }];

const describe = (interaction: ScheduleInteraction): string => {
  const { hit } = interaction;
  /* To the nearest minute: a pixel is about a minute wide here. */
  const time = new Date(Math.round(interaction.time / 60_000) * 60_000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const target =
    hit.kind === "subtask"
      ? `subtask ${hit.subtask.id} (${hit.part})`
      : hit.kind === "dependency"
        ? `dependency ${hit.dependency.id}`
        : hit.kind === "lane"
          ? `lane ${hit.lane}`
          : "nothing";
  return `${interaction.type}: ${target} at ${time}`;
};

export default function ReportThePointer() {
  const [last, setLast] = useState("Move the pointer over the plan");

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="One consignment on a truck and a van"
        initialDomain={[at(5, 30), at(18)]}
        height={152}
        onInteraction={(interaction) => setLast(describe(interaction))}
      >
        <Lane id="truck-118" label="Truck FP 118 R" />
        <Lane id="van-402" label="Van FP 402 R" />
        <Dependencies data={TRANSFERS} />
        <Subtasks data={LEGS} tasks={CONSIGNMENTS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-interaction>
        {last}
      </Text>
    </Stack>
  );
}
