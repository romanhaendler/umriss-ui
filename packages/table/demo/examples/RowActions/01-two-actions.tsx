import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Two actions";

export const lead = "Put `Action`s into `RowActions`; `onSelect` receives the row, and each button is read out with the row's name, as in “Open: INV-26-0318”.";

interface Invoice {
  id: string;
  supplier: string;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply" },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events" },
  { id: "INV-26-0309", supplier: "Nimbrel Software" },
];

export default function TwoActions() {
  const [last, setLast] = useState("No action yet.");
  const { Table, Column, RowActions, Action } = useTable(INVOICES, { rowKey: (i) => i.id });

  return (
    <Stack gap={3}>
      <Table ariaLabel="Invoices">
        <Column value="id" label="Invoice" rowHeader />
        <Column value="supplier" label="Supplier" />
        <RowActions>
          <Action onSelect={(i) => setLast(`${i.id} opened`)}>Open</Action>
          <Action onSelect={(i) => setLast(`${i.id} forwarded`)}>Forward</Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
