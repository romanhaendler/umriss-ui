import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Lane, Schedule, Subtasks, Transports } from "../../../src";
import type { Subtask, Task, Transport } from "../../../src";

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
const at = (hours: number, minutes = 0) => new Date(2026, 2, 17, hours, minutes).getTime();
const min = (n: number) => n * 60_000;

const DAY_OF_PLAN: readonly [number, number] = [at(5, 30), at(18)];


const STATIONS = [
  { id: "saw", label: "Saw 1" },
  { id: "lathe-1", label: "Lathe 1" },
  { id: "mill", label: "Mill" },
  { id: "press", label: "Press 2" },
  { id: "paint", label: "Paint shop" },
];

const ORDERS: readonly Task[] = [
  { id: "a-2042", name: "A-2042 Shaft", color: "light-dark(#0d9488, #3cc7b8)" },
  { id: "a-2043", name: "A-2043 Bracket", color: "light-dark(#c2410c, #f08a52)" },
];

const STEPS: readonly Subtask[] = [
  { id: "a-2042-1", task: "a-2042", lane: "saw", from: at(7, 30), to: at(8, 15), setup: min(10) },
  { id: "a-2042-2", task: "a-2042", lane: "lathe-1", from: at(9), to: at(11), setup: min(20), teardown: min(15) },
  { id: "a-2043-1", task: "a-2043", lane: "press", from: at(6, 30), to: at(8), setup: min(30), teardown: min(15) },
  { id: "a-2043-2", task: "a-2043", lane: "mill", from: at(10), to: at(11, 30), setup: min(15) },
  { id: "a-2043-3", task: "a-2043", lane: "paint", from: at(12), to: at(14), setup: min(20), teardown: min(20) },
];

const MOVES: readonly Transport[] = [
  { id: "t-2042-1", from: "a-2042-1", to: "a-2042-2", duration: min(15) },
  { id: "t-2043-1", from: "a-2043-1", to: "a-2043-2", duration: min(45) },
  /* Leaves the mill at 11:30 and has ten minutes to reach the paint shop's
     setup at 11:40 - it takes twenty-five. A late transport, on purpose. */
  { id: "t-2043-2", from: "a-2043-2", to: "a-2043-3", duration: min(25) },
];

export default function Selection() {
  const [selected, setSelected] = useState<string | null>("a-2043");
  const [stop, setStop] = useState<string | null>(null);
  const order = ORDERS.find((o) => o.id === selected);

  return (
    <Stack gap={3}>
      <Schedule
        ariaLabel="Plan of Tuesday, 17 March"
        initialDomain={DAY_OF_PLAN}
        height={284}
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
