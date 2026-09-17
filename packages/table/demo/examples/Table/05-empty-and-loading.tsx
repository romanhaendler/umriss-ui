import { Button, EmptyState, Stack } from "@umriss-ui/core";
import { Search, Toolbar, useTable } from "../../../src";

export const title = "Loading, empty, nothing matches";

/* Three states of the same body, and none of them is a part one puts somewhere.

   `loading` shows placeholder rows at the height the rows will have. `empty`
   says what stands there when there are no rows at all - here with a way
   forward. That there are rows but none matches the search and filters the table
   recognises itself and offers the way back; the third table therefore begins
   with a search (`initialView`). */

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

const NONE: Order[] = [];

function Loading() {
  const { Table, Column } = useTable(NONE, { rowKey: (o) => o.number });
  return (
    <Table loading ariaLabel="Orders are loading">
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" numeric />
    </Table>
  );
}

function Empty() {
  const { Table, Column } = useTable(NONE, { rowKey: (o) => o.number });
  return (
    <Table
      ariaLabel="Open orders"
      empty={
        <EmptyState
          title="No open orders"
          description="New orders appear here as soon as planning releases them."
          action={<Button size="sm">Create an order</Button>}
        />
      }
    >
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" numeric />
    </Table>
  );
}

function NothingMatches() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number, initialView: { search: "Tinworks" } });
  return (
    <Table ariaLabel="Orders, searched">
      <Toolbar>
        <Search placeholder="Search customer" />
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" />
    </Table>
  );
}

export default function EmptyAndLoading() {
  return (
    <Stack gap={5}>
      <Loading />
      <Empty />
      <NothingMatches />
    </Stack>
  );
}
