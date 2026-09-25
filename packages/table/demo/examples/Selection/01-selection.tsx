import { Stack, Text } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Select rows";
export const lead = "`selectable` adds the selection column; “select all” takes what the search leaves. Search “Oak”, select all, clear the search.";

interface Shipment {
  id: string;
  customer: string;
  tour: string;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", tour: "T-01" },
  { id: "FP-1004223", customer: "Oakridge Pharmacy", tour: "T-01" },
  { id: "FP-1004236", customer: "Brixley Cycles", tour: "T-02" },
  { id: "FP-1004249", customer: "Oakridge Pharmacy", tour: "T-02" },
  { id: "FP-1004262", customer: "Pellham Hardware", tour: "T-03" },
  { id: "FP-1004275", customer: "Oakridge Pharmacy", tour: "T-03" },
];

export default function Selection() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  const { Table, Column } = t;
  const inTheSet = t.filtered.filter((s) => t.selection.isSelected(s.id)).length;

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Shipments">
        <Toolbar>
          <Search placeholder="Search customer" />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="tour" label="Tour" />
      </Table>
      <Text size="xs" tone="muted">
        {t.selection.count} selected, {inTheSet} of them in the filtered set.
      </Text>
    </Stack>
  );
}
