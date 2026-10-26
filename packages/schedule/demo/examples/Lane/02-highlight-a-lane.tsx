import { useState } from "react";
import { Badge, Button, Stack, Text } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { Subtask, Task } from "../../../src";

export const title = "Highlight a lane";

export const lead = "The application marks a lane by putting a `Badge` into its `label`, and `scrollToLane` brings it into view when it is picked from the list; the schedule has no highlight of its own.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();

const ROUNDS: Task[] = [{ id: "rounds", name: "Rounds", color: "light-dark(#0d9488, #3cc7b8)" }];

const CREWS = Array.from({ length: 12 }, (_, i) => ({ id: `crew-${i + 1}`, label: `Crew ${String(i + 1).padStart(2, "0")}` }));

const WORK: Subtask[] = CREWS.map((crew, i) => ({
  id: `${crew.id}-round`,
  task: "rounds",
  lane: crew.id,
  from: at(7, 30 * (i % 6)),
  to: at(9, 30 * (i % 6)),
  leadIn: 15 * 60_000,
}));

export default function HighlightLane() {
  const [marked, setMarked] = useState<string | null>(null);
  const { Schedule, Lane, Subtasks, scrollToLane } = useSchedule({ initialView: { domain: [at(6), at(14)] } });

  const pick = (id: string) => {
    setMarked(id);
    scrollToLane(id);
  };

  return (
    <Stack direction="row" gap={3} align="flex-start">
      <Stack gap={1} style={{ flex: "none" }}>
        {CREWS.map((crew) => (
          <Button
            key={crew.id}
            size="sm"
            variant={marked === crew.id ? "secondary" : "ghost"}
            aria-pressed={marked === crew.id}
            onClick={() => pick(crew.id)}
          >
            {crew.label}
          </Button>
        ))}
      </Stack>
      <Schedule aria-label="Twelve crews, one round each, a crew picked from the list" height={200} laneHeight={32} headerWidth={150}>
        {CREWS.map((crew) => (
          <Lane
            key={crew.id}
            id={crew.id}
            label={
              marked === crew.id ? (
                <Stack direction="row" gap={1} align="center">
                  <Text size="sm">{crew.label}</Text>
                  <Badge tone="accent">Picked</Badge>
                </Stack>
              ) : (
                crew.label
              )
            }
          />
        ))}
        <Subtasks data={WORK} tasks={ROUNDS} />
      </Schedule>
    </Stack>
  );
}
