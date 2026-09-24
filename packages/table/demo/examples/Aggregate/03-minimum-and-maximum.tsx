import { useTable } from "../../../src";

export const title = "Minimum and maximum";

/* `"min"` and `"max"` take the extremes of numbers and of points in time
   alike, and write them in the column's format: the thinnest wall of the day
   in millimetres, the last inspection as a date and time. */

interface Inspection {
  part: string;
  wall: number;
  inspected: Date;
}

const at = (h: number, m: number) => new Date(2026, 8, 24, h, m);

const INSPECTIONS: Inspection[] = [
  { part: "Housing 40 · 0412", wall: 3.12, inspected: at(6, 42) },
  { part: "Housing 40 · 0413", wall: 3.08, inspected: at(7, 15) },
  { part: "Housing 40 · 0414", wall: 2.97, inspected: at(9, 3) },
  { part: "Housing 40 · 0415", wall: 3.15, inspected: at(11, 48) },
  { part: "Housing 40 · 0416", wall: 3.04, inspected: at(13, 20) },
];

export default function MinimumAndMaximum() {
  const { Table, Column } = useTable(INSPECTIONS, { rowKey: (i) => i.part });
  return (
    <Table ariaLabel="Wall thickness inspections">
      <Column value="part" label="Part" rowHeader />
      <Column value="wall" label="Wall (mm)" format={{ decimals: 2 }} aggregate="min" />
      <Column value="inspected" label="Inspected" format="dateTime" aggregate="max" />
    </Table>
  );
}
