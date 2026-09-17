import { useState } from "react";
import { DatePicker, FormField, UmrissProvider, Stack } from "@umriss-ui/core";
import type { LanguageOptions } from "@umriss-ui/core";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Wording and formats, once for both packages";

/* @umriss-ui/table brings no wording of its own. Its texts stand in the
   directory of @umriss-ui/core, its formats come from the same provider - a
   `UmrissProvider` sets both once, for every table and every component beneath
   it.

   Here it writes a date in ISO - in the column "Received" of the table and in
   the `DatePicker` of @umriss-ui/core below it, out of the same entry - calls
   the column menu "View" and the export "Save as CSV". What is sorted and
   exported is still the value: the formats are presentation.

   The entries stand outside the component. A provider that gets a new object on
   every render recomputes on every render. */

const LANGUAGE: LanguageOptions = {
  formats: {
    date: (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  },
  wording: {
    columns: "View",
    exportLabel: "Save as CSV",
    tableSearchPlaceholder: "Search batch …",
  },
};

interface Batch {
  batch: string;
  material: string;
  received: Date;
}

const BATCHES: Batch[] = [
  { batch: "CH-7710", material: "S235JR", received: new Date(2026, 2, 9) },
  { batch: "CH-7712", material: "1.4301", received: new Date(2026, 2, 12) },
  { batch: "CH-7715", material: "AlMg3", received: new Date(2026, 2, 16) },
];

function Batches() {
  const { Table, Column } = useTable(BATCHES, { rowKey: (b) => b.batch });
  return (
    <Table ariaLabel="Batches">
      <Toolbar>
        <Search />
        <ColumnMenu />
        <Export filename="batches.csv" />
      </Toolbar>
      <Column value="batch" label="Batch" rowHeader />
      <Column value="material" label="Material" />
      <Column value="received" label="Received" format="date" />
    </Table>
  );
}

export default function Provider() {
  const [cutoff, setCutoff] = useState<Date | null>(new Date(2026, 2, 16));
  return (
    <UmrissProvider language={LANGUAGE}>
      <Stack gap={4}>
        <Batches />
        <FormField label="Received from">
          <DatePicker value={cutoff} onChange={setCutoff} />
        </FormField>
      </Stack>
    </UmrissProvider>
  );
}
