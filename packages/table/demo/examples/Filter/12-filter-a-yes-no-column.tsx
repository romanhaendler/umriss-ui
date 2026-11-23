import { useTable } from "../../../src";

export const title = "Filter a yes-or-no column";
export const lead = "`filter=\"list\"` on a boolean column offers its two values; the condition stands in the toolbar like any other.";

interface Invoice {
  id: string;
  supplier: string;
  paid: boolean;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", paid: true },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", paid: false },
  { id: "INV-26-0309", supplier: "Nimbrel Software", paid: true },
  { id: "INV-26-0302", supplier: "Fenwright Legal", paid: false },
];

export default function FilterAYesNoColumn() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id });

  return (
    <Table aria-label="Invoices">
      <Column value="id" label="Invoice" rowHeader />
      <Column value="supplier" label="Supplier" />
      <Column value="paid" label="Paid" filter="list" />
    </Table>
  );
}
