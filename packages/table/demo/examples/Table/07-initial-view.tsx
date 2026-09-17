import { useState } from "react";
import { Button, Stack, Text } from "@umriss-ui/core";
import { ColumnMenu, Search, Toolbar, useTable } from "../../../src";
import type { TableView } from "../../../src";

export const title = "The initial view";

/* The library remembers nothing - not in the address, not in any storage.
   Search, sort levels, hidden columns, order, page and dragged widths stand in
   `t.view`, an object the application can keep wherever it likes: in a profile,
   in the session store, in its own address. Whatever is at its default is absent
   from it.

   It comes back through `initialView`, on the first render. Another view
   therefore means a new `key`: the table starts afresh, with what stands in the
   view. Names no column carries fall out.

   To try it: sort, hide a column, drag the edge of the header "Customer" - and
   start again with the view that was kept. */

const START_VIEW: TableView = {
  sort: [{ column: "quantity", direction: "desc" }],
  hidden: ["note"],
};

interface Order {
  number: string;
  customer: string;
  quantity: number;
  note: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", quantity: 120, note: "Part delivery possible" },
  { number: "A-2042", customer: "Keller & Sons", quantity: 48, note: "Enclose certificate 3.1" },
  { number: "A-2043", customer: "Northworks", quantity: 1250, note: "Call-off in four lots" },
  { number: "A-2044", customer: "Hofmann Drives", quantity: 310, note: "Packaging to standard" },
];

function OrderList({ start, restart }: { start: TableView; restart: (view: TableView) => void }) {
  const t = useTable(ORDERS, { rowKey: (o) => o.number, initialView: start });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Table ariaLabel="Orders">
        <Toolbar>
          <Search placeholder="Order or customer" />
          <ColumnMenu />
        </Toolbar>
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" resizable />
        <Column value="quantity" label="Quantity" />
        <Column value="note" label="Note" />
      </Table>
      <Stack gap={1}>
        <Text as="span" size="sm" tone="secondary">
          What the application would keep
        </Text>
        <Text as="code" size="sm" mono data-role="view">
          {JSON.stringify(t.view)}
        </Text>
      </Stack>
      <Stack direction="row" gap={2} wrap>
        <Button size="sm" onClick={() => restart(t.view)}>
          Start again with this view
        </Button>
        <Button size="sm" variant="ghost" onClick={() => restart(START_VIEW)}>
          Back to the beginning
        </Button>
      </Stack>
    </Stack>
  );
}

export default function InitialView() {
  const [start, setStart] = useState(START_VIEW);
  const [generation, setGeneration] = useState(0);

  return (
    <OrderList
      key={generation}
      start={start}
      restart={(view) => {
        setStart(view);
        setGeneration((n) => n + 1);
      }}
    />
  );
}
