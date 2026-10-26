import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Export, Toolbar, csv, useTable } from "../../../src";
import { xlsx } from "../../../src/xlsx";

export const title = "An Excel file";

export const lead =
  "Hand `Export` the `xlsx` format from `@umriss-ui/table/xlsx` for a workbook with real numbers, dates and booleans; with `onExport` it gets the bytes, for a server. An application that never imports the subpath never pays for it.";

interface Shipment {
  id: string;
  weight: number;
  delivered: Date | null;
  signed: boolean;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", weight: 23.5, delivered: new Date(2026, 2, 17, 8, 12), signed: true },
  { id: "FP-1004223", weight: 14, delivered: null, signed: false },
];

export default function AnExcelFile() {
  const [size, setSize] = useState<number | null>(null);
  const { Table, Column } = useTable(SHIPMENTS, { rowKey: (s) => s.id });

  return (
    <Stack gap={3}>
      <Table aria-label="Shipments to export">
        <Toolbar>
          <Export format={csv} label="Export CSV" />
          <Export format={xlsx} label="Export Excel" />
          <Export format={xlsx} label="Take the bytes" onExport={(bytes) => setSize(bytes.length)} />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="weight" label="Weight (kg)" />
        <Column value="delivered" label="Delivered" format="dateTime" />
        <Column value="signed" label="Signed" />
      </Table>
      <Text size="xs">{size === null ? "Not exported yet." : `${size} bytes of workbook`}</Text>
    </Stack>
  );
}
