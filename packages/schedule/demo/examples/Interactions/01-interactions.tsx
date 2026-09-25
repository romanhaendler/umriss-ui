import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Dependencies } from "../../../src";
import type { ScheduleInteraction, Subtask, Task, Dependency } from "../../../src";

export const title = "What the pointer reports";

/* `onInteraction` hears a click, a context menu and a change of what is under
   the pointer - each with its target and its position: the subtask and the part
   of it, the dependency, the lane, or nothing; the client point, the time and
   the lane under it. What the application does with it is its own: open a
   menu, show a detail, fill a status line like this one.

   While `onInteraction` is set, a right-click opens no browser menu - the
   application is expected to answer it.

   `onSelectedTaskChange` is the second line below: a click reports the task it
   selected together with the stop it hit, and clicking another stop of the same
   task reports again. */

const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "mill", label: "Mill" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2041", name: "A-2041 Housing", color: "light-dark(#2563eb, #6b9bff)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2041-1", task: "a-2041", lane: "saw", from: at(6), to: at(7), leadIn: min(15), leadOut: min(10) },
  { id: "a-2041-2", task: "a-2041", lane: "mill", from: at(8), to: at(10, 30), leadIn: min(30), leadOut: min(15) },
];

const MOVES: readonly Dependency[] = [
  { id: "t-2041-1", from: "a-2041-1", to: "a-2041-2", lag: min(10) },
];

const describe = (interaction: ScheduleInteraction): string => {
  const { hit } = interaction;
  /* To the nearest minute: a pixel is about a minute wide here. */
  const time = new Date(Math.round(interaction.time / 60_000) * 60_000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const target =
    hit.kind === "subtask"
      ? `subtask ${hit.subtask.id} (${hit.part})`
      : hit.kind === "dependency"
        ? `dependency ${hit.dependency.id}`
        : hit.kind === "lane"
          ? `lane ${hit.lane}`
          : "nothing";
  return `${interaction.type}: ${target} at ${time}`;
};

export default function Interactions() {
  const [last, setLast] = useState("Move the pointer over the plan");
  const [selected, setSelected] = useState("nothing selected");

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March"
        initialDomain={DAY_OF_PLAN}
        height={152}
        onInteraction={(interaction) => setLast(describe(interaction))}
        onSelectedTaskChange={(task, subtask) => setSelected(task === null ? "nothing selected" : `${task} at ${subtask ?? "-"}`)}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Dependencies data={MOVES} />
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-interaction>
        {last}
      </Text>
      <Text size="sm" mono tone="secondary" data-selection>
        {selected}
      </Text>
    </Stack>
  );
}
