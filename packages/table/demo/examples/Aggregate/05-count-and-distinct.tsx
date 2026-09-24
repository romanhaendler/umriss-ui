import { useTable } from "../../../src";

export const title = "Count and distinct";

/* `"count"` counts the values present - a stoppage without a cause yet does
   not count as one with a cause. `"distinct"` counts the different values:
   eight stoppages, but only three causes. Both work on every value with a
   text form, not only on numbers. */

interface Stoppage {
  id: string;
  machine: string;
  cause: string | null;
  minutes: number;
}

const STOPPAGES: Stoppage[] = [
  { id: "S-2201", machine: "Press 1", cause: "Tool change", minutes: 18 },
  { id: "S-2202", machine: "Press 1", cause: "Material missing", minutes: 42 },
  { id: "S-2203", machine: "Press 2", cause: "Tool change", minutes: 21 },
  { id: "S-2204", machine: "Press 2", cause: null, minutes: 7 },
  { id: "S-2205", machine: "Lathe 4", cause: "Sensor fault", minutes: 35 },
  { id: "S-2206", machine: "Lathe 4", cause: "Tool change", minutes: 16 },
  { id: "S-2207", machine: "Press 1", cause: "Material missing", minutes: 25 },
  { id: "S-2208", machine: "Lathe 4", cause: null, minutes: 4 },
];

export default function CountAndDistinct() {
  const { Table, Column } = useTable(STOPPAGES, { rowKey: (s) => s.id });
  return (
    <Table ariaLabel="Stoppages">
      <Column value="id" label="Stoppage" rowHeader aggregate="count" />
      <Column value="machine" label="Machine" aggregate="distinct" />
      <Column value="cause" label="Cause" aggregate="distinct" />
      <Column value="minutes" label="Minutes" aggregate="sum" />
    </Table>
  );
}
