import { Pagination, useTable } from "../../../src";

export const title = "Paging: a page that begins inside a group";

/* A page counts lines - bands and rows alike. When a page begins in the
   middle of a group, the band above it is repeated, marked "continued", and
   the span shows its value again on the first row. The band's sums are
   always the whole group's, never the part on the page. Turn to page two. */

interface Order {
  id: string;
  line: string;
  customer: string;
  quantity: number;
}

const ORDERS: Order[] = [
  { id: "A-1041", line: "Line 1", customer: "Brenner GmbH", quantity: 1200 },
  { id: "A-1044", line: "Line 1", customer: "Brenner GmbH", quantity: 800 },
  { id: "A-1052", line: "Line 1", customer: "Kessler AG", quantity: 2400 },
  { id: "A-1058", line: "Line 1", customer: "Otto & Söhne", quantity: 600 },
  { id: "A-1060", line: "Line 1", customer: "Otto & Söhne", quantity: 300 },
  { id: "A-1061", line: "Line 1", customer: "Otto & Söhne", quantity: 300 },
  { id: "A-1043", line: "Line 2", customer: "Brenner GmbH", quantity: 5000 },
  { id: "A-1049", line: "Line 2", customer: "Hartmann KG", quantity: 3200 },
  { id: "A-1055", line: "Line 2", customer: "Lindner Tech", quantity: 1500 },
  { id: "A-1057", line: "Line 2", customer: "Lindner Tech", quantity: 900 },
];

export default function Paging() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.id, defaultGrouping: ["line", "customer"], pageSize: 5 });
  return (
    <Table ariaLabel="Orders, five lines per page">
      <Pagination pageSizes={[5, 10, 25]} />
      <Column value="customer" label="Customer" />
      <Column value="id" label="Order" rowHeader />
      <Column value="line" label="Line" />
      <Column value="quantity" label="Quantity" aggregate="sum" />
    </Table>
  );
}
