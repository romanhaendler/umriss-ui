import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { useTable } from "../../../src";

export const title = "A bulk action always receives a list";

/* `bulk` makes an action a bulk action. It still stands at the row and receives
   a list there made of that one row; as long as a selection stands it also
   stands in the table toolbar and receives the selection within the filtered
   set.

   A list in both cases means: the same function, one confirmation for three
   orders and not three. The table toolbar appears with the selection - it does
   not have to be put there to carry the bulk action. */

interface Order {
  number: string;
  customer: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks" },
  { number: "A-2042", customer: "Keller & Sons" },
  { number: "A-2043", customer: "Northworks" },
];

export default function BulkAction() {
  const [last, setLast] = useState("Nothing released yet.");
  const { Table, Column, RowActions, Action } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Orders for release">
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
        <RowActions>
          <Action bulk onSelect={(list) => setLast(`Released: ${list.map((o) => o.number).join(", ")}`)}>
            Release
          </Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
