import { Search, Toolbar, Export, useTable } from "../../../src";

export const title = "The file";

/* Without `onExport`, `Export` triggers a download. In the file stands the
   filtered set - across all pages - in the visible columns and in the order the
   user sees, sorted the way he sorted.

   And with the values, not with their presentation: numbers stay numbers with a
   decimal comma, a point in time becomes a timestamp, an absent value an empty
   field. A spreadsheet receives data, not text. */

interface Order {
  number: string;
  customer: string;
  quantity: number;
  price: number;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", quantity: 120, price: 1480.5 },
  { number: "A-2042", customer: "Keller & Sons", quantity: 48, price: 612 },
  { number: "A-2043", customer: "Northworks", quantity: 1250, price: 9870.25 },
  { number: "A-2044", customer: "Northplate", quantity: 310, price: 2215.8 },
];

export default function Download() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table ariaLabel="Orders">
      <Toolbar>
        <Search placeholder="Search customer" />
        <Export filename="orders.csv" />
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" />
      <Column value="price" label="Price" format={{ decimals: 2 }} />
    </Table>
  );
}
