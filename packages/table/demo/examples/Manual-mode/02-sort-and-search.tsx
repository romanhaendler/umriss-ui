import { useState } from "react";
import { Stack, Text } from "@umriss-ui/core";
import { SHIPMENTS } from "@umriss-ui/demo/worlds/logistics";
import { Pagination, Search, Toolbar, useTable } from "../../../src";
import type { ManualView } from "../../../src";

export const title = "Sort and search on the server";
export const lead = "The view `onViewChange` reports is complete: search, sort, page and page size, defaults included. The line below shows what the server received.";

type Shipment = (typeof SHIPMENTS)[number];

const serve = (view: ManualView) => {
  const term = view.search.trim().toLowerCase();
  const hits = SHIPMENTS.filter((s) => !term || s.id.toLowerCase().includes(term) || s.customer.toLowerCase().includes(term));
  const sort = view.sort[0];
  if (sort) {
    const key = sort.column as keyof Shipment;
    const sign = sort.direction === "asc" ? 1 : -1;
    hits.sort((a, b) => (a[key] < b[key] ? -sign : a[key] > b[key] ? sign : 0));
  }
  const start = (view.page - 1) * view.pageSize;
  return { view, rows: hits.slice(start, start + view.pageSize), rowCount: hits.length };
};

const FIRST: ManualView = { search: "", conditions: {}, sort: [{ column: "id", direction: "asc" }], page: 1, pageSize: 10 };

export default function SortAndSearch() {
  const [answer, setAnswer] = useState(() => serve(FIRST));
  const { Table, Column } = useTable(answer.rows, {
    rowKey: (s) => s.id,
    defaultSort: FIRST.sort[0],
    manual: true,
    rowCount: answer.rowCount,
    onViewChange: (view) => setAnswer(serve(view)),
  });
  const { search, sort, page, pageSize } = answer.view;

  return (
    <Stack gap={2}>
      <Table ariaLabel="Shipments on the server">
        <Toolbar>
          <Search placeholder="Shipment or customer" />
        </Toolbar>
        <Column value="id" label="Shipment" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="weight" label="Weight (kg)" />
        <Pagination />
      </Table>
      <Text size="xs" tone="muted" mono>
        Received: page {page} · {pageSize} rows · {sort.map((s) => `${s.column} ${s.direction}`).join(", ")}
        {search && ` · “${search}”`}
      </Text>
    </Stack>
  );
}
