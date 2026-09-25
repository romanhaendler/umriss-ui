import { useTable } from "../../../src";

export const title = "Let people set the width";
export const lead = "`width` is the starting width, `resizable` adds a grip: drag it, double-click it to fit the content, or press Alt and an arrow.";

interface Shipment {
  id: string;
  customer: string;
  note: string;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", note: "Goods entrance at the back, ring twice" },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", note: "Cold chain, hand over in person" },
  { id: "FP-1004236", customer: "Brixley Cycles", note: "Leave with the neighbour at number 90 if the shop is closed" },
];

export default function Width() {
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Table ariaLabel="Shipments with a note">
      <Column value="id" label="Shipment" rowHeader width={120} />
      <Column value="customer" label="Customer" resizable width={180} />
      <Column value="note" label="Note" resizable sortable={false} width={160} />
    </Table>
  );
}
