import { useTable } from "../../../src";

export const title = "Compute a value from the row";
export const lead = "When `value` is a function the column needs an `id`; the computed value sorts, formats and exports like any other.";

interface Line {
  description: string;
  quantity: number;
  unitPrice: number;
}

const LINES: Line[] = [
  { description: "Desk lamps, LED", quantity: 24, unitPrice: 48.9 },
  { description: "Printer paper, box of 5 reams", quantity: 40, unitPrice: 21.5 },
  { description: "Delivery", quantity: 1, unitPrice: 35 },
];

export default function ComputedValue() {
  const { Table, Column } = useTable(LINES, { rowKey: (l) => l.description });

  return (
    <Table ariaLabel="Invoice lines">
      <Column value="description" label="Description" rowHeader />
      <Column value="quantity" label="Quantity" />
      <Column value="unitPrice" label="Unit price (€)" format={{ decimals: 2 }} />
      <Column id="net" label="Net (€)" value={(l) => l.quantity * l.unitPrice} format={{ decimals: 2 }} />
    </Table>
  );
}
