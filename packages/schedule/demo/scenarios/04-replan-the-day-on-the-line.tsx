import { useState } from "react";
import { Checkbox, ContextMenu, MenuItem, MenuSeparator, Stack, Text } from "@umriss-ui/core";
import { applyIntent, findings, ripple, shiftTask, useSchedule } from "../../src";
import type { Dependency, Intent, ScheduleInteraction, Subtask, Task } from "../../src";

/* Data from the plant world, written out here so the example runs on its own. */

const planAt = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [planAt(5, 30), planAt(18)];

const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "lathe-1", label: "Lathe 1" },
  { id: "lathe-2", label: "Lathe 2" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
  { id: "qa", label: "Inspection" },
] as const;

/* Colours in both schemes, as the application's own tokens would give them. */
const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "a-2042", name: "A-2042 Shaft", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
  { id: "a-2044", name: "A-2044 Flange", color: "light-dark(#7c3aed, #a98bfa)" },
  { id: "a-2045", name: "A-2045 Cover", color: "light-dark(#be185d, #f06aa6)" },
  { id: "a-2046", name: "A-2046 Axle", color: "light-dark(#4d7c0f, #8fc43e)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: planAt(6), to: planAt(7), leadIn: min(15), leadOut: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: planAt(8), to: planAt(10, 30), leadIn: min(30), leadOut: min(15) },
  { id: "a-2041-3", task: "a-2041", lane: "qa", from: planAt(11, 30), to: planAt(12, 15) },

  { id: "a-2042-1", task: "a-2042", lane: "saw", from: planAt(7, 30), to: planAt(8, 15), leadIn: min(10) },
  { id: "a-2042-2", task: "a-2042", lane: "lathe-1", from: planAt(9), to: planAt(11), leadIn: min(20), leadOut: min(15) },
  { id: "a-2042-3", task: "a-2042", lane: "qa", from: planAt(13), to: planAt(13, 30) },

  { id: "a-2043-1", task: "a-2043", lane: "press", from: planAt(6, 30), to: planAt(8), leadIn: min(30), leadOut: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: planAt(10), to: planAt(11, 30), leadIn: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: planAt(12), to: planAt(14), leadIn: min(20), leadOut: min(20) },

  { id: "a-2044-1", task: "a-2044", lane: "lathe-2", from: planAt(6), to: planAt(8, 30), leadIn: min(20), leadOut: min(10) },
  { id: "a-2044-2", task: "a-2044", lane: "press", from: planAt(9, 30), to: planAt(10, 45), leadIn: min(25) },
  { id: "a-2044-3", task: "a-2044", lane: "paint", from: planAt(14, 45), to: planAt(16), leadIn: min(15), leadOut: min(15) },

  { id: "a-2045-1", task: "a-2045", lane: "lathe-1", from: planAt(12), to: planAt(13, 30), leadIn: min(15), leadOut: min(10) },
  { id: "a-2045-2", task: "a-2045", lane: "press", from: planAt(14, 15), to: planAt(15), leadIn: min(20) },
  { id: "a-2045-3", task: "a-2045", lane: "qa", from: planAt(15, 45), to: planAt(16, 30) },

  { id: "a-2046-1", task: "a-2046", lane: "lathe-2", from: planAt(10), to: planAt(12), leadIn: min(20), leadOut: min(15) },
  { id: "a-2046-2", task: "a-2046", lane: "mill", from: planAt(13), to: planAt(14, 30), leadIn: min(20), leadOut: min(10) },
  { id: "a-2046-3", task: "a-2046", lane: "qa", from: planAt(15), to: planAt(15, 30) },
];

