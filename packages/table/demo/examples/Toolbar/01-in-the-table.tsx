import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Export, Search, Toolbar, useTable } from "../../../src";

export const title = "In the table";

/* The table toolbar stands in the flow above the table, wherever it stands in
   the JSX: on the left what one puts into it - search, column menu, export - and
   behind that the conditions of the column filters; on the right, as long as
   something restricts, the ratio of matches and "Reset", and as long as a
   selection stands, its count and the table's bulk actions.

   It does not float and does not travel along; that would be a dock. */

interface Order {
  number: string;
  customer: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", quantity: 120 },
  { number: "A-2042", customer: "Keller & Sons", quantity: 48 },
  { number: "A-2043", customer: "Northworks", quantity: 1250 },
];

export default function InTheTable() {
  const [last, setLast] = useState("Nothing blocked yet.");
  const { Table, Column, RowActions, Action } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Orders">
        <Toolbar>
          <Search placeholder="Search customer" />
          <ColumnMenu />
          <Export filename="orders.csv" />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="quantity" label="Quantity" />
        <RowActions>
          <Action bulk tone="danger" onSelect={(list) => setLast(`Blocked: ${list.map((o) => o.number).join(", ")}`)}>
            Block
          </Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
