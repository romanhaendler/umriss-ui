import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "A key that is no column: GroupBy";

/* The shift is nowhere in the rows - it follows from the time of the reading.
   As a column it would repeat what the timestamp already says. `GroupBy`
   declares it as a group key: typed against the rows like a column, but with
   no cell, no export and no entry among the columns. It appears only where a
   grouping is chosen - here by default, and in the column menu. */

interface Reading {
  id: string;
  machine: string;
  at: Date;
  torque: number;
}

const at = (d: number, h: number, m: number) => new Date(2026, 8, d, h, m);

const READINGS: Reading[] = [
  { id: "R-1", machine: "Press 1", at: at(23, 6, 40), torque: 48.2 },
  { id: "R-2", machine: "Press 1", at: at(23, 11, 5), torque: 51.7 },
  { id: "R-3", machine: "Press 2", at: at(23, 15, 20), torque: 46.9 },
  { id: "R-4", machine: "Press 1", at: at(23, 18, 55), torque: 55.1 },
  { id: "R-5", machine: "Press 2", at: at(23, 23, 10), torque: 44.3 },
  { id: "R-6", machine: "Press 2", at: at(24, 2, 45), torque: 43.8 },
  { id: "R-7", machine: "Press 1", at: at(24, 4, 30), torque: 49.6 },
];

const shiftOf = (d: Date) => (d.getHours() < 6 || d.getHours() >= 22 ? "Night" : d.getHours() < 14 ? "Early" : "Late");

export default function KeyThatIsNoColumn() {
  const { Table, Column, GroupBy } = useTable(READINGS, { rowKey: (r) => r.id, defaultGrouping: "shift" });
  return (
    <Table ariaLabel="Readings by shift">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <GroupBy id="shift" value={(r) => shiftOf(r.at)} label="Shift" />
      <Column value="id" label="Reading" rowHeader />
      <Column value="machine" label="Machine" />
      <Column value="at" label="Measured" format="dateTime" />
      <Column value="torque" label="Torque (Nm)" format={{ decimals: 1 }} aggregate="avg" />
    </Table>
  );
}
