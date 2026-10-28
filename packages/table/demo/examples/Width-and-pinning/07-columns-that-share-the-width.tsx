import { ColumnMenu, useTable } from "../../../src";

export const title = "Columns that share the width";
export const lead = "`flex` takes a share of the width the other columns leave - two columns with `flex={1}` split it equally - and `minWidth` keeps one readable. A column the reader drags keeps the dragged width. \"Fit all columns\" in the column menu, or `autoSizeColumns()`, sets every column to its content.";

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

export default function SharedWidth() {
  const { Table, Column, autoSizeColumns } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <>
      <button type="button" onClick={autoSizeColumns}>
        Fit now
      </button>
      <Table aria-label="Shipments filling the frame">
        <ColumnMenu />
        <Column value="id" label="Shipment" rowHeader width={120} />
        <Column value="customer" label="Customer" resizable flex={1} minWidth={140} />
        <Column value="note" label="Note" resizable sortable={false} flex={1} minWidth={160} />
      </Table>
    </>
  );
}
