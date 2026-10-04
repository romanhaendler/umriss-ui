import { Button, Stack, Text } from "@umriss-ui/core";
import { useTable, useTableSelection } from "../../../src";

export const title = "Hold the selection yourself";
export const lead = "Make it with `useTableSelection` and pass it to `useTable` as `selection`: the application counts it, fills it and clears it from controls of its own.";

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
];

const IDS = SHIPMENTS.map((s) => s.id);
const OAKRIDGE = SHIPMENTS.filter((s) => s.customer === "Oakridge Pharmacy").map((s) => s.id);

export default function HoldTheSelectionYourself() {
  const selection = useTableSelection(IDS);
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id, selection });

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center" wrap>
        <Button size="sm" variant="secondary" onClick={() => OAKRIDGE.filter((id) => !selection.isSelected(id)).forEach(selection.toggle)}>
          Select Oakridge Pharmacy
        </Button>
        <Button size="sm" variant="secondary" onClick={selection.clear} disabled={selection.count === 0}>
          Clear
        </Button>
        <Text size="xs" tone="muted">
          {selection.count} of {SHIPMENTS.length} to load
        </Text>
      </Stack>
      <Table selectable ariaLabel="Shipments">
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="tour" label="Tour" />
      </Table>
    </Stack>
  );
}
