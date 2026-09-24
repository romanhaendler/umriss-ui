import { useTable } from "../../../src";

export const title = "A group of one row";

/* Lines, and within them customers, most of whom have a single order. The
   customers are the span - the innermost of two levels -, so a customer with
   one order costs no line of its own. And a group of one row is a group like
   any other: it has its fold, its count and its box. A special case that left
   them out read as a fault among the groups beside it. */

interface Order {
  id: string;
  line: string;
  customer: string;
  article: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", article: "Housing 40", quantity: 1200 },
  { id: "A-1044", line: "Line 1", customer: "Brenner GmbH", article: "Housing 60", quantity: 800 },
  { id: "A-1043", line: "Line 1", customer: "Brenner GmbH", article: "Shaft 12", quantity: 5000 },
  { id: "A-1049", line: "Line 2", customer: "Hartmann KG", article: "Shaft 16", quantity: 3200 },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", article: "Cover plate", quantity: 2400 },
  { id: "A-1050", line: "Line 2", customer: "Vogt Maschinen", article: "Bracket L", quantity: 450 },
  { id: "A-1053", line: "Line 1", customer: "Weiss Antriebe", article: "Bracket", quantity: 1100 },
];

export default function GroupOfOne() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: ["line", "customer"] });
  return (
    <Table ariaLabel="Orders by customer">
      <Column value="customer" label="Customer" />
      <Column value="id" label="Order" rowHeader />
      <Column value="line" label="Line" />
      <Column value="article" label="Article" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
    </Table>
  );
}
