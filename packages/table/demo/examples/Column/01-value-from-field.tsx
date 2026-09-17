import { useTable } from "../../../src";

export const title = "The value out of a field";

/* `value` names a field of the row. The compiler offers exactly the fields
   `STORES` has, and a mistyped name breaks the build.

   The field supplies the column's id at the same time: under `stock` the column
   menu, the view and the export know it. What is sorted, searched and exported
   is the value - never what the cell shows. */

interface Part {
  number: string;
  description: string;
  stock: number;
}

const STORES: Part[] = [
  { number: "T-1180", description: "Flange DN 50", stock: 240 },
  { number: "T-1204", description: "Shaft Ø 32 × 410", stock: 18 },
  { number: "T-1311", description: "Bearing cap", stock: 1065 },
];

export default function ValueFromField() {
  const { Table, Column } = useTable(STORES, { rowKey: (p) => p.number });

  return (
    <Table ariaLabel="Stores">
      <Column value="number" label="Part" rowHeader />
      <Column value="description" label="Description" />
      <Column value="stock" label="Stock" />
    </Table>
  );
}
