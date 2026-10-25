import { Stack, Text } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Milestone, ScheduleTooltipTarget, Subtask, Task } from "../../../src";

export const title = "Say what a milestone is in your own tooltip";

export const lead = "Over a milestone the target is `milestone`: the point itself, with its `label` and `at`, for a tooltip of your own.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const PROJECTS: readonly Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: readonly Subtask[] = [
  { id: "build", task: "portal", lane: "arjun", from: at(7), to: at(12), name: "Build" },
  { id: "test", task: "portal", lane: "eva", from: at(12, 30), to: at(15), name: "Test" },
];

const MILESTONES: readonly Milestone[] = [{ id: "code-freeze", lane: "arjun", at: at(12), label: "Code freeze" }];

const time = (instant: number) => new Date(instant).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function Own({ target }: { target: ScheduleTooltipTarget }) {
  if (target.kind === "dependency") return null;
  if (target.kind === "subtask") return <Text size="sm">{target.subtask.name}</Text>;
  return (
    <Stack gap={1}>
      <Text size="sm" weight="semibold">
        {target.milestone.label ?? target.milestone.id}
      </Text>
      <Text size="xs" tone="secondary">
        Test may begin from {time(target.milestone.at)}
      </Text>
    </Stack>
  );
}

export default function SayWhatAMilestoneIs() {
  const { Schedule, Lane, Subtasks, Milestones } = useSchedule({ initialView: { domain: [at(6, 30), at(15, 30)] } });
  return (
    <Schedule aria-label="Build and test around the code freeze" height={150} tooltip={(target) => <Own target={target} />}>
      <Lane id="arjun" label="Arjun Mehta" />
      <Lane id="eva" label="Eva Novak" />
      <Subtasks data={WORK} tasks={PROJECTS} />
      <Milestones data={MILESTONES} />
    </Schedule>
  );
}
