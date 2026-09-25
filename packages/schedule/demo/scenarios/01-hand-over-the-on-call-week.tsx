import { useState } from "react";
import { Alert, Badge, Stack, Text } from "@umriss-ui/core";
import { BlockedTimes, Lane, Schedule, Subtasks, applyIntent, findings } from "../../src";
import type { BlockedTime, Intent, Subtask, Task } from "../../src";
import { ENGINEERS, NOW, ONCALL } from "@umriss-ui/demo/worlds/operations";

export const title = "Hand over the on-call week";

export const lead =
  "The engineer going off call checks who carries the pager until next Monday and hands on the duties that fall into someone's leave.";

export const callouts = [
  "Who holds the pager right now, read off the rota at the present moment.",
  "One lane per engineer, primary and secondary duties in two colours; the line marks now.",
  "Leila's leave, hatched on her lane: two of her duties fall into it.",
  "The duties in leave, listed from the same data the schedule draws - drag each onto a colleague and it leaves the list.",
];

export const builtFrom = [
  "schedule",
  "blocked-time",
  "now-line",
  "move-and-lane",
  "findings",
  { name: "Alert", page: "@umriss-ui/core#alert" },
  { name: "Badge", page: "@umriss-ui/core#badge" },
];

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();

const ROTATIONS: readonly Task[] = [
  { id: "primary", name: "Primary", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "secondary", name: "Secondary", color: "light-dark(#0d9488, #3cc7b8)" },
];

/* A rota entry is already a subtask: the rotation is its task, the engineer its lane. */
const START: readonly Subtask[] = ONCALL.map((duty) => ({
  id: duty.id,
  task: duty.rotation,
  lane: duty.engineer,
  from: duty.from,
  to: duty.to,
  name: duty.rotation === "primary" ? "Primary" : "Secondary",
}));

const LEAVE: readonly BlockedTime[] = [
  {
    id: "leila-leave",
    lane: "leila",
    from: day(20),
    to: day(23),
    label: "Leave",
  },
];

const nameOf = (id: string) => ENGINEERS.find((one) => one.id === id)?.name ?? id;

const when = (instant: number) =>
  new Date(instant).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function HandOver() {
  const [rota, setRota] = useState<readonly Subtask[]>(START);

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    setRota((current) => current.map((duty) => applyIntent(duty, intent)));
  };

  const onCall = rota.filter((duty) => duty.from <= NOW && NOW < duty.to);
  const inLeave = findings(rota, [], LEAVE).inBlockedTime;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap data-callout="1">
        <Text size="sm" tone="secondary">
          On call now
        </Text>
        {onCall.map((duty) => (
          <Badge key={duty.id} tone={duty.task === "primary" ? "accent" : "neutral"}>
            {`${duty.name}: ${nameOf(duty.lane)}`}
          </Badge>
        ))}
      </Stack>
      <div data-callout="2">
        <Schedule
          ariaLabel="On-call rota, 16 to 23 March"
          initialDomain={[day(16, 6), day(23, 12)]}
          height={420}
          now={NOW}
          intents={["lane"]}
          onIntent={onIntent}
          label={(duty) => duty.name ?? ""}
        >
          {ENGINEERS.map((engineer) => (
            <Lane key={engineer.id} id={engineer.id} label={engineer.name} />
          ))}
          <BlockedTimes data={LEAVE} />
          <Subtasks data={rota} tasks={ROTATIONS} />
        </Schedule>
      </div>
      <Text size="sm" tone="secondary" data-callout="3">
        Hatched: Leila Haddad is on leave from Friday to Sunday.
      </Text>
      <div data-callout="4" data-handover-findings>
        {inLeave.length === 0 ? (
          <Alert tone="success" title="Ready to hand over">
            Every duty this week has someone who is here to take it.
          </Alert>
        ) : (
          <Alert
            tone="warning"
            title={`${inLeave.length} ${inLeave.length === 1 ? "duty falls" : "duties fall"} into leave`}
          >
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {inLeave.map((found) => {
                const duty = rota.find((one) => one.id === found.subtask);
                return (
                  <li key={found.subtask}>
                    {`${duty?.name ?? found.subtask} of ${nameOf(found.lane)}, ${when(found.from)} to ${when(found.to)}`}
                  </li>
                );
              })}
            </ul>
            <Text size="sm" tone="secondary">
              Drag a duty onto a colleague's lane to hand it on.
            </Text>
          </Alert>
        )}
      </div>
    </Stack>
  );
}
