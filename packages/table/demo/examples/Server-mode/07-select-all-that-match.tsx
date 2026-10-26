import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Pagination, Toolbar, useTable } from "../../../src";
import type { AllMatching, TableRequest } from "../../../src";

interface Order {
  id: string;
  customer: string;
  amount: number;
}

const CUSTOMERS = ["Holloway Garden Supplies", "Marlow & Finch Books", "Oakridge Pharmacy", "Brixley Cycles", "Tamsin's Bakery"] as const;
const ORDERS: readonly Order[] = Array.from({ length: 12_400 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(5, "0")}`,
  customer: CUSTOMERS[(i * 3) % CUSTOMERS.length]!,
  amount: 40 + ((i * 7919) % 900),
}));

export const title = "Select all that match";
export const lead = "With the page ticked, the table offers \"Select all 12,400 that match\". The selection is then a state, not a list: all that match, except the rows unticked since. A bulk action receives rows, or - once that state stands - `{ request, except }`, and the `except` key tells the two apart; carrying it out is the server's. A change of search or conditions clears the selection.";

const pageOf = (view: TableRequest) => ORDERS.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);

export default function SelectAllThatMatch() {
  const [answer, setAnswer] = useState(() => {
    const first: TableRequest = { search: "", conditions: {}, sort: [], page: 1, pageSize: 10 };
    return { rows: pageOf(first), answers: first };
  });
  const [done, setDone] = useState("Nothing archived yet.");

  const { Table, Column, RowActions, Action } = useTable(answer.rows, {
    rowKey: (o) => o.id,
    server: true,
    rowCount: ORDERS.length,
    answers: answer.answers,
    onRequest: (view) => setTimeout(() => setAnswer({ rows: pageOf(view), answers: view }), 200),
  });

  const archive = (selected: readonly Order[] | AllMatching) =>
    setDone(
      "except" in selected
        ? `The server archives every match of the request, except ${selected.except.length} orders.`
        : `The server archives ${selected.length} named orders.`,
    );

  return (
    <Stack gap={2}>
      <Table selectable aria-label="Orders on the server">
        <Toolbar />
        <Column value="id" label="Order" rowHeader sortable={false} />
        <Column value="customer" label="Customer" sortable={false} />
        <Column value="amount" label="Amount" sortable={false} />
        <RowActions>
          <Action bulk onSelect={archive}>Archive</Action>
        </RowActions>
        <Pagination />
      </Table>
      <Text size="xs" tone="muted">{done}</Text>
    </Stack>
  );
}
