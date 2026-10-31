import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Toolbar, useTable } from "../../../src";

export const title = "Disabled and hidden per row";

export const lead = "`disabled` greys an action out on the rows it does not apply to; `hidden` takes it away. Either takes a boolean or a function of the row. A bulk action acts only on the selected rows where it is enabled, and the toolbar says how many.";

interface Order {
  id: string;
  number: string;
  status: "open" | "shipped" | "cancelled";
}

const ORDERS: Order[] = [
  { id: "a", number: "A-2041", status: "open" },
  { id: "b", number: "A-2042", status: "shipped" },
  { id: "c", number: "A-2043", status: "cancelled" },
  { id: "d", number: "A-2044", status: "open" },
];

export default function DisabledAndHiddenPerRow() {
  const [last, setLast] = useState("Nothing cancelled yet.");
  const { Table, Column, RowActions, Action } = useTable(ORDERS, { rowKey: (o) => o.id });

  return (
    <Stack gap={3}>
      <Table selectable aria-label="Orders">
        <Toolbar />
        <Column value="number" label="Order" rowHeader />
        <Column value="status" label="Status" />
        <RowActions>
          <Action bulk disabled={(o) => o.status !== "open"} onSelect={(list) => setLast(`Cancelled ${list.length} orders`)}>
            Cancel
          </Action>
          <Action hidden={(o) => o.status === "open"} onSelect={(o) => setLast(`Reopened ${o.number}`)}>
            Reopen
          </Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
