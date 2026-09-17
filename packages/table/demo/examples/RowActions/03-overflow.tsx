import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "From three actions on: all of them in the menu";

/* Up to two actions stand as buttons in the row. From three on, all of them
   stand in a menu named after the row - not two buttons and a menu: the column
   would get a different width depending on the number, and an action would
   wander out of the row into the menu as soon as a third one was added.

   The menu gives the focus back to its trigger when it closes. `tone="danger"`
   colours the entry that destroys something. */

interface Order {
  number: string;
  customer: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks" },
  { number: "A-2042", customer: "Keller & Sons" },
  { number: "A-2043", customer: "Northworks" },
];

export default function Overflow() {
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
          <Action tone="danger" onSelect={(o) => setLast(`${o.number} archived`)}>
            Archive
          </Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
