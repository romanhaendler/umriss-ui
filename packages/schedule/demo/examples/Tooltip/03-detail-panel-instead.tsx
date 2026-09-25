import { useState } from "react";
import { Badge, Card, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks } from "../../../src";
import type { ScheduleInteraction } from "../../../src";
import { PEOPLE, PROJECTS, WORK } from "@umriss-ui/demo/worlds/planning";
import type { WorkItem } from "@umriss-ui/demo/worlds/planning";

export const title = "Show a detail panel instead";

export const lead = "Set `tooltip={false}` when a panel of your own shows the item under the pointer, filled from `onInteraction`.";

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();

const WEB = PEOPLE.filter((person) => person.team === "Web");
const WEB_WORK = WORK.filter((item) => WEB.some((person) => person.id === item.lane));

export default function DetailPanelInstead() {
  const [item, setItem] = useState<WorkItem | null>(null);

  const onInteraction = (interaction: ScheduleInteraction) => {
    if (interaction.type !== "hover") return;
    const hit = interaction.hit;
    setItem(hit.kind === "subtask" ? (WEB_WORK.find((one) => one.id === hit.subtask.id) ?? null) : null);
  };

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Sprint 14 of the web team"
        initialDomain={[day(9), day(21)]}
        height={260}
        tooltip={false}
        onInteraction={onInteraction}
      >
        {WEB.map((person) => (
          <Lane key={person.id} id={person.id} label={person.name} />
        ))}
        <Subtasks data={WEB_WORK} tasks={PROJECTS} />
      </Schedule>
      <Card data-detail-panel>
        {item === null ? (
          <Text size="sm" tone="secondary">
            Rest the pointer on a work item to see its details.
          </Text>
        ) : (
          <Stack gap={1}>
            <Stack direction="row" gap={2} align="center">
              <Text size="sm" weight="semibold">
                {item.name}
              </Text>
              <Badge tone={item.status === "done" ? "success" : "neutral"}>{item.status}</Badge>
            </Stack>
            <Text size="xs" tone="secondary">
              {PROJECTS.find((project) => project.id === item.task)?.name} · {PEOPLE.find((person) => person.id === item.lane)?.name} ·{" "}
              {item.estimate} h estimated
            </Text>
          </Stack>
        )}
      </Card>
    </Stack>
  );
}
