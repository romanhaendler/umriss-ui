import { useTable } from "../../../src";

export const title = "Width: width and resizable";

/* `width` is the initial width in pixels, `resizable` shows a grip at the edge
   of the header.

   Three routes: drag the grip - that does not sort, not even in a sortable
   column -, double-click the grip to fit the content, or, with the focus in the
   header, press Alt and the arrow keys (with Shift in larger steps, Alt and
   Home fits). A dragged width is part of the view and stands in the link. */

interface Order {
  number: string;
  customer: string;
  note: string;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", note: "Part delivery possible, remainder by week 14" },
  { number: "A-2042", customer: "Keller & Sons", note: "Enclose certificate 3.1" },
  { number: "A-2043", customer: "Northworks", note: "Call-off in four lots after the sample is confirmed" },
];

export default function Width() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <Table ariaLabel="Orders with a note">
      <Column value="number" label="Order" rowHeader width={110} />
      <Column value="customer" label="Customer" resizable width={180} />
      <Column value="note" label="Note" resizable sortable={false} width={160} />
    </Table>
  );
}
