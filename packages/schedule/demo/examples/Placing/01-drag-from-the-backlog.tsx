import { useState } from "react";
import { Card, Stack, Text } from "@umriss-ui/core";
import { Dependencies, Lane, Schedule, Subtasks, applyIntent, subtaskFromPlace } from "../../../src";
import type { Dependency, Intent, PlacingItem, Subtask, Task } from "../../../src";

export const title = "Drag work in from the backlog";

export const lead = "Set `placing` on your list's `dragstart` and clear it on `dragend`; the drop reports a `place` intent that `subtaskFromPlace` turns into work.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const HOUR = 3_600_000;

const PEOPLE = [
  { id: "arjun", label: "Arjun Mehta" },
  { id: "chloe", label: "Chloe Durand" },
  { id: "eva", label: "Eva Novak" },
];

const PROJECTS: readonly Task[] = [
  { id: "shop", name: "Online shop relaunch", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "portal", name: "Member portal", color: "light-dark(#7c3aed, #a98bfa)" },
];

const TODAY: readonly Subtask[] = [
  { id: "w-101", task: "portal", lane: "arjun", from: at(8), to: at(9, 30), name: "Sign-in with e-mail code" },
  { id: "w-103", task: "portal", lane: "chloe", from: at(8), to: at(8, 45), name: "Session handling" },
  { id: "w-104", task: "shop", lane: "chloe", from: at(9, 30), to: at(10, 45), name: "Basket across devices" },
  { id: "w-108", task: "portal", lane: "eva", from: at(11, 30), to: at(12, 15), name: "Test plan for sign-in" },
];

const HANDOVERS: readonly Dependency[] = [{ id: "h-101", from: "w-101", to: "w-108", lag: 20 * 60_000 }];

/* The backlog: what the drag carries, and a label for the list. */
const BACKLOG: readonly (PlacingItem & { label: string })[] = [
  { item: "w-121", label: "Fix sign-in redirect · 2 h", task: "portal", duration: 2 * HOUR },
  { item: "w-122", label: "Update privacy text · 1 h", task: "shop", duration: HOUR },
  { item: "w-123", label: "Accessibility audit · 4 h", task: "shop", duration: 4 * HOUR },
];

export default function DragFromTheBacklog() {
  const [plan, setPlan] = useState<{ work: readonly Subtask[]; placed: number; last: string }>({
    work: TODAY,
    placed: 0,
    last: "Drag an item onto a person",
  });
  const [placing, setPlacing] = useState<PlacingItem | null>(null);

  /* One functional update, so that a second intent in the same tick - and the
     counter the new id is built from - starts from the plan the first left. */
  const onIntent = (intent: Intent) =>
    setPlan((current) => {
      if (intent.kind !== "place") {
        return { ...current, work: current.work.map((item) => applyIntent(item, intent)), last: `${intent.kind} ${intent.subtask}` };
      }
      const placed = current.placed + 1;
      const id = `${intent.item}-${placed}`;
      return { work: [...current.work, subtaskFromPlace(intent, id)], placed, last: `place ${intent.item} on ${intent.lane} as ${id}` };
    });

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2}>
        {BACKLOG.map((entry) => (
          <Card key={entry.item}>
            <div
              draggable
              data-waiting={entry.item}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", entry.item);
                event.dataTransfer.effectAllowed = "copy";
                setPlacing(entry);
              }}
              onDragEnd={() => setPlacing(null)}
              style={{ cursor: "grab" }}
            >
              <Text size="sm">{entry.label}</Text>
            </div>
          </Card>
        ))}
      </Stack>
      <Schedule
        ariaLabel="Today's plan of three people, with the backlog beside it"
        initialDomain={[at(5, 30), at(18)]}
        height={196}
        intents={["place", "move", "lane"]}
        placing={placing}
        onIntent={onIntent}
      >
        {PEOPLE.map((person) => (
          <Lane key={person.id} id={person.id} label={person.label} />
        ))}
        <Dependencies data={HANDOVERS} />
        <Subtasks data={plan.work} tasks={PROJECTS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-place>
        {plan.last}
      </Text>
    </Stack>
  );
}
