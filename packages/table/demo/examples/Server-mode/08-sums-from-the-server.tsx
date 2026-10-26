import { useState } from "react";
import { Pagination, useTable } from "../../../src";
import type { TableRequest } from "../../../src";

interface Order {
  id: string;
  customer: string;
  amount: number;
}

const CUSTOMERS = ["Holloway Garden Supplies", "Marlow & Finch Books", "Oakridge Pharmacy", "Brixley Cycles", "Tamsin's Bakery"] as const;
const ORDERS: readonly Order[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `ORD-${String(i + 1).padStart(4, "0")}`,
  customer: CUSTOMERS[(i * 3) % CUSTOMERS.length]!,
  amount: 40 + ((i * 7919) % 900),
}));

export const title = "Show sums from the server";
export const lead = "`totals` come beside the rows, by column id: the value of the column's declared `aggregate` over every match, not over the page. The footer shows them in the column's format; a key left out shows the absent value, and while an answer is out the cells are skeleton, never the old sums.";

const serve = (view: TableRequest) => ({
  rows: ORDERS.slice((view.page - 1) * view.pageSize, view.page * view.pageSize),
  answers: view,
  totals: { id: ORDERS.length, amount: ORDERS.reduce((sum, o) => sum + o.amount, 0) },
});

export default function SumsFromTheServer() {
  const [answer, setAnswer] = useState(() => serve({ search: "", conditions: {}, sort: [], page: 1, pageSize: 10 }));

  const { Table, Column } = useTable(answer.rows, {
    rowKey: (o) => o.id,
    server: true,
    rowCount: ORDERS.length,
    answers: answer.answers,
    totals: answer.totals,
    onRequest: (view) => setTimeout(() => setAnswer(serve(view)), 400),
  });

  return (
    <Table aria-label="Orders on the server">
      <Column value="id" label="Order" rowHeader sortable={false} aggregate="count" />
      <Column value="customer" label="Customer" sortable={false} />
      <Column value="amount" label="Amount" sortable={false} aggregate="sum" />
      <Pagination />
    </Table>
  );
}
