import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Export, Toolbar, csv, useTable } from "../../../src";
import type { ExportFormat } from "../../../src";

export const title = "Choose the format";

export const lead = "Hand `Export` a `format` – `csv` or one of your own, a value with an extension, a MIME type and a `write` – and name its button with `label`; `exportAs` writes the same format without a button.";

interface Shipment {
  id: string;
  weight: number;
  delivered: Date | null;
}

const SHIPMENTS: Shipment[] = [
  { id: "FP-1004210", weight: 23.5, delivered: new Date(Date.UTC(2026, 2, 17, 8, 12)) },
  { id: "FP-1004223", weight: 14, delivered: null },
];

/* Writes the sheet as JSON: the typed cells, a date as its ISO text. */
const json: ExportFormat = {
  extension: "json",
  mime: "application/json",
  write: (sheet) =>
    JSON.stringify(sheet.rows.map((row) => Object.fromEntries(sheet.columns.map((c, i) => [c.label, row[i]])))),
};

export default function ChooseTheFormat() {
  const [text, setText] = useState("Not exported yet.");
  const table = useTable(SHIPMENTS, { rowKey: (s) => s.id });
  const { Table, Column } = table;

  return (
    <Stack gap={3}>
      <Table aria-label="Shipments to export">
        <Toolbar>
          <Export format={csv} label="Export CSV" onExport={setText} />
          <Export format={json} label="Export JSON" onExport={setText} />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="weight" label="Weight (kg)" />
        <Column value="delivered" label="Delivered" format="dateTime" />
      </Table>
      <Text as="pre" size="xs" mono>
        {text}
      </Text>
      <Text size="xs">{table.exportAs(json).length} characters as JSON</Text>
    </Stack>
  );
}
