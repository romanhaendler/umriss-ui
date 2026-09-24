import { useTable } from "../../../src";

export const title = "Compact, with long names and gaps";

/* The maintenance backlog as a planner keeps it: plant › hall › machine,
   compact, selectable. A machine's full name runs long - the span cuts it and
   keeps it in the title, so that no other column has to wrap for it. Two jobs
   belong to no machine; they gather under "No value", last. A hall with a
   single job has a header without a fold or a count. */

interface Job {
  id: string;
  plant: string;
  hall: string;
  machine: string | null;
  task: string;
  hours: number;
  cost: number;
}

const JOBS: Job[] = [
  { id: "M-4410", plant: "Plant North", hall: "Hall A", machine: "Press 1 – hydraulic 400 t with automatic tool change and feeder", task: "Replace hydraulic seal on the main cylinder", hours: 3.5, cost: 1_840 },
  { id: "M-4411", plant: "Plant North", hall: "Hall A", machine: "Press 1 – hydraulic 400 t with automatic tool change and feeder", task: "Calibrate pressure sensor", hours: 1, cost: 240 },
  { id: "M-4412", plant: "Plant North", hall: "Hall A", machine: "Press 2", task: "Change tool", hours: 0.75, cost: 180 },
  { id: "M-4413", plant: "Plant North", hall: "Hall B", machine: null, task: "Inspect crane rail", hours: 2, cost: 520 },
  { id: "M-4414", plant: "Plant North", hall: "Hall B", machine: null, task: "Replace light fittings", hours: 1.5, cost: 310 },
  { id: "M-4415", plant: "Plant North", hall: "Hall B", machine: "Lathe 5", task: "Lubrication round", hours: 0.5, cost: 90 },
  { id: "M-4416", plant: "Plant South", hall: "Hall C", machine: "Mill 6", task: "Spindle bearing check", hours: 4, cost: 960 },
  { id: "M-4417", plant: "Plant South", hall: "Hall C", machine: "Mill 7", task: "Coolant change", hours: 1.25, cost: 275 },
  { id: "M-4418", plant: "Plant South", hall: "Hall C", machine: "Mill 7", task: "Replace way wipers", hours: 2.5, cost: 610 },
  { id: "M-4419", plant: "Plant South", hall: "Hall D", machine: "Robot 8", task: "Gripper jaws", hours: 1, cost: 230 },
];

export default function CompactAndLong() {
  const { Table, Column } = useTable(JOBS, { rowKey: (j) => j.id, defaultGrouping: ["plant", "hall", "machine"] });
  return (
    <Table ariaLabel="Maintenance backlog, compact" density="compact" selectable>
      <Column value="machine" label="Machine" />
      <Column value="id" label="Order" rowHeader />
      <Column value="plant" label="Plant" />
      <Column value="hall" label="Hall" />
      <Column value="task" label="Task" />
      <Column value="hours" label="Hours" format={{ decimals: 2 }} aggregate="sum" />
      <Column value="cost" label="Cost (EUR)" aggregate="sum" />
    </Table>
  );
}
