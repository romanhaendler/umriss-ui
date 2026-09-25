import { useTable } from "../../../src";

export const title = "Keep values between two bounds";
export const lead = "`filter=\"range\"` gives numbers and dates two inclusive bounds, either left open; date bounds are whole calendar days.";

interface Invoice {
  id: string;
  supplier: string;
  amount: number;
  due: Date;
}

const INVOICES: Invoice[] = [
  { id: "INV-26-0318", supplier: "Brandlow Office Supply", amount: 1951.24, due: new Date(2026, 3, 15) },
  { id: "INV-26-0317", supplier: "Kettering & Shaw Events", amount: 15_110, due: new Date(2026, 3, 12) },
  { id: "INV-26-0309", supplier: "Nimbrel Software", amount: 7288, due: new Date(2026, 3, 8) },
  { id: "INV-26-0302", supplier: "Fenwright Legal", amount: 3770, due: new Date(2026, 2, 16, 23, 45) },
  { id: "INV-26-0226", supplier: "Corrin Travel", amount: 8117.2, due: new Date(2026, 2, 12) },
  { id: "INV-26-0221", supplier: "Stellbrook Consulting", amount: 8700, due: new Date(2026, 2, 23) },
];

export default function RangeFilter() {
  const { Table, Column } = useTable(INVOICES, { rowKey: (i) => i.id });

  return (
    <Table ariaLabel="Invoices">
      <Column value="id" label="Invoice" rowHeader />
      <Column value="supplier" label="Supplier" />
      <Column value="amount" label="Amount (€)" format={{ decimals: 2 }} filter="range" aggregate="sum" />
      <Column value="due" label="Due" filter="range" format="date" />
    </Table>
  );
}
