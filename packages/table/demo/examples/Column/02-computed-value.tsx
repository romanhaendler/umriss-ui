import { useTable } from "../../../src";

export const title = "A computed value needs an id";

/* A value that stands in no field is computed from the row: `value` is then a
   function. A function has no name under which a link or the export could know
   the column - which is why the compiler demands an `id` here.

   The computed value is a value like any other: it sorts, it has a format, it
   stands in the export. */

interface Part {
  number: string;
  stock: number;
  unitPrice: number;
}

const STORES: Part[] = [
  { number: "T-1180", stock: 240, unitPrice: 12.4 },
  { number: "T-1204", stock: 18, unitPrice: 86.9 },
  { number: "T-1311", stock: 1065, unitPrice: 3.15 },
];

export default function ComputedValue() {
  const { Table, Column } = useTable(STORES, { rowKey: (p) => p.number });

  return (
    <Table ariaLabel="Stock value">
      <Column value="number" label="Part" rowHeader />
      <Column value="stock" label="Stock" />
      <Column value="unitPrice" label="Unit price" format={{ decimals: 2 }} />
      <Column
        id="stockValue"
        label="Stock value"
        value={(p) => p.stock * p.unitPrice}
        format={{ decimals: 2 }}
      />
    </Table>
  );
}