const MOVES: readonly Dependency[] = [
  { id: "t-2041-1", from: "a-2041-1", to: "a-2041-2", lag: min(10) },
  { id: "t-2041-2", from: "a-2041-2", to: "a-2041-3", lag: min(20) },
  { id: "t-2042-1", from: "a-2042-1", to: "a-2042-2", lag: min(15) },
  { id: "t-2042-2", from: "a-2042-2", to: "a-2042-3", lag: min(30), leaves: "main" },
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", lag: min(45) },
  /* Leaves the mill at 11:30 and has 10 minutes to reach the paint shop's
     lead-in at 11:40 - it takes 25: a violated dependency, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", lag: min(25) },
  { id: "t-2044-1", from: "a-2044-1", to: "a-2044-2", lag: min(20) },
  { id: "t-2044-2", from: "a-2044-2", to: "a-2044-3", lag: min(60), arrives: "main" },
  { id: "t-2045-1", from: "a-2045-1", to: "a-2045-2", lag: min(15) },
  { id: "t-2045-2", from: "a-2045-2", to: "a-2045-3", lag: min(15) },
  { id: "t-2046-1", from: "a-2046-1", to: "a-2046-2", lag: min(20) },
  { id: "t-2046-2", from: "a-2046-2", to: "a-2046-3", lag: min(10), leaves: "main" },
];

export const title = "Replan the day on the line";

export const lead =
  "A production planner at the tile works moves orders between machines during the day, lets the cascade follow and reads the findings before committing.";

export const callouts = [
  "Whether moving a step pushes the steps after it along, when their dependency no longer fits.",
  "The machines as lanes, each order in its colour: drag a step in time or onto another machine, stretch its lead-in or lead-out, or right-click it for the context menu.",
  "What is wrong with the plan now - overlaps and violated dependencies, counted from the same data after every change.",
  "The intents the schedule reported, newest first: it changes nothing itself.",
];

export const builtFrom = [
  "schedule",
  "dependencies",
  "move-and-lane",
  "stretch",
  "ripple",
  "findings",
  "interactions",
  { name: "ContextMenu", page: "@umriss-ui/core#contextmenu" },
];

/* The whole recipe, as an application writes it.

   The plan lives in the application's state. The schedule draws it, a drag
   reports intents, and the application applies them - here, if asked, with the
   cascade `ripple` computes over the successors. The findings below come from
   the same data and change with every drop.

   A right-click opens `ContextMenu` from @umriss-ui/core at the pointer: the
   schedule reports the interaction with its target and position and knows
   nothing of the menu. The entries act on the data the same way a drag does -
   through intents; moving the whole order is `shiftTask`, one move per stop. */

const QUARTER = 15 * 60_000;

type Menu = { interaction: ScheduleInteraction; subtask: Subtask | null };

type Plan = { steps: readonly Subtask[]; log: readonly string[] };

const START: Plan = { steps: STEPS, log: [] };

/* One drop can report two intents - a move and a lane - one after the other.
   Each is applied to the plan as the previous one left it: a functional update,
   not the plan this render happened to see. */
function applied(plan: Plan, intent: Intent, cascade: boolean): Plan {
  const pushed = cascade ? ripple(plan.steps, MOVES, intent) : [];
  const steps = [intent, ...pushed].reduce((data, change) => data.map((step) => applyIntent(step, change)), plan.steps);
  const subject = intent.kind === "place" ? intent.item : intent.subtask;
  const line = `${intent.kind} ${subject}${pushed.length > 0 ? `, pushed ${pushed.length}` : ""}`;
  return { steps, log: [line, ...plan.log].slice(0, 4) };
}

export default function ReplanTheDay() {
  const { Schedule, Lane, Subtasks, Dependencies } = useSchedule();
  const [plan, setPlan] = useState<Plan>(START);
  const [cascade, setCascade] = useState(true);
  const [menu, setMenu] = useState<Menu | null>(null);

  const apply = (intent: Intent) => setPlan((current) => applied(current, intent, cascade));

  const onInteraction = (interaction: ScheduleInteraction) => {
    if (interaction.type !== "contextmenu") return;
    const subtask = interaction.hit.kind === "subtask" ? interaction.hit.subtask : null;
    setMenu({ interaction, subtask });
  };

  const found = findings(plan.steps, MOVES);
  const target = menu?.subtask ?? null;

  return (
    <Stack gap={3}>
      <div data-callout="1">
        <Checkbox label="Push successors when a dependency no longer fits" checked={cascade} onChange={(e) => setCascade(e.target.checked)} />
      </div>
      <div data-callout="2">
        <Schedule
          ariaLabel="Plan of Tuesday, 17 March, in the planner's hands"
          initialDomain={DAY_OF_PLAN}
          height={380}
          intents={["move", "lane", "stretch", "leadIn", "leadOut"]}
          onIntent={apply}
          onInteraction={onInteraction}
        >
          {STATIONS.map((station) => (
            <Lane key={station.id} id={station.id} label={station.label} />
          ))}
          <Dependencies data={MOVES} />
          <Subtasks data={plan.steps} tasks={ORDERS} />
        </Schedule>
      </div>
      <ContextMenu
        open={menu !== null}
        position={{ x: menu?.interaction.clientX ?? 0, y: menu?.interaction.clientY ?? 0 }}
        onOpenChange={(open) => {
          if (!open) setMenu(null);
        }}
        ariaLabel={target !== null ? `Actions for ${target.id}` : "Actions for the plan"}
      >
        {target !== null ? (
          <>
            <MenuItem onSelect={() => apply({ kind: "move", subtask: target.id, from: target.from - QUARTER, to: target.to - QUARTER })}>
              Earlier by a quarter hour
            </MenuItem>
            <MenuItem onSelect={() => apply({ kind: "move", subtask: target.id, from: target.from + QUARTER, to: target.to + QUARTER })}>
              Later by a quarter hour
            </MenuItem>
            <MenuItem onSelect={() => shiftTask(plan.steps, target.task, QUARTER).forEach(apply)}>
              The whole order later by a quarter hour
            </MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => apply({ kind: "leadIn", subtask: target.id, leadIn: 0 })} disabled={(target.leadIn ?? 0) === 0}>
              Remove the lead-in
            </MenuItem>
          </>
        ) : (
          <MenuItem onSelect={() => setPlan(START)}>Reset the plan</MenuItem>
        )}
      </ContextMenu>
      <Text size="sm" tone="secondary" data-findings-summary data-callout="3">
        {found.overlaps.length} {found.overlaps.length === 1 ? "overlap" : "overlaps"}, {found.violatedDependencies.length}{" "}
        {found.violatedDependencies.length === 1 ? "violated dependency" : "violated dependencies"}
      </Text>
      <Text size="xs" mono tone="muted" data-intent-log data-callout="4">
        {plan.log.length === 0 ? "Drag a subtask, or right-click one" : plan.log.join(" · ")}
      </Text>
    </Stack>
  );
}
