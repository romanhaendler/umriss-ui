import { useTable } from "../../../src";

export const title = "Styling rows with rowProps";

/* `rowProps` gives every row classes and data attributes - and nothing else.

   How a row looks stays with the application's stylesheet; the table says only
   which row is meant. Here an urgent order carries `data-urgent`, and a rule
   draws an edge in the warning colour at its row header. The column "Urgent"
   says the same as a word: colour alone carries no information. */

interface Order {
  number: string;
  customer: string;
  dueDate: Date;
  urgent: boolean;
}

const ORDERS: Order[] = [
  { number: "A-2041", customer: "Brandt Metalworks", dueDate: new Date(2026, 2, 27), urgent: false },
  { number: "A-2042", customer: "Keller & Sons", dueDate: new Date(2026, 2, 18), urgent: true },
  { number: "A-2043", customer: "Northworks", dueDate: new Date(2026, 3, 2), urgent: false },
  { number: "A-2044", customer: "Hofmann Drives", dueDate: new Date(2026, 2, 19), urgent: true },
];

const STYLE = `
.urgent-orders tr[data-urgent] > th {
  box-shadow: inset 3px 0 0 var(--u-color-warning);
}
`;

export default function StylingRows() {
  const { Table, Column } = useTable(ORDERS, { rowKey: (o) => o.number });

  return (
    <>
      <style>{STYLE}</style>
      <Table
        className="urgent-orders"
        ariaLabel="Orders"
        rowProps={(o) => ({ "data-urgent": o.urgent ? "" : undefined })}
      >
        <Column value="number" label="Order" rowHeader />
        <Column value="customer" label="Customer" />
        <Column value="dueDate" label="Due date" format="date" />
        <Column value="urgent" label="Urgent" />
      </Table>
    </>
  );
}
