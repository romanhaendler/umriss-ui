import { useTable } from "../../../src";

export const title = "The first table";

/* Three columns and the rows, nothing else.

   `useTable` binds the row kind: from `ORDERS` the compiler knows that a row has
   `number`, `customer` and `quantity`, and `value` offers exactly those three.
   `Table` and `Column` come out of the same call - the typing hangs on that, and
   that is why there is no freely imported `Column`.

   What the columns do not say is decided by the value: text on the left, the
   quantity right-aligned in the provider's notation and sortable. `rowHeader`
   makes the order the name of the row. */

interface Order {
  number: string;
  customer: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", quantity: 120 },
  { number: "A-2042", customer: "Keller & Sons", quantity: 48 },
  { number: "A-2043", customer: "Northworks", quantity: 1250 },
  { number: "A-2044", customer: "Hofmann Drives", quantity: 310 },
];

export default function FirstTable() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table ariaLabel="Orders">
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" />
    </Table>
  );
}
