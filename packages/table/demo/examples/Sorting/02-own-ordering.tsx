import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Export, Toolbar, useTable } from "../../../src";

export const title = "Sort and export a value that is an object";
export const lead = "A value without an order or a text form needs `children`; `sortValue` gives what to sort by, `exportValue` the text for the file.";

interface Parcel {
  id: string;
  size: { length: number; width: number; height: number };
}

const PARCELS: Parcel[] = [
  { id: "FP-1004210", size: { length: 60, width: 40, height: 40 } },
  { id: "FP-1004223", size: { length: 30, width: 20, height: 10 } },
  { id: "FP-1004236", size: { length: 120, width: 60, height: 20 } },
];

export default function OwnOrdering() {
  const [csv, setCsv] = useState("Not exported yet.");
  const { Table, Column } = useTable(PARCELS, { rowKey: (p) => p.id });

  return (
    <Stack gap={3}>
      <Table ariaLabel="Parcels">
        <Toolbar>
          <Export onExport={setCsv} />
        </Toolbar>
        <Column value="id" label="Parcel" rowHeader />
        <Column
          value="size"
          label="Size (cm)"
          sortValue={(s) => s.length * s.width * s.height}
          exportValue={(s) => `${s.length} x ${s.width} x ${s.height}`}
        >
          {(s) => `${s.length} × ${s.width} × ${s.height}`}
        </Column>
      </Table>
      <Text as="pre" size="xs" mono>
        {csv}
      </Text>
    </Stack>
  );
}
