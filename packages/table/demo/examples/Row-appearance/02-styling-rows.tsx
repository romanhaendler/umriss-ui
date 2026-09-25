import { useTable } from "../../../src";

export const title = "Mark rows by their state";
export const lead = "`rowProps` gives a row classes and data attributes; the application's stylesheet draws them, and a word in a column says the same.";

interface Invoice {
  id: string;
  supplier: string;
  due: Date;
  overdue: boolean;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", due: new Date(2026, 3, 15), overdue: false },
  { id: "INV-26-0309", supplier: "Nimbrel Software", due: new Date(2026, 3, 8), overdue: false },
  { id: "INV-26-0226", supplier: "Corrin Travel", due: new Date(2026, 2, 12), overdue: true },
  { id: "INV-26-0221", supplier: "Stellbrook Consulting", due: new Date(2026, 2, 16), overdue: true },
];

const STYLE = `
.invoice-list tr[data-overdue] > th {
  box-shadow: inset 3px 0 0 var(--u-color-warning);
}
`;

export default function StylingRows() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id });

  return (
    <>
      <style>{STYLE}</style>
      <Table className="invoice-list" ariaLabel="Invoices" rowProps={(i) => ({ "data-overdue": i.overdue ? "" : undefined })}>
        <Column value="id" label="Invoice" rowHeader />
        <Column value="supplier" label="Supplier" />
        <Column value="due" label="Due" format="date" />
        <Column value="overdue" label="Overdue" />
      </Table>
    </>
  );
}
