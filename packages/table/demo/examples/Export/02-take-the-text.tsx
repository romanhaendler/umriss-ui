import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Export, Toolbar, useTable } from "../../../src";

export const title = "Take the text";

export const lead = "Pass `onExport` to receive the CSV text instead of a download – for the clipboard or a service; values, not their presentation.";

interface Shipment {
  id: string;
  weight: number;
  delivered: Date | null;
  signed: boolean;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", weight: 23.5, delivered: new Date(Date.UTC(2026, 2, 17, 8, 12)), signed: true },
  { id: "FP-1004223", weight: 14, delivered: null, signed: false },
];

export default function TakeTheText() {
  const [text, setText] = useState("Not exported yet.");
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Stack gap={3}>
      <Table ariaLabel="Shipments to export">
        <Toolbar>
          <Export onExport={setText} />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="weight" label="Weight (kg)" />
        <Column value="delivered" label="Delivered" format="dateTime" />
        <Column value="signed" label="Signed" />
      </Table>
      <Text as="pre" size="xs" mono>
        {text}
      </Text>
    </Stack>
  );
}
