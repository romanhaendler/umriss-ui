import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Nothing declared: the user groups";

/* No grouping in the code - and still a groupable table. Open "Columns" and
   choose under GROUPING: every column whose value is text, a number, a point
   in time or a boolean is offered, the first choice is the outer level, up to
   three. The table toolbar names the grouping in one chip; its menu takes one
   level away or folds everything. */

interface Stoppage {
  id: string;
  machine: string;
  cause: string;
  shift: "Early" | "Late" | "Night";
  minutes: number;
}

const STOPPAGES: Stoppage[] = [
  { id: "S-301", machine: "Press 1", cause: "Tool change", shift: "Early", minutes: 24 },
  { id: "S-302", machine: "Press 1", cause: "Material missing", shift: "Late", minutes: 41 },
  { id: "S-303", machine: "Press 2", cause: "Tool change", shift: "Early", minutes: 18 },
  { id: "S-304", machine: "Lathe 4", cause: "Sensor fault", shift: "Night", minutes: 63 },
  { id: "S-305", machine: "Lathe 4", cause: "Tool change", shift: "Late", minutes: 22 },
  { id: "S-306", machine: "Press 2", cause: "Material missing", shift: "Night", minutes: 35 },
  { id: "S-307", machine: "Mill 6", cause: "Sensor fault", shift: "Early", minutes: 12 },
];

export default function NothingDeclared() {
  const { Table, Column } = useTable(STOPPAGES, { rowKey: (s) => s.id });
  return (
    <Table ariaLabel="Stoppages">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="id" label="Stoppage" rowHeader />
      <Column value="machine" label="Machine" />
      <Column value="cause" label="Cause" />
      <Column value="shift" label="Shift" />
      <Column value="minutes" label="Minutes" aggregate="sum" />
    </Table>
  );
}
