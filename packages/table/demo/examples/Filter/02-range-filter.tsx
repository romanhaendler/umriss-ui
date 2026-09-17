import { useTable } from "../../../src";

export const title = "filter=“range”: two bounds, for numbers and points in time";

/* `filter="range"` gives a column two bounds, both inclusive, and either may
   stay open: "from 100", "up to 500", "100–500". An absent value never matches -
   "between 100 and 500" says nothing about a quantity nobody knows.

   Over a number stand two number fields that take effect as one types; where
   "From" lies behind "To" they are invalid and the condition stays the last
   valid one. Over a point in time stands the period picker, and the bounds are
   calendar days: up to 30 September means including the whole of 30 September,
   even for a due date at 23:45.

   The compiler admits `"range"` only on numbers and points in time; on a text
   column it does not compile - the search is there for that. */

interface Order {
  number: string;
  customer: string;
  quantity: number;
  due: Date;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", quantity: 120, due: new Date(2026, 8, 3, 9, 0) },
  { number: "A-2042", customer: "Keller & Sons", quantity: 48, due: new Date(2026, 8, 12, 14, 30) },
  { number: "A-2043", customer: "Northworks", quantity: 1250, due: new Date(2026, 8, 18, 7, 15) },
  { number: "A-2044", customer: "Hofmann Drives", quantity: 310, due: new Date(2026, 8, 30, 23, 45) },
  { number: "A-2045", customer: "Lindner Hydraulics", quantity: 96, due: new Date(2026, 9, 1, 6, 0) },
  { number: "A-2046", customer: "Sauer Conveyors", quantity: 540, due: new Date(2026, 9, 8, 11, 20) },
];

export default function RangeFilter() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table ariaLabel="Orders">
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="quantity" label="Quantity" filter="range" footer="sum" />
      <Column value="due" label="Due date" filter="range" format="date" />
    </Table>
  );
}
