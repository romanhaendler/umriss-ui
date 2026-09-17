import { useState } from "react";
import { Checkbox, ContextMenu, MenuItem, MenuSeparator, Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports, applyIntent, findings, ripple } from "../../../src";
import type { Intent, ScheduleInteraction, Subtask } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "Demonstration: the plan in the planner's hands";

/* The whole recipe, as an application writes it.

   The plan lives in the application's state. The schedule draws it, a drag
   reports intents, and the application applies them - here, if asked, with the
   cascade `ripple` computes over the successors. The findings below come from
   the same data and change with every drop.

   A right-click opens `ContextMenu` from @umriss-ui/core at the pointer: the
   schedule reports the interaction with its target and position and knows
   nothing of the menu. The entries act on the data the same way a drag does -
   through intents. */

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
  const line = `${intent.kind} ${intent.subtask}${pushed.length > 0 ? `, pushed ${pushed.length}` : ""}`;
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
      <Checkbox label="Push successors when a transport no longer fits" checked={cascade} onChange={(e) => setCascade(e.target.checked)} />
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March, in the planner's hands"
        initialDomain={DAY_OF_PLAN}
        height={380}
        intents={["move", "lane", "stretch", "setup", "teardown"]}
        onIntent={apply}
        onInteraction={onInteraction}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Transports data={MOVES} />
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
            <MenuSeparator />
            <MenuItem onSelect={() => apply({ kind: "setup", subtask: target.id, setup: 0 })} disabled={(target.setup ?? 0) === 0}>
              Remove the setup
            </MenuItem>
          </>
        ) : (
          <MenuItem onSelect={() => setPlan(START)}>Reset the plan</MenuItem>
        )}
      </ContextMenu>
      <Text size="sm" tone="secondary" data-findings-summary>
        {found.overlaps.length} {found.overlaps.length === 1 ? "overlap" : "overlaps"}, {found.lateTransports.length}{" "}
        {found.lateTransports.length === 1 ? "late transport" : "late transports"}
      </Text>
      <Text size="xs" mono tone="muted" data-intent-log>
        {plan.log.length === 0 ? "Drag a subtask, or right-click one" : plan.log.join(" · ")}
      </Text>
    </Stack>
  );
}
