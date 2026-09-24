import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Show and hide, arrange";

/* The column menu hides columns and arranges them - and the table applies both
   to head, body and foot at once. That was exactly the error this package
   exists for: reordered in the model, left standing on the screen.

   Every control is a real control, reachable without a pointer; after "move
   forward" the focus stays on the button of the column that moved. The row
   header cannot be hidden, and because it sticks here, it stands in front and
   stays there. */

interface Order {
  number: string;
  customer: string;
  line: string;
  quantity: number;
  due: Date;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", line: "Line 1", quantity: 120, due: new Date(2026, 2, 20) },
  { number: "A-2042", customer: "Keller & Sons", line: "Line 2", quantity: 48, due: new Date(2026, 2, 24) },
  { number: "A-2043", customer: "Northworks", line: "Line 1", quantity: 1250, due: new Date(2026, 2, 18) },
];

export default function ShowHideAndOrder() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table stickyRowHeader ariaLabel="Orders">
      <Toolbar>
        <ColumnMenu />
      </Toolbar>
      <Column value="number" label="Order" rowHeader />
      <Column value="customer" label="Customer" />
      <Column value="line" label="Line" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
      <Column value="due" label="Due" format="date" />
    </Table>
  );
}
