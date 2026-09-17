import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "Two actions in the row";

/* `RowActions` holds a row's `Action`s; `onSelect` receives the row.

   The quiet gesture: at rest the buttons stand in the secondary type, with the
   pointer over the row or the focus in it they stand in the accent. They are
   visible at all times - revealing them on pointer contact alone would pass
   every screenshot and would be invisible to anyone who does not use a mouse.
   They are read out with the name of the row: "Open: A-2041". */

interface Order {
  number: string;
  customer: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks" },
  { number: "A-2042", customer: "Keller & Sons" },
  { number: "A-2043", customer: "Northworks" },
];

export default function RowActionsExample() {
  const [last, setLast] = useState("No action yet.");
  const { Table, Column, RowActions, Action } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Stack gap={3}>
      <Table ariaLabel="Orders">
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
        <RowActions>
          <Action onSelect={(o) => setLast(`${o.number} opened`)}>Open</Action>
          <Action onSelect={(o) => setLast(`${o.number} duplicated`)}>Duplicate</Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
