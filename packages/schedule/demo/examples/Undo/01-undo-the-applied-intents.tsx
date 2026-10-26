import { useState, type KeyboardEvent } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { applyIntent, useSchedule } from "../../../src";
import type { Dependency, Intent, Subtask, Task } from "../../../src";

export const title = "Undo the applied intents";

export const lead = "The history is the application's, not the schedule's (ADR-0023, ADR-0032): it keeps the plan before each intent it applies, and Ctrl+Z, ⌘Z on a Mac, or the Undo button pops the last one. The schedule only knows end-to-start, so a start-to-start is one dependency with a negative lag: the lag is the delay less the spec's three hours, and the line is drawn apart.";

const at = (hours: number) => new Date(2026, 2, 17, hours).getTime();
const HOUR = 60 * 60_000;

const PROJECTS: Task[] = [{ id: "portal", name: "Member portal", color: "light-dark(#7c3aed, #a98bfa)" }];

const START: readonly Subtask[] = [
  { id: "spec", task: "portal", lane: "arjun", from: at(9), to: at(12), name: "Specification" },
  { id: "build", task: "portal", lane: "chloe", from: at(10), to: at(13), name: "Build" },
];

/* Start-to-start: the build may begin an hour after the spec begins, which is
   a lag of one hour less the spec's three hours. */
const LINKS: readonly Dependency[] = [
  { id: "spec-starts-build", from: "spec", to: "build", lag: HOUR - 3 * HOUR, route: "orthogonal", ends: "dot" },
];

export default function UndoIntents() {
  const [state, setState] = useState<{ plan: readonly Subtask[]; history: readonly (readonly Subtask[])[] }>({
    plan: START,
    history: [],
  });

  const apply = (intent: Intent) =>
    setState((s) => ({ plan: s.plan.map((item) => applyIntent(item, intent)), history: [...s.history, s.plan] }));

  const undo = () =>
    setState((s) => {
      const previous = s.history.at(-1);
      return previous === undefined ? s : { plan: previous, history: s.history.slice(0, -1) };
    });

  /* The key belongs to the page: the plot leaves Ctrl and ⌘ to it. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
    }
  };

  const { Schedule, Lane, Subtasks, Dependencies } = useSchedule({ initialView: { domain: [at(8), at(15)] } });

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" variant="secondary" disabled={state.history.length === 0} onClick={undo}>
          Undo
        </Button>
        <Text size="xs" tone="muted">
          {state.history.length} to undo
        </Text>
      </Stack>
      <div onKeyDown={onKeyDown}>
        <Schedule
          aria-label="Specification and build, the build starting an hour after the spec starts"
          height={150}
          intents={["move", "lane"]}
          onIntent={apply}
        >
          <Lane id="arjun" label="Arjun Mehta" />
          <Lane id="chloe" label="Chloe Durand" />
          <Dependencies data={LINKS} />
          <Subtasks data={state.plan} tasks={PROJECTS} />
        </Schedule>
      </div>
    </Stack>
  );
}
