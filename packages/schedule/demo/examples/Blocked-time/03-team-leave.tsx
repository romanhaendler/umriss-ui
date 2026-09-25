import { Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Lane, Schedule, Subtasks, findings } from "../../../src";
import type { BlockedTime } from "../../../src";
import { LEAVE, PEOPLE, PROJECTS, WORK } from "@umriss-ui/demo/worlds/planning";

export const title = "Check a sprint against the leave calendar";

export const lead = "The team's holidays, sick days and training become `BlockedTimes`, and `findings` confirms that no work item runs into one.";

const BLOCKED: BlockedTime[] = LEAVE.map((leave) => ({ id: leave.id, lane: leave.person, from: leave.from, to: leave.to, label: leave.reason }));

const SPRINT_14: readonly [number, number] = [new Date(2026, 2, 9, 6).getTime(), new Date(2026, 2, 21).getTime()];

const NAME = new Map(WORK.map((item) => [item.id, item.name]));
const PERSON = new Map(PEOPLE.map((person) => [person.id, person.name]));

export default function TeamLeave() {
  const clashes = findings(WORK, [], BLOCKED).inBlockedTime;
  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Sprint 14 with the team's leave" initialDomain={SPRINT_14} height={500}>
        {PEOPLE.map((person) => (
          <Lane key={person.id} id={person.id} label={person.name} />
        ))}
        <BlockedTimes data={BLOCKED} />
        <Subtasks data={WORK} tasks={PROJECTS} />
      </Schedule>
      <Text size="sm" tone="secondary">
        {clashes.length === 0
          ? "No work falls into anyone's leave."
          : clashes.map((clash) => `${NAME.get(clash.subtask)} (${PERSON.get(WORK.find((w) => w.id === clash.subtask)?.lane ?? "")})`).join(" · ")}
      </Text>
    </Stack>
  );
}
