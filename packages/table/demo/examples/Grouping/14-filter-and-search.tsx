import { Search, Toolbar, useTable } from "../../../src";

export const title = "Filter and search: groups as you type";

/* Grouping comes after the filter: a group holds what search and conditions
   leave, and a group they empty is gone. Type "shaft" - Line 1 disappears,
   the counts in the bands count down to what is left, and the sums are the
   sums of what you see. Filter the articles in their header as well. */

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
  { id: "A-1057", line: "Line 2", article: "Bushing", quantity: 900 },
  { id: "A-1046", line: "Line 3", article: "Bracket", quantity: 700 },
  { id: "A-1054", line: "Line 3", article: "Shaft 12", quantity: 1800 },
];

export default function FilterAndSearch() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: "line" });
  return (
    <Table ariaLabel="Orders by line, searchable">
      <Toolbar>
        <Search />
      </Toolbar>
      <Column value="line" label="Line" />
      <Column value="id" label="Order" rowHeader />
      <Column value="article" label="Article" filter="list" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
    </Table>
  );
}
