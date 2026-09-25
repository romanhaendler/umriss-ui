import { useState } from "react";
import { Checkbox, ContextMenu, MenuItem, MenuSeparator, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Dependencies, applyIntent, findings, ripple, shiftTask } from "../../../src";
import type { Intent, ScheduleInteraction, Subtask } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "Demonstration: the plan in the planner's hands";

/* The one example that does not carry its own data. A demonstration is a whole
   plant - seven stations, six orders and their moves through a Tuesday - and
   ninety lines of it in this file would bury the thing it demonstrates. It is
   shown instead: `data.ts` stands in the second tab of the code view, so a
   reader sees it and can copy both. That is the named exception the check
   allows, and the only one in this demo. */
export const shows = ["../../data.ts"];

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

export default function Demonstration() {
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
      <Checkbox label="Push successors when a dependency no longer fits" checked={cascade} onChange={(e) => setCascade(e.target.checked)} />
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
      <Text size="sm" tone="secondary" data-findings-summary>
        {found.overlaps.length} {found.overlaps.length === 1 ? "overlap" : "overlaps"}, {found.violatedDependencies.length}{" "}
        {found.violatedDependencies.length === 1 ? "violated dependency" : "violated dependencies"}
      </Text>
      <Text size="xs" mono tone="muted" data-intent-log>
        {plan.log.length === 0 ? "Drag a subtask, or right-click one" : plan.log.join(" · ")}
      </Text>
    </Stack>
  );
}
