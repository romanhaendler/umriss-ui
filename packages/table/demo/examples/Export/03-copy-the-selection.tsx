import { Button, Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Copy the selection";

export const lead = "Ctrl or Cmd with C copies the selected rows, tab-separated under a header line; `selectionAsText()` hands the same text to a button of your own.";

interface Shipment {
  id: string;
  customer: string;
  weight: number;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies", weight: 23.5 },
  { id: "FP-1004223", customer: "Northgate Florists", weight: 41.25 },
  { id: "FP-1004236", customer: "Pellham Hardware", weight: 4 },
];

export default function CopyTheSelection() {
  const t = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Stack direction="row" gap={2} align="center">
        <Button size="sm" variant="secondary" onClick={() => void navigator.clipboard.writeText(t.selectionAsText())} disabled={t.selection.count === 0}>
          Copy as table
        </Button>
        <Text size="xs" tone="muted">
          {t.selection.count} selected
        </Text>
      </Stack>
      <Table selectable ariaLabel="Shipments to copy">
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="weight" label="Weight (kg)" />
      </Table>
    </Stack>
  );
}
