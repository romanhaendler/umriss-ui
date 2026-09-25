import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Lane, Schedule, Subtasks, applyIntent } from "../../../src";
import type { BlockedTime, Intent, Subtask } from "../../../src";
import { LEAVE, PEOPLE, PROJECTS, WORK } from "@umriss-ui/demo/worlds/planning";

export const title = "Keep work out of someone's leave";

export const lead = "Blocked time refuses a place in time where `canMoveTo` refuses a lane; both hold together, and neither wears a warning colour.";

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();

const APPS = PEOPLE.filter((person) => person.team === "Apps" && person.role !== "Product manager");
const START: readonly Subtask[] = WORK.filter((item) => APPS.some((person) => person.id === item.lane));
const AWAY: readonly BlockedTime[] = LEAVE.filter((leave) => APPS.some((person) => person.id === leave.person)).map((leave) => ({
  id: leave.id,
  lane: leave.person,
  from: leave.from,
  to: leave.to,
  label: leave.reason,
}));

/* Work stays with people of the role it was planned for. */
const roleOf = (lane: string) => PEOPLE.find((person) => person.id === lane)?.role;
const START_ROLE = new Map(START.map((item) => [item.id, roleOf(item.lane)]));
const mayGo = (item: Subtask, lane: string) => START_ROLE.get(item.id) === roleOf(lane);

export default function AroundLeave() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  const [last, setLast] = useState("Drag Freya's store screenshots into her holiday");

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    setWork((current) => current.map((item) => applyIntent(item, intent)));
    setLast(`${intent.subtask}: ${intent.kind}`);
  };

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="The apps team this week, with leave"
        initialDomain={[day(9), day(21)]}
        height={236}
        intents={["move", "lane"]}
        canMoveTo={mayGo}
        onIntent={onIntent}
      >
        {APPS.map((person) => (
          <Lane key={person.id} id={person.id} label={`${person.name}, ${person.role}`} />
        ))}
        <BlockedTimes data={AWAY} />
        <Subtasks data={work} tasks={PROJECTS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-move>
        {last}
      </Text>
    </Stack>
  );
}
