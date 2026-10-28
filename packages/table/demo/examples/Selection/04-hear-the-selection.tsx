import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Hear the selection";
export const lead = "`onSelectionChange` hands the application the ticked keys after each change, so it need not hold the selection itself. Tick rows, then “select all”.";

interface Shipment {
  id: string;
  customer: string;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", customer: "Holloway Garden Supplies" },
  { id: "FP-1004223", customer: "Oakridge Pharmacy" },
  { id: "FP-1004236", customer: "Brixley Cycles" },
];

export default function HearTheSelection() {
  const [keys, setKeys] = useState<string[]>([]);
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id, onSelectionChange: setKeys });

  return (
    <Stack gap={3}>
      <Table selectable aria-label="Shipments">
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
      </Table>
      <Text size="xs" tone="muted">
        Heard: {keys.length === 0 ? "nothing ticked" : keys.join(", ")}.
      </Text>
    </Stack>
  );
}
