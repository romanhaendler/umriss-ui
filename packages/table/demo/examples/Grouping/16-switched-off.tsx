import { ColumnMenu, Toolbar, useTable } from "../../../src";

export const title = "Switched off: groupable={false}";

/* Grouping is on for every table - that is what makes it cost nothing. Where
   a column makes no sense as a group, it says `groupable={false}`: the order
   number is unique, grouping by it would give each row a group of its own.
   Where a whole table must not be grouped - a fixed report -, `<Table
   groupable={false}>` takes the grouping out of the column menu and passes
   over a grouping handed in. */

interface Order {
  id: string;
  line: string;
  customer: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", quantity: 1200 },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", quantity: 2400 },
  { id: "A-1043", line: "Line 2", customer: "Brenner GmbH", quantity: 5000 },
  { id: "A-1053", line: "Line 3", customer: "Weiss Antriebe", quantity: 1100 },
];

export default function SwitchedOff() {
  const orders = useTable(ORDERS, { rowKey: (o) => o.id });
  const report = useTable(ORDERS, { rowKey: (o) => o.id });
  return (
    <>
      <orders.Table ariaLabel="Orders, groupable but not by order">
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <orders.Column value="id" label="Order" rowHeader groupable={false} />
        <orders.Column value="line" label="Line" />
        <orders.Column value="customer" label="Customer" />
        <orders.Column value="quantity" label="Quantity" groupable={false} aggregate="sum" />
      </orders.Table>
      <report.Table ariaLabel="Order report, never grouped" groupable={false}>
        <Toolbar>
          <ColumnMenu />
        </Toolbar>
        <report.Column value="id" label="Order" rowHeader />
        <report.Column value="line" label="Line" />
        <report.Column value="customer" label="Customer" />
        <report.Column value="quantity" label="Quantity" aggregate="sum" />
      </report.Table>
    </>
  );
}
