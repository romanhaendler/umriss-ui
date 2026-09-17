import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Export, Toolbar, useTable } from "../../../src";

export const title = "sortValue and exportValue";

/* A value without an ordering of its own and without a textual form - here a
   size made of width and height - demands `children`, and it sorts and stands
   in the export only once the column says how.

   `sortValue` gives the area to sort by, `exportValue` the text for the
   spreadsheet. Both receive the value, never the row: they say something about
   this column, not about the order. */

interface Sheet {
  number: string;
  size: { width: number; height: number };
}

const SHEETS: Sheet[] = [
  { number: "B-11", size: { width: 1250, height: 2500 } },
  { number: "B-12", size: { width: 1000, height: 2000 } },
  { number: "B-13", size: { width: 1500, height: 3000 } },
];

export default function OwnOrdering() {
  const [csv, setCsv] = useState("Not exported yet.");
  const { Table, Column } = useTable(SHEETS, { rowKey: (s) => s.number });

  return (
    <Stack gap={3}>
      <Table ariaLabel="Sheets">
        <Toolbar>
          <Export onExport={setCsv} />
        </Toolbar>
        <Column value="number" label="Sheet" rowHeader />
        <Column
          value="size"
          label="Size (mm)"
          sortValue={(s) => s.width * s.height}
          exportValue={(s) => `${s.width} x ${s.height}`}
        >
          {(s) => `${s.width} × ${s.height}`}
        </Column>
      </Table>
      <Text as="pre" size="xs" mono>
        {csv}
      </Text>
    </Stack>
  );
}
