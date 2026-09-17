import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { ScheduleInteraction } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "What the pointer reports";

/* `onInteraction` hears a click, a context menu and a change of what is under
   the pointer - each with its target and its position: the subtask and the part
   of it, the transport, the lane, or nothing; the client point, the time and
   the lane under it. What the application does with it is its own: open a
   menu, show a detail, fill a status line like this one.

   While `onInteraction` is set, a right-click opens no browser menu - the
   application is expected to answer it. */

const describe = (interaction: ScheduleInteraction): string => {
  const { hit } = interaction;
  /* To the nearest minute: a pixel is about a minute wide here. */
  const time = new Date(Math.round(interaction.time / 60_000) * 60_000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const target =
    hit.kind === "subtask"
      ? `subtask ${hit.subtask.id} (${hit.part})`
      : hit.kind === "transport"
        ? `transport ${hit.transport.id}`
        : hit.kind === "lane"
          ? `lane ${hit.lane}`
          : "nothing";
  return `${interaction.type}: ${target} at ${time}`;
};

export default function Interactions() {
  const [last, setLast] = useState("Move the pointer over the plan");

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March"
        initialDomain={DAY_OF_PLAN}
        height={380}
        onInteraction={(interaction) => setLast(describe(interaction))}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Transports data={MOVES} />
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" mono tone="secondary" data-last-interaction>
        {last}
      </Text>
    </Stack>
  );
}
