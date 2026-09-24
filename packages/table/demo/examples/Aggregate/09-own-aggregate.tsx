import { useTable } from "../../../src";

export const title = "An aggregate of one's own";

/* A function takes the values present and the group's rows and returns a
   value of the column's own type; it is written through the column's format
   or presentation like every other value. Here the average cycle time
   weighted by pieces: an order of 5,000 pieces tells more about the line than
   one of 150. */

interface Run {
  id: string;
  line: string;
  shift: string;
  pieces: number;
  cycle: number;
}

const RUNS: Run[] = [
  { id: "R-501", line: "Line 1", shift: "Early", pieces: 4800, cycle: 11.2 },
  { id: "R-502", line: "Line 1", shift: "Late", pieces: 150, cycle: 18.9 },
  { id: "R-503", line: "Line 1", shift: "Late", pieces: 2200, cycle: 12.4 },
  { id: "R-504", line: "Line 2", shift: "Early", pieces: 3600, cycle: 9.8 },
  { id: "R-505", line: "Line 2", shift: "Late", pieces: 900, cycle: 10.6 },
];

export default function OwnAggregate() {
  const { Table, Column } = useTable(RUNS, { rowKey: (r) => r.id, defaultGrouping: ["line", "shift"] });
  return (
    <Table ariaLabel="Cycle times by line">
      <Column value="shift" label="Shift" />
      <Column value="line" label="Line" />
      <Column value="id" label="Run" rowHeader />
      <Column value="pieces" label="Pieces" format="count" aggregate="sum" />
      <Column
        value="cycle"
        label="Cycle (s)"
        format={{ decimals: 1 }}
        aggregate={(_, rows) => rows.reduce((s, r) => s + r.cycle * r.pieces, 0) / rows.reduce((s, r) => s + r.pieces, 0)}
      />
    </Table>
  );
}
