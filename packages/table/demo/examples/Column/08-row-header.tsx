import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "rowHeader: the column that names the row";

/* One column per table may name the row. It becomes the row header cell, it
   cannot be hidden in the column menu, and its text is the name with which the
   row's selection, expander and actions are read out: not "checkbox, not
   checked", but "select A-2041". No `aria-label` by hand. */

interface Order {
  number: string;
  customer: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks" },
  { number: "A-2042", customer: "Keller & Sons" },
  { number: "A-2043", customer: "Northworks" },
];

export default function RowHeader() {
  const [last, setLast] = useState("Nothing opened yet.");
  const { Table, Column, RowActions, Action } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Stack gap={3}>
      <Table selectable ariaLabel="Orders">
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
        <RowActions>
          <Action onSelect={(o) => setLast(`${o.number} opened`)}>Open</Action>
        </RowActions>
      </Table>
      <Text size="sm" tone="secondary" role="status">
        {last}
      </Text>
    </Stack>
  );
}
