import { Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Keep rows open while searching";

export const lead = "Open two rows, search them away and back: a row stays open by its key, so the details return as they were.";

interface Shipment {
  id: string;
  customer: string;
  note: string;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", note: "Leave at the side gate if closed." },
  { id: "FP-1004223", customer: "Brixley Cycles", note: "Failed attempt at 08:40 – the shop opens at 09:30." },
  { id: "FP-1004236", customer: "Pellham Hardware", note: "Two pallets, tail lift needed." },
  { id: "FP-1004249", customer: "Ashcombe Dental", note: "Reception on the first floor." },
];

export default function KeepRowsOpen() {
  const { Table, Column, RowDetail } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Table ariaLabel="Shipments with notes">
      <Toolbar>
        <Search placeholder="Search customer" />
      </Toolbar>
      <Column value="id" label="Shipment" rowHeader />
      <Column value="customer" label="Customer" />
      <RowDetail>{(s) => <Text size="sm">{s.note}</Text>}</RowDetail>
    </Table>
  );
}
