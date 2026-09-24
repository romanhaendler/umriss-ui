import { Pagination, Toolbar, useTable } from "../../../src";

export const title = "A whole group selected";

/* Release every order of one customer at once. The box in a band selects all
   of its group's rows, the box beside a span all of the span's - on other
   pages and in folded groups as well; half a group shows as a dash. The bulk
   action in the table toolbar receives the list, as it always does. */

interface Order {
  id: string;
  customer: string;
  article: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", customer: "Brenner GmbH", article: "Housing 40", quantity: 1200 },
  { id: "A-1044", customer: "Brenner GmbH", article: "Housing 60", quantity: 800 },
  { id: "A-1043", customer: "Brenner GmbH", article: "Shaft 12", quantity: 5000 },
  { id: "A-1047", customer: "Brenner GmbH", article: "Flange", quantity: 600 },
  { id: "A-1049", customer: "Hartmann KG", article: "Shaft 16", quantity: 3200 },
  { id: "A-1052", customer: "Kessler AG", article: "Cover plate", quantity: 2400 },
  { id: "A-1046", customer: "Kessler AG", article: "Bracket", quantity: 700 },
  { id: "A-1053", customer: "Weiss Antriebe", article: "Bracket", quantity: 1100 },
];

export default function WholeGroup() {
  const { Table, Column, RowActions, Action } = useTable(ORDERS, {
    rowKey: (o) => o.id,
    defaultGrouping: "customer",
    pageSize: 5,
  });
  return (
    <Table ariaLabel="Orders to release" selectable>
      <Toolbar />
      <Pagination pageSizes={[5, 10]} />
      <Column value="customer" label="Customer" />
      <Column value="id" label="Order" rowHeader />
      <Column value="article" label="Article" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
      <RowActions>
        <Action bulk onSelect={(orders) => window.alert(`Released: ${orders.map((o) => o.id).join(", ")}`)}>
          Release
        </Action>
      </RowActions>
    </Table>
  );
}
