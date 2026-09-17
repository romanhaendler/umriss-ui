import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import { DAY_OF_PLAN, MOVES, ORDERS, STATIONS, STEPS } from "../../data";

export const title = "Selecting a task";

/* A click on a subtask selects its whole task: every subtask and every
   transport of it is outlined, across all lanes. A click on a transport selects
   the task it belongs to, a click on the empty plot clears the selection.

   Here the selection is controlled - `selectedTask` and
   `onSelectedTaskChange` -, so the application can show what is selected
   elsewhere. Leave both out and the schedule keeps the selection itself.

   The callback also carries the subtask that was clicked, so an application can
   show the stop and not only the order; clicking another stop of the same order
   reports again. Only the task is controlled - which stop is meant follows the
   pointer. */
export default function Selection() {
  const [selected, setSelected] = useState<string | null>("a-2043");
  const [stop, setStop] = useState<string | null>(null);
  const order = ORDERS.find((o) => o.id === selected);

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March"
        initialDomain={DAY_OF_PLAN}
        height={380}
        selectedTask={selected}
        onSelectedTaskChange={(task, subtask) => {
          setSelected(task);
          setStop(subtask);
        }}
      >
        {STATIONS.map((station) => (
          <Lane key={station.id} id={station.id} label={station.label} />
        ))}
        <Transports data={MOVES} />
        <Subtasks data={STEPS} tasks={ORDERS} />
      </Schedule>
      <Text size="sm" tone="secondary" data-selected-order>
        Selected: {order?.name ?? "nothing"}
        {stop !== null ? `, at ${stop}` : ""}
      </Text>
    </Stack>
  );
}
