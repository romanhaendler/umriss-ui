import { Stack, Text } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { BlockedTime, Dependency, ScheduleTooltipTarget, Subtask, Task } from "../../../src";

export const title = "Say what a bar covers and a line joins";

export const lead = "The target says what is hovered: a bar brings its `subtask` and the `blocked` time it covers, a line its `dependency` with the subtasks it joins, `from` and `to`.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const PROJECTS: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#2563eb, #6b9bff)" }];

const WORK: Subtask[] = [
  { id: "design", task: "portal", lane: "noah", from: at(7), to: at(9), name: "Design" },
  { id: "build", task: "portal", lane: "arjun", from: at(9, 30), to: at(13), name: "Build" },
  { id: "test", task: "portal", lane: "eva", from: at(13, 30), to: at(15), name: "Test" },
];

const HANDOVERS: Dependency[] = [
  { id: "to-build", from: "design", to: "build", lag: min(15) },
  { id: "to-test", from: "build", to: "test", lag: min(15) },
];

const LEAVE: BlockedTime[] = [{ id: "arjun-dentist", lane: "arjun", from: at(11), to: at(12), label: "Dentist" }];

const time = (instant: number) => new Date(instant).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function Covers({ target }: { target: ScheduleTooltipTarget }) {
  if (target.kind === "dependency") {
    return (
      <Stack gap={1}>
        <Text size="sm" weight="semibold">
          Handover {target.dependency.id}
        </Text>
        <Text size="xs" tone="secondary">
          {target.from?.name ?? "?"} → {target.to?.name ?? "?"}
        </Text>
      </Stack>
    );
  }
  return (
    <Stack gap={1}>
      <Text size="sm" weight="semibold">
        {target.subtask.name}
      </Text>
      <Text size="xs" tone="secondary">
        {time(target.subtask.from)} – {time(target.subtask.to)}
      </Text>
      {target.blocked.map((blocked) => (
        <Text size="xs" tone="secondary" key={blocked.id}>
          Covers {blocked.label}, {time(blocked.from)} – {time(blocked.to)}
        </Text>
      ))}
    </Stack>
  );
}

export default function SayWhatABarCoversAndALineJoins() {
  const { Schedule, Lane, Subtasks, Dependencies, BlockedTimes } = useSchedule({ initialView: { domain: [at(6, 30), at(15, 30)] } });
  return (
    <Schedule ariaLabel="Design, build and test, with leave under the build" height={188} tooltip={(target) => <Covers target={target} />}>
      <Lane id="noah" label="Noah Fischer" />
      <Lane id="arjun" label="Arjun Mehta" />
      <Lane id="eva" label="Eva Novak" />
      <BlockedTimes data={LEAVE} />
      <Dependencies data={HANDOVERS} />
      <Subtasks data={WORK} tasks={PROJECTS} />
    </Schedule>
  );
}
