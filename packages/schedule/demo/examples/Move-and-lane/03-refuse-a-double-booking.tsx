import { useRef, useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, applyIntent, overlaps } from "../../../src";
import type { Intent, Subtask } from "../../../src";
import { PEOPLE, PROJECTS, WORK } from "@umriss-ui/demo/worlds/planning";

export const title = "Refuse a move that double-books someone";

export const lead = "Your `onIntent` decides: here it applies a drop only when `overlaps` finds no new double booking, and says why otherwise.";

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();

const WEB = PEOPLE.filter((person) => person.team === "Web" && WORK.some((item) => item.lane === person.id));
const START: readonly Subtask[] = WORK.filter((item) => WEB.some((person) => person.id === item.lane));

export default function RefuseADoubleBooking() {
  const [work, setWork] = useState<readonly Subtask[]>(START);
  /* A drop onto another lane at another time reports two intents in one
     tick; each is decided on the plan the one before it left. */
  const plan = useRef(work);
  const [said, setSaid] = useState("Drag a work item onto someone who is busy");

  const onIntent = (intent: Intent) => {
    if (intent.kind === "place") return;
    const next = plan.current.map((item) => applyIntent(item, intent));
    const moved = intent.subtask;
    const clash = overlaps(next).find((o) => o.first === moved || o.second === moved);
    if (clash !== undefined) {
      setSaid(`Not applied: ${moved} would share ${clash.lane}'s time with ${clash.first === moved ? clash.second : clash.first}.`);
      return;
    }
    plan.current = next;
    setWork(next);
    setSaid(`Applied: ${intent.kind} ${moved}.`);
  };

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Sprint 14 of the web team, editable"
        initialDomain={[day(9), day(21)]}
        height={240}
        intents={["move", "lane"]}
        onIntent={onIntent}
      >
        {WEB.map((person) => (
          <Lane key={person.id} id={person.id} label={person.name} />
        ))}
        <Subtasks data={work} tasks={PROJECTS} />
      </Schedule>
      <Text size="sm" tone="secondary" data-decision>
        {said}
      </Text>
    </Stack>
  );
}
