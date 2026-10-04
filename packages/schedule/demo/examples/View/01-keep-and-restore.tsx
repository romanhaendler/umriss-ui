import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { useSchedule } from "../../../src";
import type { ScheduleView, Subtask, Task } from "../../../src";

export const title = "Keep and restore a view";

export const lead = "`onViewChange` reports the span and the folded groups as one view; keep it - here in the browser's storage, so it outlives a reload - and hand it back through `initialView`. Pan, zoom, fold, keep, reload, restore.";

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const START: ScheduleView = { domain: [at(6), at(16)] };
const KEPT = "umriss-schedule-demo-view";

/* Storage can be missing or refuse - a private window, a blocked site. The
   view is then simply not kept. */
function readKept(): ScheduleView | null {
  try {
    const stored = localStorage.getItem(KEPT);
    return stored === null ? null : (JSON.parse(stored) as ScheduleView);
  } catch {
    return null;
  }
}

function keep(view: ScheduleView): void {
  try {
    localStorage.setItem(KEPT, JSON.stringify(view));
  } catch {
    /* Not kept; the schedule works on regardless. */
  }
}

const TEAMS: Task[] = [
  { id: "portal", name: "Member portal", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "billing", name: "Billing run", color: "light-dark(#0d9488, #3cc7b8)" },
];

const WORK: Subtask[] = [
  { id: "p1", task: "portal", lane: "noah", from: at(7), to: at(9, 30), leadOut: min(15) },
  { id: "p2", task: "portal", lane: "arjun", from: at(10), to: at(13), leadIn: min(30) },
  { id: "b1", task: "billing", lane: "mei", from: at(8), to: at(11) },
  { id: "b2", task: "billing", lane: "lukas", from: at(11, 30), to: at(14, 30), leadIn: min(15) },
];

export default function KeepAndRestore() {
  /* The application holds the view the schedule reports; handing it another
     one is all it takes to restore. */
  const [view, setView] = useState<ScheduleView>(START);
  const [kept, setKept] = useState<ScheduleView | null>(readKept);
  const { Schedule, Lane, LaneGroup, Subtasks, setDomain } = useSchedule({ initialView: view, onViewChange: setView });

  return (
    <Stack gap={3}>
      <Schedule ariaLabel="Two teams on Tuesday, 17 March" height={290}>
        <LaneGroup id="product" label="Product">
          <Lane id="noah" label="Noah Fischer" />
          <Lane id="arjun" label="Arjun Mehta" />
        </LaneGroup>
        <LaneGroup id="finance" label="Finance">
          <Lane id="mei" label="Mei Tanaka" />
          <Lane id="lukas" label="Lukas Brandt" />
        </LaneGroup>
        <Subtasks data={WORK} tasks={TEAMS} />
      </Schedule>
      <Stack gap={1}>
        <Text as="span" size="sm" tone="secondary">
          What the application would keep
        </Text>
        {/* JSON has no space to break at: without this it ran past a phone's card. */}
        <Text as="code" size="sm" mono data-role="view" style={{ overflowWrap: "anywhere" }}>
          {JSON.stringify(view)}
        </Text>
      </Stack>
      <Stack direction="row" gap={2} wrap>
        <Button
          size="sm"
          onClick={() => {
            keep(view);
            setKept(view);
          }}
          data-keep
        >
          Keep this view
        </Button>
        <Button size="sm" variant="ghost" disabled={kept === null} onClick={() => kept && setView(kept)} data-restore>
          Restore the kept view
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDomain(null)} data-whole-plan>
          Show the whole plan
        </Button>
      </Stack>
    </Stack>
  );
}
