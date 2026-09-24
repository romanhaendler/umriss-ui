import { useTable } from "../../../src";

export const title = "Groups by their aggregate: one click";

/* Which line has the most scrap? Click the Scrap header. A sort level on a
   column with an aggregate orders the groups by it - and the orders within
   each line by their own scrap. A sort on the grouped column turns the lines
   round; one on any other column orders only the rows within. Here the table
   starts that way: `defaultSort` on Scrap, descending. */

interface Order {
  id: string;
  line: string;
  article: string;
  quantity: number;
  scrap: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", article: "Housing 40", quantity: 1200, scrap: 14 },
  { id: "A-1044", line: "Line 1", article: "Housing 60", quantity: 800, scrap: 3 },
  { id: "A-1052", line: "Line 1", article: "Cover plate", quantity: 2400, scrap: 31 },
  { id: "A-1043", line: "Line 2", article: "Shaft 12", quantity: 5000, scrap: 62 },
  { id: "A-1049", line: "Line 2", article: "Shaft 16", quantity: 3200, scrap: 18 },
  { id: "A-1046", line: "Line 3", article: "Bracket", quantity: 700, scrap: 9 },
  { id: "A-1053", line: "Line 3", article: "Bracket", quantity: 1100, scrap: 27 },
];

export default function GroupsByAggregate() {
  const { Table, Column } = useTable(ORDERS, {
    rowKey: (o) => o.id,
    defaultGrouping: "line",
    defaultSort: { column: "scrap", direction: "desc" },
  });
  return (
    <Table ariaLabel="Orders by line, most scrap first">
      <Column value="line" label="Line" />
      <Column value="id" label="Order" rowHeader />
      <Column value="article" label="Article" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
      <Column value="scrap" label="Scrap" aggregate="sum" />
    </Table>
  );
}
