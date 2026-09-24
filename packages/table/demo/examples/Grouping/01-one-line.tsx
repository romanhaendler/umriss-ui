import { useTable } from "../../../src";

export const title = "One line: orders by line";

/* `defaultGrouping` on the hook is all it takes. The table groups by the
   column of that id and gives every line a group header: its name, its count
   and its sum under the Quantity column, with a bar for its share. The line
   column leaves the body - its value stands in the header; the table toolbar
   names the grouping and takes it away. */

interface Order {
  id: string;
  line: string;
  article: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", article: "Housing 40", quantity: 1200 },
  { id: "A-1044", line: "Line 1", article: "Housing 60", quantity: 800 },
  { id: "A-1052", line: "Line 1", article: "Cover plate", quantity: 2400 },
  { id: "A-1043", line: "Line 2", article: "Shaft 12", quantity: 5000 },
  { id: "A-1049", line: "Line 2", article: "Shaft 16", quantity: 3200 },
  { id: "A-1046", line: "Line 3", article: "Bracket", quantity: 700 },
  { id: "A-1053", line: "Line 3", article: "Bracket", quantity: 1100 },
];

export default function OneLine() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: "line" });
  return (
    <Table ariaLabel="Orders by line">
      <Column value="id" label="Order" rowHeader />
      <Column value="line" label="Line" />
      <Column value="article" label="Article" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
    </Table>
  );
}
