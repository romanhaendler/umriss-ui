import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { Pagination, useTable } from "../../../src";
import type { TableRequest } from "../../../src";

interface Order {
  id: string;
  customer: string;
  amount: number;
}

const CUSTOMERS = ["Holloway Garden Supplies", "Marlow & Finch Books", "Oakridge Pharmacy", "Brixley Cycles", "Tamsin's Bakery"] as const;
const ORDERS: readonly Order[] = Array.from({ length: 120 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(4, "0")}`,
  customer: CUSTOMERS[(i * 3) % CUSTOMERS.length]!,
  amount: 40 + ((i * 7919) % 900),
}));

export const title = "Show a failed fetch";
export const lead = "`error` is the message the application wrote when the fetch failed. It stands where the rows were, with \"Try again\", which reports the same request once more. With `answers` the message is the failure of that request and shows only while it is the table's current one. The table clears nothing: the application sets and clears `error`. Here the second page fails the first time it is asked for.";

const pageOf = (view: TableRequest) => ORDERS.slice((view.page - 1) * view.pageSize, view.page * view.pageSize);

export default function AFailedFetch() {
  const [answer, setAnswer] = useState<{ rows: readonly Order[]; answers: TableRequest; error?: string }>(() => {
    const first: TableRequest = { search: "", conditions: {}, sort: [], page: 1, pageSize: 10 };
    return { rows: pageOf(first), answers: first };
  });
  const [failed, setFailed] = useState(false);

  const { Table, Column } = useTable(answer.rows, {
    rowKey: (o) => o.id,
    server: true,
    rowCount: ORDERS.length,
    answers: answer.answers,
    ...(answer.error ? { error: answer.error } : {}),
    onRequest: (view) => {
      setTimeout(() => {
        if (view.page === 2 && !failed) {
          setFailed(true);
          setAnswer({ rows: [], answers: view, error: "The orders could not be loaded: the server did not answer." });
        } else setAnswer({ rows: pageOf(view), answers: view });
      }, 300);
    },
  });

  return (
    <Stack gap={2}>
      <Table aria-label="Orders on the server">
        <Column value="id" label="Order" rowHeader sortable={false} />
        <Column value="customer" label="Customer" sortable={false} />
        <Column value="amount" label="Amount" sortable={false} />
        <Pagination />
      </Table>
      <Text size="xs" tone="muted">Page 2 fails once; press Try again.</Text>
    </Stack>
  );
}
