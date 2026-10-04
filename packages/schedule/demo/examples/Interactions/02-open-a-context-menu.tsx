import { useState } from "react";
import { ContextMenu, MenuItem } from "@umriss-ui/core";
import { applyIntent, useSchedule } from "../../../src";
import type { ScheduleInteraction, Subtask, Task } from "../../../src";

/* Data from the operations world, written out here so the example runs on its own. */

const at = (day: number, hours: number, minutes = 0) => new Date(2026, 2, day, hours, minutes).getTime();

interface Engineer {
  id: string;
  name: string;
  team: string;
}

const ENGINEERS: readonly Engineer[] = [
  { id: "priya", name: "Priya Raman", team: "Payments" },
  { id: "jonas", name: "Jonas Keller", team: "Payments" },
  { id: "ada", name: "Ada Mwangi", team: "Identity" },
  { id: "tomasz", name: "Tomasz Nowak", team: "Discovery" },
  { id: "leila", name: "Leila Haddad", team: "Discovery" },
  { id: "sam", name: "Sam Okafor", team: "Messaging" },
  { id: "ines", name: "Ines Duarte", team: "Integrations" },
  { id: "felix", name: "Felix Brandt", team: "Insights" },
];

interface OnCall {
  id: string;
  engineer: string;
  rotation: "primary" | "secondary";
  from: number;
  to: number;
}

/** Monday 16 to Monday 23 March, handed over every morning at 09:00: the
    secondary of one day is the primary of the next. */
const ONCALL: readonly OnCall[] = Array.from({ length: 7 }, (_, day) => [
  { rotation: "primary" as const, engineer: ENGINEERS[day % ENGINEERS.length]!.id },
  { rotation: "secondary" as const, engineer: ENGINEERS[(day + 1) % ENGINEERS.length]!.id },
].map(({ rotation, engineer }) => ({
  id: `${rotation}-${16 + day}`,
  engineer,
  rotation,
  from: at(16 + day, 9),
  to: at(17 + day, 9),
}))).flat();

export const title = "Open a context menu";

export const lead = "On a `contextmenu` interaction, open `ContextMenu` from @umriss-ui/core at `clientX` and `clientY`; its entries change your data.";

const day = (d: number, hours = 0) => new Date(2026, 2, d, hours).getTime();

const ROTATIONS: readonly Task[] = [
  { id: "primary", name: "Primary", color: "light-dark(#2563eb, #6b9bff)" },
  { id: "secondary", name: "Secondary", color: "light-dark(#0d9488, #3cc7b8)" },
];

/* The rotation is the task, the engineer the lane. */
const START: readonly Subtask[] = ONCALL.map((duty) => ({
  id: duty.id,
  task: duty.rotation,
  lane: duty.engineer,
  from: duty.from,
  to: duty.to,
  name: duty.rotation === "primary" ? "Primary" : "Secondary",
}));

export default function OpenAContextMenu() {
  const { Schedule, Lane, Subtasks } = useSchedule({ initialView: { domain: [day(16, 6), day(23, 12)] } });
  const [rota, setRota] = useState<readonly Subtask[]>(START);
  const [menu, setMenu] = useState<{ interaction: ScheduleInteraction; duty: Subtask } | null>(null);

  /* While `onInteraction` is set, a right-click opens no browser menu. */
  const onInteraction = (interaction: ScheduleInteraction) => {
    if (interaction.type !== "contextmenu") return;
    setMenu(interaction.hit.kind === "subtask" ? { interaction, duty: interaction.hit.subtask } : null);
  };

  return (
    <>
      <Schedule
        ariaLabel="On-call rota, 16 to 23 March"
        height={420}
        onInteraction={onInteraction}
      >
        {ENGINEERS.map((engineer) => (
          <Lane key={engineer.id} id={engineer.id} label={engineer.name} />
        ))}
        <Subtasks data={rota} tasks={ROTATIONS} />
      </Schedule>
      <ContextMenu
        open={menu !== null}
        position={{ x: menu?.interaction.clientX ?? 0, y: menu?.interaction.clientY ?? 0 }}
        onOpenChange={(open) => {
          if (!open) setMenu(null);
        }}
        ariaLabel={menu !== null ? `Hand over ${menu.duty.id}` : "Hand over"}
      >
        {menu !== null &&
          ENGINEERS.filter((engineer) => engineer.id !== menu.duty.lane).map((engineer) => (
            <MenuItem
              key={engineer.id}
              onSelect={() => {
                const intent = { kind: "lane", subtask: menu.duty.id, lane: engineer.id } as const;
                setRota((current) => current.map((duty) => applyIntent(duty, intent)));
              }}
            >
              Hand to {engineer.name}
            </MenuItem>
          ))}
      </ContextMenu>
    </>
  );
}
