import { useState } from "react";
import { Alert, Badge, Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Lane, LaneGroup, Schedule, Subtasks, applyIntent, findings } from "../../src";
import type { BlockedTime, Intent, Subtask } from "../../src";
import { LEAVE, NOW, PEOPLE, PROJECTS, SPRINTS, WORK } from "@umriss-ui/demo/worlds/planning";

export const title = "Plan the sprint around leave";

export const lead =
  "A team lead checks the running sprint against holidays, sick days and training, and moves the work that lands on someone who is away.";

export const callouts = [
  "The sprint and its goal, as the team agreed it at planning.",
  "People as lanes in their two teams; the axis leaves nights and weekends out.",
  "Leave, sickness and training, hatched on the person's lane - a drag does not put work into it.",
  "Work planned into someone's absence, listed from the same data: drag it onto a teammate and it leaves the list.",
];

export const builtFrom = [
  "schedule",
  "lane-groups",
  "blocked-time",
  "time-axis",
  "where-it-may-go",
  "findings",
  { name: "Alert", page: "@umriss-ui/core#alert" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
];

const at = (day: number, hours = 9) => new Date(2026, 2, day, hours).getTime();

const SPRINT = SPRINTS.find((one) => one.id === "sprint-14")!;

/* The working days of the sprint: the axis shows these and nothing else. */
const WORKING_DAYS = [9, 10, 11, 12, 13, 16, 17, 18, 19, 20].map((day) => ({
  from: at(day, 8),
  to: at(day, 18),
}));

/* Added after planning, before anyone looked at the leave table. */
const START: readonly Subtask[] = [
  ...WORK,
  {
    id: "w-117",
    task: "portal",
    lane: "arjun",
    from: at(18),
    to: at(19, 17),
    name: "Account deletion",
  },
];

const BLOCKED: readonly BlockedTime[] = LEAVE.map((leave) => ({
  id: leave.id,
  lane: leave.person,
  from: leave.from,
  to: leave.to,
  label: leave.reason,
}));

const teamOf = (person: string) => PEOPLE.find((one) => one.id === person)?.team;
const nameOf = (person: string) => PEOPLE.find((one) => one.id === person)?.name ?? person;

export default function SprintAroundLeave() {
  const [work, setWork] = useState<readonly Subtask[]>(START);

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    setWork((current) => current.map((item) => applyIntent(item, intent)));
  };

  const clashes = findings(work, [], BLOCKED).inBlockedTime;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap data-callout="1">
        <Badge tone="accent">{SPRINT.name}</Badge>
        <Text size="sm">{SPRINT.goal}</Text>
        <Text size="sm" tone="secondary">
          9 to 20 March
        </Text>
      </Stack>
      <div data-callout="2">
        <Schedule
          ariaLabel="Sprint 14, work per person"
          initialDomain={[SPRINT.from, SPRINT.to]}
          calendar={WORKING_DAYS}
          height={570}
          now={NOW}
          intents={["move", "lane"]}
          canMoveTo={(item, lane) => teamOf(item.lane) === teamOf(lane)}
          onIntent={onIntent}
          label={(item) => item.name ?? ""}
        >
          {(["Web", "Apps"] as const).map((team) => (
            <LaneGroup key={team} id={team} label={`${team} team`}>
              {PEOPLE.filter((one) => one.team === team).map((person) => (
                <Lane key={person.id} id={person.id} label={person.name} />
              ))}
            </LaneGroup>
          ))}
          <BlockedTimes data={BLOCKED} />
          <Subtasks data={work} tasks={PROJECTS} />
        </Schedule>
      </div>
      <Text size="sm" tone="secondary" data-callout="3">
        Hatched: away. Work moves between people of one team only.
      </Text>
      <div data-callout="4" data-leave-findings>
        {clashes.length === 0 ? (
          <Alert tone="success" title="The sprint fits around everyone's leave" />
        ) : (
          <Alert
            tone="warning"
            title={`${clashes.length} ${clashes.length === 1 ? "item is" : "items are"} planned into an absence`}
          >
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {clashes.map((found) => {
                const item = work.find((one) => one.id === found.subtask);
                const reason = BLOCKED.find((one) => one.id === found.blocked)?.label ?? "leave";
                return (
                  <li
                    key={`${found.subtask}:${found.blocked}`}
                  >{`${item?.name ?? found.subtask}: ${nameOf(found.lane)} is away (${reason.toLowerCase()})`}</li>
                );
              })}
            </ul>
          </Alert>
        )}
      </div>
    </Stack>
  );
}
