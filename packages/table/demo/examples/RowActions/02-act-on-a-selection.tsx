import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Act on a selection";

export const lead = "Mark an action `bulk` and it receives a list: one row at the row, the selection in the toolbar that appears while rows are ticked.";

interface Invoice {
  id: string;
  supplier: string;
  costCentre: string;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", costCentre: "Facilities" },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", costCentre: "Marketing" },
  { id: "INV-26-0315", supplier: "Harlow Print Works", costCentre: "Marketing" },
  { id: "INV-26-0312", supplier: "Corrin Travel", costCentre: "Sales" },
];

export default function ActOnASelection() {
  const [last, setLast] = useState("Nothing approved yet.");
  const { Table, Column, RowActions, Action } = useTable(INVOICES, { rowKey: (i) => i.id });

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Invoices awaiting approval">
        <Column value="id" label="Invoice" rowHeader />
        <Column value="supplier" label="Supplier" />
        <Column value="costCentre" label="Cost centre" />
        <RowActions>
          <Action bulk onSelect={(list) => setLast(`Approved: ${list.map((i) => i.id).join(", ")}`)}>
            Approve
          </Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
