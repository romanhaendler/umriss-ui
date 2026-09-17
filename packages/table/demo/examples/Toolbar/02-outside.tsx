import { Stack } from "@umriss-ui/core";
import { Export, Search, Toolbar, useTable } from "../../../src";

export const title = "Outside the table: of";

/* The unbound parts touch no row, so they need no binding. Placed in a table
   they read it; outside they take the table as `of` - the return value of
   `useTable`, which one keeps for the purpose.

   `of` applies per part: a table toolbar outside does not pass it on to its
   children, each names its table itself. It stands here in front of the table,
   and that is more than tidiness: placed behind it, it would register only after
   the first paint, and until then the table would show a toolbar of its own. */

interface Order {
  number: string;
  customer: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks" },
  { number: "A-2042", customer: "Keller & Sons" },
  { number: "A-2043", customer: "Northworks" },
];

export default function Outside() {
  const t = useTable(ORDERS, { rowKey: (o) => o.number });
  const { Table, Column } = t;

  return (
    <Stack gap={3}>
      <Toolbar of={t}>
        <Search of={t} placeholder="Search customer" />
        <Export of={t} filename="orders.csv" />
      </Toolbar>
      <Table ariaLabel="Orders">
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
      </Table>
    </Stack>
  );
}
