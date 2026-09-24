import { useTable } from "../../../src";

export const title = "Three levels: plant › hall › machine";

/* Maintenance orders of two plants. Plant and hall are bands - the hall one
   step in, a hairline at the left carrying the depth -, the machine is the
   span beside its orders. Three levels is the most a table holds and still
   reads; the column menu offers no fourth. */

interface Job {
  id: string;
  plant: string;
  hall: string;
  machine: string;
  task: string;
  hours: number;
}

const JOBS: Job[] = [
  { id: "M-4410", plant: "Plant North", hall: "Hall A", machine: "Press 1", task: "Replace hydraulic seal", hours: 3.5 },
  { id: "M-4411", plant: "Plant North", hall: "Hall A", machine: "Press 1", task: "Calibrate pressure sensor", hours: 1 },
  { id: "M-4412", plant: "Plant North", hall: "Hall A", machine: "Press 2", task: "Change tool", hours: 0.75 },
  { id: "M-4413", plant: "Plant North", hall: "Hall B", machine: "Lathe 4", task: "Align tailstock", hours: 2 },
  { id: "M-4414", plant: "Plant North", hall: "Hall B", machine: "Lathe 4", task: "Replace belt", hours: 1.5 },
  { id: "M-4415", plant: "Plant North", hall: "Hall B", machine: "Lathe 5", task: "Lubrication round", hours: 0.5 },
  { id: "M-4416", plant: "Plant South", hall: "Hall C", machine: "Mill 6", task: "Spindle bearing check", hours: 4 },
  { id: "M-4417", plant: "Plant South", hall: "Hall C", machine: "Mill 7", task: "Coolant change", hours: 1.25 },
  { id: "M-4418", plant: "Plant South", hall: "Hall C", machine: "Mill 7", task: "Replace way wipers", hours: 2.5 },
  { id: "M-4419", plant: "Plant South", hall: "Hall D", machine: "Robot 8", task: "Gripper jaws", hours: 1 },
];

export default function ThreeLevels() {
  const { Table, Column } = useTable(JOBS, { rowKey: (j) => j.id, defaultGrouping: ["plant", "hall", "machine"] });
  return (
    <Table ariaLabel="Maintenance orders by plant, hall and machine">
      <Column value="machine" label="Machine" />
      <Column value="id" label="Order" rowHeader />
      <Column value="plant" label="Plant" />
      <Column value="hall" label="Hall" />
      <Column value="task" label="Task" />
      <Column value="hours" label="Hours" format={{ decimals: 2 }} aggregate="sum" />
    </Table>
  );
}
