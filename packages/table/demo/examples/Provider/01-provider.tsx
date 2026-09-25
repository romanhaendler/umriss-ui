import { useState } from "react";
import { DatePicker, FormField, UmrissProvider, Stack } from "@umriss-ui/core";
import type { LanguageOptions } from "@umriss-ui/core";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Set wording and formats once";
export const lead = "The table's texts and formats come from the core `UmrissProvider`: one `language` object sets them for the table and the date picker alike.";

/* Outside the component: a provider that gets a new object on every render
   recomputes on every render. */
const LANGUAGE: LanguageOptions = {
  formats: {
    date: (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  },
  wording: {
    columns: "View",
    exportLabel: "Save as CSV",
    tableSearchPlaceholder: "Search invoice …",
  },
};

interface Invoice {
  id: string;
  supplier: string;
  received: Date;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", received: new Date(2026, 2, 16) },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", received: new Date(2026, 2, 13) },
  { id: "INV-26-0309", supplier: "Nimbrel Software", received: new Date(2026, 2, 9) },
];

function Invoices() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id });
  return (
    <Table ariaLabel="Invoices">
      <Toolbar>
        <Search />
        <ColumnMenu />
        <Export filename="invoices.csv" />
      </Toolbar>
      <Column value="id" label="Invoice" rowHeader />
      <Column value="supplier" label="Supplier" />
      <Column value="received" label="Received" format="date" />
    </Table>
  );
}

export default function Provider() {
  const [from, setFrom] = useState<Date | null>(new Date(2026, 2, 9));
  return (
    <UmrissProvider language={LANGUAGE}>
      <Stack gap={4}>
        <Invoices />
        <FormField label="Received from">
          <DatePicker value={from} onChange={setFrom} />
        </FormField>
      </Stack>
    </UmrissProvider>
  );
}
